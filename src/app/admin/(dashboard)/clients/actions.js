"use server";

import { getAdminSession } from "@/lib/supabase/authServer";
import { spawnClientProject } from "@/lib/sop/spawnProject";
import { revalidatePath } from "next/cache";

export async function createClientAction(formData) {
  const { supabase } = await getAdminSession();

  const name = formData.get("name")?.toString().trim();
  const contact_email = formData.get("contact_email")?.toString().trim();
  const org_name = formData.get("org_name")?.toString().trim();

  if (!name || !contact_email || !org_name) {
    return { success: false, error: "Name, contact email, and organization name are required." };
  }

  const { data: newClient, error } = await supabase
    .from("clients")
    .insert([{ name, contact_email, org_name }])
    .select()
    .single();

  if (error || !newClient) {
    return { success: false, error: error?.message || "Failed to create client record." };
  }

  revalidatePath("/admin/clients");
  return { success: true, clientId: newClient.id, client: newClient };
}

export async function spawnProjectAction(clientId, projectType) {
  const { user } = await getAdminSession();

  if (!clientId || !projectType) {
    return { success: false, error: "Client ID and Project Type are required." };
  }

  const res = await spawnClientProject({ clientId, projectType });

  if (res.success) {
    revalidatePath("/admin/clients");
    revalidatePath("/admin/sop");
    revalidatePath("/workspace");
  }

  return res;
}

export async function deleteClientAction(clientId) {
  const { user, supabase } = await getAdminSession();

  if (!clientId) {
    return { success: false, error: "Client ID is required." };
  }

  // Fetch client info
  const { data: client, error: cErr } = await supabase
    .from("clients")
    .select("*, client_projects(*)")
    .eq("id", clientId)
    .single();

  if (cErr || !client) {
    return { success: false, error: "Client record not found." };
  }

  const projects = client.client_projects || [];
  const activeProjects = projects.filter((p) =>
    ["onboarding", "active", "on_hold"].includes(p.status)
  );

  if (activeProjects.length > 0) {
    return {
      success:
        false,
      error: `This client has ${activeProjects.length} active project(s). Complete or cancel them first before deleting the client record.`,
    };
  }

  const nowIso = new Date().toISOString();

  // Log activity BEFORE deletion
  await supabase.from("sop_activity_logs").insert([
    {
      client_project_id: null,
      actor_user_id: user.id,
      event_type: "client_deleted",
      event_detail: {
        client_id: clientId,
        name: client.name,
        org_name: client.org_name,
        contact_email: client.contact_email,
        deleted_at: nowIso,
      },
    },
  ]);

  // Execute explicit FK-safe deletion for all associated projects & phases
  for (const proj of projects) {
    const { data: phases } = await supabase
      .from("project_phases")
      .select("id")
      .eq("client_project_id", proj.id);

    const phaseIds = (phases || []).map((p) => p.id);

    if (phaseIds.length > 0) {
      await supabase.from("sop_tasks").delete().in("project_phase_id", phaseIds);
    }

    await supabase
      .from("client_projects")
      .update({ current_phase_id: null })
      .eq("id", proj.id);

    await supabase.from("project_phases").delete().eq("client_project_id", proj.id);
    await supabase.from("client_projects").delete().eq("id", proj.id);
  }

  // Delete client row
  const { error: delErr } = await supabase.from("clients").delete().eq("id", clientId);

  if (delErr) {
    return { success: false, error: delErr.message };
  }

  revalidatePath("/admin/clients");
  revalidatePath("/admin/sop");
  revalidatePath("/workspace");

  return { success: true };
}

