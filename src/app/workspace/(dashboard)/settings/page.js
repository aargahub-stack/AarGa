import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";
import SettingsView from "@/components/workspace/settings/SettingsView";

export const metadata = {
  title: "Workspace Settings — AarGa Workspace",
};

export default async function SettingsPage() {
  const { teamMember } = await getWorkspaceSession();
  return <SettingsView teamMember={teamMember} />;
}
