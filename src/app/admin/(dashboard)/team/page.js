import { getAdminSession } from "@/lib/supabase/authServer";
import TeamWorkloadView from "./TeamWorkloadView";

export default async function AdminTeamWorkloadPage() {
  const { supabase } = await getAdminSession();

  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("*, team_member_skills(*, skills(name)), sop_tasks:sop_tasks!sop_tasks_assigned_to_fkey(*)")
    .eq("active", true)
    .order("name", { ascending: true });

  return <TeamWorkloadView teamMembers={teamMembers || []} />;
}
