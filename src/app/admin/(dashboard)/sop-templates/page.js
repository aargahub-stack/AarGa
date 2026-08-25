import { getAdminSession } from "@/lib/supabase/authServer";
import SopTemplatesListView from "./SopTemplatesListView";

export default async function AdminSopTemplatesPage() {
  const { supabase } = await getAdminSession();

  const { data: templates } = await supabase
    .from("sop_templates")
    .select("*, sop_template_phases(*, sop_template_tasks(*))")
    .order("created_at", { ascending: false });

  return <SopTemplatesListView templates={templates || []} />;
}
