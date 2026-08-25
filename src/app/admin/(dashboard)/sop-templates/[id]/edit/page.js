import { getAdminSession } from "@/lib/supabase/authServer";
import { notFound } from "next/navigation";
import SopTemplateBuilderView from "../../SopTemplateBuilderView";

export default async function EditSopTemplatePage({ params }) {
  const { id } = await params;
  const { supabase } = await getAdminSession();

  const [{ data: template }, { data: skills }] = await Promise.all([
    supabase
      .from("sop_templates")
      .select("*, sop_template_phases(*, sop_template_tasks(*))")
      .eq("id", id)
      .single(),
    supabase.from("skills").select("name"),
  ]);

  if (!template) {
    notFound();
  }

  return (
    <SopTemplateBuilderView
      initialTemplate={template}
      availableSkills={(skills || []).map((s) => s.name)}
    />
  );
}
