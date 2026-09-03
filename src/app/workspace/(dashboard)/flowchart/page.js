import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";
import FlowchartCanvas from "@/components/workspace/flowchart/FlowchartCanvas";
import FlowchartList from "@/components/workspace/flowchart/FlowchartList";
import { listMyFlowcharts } from "./actions";

export const metadata = {
  title: "Flowchart Maker — AarGa Workspace",
};

export default async function FlowchartPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const { teamMember, supabase } = await getWorkspaceSession();

  const loadId = resolvedSearchParams?.id;
  const isNew = resolvedSearchParams?.new === "true";

  // Mode 1: Editor Canvas View (either loading existing flowchart by ID or starting new blank canvas)
  if (loadId || isNew) {
    let initialFlowchart = null;

    if (loadId) {
      const { data } = await supabase
        .from("flowcharts")
        .select("*")
        .eq("id", loadId)
        .eq("created_by", teamMember.id)
        .maybeSingle();

      initialFlowchart = data;
    }

    return (
      <FlowchartCanvas
        initialFlowchart={initialFlowchart}
        teamMemberId={teamMember.id}
      />
    );
  }

  // Mode 2: Landing View showing user's saved flowcharts grid
  const res = await listMyFlowcharts();
  const flowcharts = res.success ? res.data : [];

  return <FlowchartList flowcharts={flowcharts} teamMember={teamMember} />;
}
