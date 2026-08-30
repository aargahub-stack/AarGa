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

export async function markProjectCompleted(projectId) {
  const { user, supabase } = await getAdminSession();

  if (!projectId) {
    return { success: false, error: "Project ID is required." };
  }

  // Check project & phases
  const { data: project, error: pErr } = await supabase
    .from("client_projects")
    .select("*, clients(id, org_name, name)")
    .eq("id", projectId)
    .single();

  if (pErr || !project) {
    return { success: false, error: "Client project not found." };
  }

  // Fetch all phases for project ordered by phase_order ascending
  const { data: phases } = await supabase
    .from("project_phases")
    .select("*")
    .eq("client_project_id", projectId)
    .order("phase_order", { ascending: true });

  if (!phases || phases.length === 0) {
    return { success: false, error: "Project has no initialized phases." };
  }

  const finalPhase = phases[phases.length - 1];

  if (finalPhase.status !== "completed") {
    return {
      success: false,
      error: `Final phase '${finalPhase.name}' must be completed first before marking the project completed.`,
    };
  }

  const nowIso = new Date().toISOString();

  // Update status to completed
  const { error: updateErr } = await supabase
    .from("client_projects")
    .update({ status: "completed" })
    .eq("id", projectId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // Log activity
  await supabase.from("sop_activity_logs").insert([
    {
      client_project_id: projectId,
      actor_user_id: user.id,
      event_type: "project_completed",
      event_detail: {
        completed_at: nowIso,
        client_name: project.clients?.org_name || project.clients?.name,
        project_type: project.project_type,
      },
    },
  ]);

  revalidatePath(`/admin/clients/${project.client_id}/projects/${projectId}`);
  revalidatePath(`/admin/clients/${project.client_id}`);
  revalidatePath("/admin/clients");
  revalidatePath("/admin/sop");
  revalidatePath("/workspace");

  return { success: true };
}

export async function cancelClientProject(projectId) {
  const { user, supabase } = await getAdminSession();

  if (!projectId) {
    return { success: false, error: "Project ID is required." };
  }

  const { data: project, error: pErr } = await supabase
    .from("client_projects")
    .select("*, clients(id, org_name, name)")
    .eq("id", projectId)
    .single();

  if (pErr || !project) {
    return { success: false, error: "Client project not found." };
  }

  const nowIso = new Date().toISOString();

  const { error: updateErr } = await supabase
    .from("client_projects")
    .update({ status: "cancelled" })
    .eq("id", projectId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // Log activity
  await supabase.from("sop_activity_logs").insert([
    {
      client_project_id: projectId,
      actor_user_id: user.id,
      event_type: "project_cancelled",
      event_detail: {
        cancelled_at: nowIso,
        client_name: project.clients?.org_name || project.clients?.name,
        project_type: project.project_type,
      },
    },
  ]);

  revalidatePath(`/admin/clients/${project.client_id}/projects/${projectId}`);
  revalidatePath(`/admin/clients/${project.client_id}`);
  revalidatePath("/admin/clients");
  revalidatePath("/admin/sop");
  revalidatePath("/workspace");

  return { success: true };
}

export async function deleteClientProject(projectId) {
  const { user, supabase } = await getAdminSession();

  if (!projectId) {
    return { success: false, error: "Project ID is required." };
  }

  // Fetch project and client details
  const { data: project, error: pErr } = await supabase
    .from("client_projects")
    .select("*, clients(id, org_name, name)")
    .eq("id", projectId)
    .single();

  if (pErr || !project) {
    return { success: false, error: "Client project not found." };
  }

  // Get project phases
  const { data: phases } = await supabase
    .from("project_phases")
    .select("id")
    .eq("client_project_id", projectId);

  const phaseIds = (phases || []).map((p) => p.id);

  // Check for in-flight tasks (in_progress or submitted_for_review)
  if (phaseIds.length > 0) {
    const { data: activeTasks } = await supabase
      .from("sop_tasks")
      .select("id, title, status")
      .in("project_phase_id", phaseIds)
      .in("status", ["in_progress", "submitted_for_review"]);

    if (activeTasks && activeTasks.length > 0) {
      return {
        success: false,
        error: `This project has ${activeTasks.length} task(s) currently in progress or awaiting review. Mark the project as completed or cancelled instead of deleting, or resolve those tasks first.`,
      };
    }
  }

  const nowIso = new Date().toISOString();

  // Log activity BEFORE deletion
  await supabase.from("sop_activity_logs").insert([
    {
      client_project_id: null,
      actor_user_id: user.id,
      event_type: "project_deleted",
      event_detail: {
        project_id: projectId,
        project_type: project.project_type,
        client_id: project.client_id,
        client_name: project.clients?.org_name || project.clients?.name,
        deleted_at: nowIso,
      },
    },
  ]);

  // Execute explicit FK-respecting deletion sequence:
  // 1. Delete sop_tasks
  if (phaseIds.length > 0) {
    await supabase.from("sop_tasks").delete().in("project_phase_id", phaseIds);
  }

  // 2. Unlink current_phase_id from project
  await supabase.from("client_projects").update({ current_phase_id: null }).eq("id", projectId);

  // 3. Delete project_phases
  await supabase.from("project_phases").delete().eq("client_project_id", projectId);

  // 4. Delete client_projects
  const { error: delErr } = await supabase.from("client_projects").delete().eq("id", projectId);

  if (delErr) {
    return { success: false, error: delErr.message };
  }

  revalidatePath(`/admin/clients/${project.client_id}`);
  revalidatePath("/admin/clients");
  revalidatePath("/admin/sop");
  revalidatePath("/workspace");

  return { success: true, clientId: project.client_id };
}

