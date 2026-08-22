"use server";

import { getAdminSession } from "@/lib/supabase/authServer";
import { revalidatePath } from "next/cache";

function parseMetricFormData(formData) {
  const entity_type = formData.get("entity_type")?.toString().trim();
  const metric_key = formData
    .get("metric_key")
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_");
  const metric_label = formData.get("metric_label")?.toString().trim();
  const metric_value = formData.get("metric_value")?.toString().trim();
  const display_order = parseInt(
    formData.get("display_order")?.toString() || "1",
    10
  );

  if (!entity_type || !metric_key || !metric_label || !metric_value) {
    throw new Error(
      "Entity type, metric key, metric label, and metric value are required fields."
    );
  }

  return {
    entity_type,
    metric_key,
    metric_label,
    metric_value,
    display_order: isNaN(display_order) ? 1 : display_order,
  };
}

function triggerEcosystemRevalidation() {
  revalidatePath("/admin/ecosystem-metrics");
  revalidatePath("/admin/ecosystem");
  revalidatePath("/");
  revalidatePath("/ecosystem");
}

export async function createMetricAction(formData) {
  const { supabase } = await getAdminSession();

  try {
    const payload = parseMetricFormData(formData);

    // Check if key already exists for this entity
    const { data: existing } = await supabase
      .from("ecosystem_metrics")
      .select("id")
      .eq("entity_type", payload.entity_type)
      .eq("metric_key", payload.metric_key)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: `A metric with key '${payload.metric_key}' already exists for entity '${payload.entity_type}'. Please use Edit instead.`,
      };
    }

    const { error } = await supabase
      .from("ecosystem_metrics")
      .insert([payload]);

    if (error) {
      return { success: false, error: error.message };
    }

    triggerEcosystemRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateMetricAction(id, formData) {
  const { supabase } = await getAdminSession();

  try {
    const entity_type = formData.get("entity_type")?.toString().trim();
    const metric_label = formData.get("metric_label")?.toString().trim();
    const metric_value = formData.get("metric_value")?.toString().trim();
    const display_order = parseInt(
      formData.get("display_order")?.toString() || "1",
      10
    );

    if (!entity_type || !metric_label || !metric_value) {
      throw new Error("Entity type, metric label, and metric value are required.");
    }

    const payload = {
      entity_type,
      metric_label,
      metric_value,
      display_order: isNaN(display_order) ? 1 : display_order,
    };

    const { error } = await supabase
      .from("ecosystem_metrics")
      .update(payload)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    triggerEcosystemRevalidation();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteMetricAction(id) {
  const { supabase } = await getAdminSession();

  const { error } = await supabase
    .from("ecosystem_metrics")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  triggerEcosystemRevalidation();
  return { success: true };
}
