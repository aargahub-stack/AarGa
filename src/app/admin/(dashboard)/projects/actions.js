"use server";

import { getAdminSession } from "@/lib/supabase/authServer";
import { revalidatePath } from "next/cache";

function parseProjectFormData(formData) {
  const title = formData.get("title")?.toString().trim();
  const slug = formData.get("slug")?.toString().trim().toLowerCase();
  const category = formData.get("category")?.toString().trim();
  const tagline = formData.get("tagline")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const live_url = formData.get("live_url")?.toString().trim();
  const status = formData.get("status")?.toString().trim() || "Alpha";
  const accent = formData.get("accent")?.toString().trim() || "emerald";
  const size = formData.get("size")?.toString().trim() || "sm";

  const rawTechStack = formData.get("tech_stack")?.toString() || "";
  const tech_stack = rawTechStack
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const rawMetrics = formData.get("metrics_json")?.toString() || "{}";
  let metrics = {};
  try {
    metrics = JSON.parse(rawMetrics);
  } catch {
    metrics = {};
  }

  if (!title || !slug || !category) {
    throw new Error("Title, slug, and category are required fields.");
  }

  return {
    title,
    slug,
    category,
    tagline,
    description,
    live_url,
    status,
    accent,
    size,
    tech_stack,
    metrics,
  };
}

function triggerSiteRevalidation() {
  revalidatePath("/admin/projects");
  revalidatePath("/tech");
  revalidatePath("/ecosystem");
  revalidatePath("/");
}

export async function createProjectAction(formData) {
  const { supabase } = await getAdminSession();

  try {
    const payload = parseProjectFormData(formData);

    const { error } = await supabase.from("projects").insert([payload]);

    if (error) {
      return { success: false, error: error.message };
    }

    triggerSiteRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateProjectAction(id, formData) {
  const { supabase } = await getAdminSession();

  try {
    const payload = parseProjectFormData(formData);

    const { error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    triggerSiteRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteProjectAction(id) {
  const { supabase } = await getAdminSession();

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  triggerSiteRevalidation();
  return { success: true };
}
