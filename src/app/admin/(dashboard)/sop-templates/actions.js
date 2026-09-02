"use server";

import { getAdminSession } from "@/lib/supabase/authServer";
import { revalidatePath } from "next/cache";

/**
 * Saves (inserts or updates) a complete SOP template tree.
 * CONFIRMATION: Editing an existing template NEVER retroactively alters already-spawned
 * live projects, as client_projects/project_phases/sop_tasks are independent copies.
 */
export async function saveTemplate({
  templateId = null,
  projectType,
  name,
  version = 1,
  isActive = true,
  phases = [],
}) {
  const { user, supabase } = await getAdminSession();

  if (!projectType || !name) {
    return { success: false, error: "Project type and template name are required." };
  }

  try {
    let targetTemplateId = templateId;

    // Use the exact version requested by the user
    let finalVersion = Number(version) || 1;

    if (targetTemplateId) {
      // Update existing template header
      const { error: tmplUpdateErr } = await supabase
        .from("sop_templates")
        .update({
          project_type: projectType,
          name,
          version: finalVersion,
          is_active: isActive,
        })
        .eq("id", targetTemplateId);

      if (tmplUpdateErr) {
        return { success: false, error: tmplUpdateErr.message };
      }

      // Delete existing phases (cascade deletes old template tasks)
      const { error: delErr } = await supabase
        .from("sop_template_phases")
        .delete()
        .eq("sop_template_id", targetTemplateId);

      if (delErr) {
        return { success: false, error: `Failed to refresh template phases: ${delErr.message}` };
      }
    } else {
      // Insert new template header
      const { data: newTmpl, error: tmplInsErr } = await supabase
        .from("sop_templates")
        .insert([
          {
            project_type: projectType,
            name,
            version: finalVersion,
            is_active: isActive,
          },
        ])
        .select()
        .single();

      if (tmplInsErr || !newTmpl) {
        return { success: false, error: tmplInsErr?.message || "Failed to create template." };
      }

      targetTemplateId = newTmpl.id;
    }

    // 1. Collect all unique skill tags across all phases & tasks for a SINGLE batch upsert subrequest
    const allSkillTags = new Set();
    phases.forEach((p) => {
      (p.tasks || []).forEach((t) => {
        (t.required_skill_tags || []).forEach((tag) => {
          if (tag && tag.trim()) allSkillTags.add(tag.trim());
        });
      });
    });

    if (allSkillTags.size > 0) {
      const skillsBatch = Array.from(allSkillTags).map((tag) => ({
        name: tag,
        category: "SOP Tag",
      }));
      await supabase
        .from("skills")
        .upsert(skillsBatch, { onConflict: "name", ignoreDuplicates: true });
    }

    // 2. Insert updated phases & tasks in batched operations
    for (let pIdx = 0; pIdx < phases.length; pIdx++) {
      const phase = phases[pIdx];
      const phaseOrder = pIdx + 1;

      const { data: insPhase, error: phaseInsErr } = await supabase
        .from("sop_template_phases")
        .insert([
          {
            sop_template_id: targetTemplateId,
            phase_order: phaseOrder,
            name: phase.name || `Phase ${phaseOrder}`,
            description: phase.description || "",
            exit_criteria: Array.isArray(phase.exit_criteria) ? phase.exit_criteria : [],
          },
        ])
        .select()
        .single();

      if (phaseInsErr || !insPhase) {
        throw new Error(phaseInsErr?.message || `Failed to insert phase ${phaseOrder}`);
      }

      const tasks = phase.tasks || [];
      if (tasks.length > 0) {
        const batchedTasks = tasks.map((task, tIdx) => {
          const taskOrder = tIdx + 1;
          const skillTags = Array.isArray(task.required_skill_tags)
            ? task.required_skill_tags.filter(Boolean)
            : [];
          return {
            sop_template_phase_id: insPhase.id,
            title: task.title || `Task ${taskOrder}`,
            description: task.description || "",
            required_skill_tags: skillTags,
            estimated_hours: Number(task.estimated_hours) || 4.0,
            task_order: taskOrder,
            is_optional: Boolean(task.is_optional),
          };
        });

        const { error: taskInsErr } = await supabase
          .from("sop_template_tasks")
          .insert(batchedTasks);

        if (taskInsErr) {
          throw new Error(taskInsErr.message);
        }
      }
    }

    revalidatePath("/admin/sop-templates");
    revalidatePath("/admin/clients");

    return { success: true, templateId: targetTemplateId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a template ONLY if 0 live projects reference it.
 */
export async function deleteTemplate(templateId) {
  const { supabase } = await getAdminSession();

  if (!templateId) {
    return { success: false, error: "Template ID is required." };
  }

  // Check if live projects reference this template
  const { count, error: countErr } = await supabase
    .from("client_projects")
    .select("id", { count: "exact", head: true })
    .eq("sop_template_id", templateId);

  if (countErr) {
    return { success: false, error: countErr.message };
  }

  if (count && count > 0) {
    return {
      success: false,
      error: `${count} live project(s) were spawned from this template — deactivate it instead of deleting.`,
    };
  }

  const { error: delErr } = await supabase
    .from("sop_templates")
    .delete()
    .eq("id", templateId);

  if (delErr) {
    return { success: false, error: delErr.message };
  }

  revalidatePath("/admin/sop-templates");
  return { success: true };
}

/**
 * Convenience Action: Clones an existing template + phases + tasks as a new version or copy.
 */
export async function duplicateTemplate(templateId) {
  const { supabase } = await getAdminSession();

  if (!templateId) {
    return { success: false, error: "Template ID is required." };
  }

  // Fetch original template
  const { data: sourceTmpl, error: fetchErr } = await supabase
    .from("sop_templates")
    .select("*, sop_template_phases(*, sop_template_tasks(*))")
    .eq("id", templateId)
    .single();

  if (fetchErr || !sourceTmpl) {
    return { success: false, error: "Source template not found." };
  }

  // Find max version for this project_type
  const { data: existingVersions } = await supabase
    .from("sop_templates")
    .select("version")
    .eq("project_type", sourceTmpl.project_type);

  const maxVer = Math.max(0, ...(existingVersions || []).map((v) => v.version || 1));
  const newVer = maxVer + 1;

  const phases = (sourceTmpl.sop_template_phases || [])
    .sort((a, b) => a.phase_order - b.phase_order)
    .map((p) => ({
      name: p.name,
      description: p.description,
      exit_criteria: p.exit_criteria || [],
      tasks: (p.sop_template_tasks || [])
        .sort((a, b) => a.task_order - b.task_order)
        .map((t) => ({
          title: t.title,
          description: t.description,
          required_skill_tags: t.required_skill_tags || [],
          estimated_hours: t.estimated_hours,
          is_optional: t.is_optional,
        })),
    }));

  return saveTemplate({
    templateId: null,
    projectType: sourceTmpl.project_type,
    name: `${sourceTmpl.name} (v${newVer})`,
    version: newVer,
    isActive: true,
    phases,
  });
}
