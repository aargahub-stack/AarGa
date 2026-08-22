"use server";

import { getAdminSession } from "@/lib/supabase/authServer";
import { revalidatePath } from "next/cache";

function parseInternFormData(formData) {
  const name = formData.get("name")?.toString().trim();
  const profile_slug = formData.get("profile_slug")?.toString().trim().toLowerCase();
  const role = formData.get("role")?.toString().trim();
  const cohort_label = formData.get("cohort_label")?.toString().trim();
  const cohort_date = formData.get("cohort_date")?.toString().trim() || null;
  const location = formData.get("location")?.toString().trim();
  const avatar_initials = formData.get("avatar_initials")?.toString().trim().toUpperCase();
  const telemetry_score = parseInt(formData.get("telemetry_score")?.toString() || "0", 10);
  const verified_status = formData.get("verified_status")?.toString().trim() || "In Review";
  const college_info = formData.get("college_info")?.toString().trim();
  const projects_shipped = parseInt(formData.get("projects_shipped")?.toString() || "0", 10);
  const blurb = formData.get("blurb")?.toString().trim();

  const rawSkills = formData.get("skills")?.toString() || "";
  const skills = rawSkills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!name || !profile_slug || !role) {
    throw new Error("Name, profile slug, and role are required fields.");
  }

  return {
    name,
    profile_slug,
    role,
    cohort_label,
    cohort_date: cohort_date || null,
    location,
    avatar_initials: avatar_initials || name.slice(0, 2).toUpperCase(),
    telemetry_score: isNaN(telemetry_score) ? 0 : Math.min(100, Math.max(0, telemetry_score)),
    verified_status,
    skills,
    college_info,
    projects_shipped: isNaN(projects_shipped) ? 0 : projects_shipped,
    blurb,
  };
}

function triggerInternRevalidation() {
  revalidatePath("/admin/interns");
  revalidatePath("/interns");
  revalidatePath("/ecosystem");
}

export async function createInternAction(formData) {
  const { supabase } = await getAdminSession();

  try {
    const payload = parseInternFormData(formData);

    const { error } = await supabase.from("interns").insert([payload]);

    if (error) {
      return { success: false, error: error.message };
    }

    triggerInternRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateInternAction(id, formData) {
  const { supabase } = await getAdminSession();

  try {
    const payload = parseInternFormData(formData);

    const { error } = await supabase
      .from("interns")
      .update(payload)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    triggerInternRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteInternAction(id) {
  const { supabase } = await getAdminSession();

  const { error } = await supabase.from("interns").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  triggerInternRevalidation();
  return { success: true };
}
