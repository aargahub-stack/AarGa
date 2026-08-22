import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";
import WorkspaceTaskView from "./WorkspaceTaskView";

export default async function WorkspaceDashboardPage() {
  const { teamMember, supabase } = await getWorkspaceSession();

  // Query all tasks assigned to current team member
  const { data: allAssignedTasks } = await supabase
    .from("sop_tasks")
    .select("*, project_phases(*, client_projects(*, clients(*)))")
    .eq("assigned_to", teamMember.id)
    .order("created_at", { ascending: false });

  const tasksList = allAssignedTasks || [];

  // Actionable tasks MUST belong to an active phase
  const activeTasks = tasksList.filter(
    (t) =>
      t.status !== "completed" &&
      t.project_phases?.status === "active"
  );

  // Completed tasks for read-only history section
  const completedTasks = tasksList.filter((t) => t.status === "completed");

  return (
    <WorkspaceTaskView
      teamMember={teamMember}
      activeTasks={activeTasks}
      completedTasks={completedTasks}
    />
  );
}
