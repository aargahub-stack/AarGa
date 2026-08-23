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
