import { getAdminSession } from "@/lib/supabase/authServer";
import SopReviewView from "./SopReviewView";

export default async function AdminSopReviewPage() {
  const { supabase } = await getAdminSession();

  // Query tasks submitted for review
  const { data: reviewTasks } = await supabase
    .from("sop_tasks")
    .select("*, team_members(name, role), project_phases(*, client_projects(*, clients(*)))")
    .eq("status", "submitted_for_review")
    .order("created_at", { ascending: false });

  // Query active client projects
  const { data: activeProjects } = await supabase
    .from("client_projects")
    .select("*, clients(*), project_phases(*)")
    .order("created_at", { ascending: false });

  return (
    <SopReviewView
      reviewTasks={reviewTasks || []}
      activeProjects={activeProjects || []}
    />
  );
}
