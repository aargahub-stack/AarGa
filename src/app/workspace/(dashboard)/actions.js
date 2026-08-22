"use server";

import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";
import { revalidatePath } from "next/cache";

export async function startTaskAction(sopTaskId) {
  const { teamMember, supabase } = await getWorkspaceSession();

  if (!sopTaskId) {
    return { success: false, error: "Task ID is required." };
  }

  // 1. Fetch task and ownership re-validation
  const { data: task, error: fetchErr } = await supabase
    .from("sop_tasks")
    .select("*, project_phases(client_project_id)")
    .eq("id", sopTaskId)
    .single();

  if (fetchErr || !task) {
    return { success: false, error: "Task not found." };
  }

  if (task.assigned_to !== teamMember.id) {
    return { success: false, error: "Unauthorized. Task is not assigned to you." };
  }

  if (task.status !== "assigned") {
    return { success: false, error: `Cannot start task from state '${task.status}'.` };
  }

  // 2. Transition status to in_progress
  const { error: updateErr } = await supabase
    .from("sop_tasks")
    .update({ status: "in_progress" })
    .eq("id", sopTaskId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // 3. Log activity
  await supabase.from("sop_activity_logs").insert([
    {
      client_project_id: task.project_phases?.client_project_id,
      sop_task_id: sopTaskId,
      actor_user_id: teamMember.user_id,
      event_type: "task_started",
      event_detail: { assigned_to: teamMember.id },
    },
  ]);

  revalidatePath("/workspace");
  return { success: true };
}

export async function submitTaskForReviewAction(sopTaskId, submissionNote = "") {
  const { teamMember, supabase } = await getWorkspaceSession();

  if (!sopTaskId) {
    return { success: false, error: "Task ID is required." };
  }

  // 1. Fetch task and ownership re-validation
  const { data: task, error: fetchErr } = await supabase
    .from("sop_tasks")
    .select("*, project_phases(client_project_id)")
    .eq("id", sopTaskId)
    .single();

  if (fetchErr || !task) {
    return { success: false, error: "Task not found." };
  }

  if (task.assigned_to !== teamMember.id) {
    return { success: false, error: "Unauthorized. Task is not assigned to you." };
  }

  if (task.status !== "in_progress") {
    return { success: false, error: `Cannot submit task from state '${task.status}'.` };
  }

  // 2. Transition status to submitted_for_review
  const { error: updateErr } = await supabase
    .from("sop_tasks")
    .update({
      status: "submitted_for_review",
      submission_note: submissionNote,
    })
    .eq("id", sopTaskId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // 3. Log activity
  await supabase.from("sop_activity_logs").insert([
    {
      client_project_id: task.project_phases?.client_project_id,
      sop_task_id: sopTaskId,
      actor_user_id: teamMember.user_id,
      event_type: "task_submitted_for_review",
      event_detail: {
        assigned_to: teamMember.id,
        submission_note: submissionNote,
      },
    },
  ]);

  revalidatePath("/workspace");
  revalidatePath("/admin/sop");
  return { success: true };
}
