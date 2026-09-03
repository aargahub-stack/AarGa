import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";
import ToolsGrid from "@/components/workspace/tools/ToolsGrid";

export const metadata = {
  title: "Tools Hub — AarGa Workspace",
};

export default async function ToolsHubPage() {
  await getWorkspaceSession();
  return <ToolsGrid />;
}
