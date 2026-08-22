import { getAuthenticatedSupabaseClient, getAdminSession } from "@/lib/supabase/authServer";
import { suggestAssigneesForTask } from "./matching";

/**
 * Event-driven phase state machine.
 * Verifies phase task completion, advances to the next phase, and handles phase reopen workflows.
 */
export async function checkAndAdvancePhase(projectPhaseId) {
  const supabase = await getAuthenticatedSupabaseClient();

  if (!projectPhaseId) return { advanced: false, reason: "No phase ID provided." };

  // Fetch current phase details
  const { data: currentPhase, error: phaseErr } = await supabase
    .from("project_phases")
    .select("*, client_projects(*)")
    .eq("id", projectPhaseId)
    .single();

  if (phaseErr || !currentPhase) {
    return { advanced: false, reason: "Phase not found." };
  }

  // Query all non-optional tasks for this phase
  const { data: requiredTasks, error: tasksErr } = await supabase
    .from("sop_tasks")
    .select("*")
    .eq("project_phase_id", projectPhaseId)
    .eq("is_optional", false);

  if (tasksErr) {
    return { advanced: false, reason: tasksErr.message };
  }

  const allCompleted = (requiredTasks || []).every(
    (t) => t.status === "completed" && Boolean(t.verified_by)
  );

  if (!allCompleted) {
    return {
      advanced: false,
      reason: "Not all required tasks in this phase are completed and verified.",
    };
  }

  const nowIso = new Date().toISOString();

  // 1. Set current phase status to completed
  const { error: completeErr } = await supabase
    .from("project_phases")
    .update({
      status: "completed",
      completed_at: nowIso,
    })
    .eq("id", projectPhaseId);

  if (completeErr) {
    return { advanced: false, reason: completeErr.message };
  }

  const projectId = currentPhase.client_project_id;
  const nextOrder = currentPhase.phase_order + 1;

  // 2. Find next phase
  const { data: nextPhases } = await supabase
    .from("project_phases")
    .select("*")
    .eq("client_project_id", projectId)
    .eq("phase_order", nextOrder)
    .limit(1);

  const nextPhase = nextPhases && nextPhases.length > 0 ? nextPhases[0] : null;

  if (nextPhase) {
    // Unlock next phase
    await supabase
      .from("project_phases")
      .update({
        status: "active",
        unlocked_at: nowIso,
      })
      .eq("id", nextPhase.id);

    // Update project current_phase_id
    await supabase
      .from("client_projects")
      .update({ current_phase_id: nextPhase.id })
      .eq("id", projectId);

    // Fetch tasks for next phase and trigger matching suggestions
    const { data: nextTasks } = await supabase
      .from("sop_tasks")
      .select("*")
      .eq("project_phase_id", nextPhase.id);

    if (nextTasks && nextTasks.length > 0) {
      for (const nTask of nextTasks) {
        const suggestions = await suggestAssigneesForTask(nTask.id);
        if (suggestions && suggestions.length > 0) {
          const topCandidate = suggestions[0];
          // Enqueue notification for top candidate
          await supabase.from("sop_notifications").insert([
            {
              team_member_id: topCandidate.candidate.id,
              message: `You are suggested for new task '${nTask.title}' in Phase ${nextPhase.phase_order}: ${nextPhase.name}`,
              link_path: "/workspace",
            },
          ]);
        }
      }
    }

    // Log phase advanced event
    await supabase.from("sop_activity_logs").insert([
      {
        client_project_id: projectId,
        event_type: "phase_advanced",
        event_detail: {
          completed_phase_id: projectPhaseId,
          unlocked_phase_id: nextPhase.id,
          next_phase_order: nextOrder,
        },
      },
    ]);

    return {
      advanced: true,
      nextPhaseUnlocked: true,
      nextPhaseId: nextPhase.id,
    };
  } else {
    // All phases complete -> Mark project completed
    await supabase
      .from("client_projects")
      .update({ status: "completed" })
      .eq("id", projectId);

    await supabase.from("sop_activity_logs").insert([
      {
        client_project_id: projectId,
        event_type: "project_completed",
        event_detail: { final_phase_id: projectPhaseId },
      },
    ]);

    return {
      advanced: true,
      projectCompleted: true,
    };
  }
}

/**
 * Re-opens a completed phase (Admin/Founder Action).
 * Sets phase status back to active and logs the action with warning feedback.
 */
export async function reopenPhase(projectPhaseId, reason) {
  const { user, supabase } = await getAdminSession();

  if (!projectPhaseId || !reason) {
    return { success: false, error: "Phase ID and reopen reason are required." };
  }

  const { data: phase, error: fetchErr } = await supabase
    .from("project_phases")
    .select("*")
    .eq("id", projectPhaseId)
    .single();

  if (fetchErr || !phase) {
    return { success: false, error: "Phase not found." };
  }

  const { error: updateErr } = await supabase
    .from("project_phases")
    .update({
      status: "active",
      completed_at: null,
    })
    .eq("id", projectPhaseId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // Update current_phase_id on project
  await supabase
    .from("client_projects")
    .update({ current_phase_id: projectPhaseId })
    .eq("id", phase.client_project_id);

  // Log activity
  await supabase.from("sop_activity_logs").insert([
    {
      client_project_id: phase.client_project_id,
      actor_user_id: user.id,
      event_type: "phase_reopened",
      event_detail: {
        phase_id: projectPhaseId,
        reason,
      },
    },
  ]);

  return {
    success: true,
    warning:
      "Later phases remain in their current state; review manually for dependency impact.",
  };
}
