import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";

export const metadata = {
  title: "Flowchart Studio — AarGa OS Workspace",
  description: "Dedicated 100% full-screen flowchart and diagramming studio.",
};

export default async function StandaloneLayout({ children }) {
  await getWorkspaceSession();

  return (
    <div className="h-screen w-screen bg-slate-950 font-sans text-white overflow-hidden antialiased">
      {children}
    </div>
  );
}
