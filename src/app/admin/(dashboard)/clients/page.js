import { getAdminSession } from "@/lib/supabase/authServer";
import ClientsView from "./ClientsView";

export default async function AdminClientsPage() {
  const { supabase } = await getAdminSession();

  const { data: clients } = await supabase
    .from("clients")
    .select("*, client_projects(*)")
    .order("created_at", { ascending: false });

  return <ClientsView clients={clients || []} />;
}
