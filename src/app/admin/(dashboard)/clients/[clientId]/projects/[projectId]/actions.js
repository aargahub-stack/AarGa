"use server";

import { getAdminSession } from "@/lib/supabase/authServer";
import { suggestAssigneesForTask, confirmAssignment } from "@/lib/sop/matching";
import { reopenPhase } from "@/lib/sop/phaseEngine";
import { revalidatePath } from "next/cache";

export async function forceUnlockPhase(phaseId, reason) {
  const { user, supabase } = await getAdminSession();

  if (!phaseId || !reason) {
    return { success: false, error: "Phase ID and unlock reason are required." };
  }

  const { data: phase, error: fetchErr } = await supabase
    .from("project_phases")
    .select("*")
    .eq("id", phaseId)
    .single();

  if (fetchErr || !phase) {
    return { success: false, error: "Project phase not found." };
  }

  const nowIso = new Date().toISOString();

  // Force phase status to active
  const { error: updateErr } = await supabase
    .from("project_phases")
    .update({
      status: "active",
      unlocked_at: nowIso,
    })
    .eq("id", phaseId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // Update client_projects current_phase_id
  await supabase
    .from("client_projects")
    .update({ current_phase_id: phaseId })
    .eq("id", phase.client_project_id);

  // Log activity with event_type = 'manual_force_unlock'
  await supabase.from("sop_activity_logs").insert([
    {
      client_project_id: phase.client_project_id,
      actor_user_id: user.id,
      event_type: "manual_force_unlock",
      event_detail: {
        phase_id: phaseId,
        phase_order: phase.phase_order,
        phase_name: phase.name,
        reason,
        unlocked_at: nowIso,
      },
    },
  ]);

  revalidatePath(`/admin/clients/${phase.client_project_id}`);
  revalidatePath("/admin/sop");
  revalidatePath("/workspace");

  return { success: true };
}

export async function createAdHocTask({
  projectPhaseId,
  title,
  description = "",
  requiredSkillTags = [],
  estimatedHours = 4.0,
}) {
  const { user, supabase } = await getAdminSession();

  if (!projectPhaseId || !title) {
    return { success: false, error: "Phase ID and task title are required." };
  }

  const { data: phase, error: phaseErr } = await supabase
    .from("project_phases")
    .select("client_project_id")
    .eq("id", projectPhaseId)
    .single();

  if (phaseErr || !phase) {
    return { success: false, error: "Project phase not found." };
  }

  const { data: newTask, error: insErr } = await supabase
    .from("sop_tasks")
    .insert([
      {
        project_phase_id: projectPhaseId,
        title,
        description,
        required_skill_tags: requiredSkillTags,
        estimated_hours: Number(estimatedHours) || 4.0,
        status: "unassigned",
        source: "ad_hoc",
      },
    ])
    .select()
    .single();

  if (insErr || !newTask) {
    return { success: false, error: insErr?.message || "Failed to create ad-hoc task." };
  }

  // Log activity
  await supabase.from("sop_activity_logs").insert([
    {
      client_project_id: phase.client_project_id,
      sop_task_id: newTask.id,
      actor_user_id: user.id,
      event_type: "ad_hoc_task_created",
      event_detail: {
        title,
        required_skill_tags: requiredSkillTags,
        estimated_hours: estimatedHours,
      },
    },
  ]);

  revalidatePath(`/admin/clients/${phase.client_project_id}`);
  return { success: true, taskId: newTask.id, task: newTask };
}

export async function getSuggestionsAction(sopTaskId) {
  await getAdminSession();
  return suggestAssigneesForTask(sopTaskId);
}

export async function getAllTeamMembersAction() {
  const { supabase } = await getAdminSession();

  const { data: members } = await supabase
    .from("team_members")
    .select("*, team_member_skills(*, skills(name)), sop_tasks:sop_tasks!sop_tasks_assigned_to_fkey(*)")
    .eq("active", true)
    .order("name", { ascending: true });

  return members || [];
}

export async function assignTaskAction(sopTaskId, teamMemberId, method = "manual_override") {
  const { user, supabase } = await getAdminSession();

  // Fetch existing task state to check for reassignment from previous member
  const { data: currentTask } = await supabase
    .from("sop_tasks")
    .select("*, project_phases(client_project_id)")
    .eq("id", sopTaskId)
    .single();

  const previousAssigneeId = currentTask?.assigned_to;
  const isReassignment = previousAssigneeId && previousAssigneeId !== teamMemberId;

  const res = await confirmAssignment(sopTaskId, teamMemberId, method);

  if (res.success && isReassignment) {
    // Log explicit task_reassigned event
    await supabase.from("sop_activity_logs").insert([
      {
        client_project_id: currentTask.project_phases?.client_project_id,
        sop_task_id: sopTaskId,
        actor_user_id: user.id,
        event_type: "task_reassigned",
        event_detail: {
          previous_assignee: previousAssigneeId,
          new_assignee: teamMemberId,
          method,
        },
      },
    ]);
  }

  revalidatePath("/admin/sop");
  revalidatePath("/workspace");
  return res;
}

export async function reopenPhaseAction(projectPhaseId, reason) {
  return reopenPhase(projectPhaseId, reason);
}
