import { getAdminSession } from "@/lib/supabase/authServer";
import { notFound } from "next/navigation";
import ProjectPhaseControlView from "./ProjectPhaseControlView";

export default async function AdminProjectPhaseControlPage({ params }) {
  const { clientId, projectId } = await params;
  const { supabase } = await getAdminSession();

  const [{ data: project }, { data: client }, { data: phases }, { data: activityLogs }] =
    await Promise.all([
      supabase.from("client_projects").select("*").eq("id", projectId).single(),
      supabase.from("clients").select("*").eq("id", clientId).single(),
      supabase
        .from("project_phases")
        .select("*, sop_tasks(*, team_members(id, name, role)))")
        .eq("client_project_id", projectId)
        .order("phase_order", { ascending: true }),
      supabase
        .from("sop_activity_logs")
        .select("*")
        .eq("client_project_id", projectId)
        .order("created_at", { ascending: false }),
    ]);

  if (!project || !client) {
    notFound();
  }

  return (
    <ProjectPhaseControlView
      project={project}
      client={client}
      phases={phases || []}
      activityLogs={activityLogs || []}
    />
  );
}
