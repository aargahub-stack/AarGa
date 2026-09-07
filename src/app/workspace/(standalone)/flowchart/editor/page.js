import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";
import { loadFlowchart } from "@/app/workspace/(dashboard)/flowchart/actions";
import FlowchartCanvas from "@/components/workspace/flowchart/FlowchartCanvas";

export const metadata = {
  title: "Flowchart Studio — AarGa OS",
  description: "Dedicated 100% full-screen flowchart canvas and code-to-diagram studio.",
};

export default async function DedicatedFlowchartEditorPage({ searchParams }) {
  const { teamMember } = await getWorkspaceSession();
  const params = await searchParams;
  const id = params?.id;

  let flowchartData = null;

  if (id) {
    const res = await loadFlowchart(id);
    if (res.success) {
      flowchartData = res.data;
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950">
      <FlowchartCanvas
        initialFlowchart={flowchartData}
        teamMemberId={teamMember.id}
        isStandalone={true}
      />
    </div>
  );
}
