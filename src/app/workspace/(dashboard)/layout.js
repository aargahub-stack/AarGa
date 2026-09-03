import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";
import WorkspaceHeader from "./WorkspaceHeader";
import WorkspaceSidebar from "./WorkspaceSidebar";

export const metadata = {
  title: "Employee Workspace — AarGa SOP Engine",
  description: "Daily task execution queue and SOP workflow workspace.",
};

export default async function WorkspaceLayout({ children }) {
  const { teamMember, supabase } = await getWorkspaceSession();

  // Fetch unread notifications count for team member
  const { data: notifications } = await supabase
    .from("sop_notifications")
    .select("id, read")
    .eq("team_member_id", teamMember.id)
    .eq("read", false);

  const unreadCount = (notifications || []).length;

  return (
    <div className="flex min-h-screen bg-paper font-sans text-ink antialiased">
      <WorkspaceSidebar teamMember={teamMember} />
      <div className="flex-1 flex flex-col min-w-0 pl-[260px]">
        <WorkspaceHeader teamMember={teamMember} unreadCount={unreadCount} />
        <main className="flex-1 w-full flex flex-col no-scrollbar">{children}</main>
      </div>
    </div>
  );
}
