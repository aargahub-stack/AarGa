import { getAdminSession } from "@/lib/supabase/authServer";
import { suggestAssigneesForTask } from "./matching";

/**
 * Spawns a live client project from an active SOP template blueprint.
 * Re-validates admin privileges and executes ordered copying of phases and tasks.
 */
export async function spawnClientProject({ clientId, projectType }) {
  const { user, supabase } = await getAdminSession();

  if (!clientId || !projectType) {
    return { success: false, error: "Client ID and project type are required." };
  }

  // 1. Fetch active template for projectType (highest version)
  const { data: templates, error: tmplError } = await supabase
    .from("sop_templates")
    .select("*")
    .eq("project_type", projectType)
    .eq("is_active", true)
    .order("version", { ascending: false })
    .limit(1);

  if (tmplError) {
    return { success: false, error: tmplError.message };
  }

  if (!templates || templates.length === 0) {
    return {
      success: false,
      error: `No SOP template configured for project type '${projectType}' yet. Please create a template blueprint first.`,
    };
  }

  const template = templates[0];

  // Fetch template phases and tasks
  const { data: templatePhases, error: phasesError } = await supabase
    .from("sop_template_phases")
    .select("*, sop_template_tasks(*)")
    .eq("sop_template_id", template.id)
    .order("phase_order", { ascending: true });

  if (phasesError) {
    return { success: false, error: phasesError.message };
  }

  if (!templatePhases || templatePhases.length === 0) {
    return {
      success: false,
      error: `SOP template '${template.name}' has no defined phases.`,
    };
  }

  try {
    // a. Create client project row
    const { data: newProject, error: projError } = await supabase
      .from("client_projects")
      .insert([
        {
          client_id: clientId,
          project_type: projectType,
          sop_template_id: template.id,
          status: "onboarding",
        },
      ])
      .select()
      .single();

    if (projError || !newProject) {
      throw new Error(projError?.message || "Failed to create client project.");
    }

    const projectId = newProject.id;
    const createdPhases = [];
    const createdTasks = [];
    let phase1Id = null;

    // b. Copy phases and tasks
    for (const tPhase of templatePhases) {
      const isPhase1 = tPhase.phase_order === 1;
      const phaseStatus = isPhase1 ? "active" : "locked";

      const { data: insertedPhase, error: insPhaseErr } = await supabase
        .from("project_phases")
        .insert([
          {
            client_project_id: projectId,
            sop_template_phase_id: tPhase.id,
            phase_order: tPhase.phase_order,
            name: tPhase.name,
            status: phaseStatus,
            unlocked_at: isPhase1 ? new Date().toISOString() : null,
          },
        ])
        .select()
        .single();

      if (insPhaseErr || !insertedPhase) {
        throw new Error(insPhaseErr?.message || "Failed to insert project phase.");
      }

      createdPhases.push(insertedPhase);

      if (isPhase1) {
        phase1Id = insertedPhase.id;
      }

      // Copy tasks for this phase
      const tTasks = tPhase.sop_template_tasks || [];
      for (const tTask of tTasks) {
        const { data: insertedTask, error: insTaskErr } = await supabase
          .from("sop_tasks")
          .insert([
            {
              project_phase_id: insertedPhase.id,
              title: tTask.title,
              description: tTask.description,
              required_skill_tags: tTask.required_skill_tags || [],
              status: "unassigned",
              is_optional: tTask.is_optional,
              source: "template",
            },
          ])
          .select()
          .single();

        if (insTaskErr || !insertedTask) {
          throw new Error(insTaskErr?.message || "Failed to insert task.");
        }

        createdTasks.push(insertedTask);
      }
    }

    // c. Update client project current_phase_id and status to 'active'
    const { error: updateProjErr } = await supabase
      .from("client_projects")
      .update({
        current_phase_id: phase1Id,
        status: "active",
      })
      .eq("id", projectId);

    if (updateProjErr) {
      throw new Error(updateProjErr.message);
    }

    // d. Write activity log
    await supabase.from("sop_activity_logs").insert([
      {
        client_project_id: projectId,
        actor_user_id: user.id,
        event_type: "project_spawned",
        event_detail: {
          template_id: template.id,
          template_name: template.name,
          phases_count: createdPhases.length,
          tasks_count: createdTasks.length,
        },
      },
    ]);

    // e. Trigger matching suggestions for Phase 1 tasks
    const phase1Tasks = createdTasks.filter(
      (t) => t.project_phase_id === phase1Id
    );

    const suggestionsMap = {};
    for (const p1Task of phase1Tasks) {
      const suggestions = await suggestAssigneesForTask(p1Task.id);
      suggestionsMap[p1Task.id] = suggestions;
    }

    return {
      success: true,
      projectId,
      project: newProject,
      phases: createdPhases,
      tasks: createdTasks,
      suggestions: suggestionsMap,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
