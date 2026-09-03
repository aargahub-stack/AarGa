import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";
import WorkspaceTaskView from "./WorkspaceTaskView";
import { getAttendanceDataAction, getCompensationDataAction } from "./dashboardActions";

export default async function WorkspaceDashboardPage() {
  const { teamMember, supabase } = await getWorkspaceSession();

  // Query assigned tasks, notifications, attendance, and compensation concurrently
  const [
    { data: allAssignedTasks },
    { data: notifications },
    attendanceData,
    compensationData,
  ] = await Promise.all([
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
    getAttendanceDataAction(),
    getCompensationDataAction(),
  ]);

  const tasksList = allAssignedTasks || [];

  // Parse rejection reasons from sop_notifications ("Task 'Title' returned for revisions: <Reason>")
  const notifRejectionMap = new Map();
  (notifications || []).forEach((n) => {
    if (n.message && n.message.includes("returned for revisions:")) {
      const parts = n.message.split("returned for revisions:");
      if (parts[1]) {
        const reason = parts[1].trim();
        const match = parts[0].match(/Task ['"](.*?)['"]/);
        if (match && match[1]) {
          const taskTitle = match[1].trim();
          if (!notifRejectionMap.has(taskTitle)) {
            notifRejectionMap.set(taskTitle, reason);
          }
        }
      }
    }
  });

  const enrichedTasks = tasksList.map((t) => {
    const reasonFromNotif = notifRejectionMap.get(t.title?.trim());
    return {
      ...t,
      rejection_reason: t.rejection_reason || reasonFromNotif || null,
    };
  });

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
      attendanceData={attendanceData}
      compensationData={compensationData}
    />
  );
}
