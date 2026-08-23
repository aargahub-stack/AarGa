import { getAdminSession } from "@/lib/supabase/authServer";
import { suggestAssigneesForTask } from "./matching";

/**
 * Spawns a live client project from an active SOP template blueprint.
 * Re-validates admin privileges and executes ordered copying of phases and tasks.
 * Includes diagnostic error logging to distinguish between RLS policy blocks and missing data rows.
 */
export async function spawnClientProject({ clientId, projectType }) {
  const { user, supabase } = await getAdminSession();

  if (!clientId || !projectType) {
    return { success: false, error: "Client ID and project type are required." };
  }

  // 1. Fetch active template for projectType (highest version)
  const { data: templates, error: tmplError, status: tmplStatus } = await supabase
    .from("sop_templates")
    .select("*")
    .eq("project_type", projectType)
    .eq("is_active", true)
    .order("version", { ascending: false })
    .limit(1);

  if (tmplError || !templates || templates.length === 0) {
    console.error("[spawnClientProject Diagnostic] sop_templates query failed or returned 0 rows:", {
      clientId,
      projectType,
      user_id: user?.id,
      status: tmplStatus,
      error: tmplError?.message,
      dataLength: templates?.length || 0,
    });

    return {
      success: false,
      error: `No active SOP template found for project type '${projectType}'. (Query status: ${tmplStatus}, details logged to server console)`,
    };
  }

  const template = templates[0];

  // 2. Fetch template phases and tasks
  const { data: templatePhases, error: phasesError, status: phasesStatus } = await supabase
    .from("sop_template_phases")
    .select("*, sop_template_tasks(*)")
    .eq("sop_template_id", template.id)
    .order("phase_order", { ascending: true });

  if (phasesError || !templatePhases || templatePhases.length === 0) {
    console.error("[spawnClientProject Diagnostic] sop_template_phases query failed or returned 0 rows:", {
      templateId: template.id,
      templateName: template.name,
      status: phasesStatus,
      error: phasesError?.message,
      dataLength: templatePhases?.length || 0,
    });

    return {
      success: false,
      error: `SOP template '${template.name}' has no defined phases. (Query status: ${phasesStatus})`,
    };
  }

  try {
    // a. Create client project row
    const { data: newProject, error: projError, status: projStatus } = await supabase
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
      console.error("[spawnClientProject Diagnostic] client_projects insert failed:", {
        clientId,
        projectType,
        status: projStatus,
        error: projError?.message,
      });
      throw new Error(projError?.message || `Failed to create client project. (Status: ${projStatus})`);
    }

    const projectId = newProject.id;
    const createdPhases = [];
    const createdTasks = [];
    let phase1Id = null;

    // b. Copy phases and tasks
    for (const tPhase of templatePhases) {
      const isPhase1 = tPhase.phase_order === 1;
      const phaseStatus = isPhase1 ? "active" : "locked";

      const { data: insertedPhase, error: insPhaseErr, status: insPhaseStatus } = await supabase
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
        console.error("[spawnClientProject Diagnostic] project_phases insert failed:", {
          projectId,
          phaseOrder: tPhase.phase_order,
          status: insPhaseStatus,
          error: insPhaseErr?.message,
        });
        throw new Error(insPhaseErr?.message || `Failed to insert project phase ${tPhase.phase_order}. (Status: ${insPhaseStatus})`);
      }

      createdPhases.push(insertedPhase);

      if (isPhase1) {
        phase1Id = insertedPhase.id;
      }

      // Copy tasks for this phase
      const tTasks = tPhase.sop_template_tasks || [];
      for (const tTask of tTasks) {
        const { data: insertedTask, error: insTaskErr, status: insTaskStatus } = await supabase
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
          console.error("[spawnClientProject Diagnostic] sop_tasks insert failed:", {
            projectPhaseId: insertedPhase.id,
            taskTitle: tTask.title,
            status: insTaskStatus,
            error: insTaskErr?.message,
          });
          throw new Error(insTaskErr?.message || `Failed to insert task '${tTask.title}'. (Status: ${insTaskStatus})`);
        }

        createdTasks.push(insertedTask);
      }
    }

    // c. Update client project current_phase_id and status to 'active'
    const { error: updateProjErr, status: updateProjStatus } = await supabase
      .from("client_projects")
      .update({
        current_phase_id: phase1Id,
        status: "active",
      })
      .eq("id", projectId);

    if (updateProjErr) {
      console.error("[spawnClientProject Diagnostic] client_projects update status failed:", {
        projectId,
        phase1Id,
        status: updateProjStatus,
        error: updateProjErr.message,
      });
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
    console.error("[spawnClientProject Catch]", err);
    return { success: false, error: err.message };
  }
}
