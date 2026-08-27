import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";
import WorkspaceTaskView from "./WorkspaceTaskView";

export default async function WorkspaceDashboardPage() {
  const { teamMember, supabase } = await getWorkspaceSession();

  // Query assigned tasks, notifications, and rejection activity logs concurrently
  const [{ data: allAssignedTasks }, { data: notifications }, { data: rejectionLogs }] =
    await Promise.all([
      supabase
        .from("sop_tasks")
        .select("*, project_phases(*, client_projects(*, clients(*)))")
        .eq("assigned_to", teamMember.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("sop_notifications")
        .select("*")
        .eq("team_member_id", teamMember.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("sop_activity_logs")
        .select("*")
        .eq("event_type", "task_rejected")
        .order("created_at", { ascending: false }),
    ]);

  const tasksList = allAssignedTasks || [];

  // Map rejection logs to tasks if rejection_reason column isn't directly populated
  const rejectionMap = new Map();
  (rejectionLogs || []).forEach((log) => {
    if (log.sop_task_id && !rejectionMap.has(log.sop_task_id)) {
      rejectionMap.set(log.sop_task_id, log.event_detail?.reason);
    }
  });

  const enrichedTasks = tasksList.map((t) => ({
    ...t,
    rejection_reason: t.rejection_reason || rejectionMap.get(t.id) || null,
  }));

  // Actionable tasks MUST belong to an active phase
  const activeTasks = enrichedTasks.filter(
    (t) =>
      t.status !== "completed" &&
      t.project_phases?.status === "active"
  );

  // Completed tasks for read-only history section
  const completedTasks = enrichedTasks.filter((t) => t.status === "completed");

  return (
    <WorkspaceTaskView
      teamMember={teamMember}
      activeTasks={activeTasks}
      completedTasks={completedTasks}
      notifications={notifications || []}
    />
  );
}
