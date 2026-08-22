import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";
import WorkspaceHeader from "./WorkspaceHeader";

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
    <div className="flex min-h-screen flex-col bg-paper font-sans text-ink antialiased">
      <WorkspaceHeader teamMember={teamMember} unreadCount={unreadCount} />
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 sm:p-8 no-scrollbar">{children}</main>
    </div>
  );
}
