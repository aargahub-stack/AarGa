import { getAuthenticatedSupabaseClient, getAdminSession } from "@/lib/supabase/authServer";
import { revalidatePath } from "next/cache";

/**
 * Pure read/compute smart delegation algorithm.
 * Hard-filters by skill tag overlap, then scores surviving candidates deterministically.
 */
export async function suggestAssigneesForTask(sopTaskId) {
  const supabase = await getAuthenticatedSupabaseClient();

  if (!sopTaskId) return [];

  // 1. Fetch task details & project_id
  const { data: task, error: taskErr } = await supabase
    .from("sop_tasks")
    .select("*, project_phases(client_project_id)")
    .eq("id", sopTaskId)
    .single();

  if (taskErr || !task) return [];

  const requiredTags = (task.required_skill_tags || []).map((t) =>
    t.trim().toLowerCase()
  );

  if (requiredTags.length === 0) {
    return [];
  }

  // 2. Fetch active team members with skills and assigned tasks
  const { data: members, error: memErr } = await supabase
    .from("team_members")
    .select("*, team_member_skills(*, skills(name)), sop_tasks(*)")
    .eq("active", true);

  if (memErr || !members) return [];

  const candidateScores = [];

  for (const member of members) {
    const memberSkills = member.team_member_skills || [];

    // Find overlapping skill tags
    const matchingSkills = memberSkills.filter((ms) => {
      const skillName = ms.skills?.name?.trim().toLowerCase();
      return skillName && requiredTags.includes(skillName);
    });

    // Hard filter: MUST have at least 1 matching skill tag
    if (matchingSkills.length === 0) {
      continue;
    }

    let score = 0;
    const reasons = [];

    // +3 points per matching skill tag
    const tagPoints = matchingSkills.length * 3;
    score += tagPoints;
    reasons.push(`+${tagPoints} pts: Matches ${matchingSkills.length} required skill tag(s)`);

    // + proficiency_level (1-5) summed
    const profSum = matchingSkills.reduce(
      (acc, s) => acc + (s.proficiency_level || 1),
      0
    );
    score += profSum;
    reasons.push(`+${profSum} pts: Combined proficiency rating`);

    // +5 bonus if any matching skill has verified = true
    const hasVerified = matchingSkills.some((s) => s.verified);
    if (hasVerified) {
      score += 5;
      reasons.push(`+5 pts: Verified skill badge present`);
    }

    // + (telemetry_score / 20)
    let highestTelemetry = 0;
    matchingSkills.forEach((s) => {
      if (s.telemetry_score && s.telemetry_score > highestTelemetry) {
        highestTelemetry = s.telemetry_score;
      }
    });
    if (highestTelemetry > 0) {
      const telemBonus = Math.round(highestTelemetry / 20);
      score += telemBonus;
      reasons.push(`+${telemBonus} pts: VeriSkill telemetry score (${highestTelemetry}/100)`);
    }

    // Workload penalty
    const memberActiveTasks = (member.sop_tasks || []).filter(
      (t) => t.status !== "completed"
    );

    // Sum estimated hours if available, defaulting to 4 hrs per active task
    const activeHours = memberActiveTasks.length * 4;
    const capacity = member.current_capacity_hours_per_week || 40;
    const workloadRatio = activeHours / capacity;
    const penalty = Math.round(workloadRatio * 5);

    score -= penalty;
    if (penalty > 0) {
      reasons.push(`-${penalty} pts: Current workload penalty (${memberActiveTasks.length} active tasks)`);
    } else {
      reasons.push(`0 pts: Full capacity available`);
    }

    // Continuity bonus: +2 if candidate has any tasks on same client_project_id
    const currentProjectId = task.project_phases?.client_project_id;
    const hasContinuity = (member.sop_tasks || []).some(
      (t) => t.project_phases?.client_project_id === currentProjectId
    );

    if (hasContinuity) {
      score += 2;
      reasons.push(`+2 pts: Continuity bonus (existing project member)`);
    }

    candidateScores.push({
      candidate: {
        id: member.id,
        name: member.name,
        role: member.role,
        employmentType: member.employment_type,
        capacity: capacity,
        activeTasksCount: memberActiveTasks.length,
      },
      score,
      workloadRatio,
      reasons,
    });
  }

  // Deterministic Sorting:
  // 1. Highest Score
  // 2. Lowest Workload Ratio (tiebreaker)
  // 3. Alphabetical Name (tiebreaker)
  candidateScores.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (a.workloadRatio !== b.workloadRatio) {
      return a.workloadRatio - b.workloadRatio;
    }
    return a.candidate.name.localeCompare(b.candidate.name);
  });

  return candidateScores.slice(0, 3);
}

/**
 * Confirms a task assignment (Admin/Lead Server Action).
 * Updates assigned_to, status = 'assigned', logs event, and enqueues notification.
 */
export async function confirmAssignment(sopTaskId, teamMemberId, method = "manual_override") {
  const { user, supabase } = await getAdminSession();

  if (!sopTaskId || !teamMemberId) {
    return { success: false, error: "Task ID and Team Member ID are required." };
  }

  const { data: task, error: fetchErr } = await supabase
    .from("sop_tasks")
    .select("*, project_phases(client_project_id)")
    .eq("id", sopTaskId)
    .single();

  if (fetchErr || !task) {
    return { success: false, error: "Task not found." };
  }

  const { error: updateErr } = await supabase
    .from("sop_tasks")
    .update({
      assigned_to: teamMemberId,
      assignment_method: method,
      status: "assigned",
    })
    .eq("id", sopTaskId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // Log activity
  await supabase.from("sop_activity_logs").insert([
    {
      client_project_id: task.project_phases?.client_project_id,
      sop_task_id: sopTaskId,
      actor_user_id: user.id,
      event_type: "task_assigned",
      event_detail: {
        assigned_to: teamMemberId,
        assignment_method: method,
      },
    },
  ]);

  // Enqueue notification
  await supabase.from("sop_notifications").insert([
    {
      team_member_id: teamMemberId,
      message: `You have been assigned to task '${task.title}'`,
      link_path: "/workspace",
    },
  ]);

  revalidatePath("/admin/sop");
  revalidatePath("/workspace");

  return { success: true };
}
