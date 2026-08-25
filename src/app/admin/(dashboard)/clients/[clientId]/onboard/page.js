import { getAdminSession } from "@/lib/supabase/authServer";
import { notFound } from "next/navigation";
import OnboardWizardView from "./OnboardWizardView";

export default async function AdminClientOnboardPage({ params }) {
  const { clientId } = await params;
  const { supabase } = await getAdminSession();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (!client) {
    notFound();
  }

  return <OnboardWizardView client={client} />;
}
