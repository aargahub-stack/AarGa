import { getAdminSession } from "@/lib/supabase/authServer";
import { notFound } from "next/navigation";
import OnboardWizardView from "./OnboardWizardView";

export default async function AdminClientOnboardPage({ params }) {
  const { id } = await params;
  const { supabase } = await getAdminSession();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) {
    notFound();
  }

  return <OnboardWizardView client={client} />;
}
