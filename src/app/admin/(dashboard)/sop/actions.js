"use server";

import { getAdminSession } from "@/lib/supabase/authServer";
import { checkAndAdvancePhase } from "@/lib/sop/phaseEngine";
import { revalidatePath } from "next/cache";

export async function verifyTaskCompletion(sopTaskId) {
  const { user, supabase } = await getAdminSession();

  if (!sopTaskId) {
    return { success: false, error: "Task ID is required." };
  }

  // Find admin team member ID
  const { data: adminMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const verifierId = adminMember ? adminMember.id : null;

  // Fetch task details
  const { data: task, error: fetchErr } = await supabase
    .from("sop_tasks")
    .select("*, project_phases(*)")
    .eq("id", sopTaskId)
    .single();

  if (fetchErr || !task) {
    return { success: false, error: "Task not found." };
  }

  // Update status to completed and set verified_by
  const { error: updateErr } = await supabase
    .from("sop_tasks")
    .update({
      status: "completed",
      verified_by: verifierId,
    })
    .eq("id", sopTaskId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // Log activity
  await supabase.from("sop_activity_logs").insert([
    {
      client_project_id: task.project_phases?.client_project_id,
      sop_task_id: sopTaskId,
      actor_user_id: user.id,
      event_type: "task_verified",
      event_detail: { verified_by: verifierId },
    },
  ]);

  // Event-driven phase advancement check
  const phaseResult = await checkAndAdvancePhase(task.project_phase_id);

  revalidatePath("/admin/sop");
  revalidatePath("/workspace");

  return {
    success: true,
    phaseResult,
  };
}

export async function rejectTaskSubmission(sopTaskId, rejectionReason) {
  const { user, supabase } = await getAdminSession();

  if (!sopTaskId || !rejectionReason) {
    return { success: false, error: "Task ID and rejection reason are required." };
  }

  const { data: task, error: fetchErr } = await supabase
    .from("sop_tasks")
    .select("*, project_phases(client_project_id)")
    .eq("id", sopTaskId)
    .single();

  if (fetchErr || !task) {
    return { success: false, error: "Task not found." };
  }

  // Revert status back to in_progress and save rejection_reason
  const updatePayload = {
    status: "in_progress",
    rejection_reason: rejectionReason,
  };

  const { error: updateErr } = await supabase
    .from("sop_tasks")
    .update(updatePayload)
    .eq("id", sopTaskId);

  if (updateErr) {
    delete updatePayload.rejection_reason;
    await supabase.from("sop_tasks").update(updatePayload).eq("id", sopTaskId);
  }

  // Log activity
  await supabase.from("sop_activity_logs").insert([
    {
      client_project_id: task.project_phases?.client_project_id,
      sop_task_id: sopTaskId,
      actor_user_id: user.id,
      event_type: "task_rejected",
      event_detail: { reason: rejectionReason },
    },
  ]);

  // Enqueue notification to assigned team member
  if (task.assigned_to) {
    await supabase.from("sop_notifications").insert([
      {
        team_member_id: task.assigned_to,
        message: `Task '${task.title}' returned for revisions: ${rejectionReason}`,
        link_path: "/workspace",
      },
    ]);
  }

  revalidatePath("/admin/sop");
  revalidatePath("/workspace");

  return { success: true };
}
