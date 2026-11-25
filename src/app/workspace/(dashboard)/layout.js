import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";
import WorkspaceHeader from "./WorkspaceHeader";
import WorkspaceSidebar from "./WorkspaceSidebar";

export const metadata = {
  title: "Employee Workspace — AarGa SOP Engine",
  description: "Daily task execution queue and SOP workflow workspace.",
};

export default async function WorkspaceLayout({ children }) {
  const { teamMember, isAdminOversight, user, supabase } = await getWorkspaceSession();

  // Fetch unread notifications count for team member
  let unreadCount = 0;
  if (teamMember?.id) {
    const { data: notifications } = await supabase
      .from("sop_notifications")
      .select("id, read")
      .eq("team_member_id", teamMember.id)
      .eq("read", false);

    unreadCount = (notifications || []).length;
  }

  const displayMember = teamMember || {
    name: user.email?.split("@")[0] || "Administrator",
    role: "Administrator (Oversight)",
  };

  return (
    <div className="flex min-h-screen bg-paper font-sans text-ink antialiased">
      <WorkspaceSidebar teamMember={displayMember} />
      <div className="flex-1 flex flex-col min-w-0 pl-[260px]">
        <WorkspaceHeader teamMember={displayMember} unreadCount={unreadCount} />
        <main className="flex-1 w-full flex flex-col no-scrollbar">{children}</main>
      </div>
    </div>
  );
}
