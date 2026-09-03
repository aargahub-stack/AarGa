import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";
import ProfileView from "@/components/workspace/profile/ProfileView";

export const metadata = {
  title: "User Profile — AarGa Workspace",
};

export default async function ProfilePage() {
  const { teamMember } = await getWorkspaceSession();
  return <ProfileView teamMember={teamMember} />;
}
