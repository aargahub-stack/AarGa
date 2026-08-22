"use server";

import { getAdminSession } from "@/lib/supabase/authServer";
import { revalidatePath } from "next/cache";

export async function createAdminTask(formData) {
  const { supabase } = await getAdminSession();

  const title = formData.get("title")?.toString().trim();
  if (!title) {
    return { success: false, error: "Task title cannot be empty." };
  }

  const { error } = await supabase.from("admin_tasks").insert([{ title }]);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function toggleTaskStatus(id, currentStatus) {
  const { supabase } = await getAdminSession();

  const nextStatus = currentStatus === "completed" ? "pending" : "completed";

  const { error } = await supabase
    .from("admin_tasks")
    .update({ status: nextStatus })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function deleteAdminTask(id) {
  const { supabase } = await getAdminSession();

  const { error } = await supabase.from("admin_tasks").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}
