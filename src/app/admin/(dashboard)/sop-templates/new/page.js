import { getAdminSession } from "@/lib/supabase/authServer";
import SopTemplateBuilderView from "../SopTemplateBuilderView";

export default async function NewSopTemplatePage() {
  const { supabase } = await getAdminSession();

  const { data: skills } = await supabase.from("skills").select("name");

  return (
    <SopTemplateBuilderView
      initialTemplate={null}
      availableSkills={(skills || []).map((s) => s.name)}
    />
  );
}
