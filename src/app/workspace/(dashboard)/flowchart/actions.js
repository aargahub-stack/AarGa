"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";

export async function saveFlowchart({ id, title, nodes, edges }) {
  try {
    const { teamMember, supabase } = await getWorkspaceSession();

    const payload = {
      title: title || "Untitled Flowchart",
      nodes: nodes || [],
      edges: edges || [],
      created_by: teamMember.id,
    };

    const query = id
      ? supabase.from("flowcharts").update(payload).eq("id", id).select().single()
      : supabase.from("flowcharts").insert([payload]).select().single();

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/workspace/flowchart");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || "Failed to save flowchart." };
  }
}

export async function loadFlowchart(id) {
  try {
    const { supabase } = await getWorkspaceSession();

    const { data, error } = await supabase
      .from("flowcharts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || "Failed to load flowchart." };
  }
}

export async function listMyFlowcharts() {
  try {
    const { teamMember, supabase } = await getWorkspaceSession();

    const { data, error } = await supabase
      .from("flowcharts")
      .select("id, title, updated_at, created_at, nodes, edges")
      .eq("created_by", teamMember.id)
      .order("updated_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: err.message || "Failed to list flowcharts." };
  }
}

export async function deleteFlowchart(id) {
  try {
    const { supabase } = await getWorkspaceSession();

    const { error } = await supabase.from("flowcharts").delete().eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/workspace/flowchart");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "Failed to delete flowchart." };
  }
}
