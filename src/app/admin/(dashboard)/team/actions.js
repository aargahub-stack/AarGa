"use server";

import { getAdminSession } from "@/lib/supabase/authServer";
import { supabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Fetch available auth.users and interns for linking in the New Team Member form.
 */
export async function getOptionsForNewTeamMember() {
  await getAdminSession();

  let authUsers = [];
  try {
    const { data: usersData } = await supabaseServer.auth.admin.listUsers();
    authUsers = (usersData?.users || []).map((u) => ({
      id: u.id,
      email: u.email,
    }));
  } catch (err) {
    console.warn("[getOptionsForNewTeamMember] Failed to list auth users:", err);
  }

  const { data: interns } = await supabaseServer
    .from("interns")
    .select("id, name, role, profile_slug, skills")
    .order("name", { ascending: true });

  const { data: allSkills } = await supabaseServer
    .from("skills")
    .select("*")
    .order("name", { ascending: true });

  return {
    authUsers,
    interns: interns || [],
    allSkills: allSkills || [],
  };
}

/**
 * Creates a new team_members row and optionally imports intern skill tags.
 */
export async function createTeamMember({
  name,
  role,
  employmentType = "full_time",
  currentCapacity = 40,
  userId = null,
  linkedInternId = null,
  importSkills = false,
  customSkills = [],
}) {
  const { supabase } = await getAdminSession();

  if (!name || !role) {
    return { success: false, error: "Name and role are required." };
  }

  // Insert into team_members
  const { data: newMember, error: insertErr } = await supabase
    .from("team_members")
    .insert([
      {
        name,
        role,
        employment_type: employmentType,
        current_capacity_hours_per_week: Number(currentCapacity) || 40,
        user_id: userId || null,
        linked_intern_id: linkedInternId || null,
        active: true,
      },
    ])
    .select()
    .single();

  if (insertErr || !newMember) {
    return { success: false, error: insertErr?.message || "Failed to create team member." };
  }

  // Process skill tags if import requested or custom skills provided
  let skillsToImport = [...customSkills];

  if (importSkills && linkedInternId) {
    const { data: intern } = await supabase
      .from("interns")
      .select("skills")
      .eq("id", linkedInternId)
      .single();

    if (intern?.skills && Array.isArray(intern.skills)) {
      skillsToImport = [
        ...skillsToImport,
        ...intern.skills.map((s) => ({
          name: s,
          proficiencyLevel: 3,
          verified: true,
        })),
      ];
    }
  }

  // De-duplicate skills by name
  const uniqueSkillsMap = new Map();
  skillsToImport.forEach((s) => {
    if (s.name && !uniqueSkillsMap.has(s.name.trim().toLowerCase())) {
      uniqueSkillsMap.set(s.name.trim().toLowerCase(), s);
    }
  });

  for (const skillItem of uniqueSkillsMap.values()) {
    const skillName = skillItem.name.trim();

    // Ensure skill exists in skills table
    await supabase.from("skills").upsert(
      [{ name: skillName, category: "SOP Tag" }],
      { onConflict: "name", ignoreDuplicates: true }
    );

    const { data: skillRow } = await supabase
      .from("skills")
      .select("id")
      .eq("name", skillName)
      .single();

    if (skillRow) {
      await supabase.from("team_member_skills").insert([
        {
          team_member_id: newMember.id,
          skill_id: skillRow.id,
          proficiency_level: Number(skillItem.proficiencyLevel) || 3,
          verified: Boolean(skillItem.verified),
        },
      ]);
    }
  }

  revalidatePath("/admin/team");
  return { success: true, teamMemberId: newMember.id };
}

/**
 * Updates team_member_skills for a specific team member.
 */
export async function updateTeamMemberSkills(teamMemberId, skillsList = []) {
  const { supabase } = await getAdminSession();

  if (!teamMemberId) {
    return { success: false, error: "Team Member ID is required." };
  }

  // Delete existing team_member_skills rows
  const { error: delErr } = await supabase
    .from("team_member_skills")
    .delete()
    .eq("team_member_id", teamMemberId);

  if (delErr) {
    return { success: false, error: `Failed to reset skills: ${delErr.message}` };
  }

  // Insert updated skills
  for (const skillItem of skillsList) {
    const skillName = (skillItem.name || "").trim();
    if (!skillName) continue;

    await supabase.from("skills").upsert(
      [{ name: skillName, category: "SOP Tag" }],
      { onConflict: "name", ignoreDuplicates: true }
    );

    const { data: skillRow } = await supabase
      .from("skills")
      .select("id")
      .eq("name", skillName)
      .single();

    if (skillRow) {
      await supabase.from("team_member_skills").insert([
        {
          team_member_id: teamMemberId,
          skill_id: skillRow.id,
          proficiency_level: Number(skillItem.proficiencyLevel) || 3,
          verified: Boolean(skillItem.verified),
        },
      ]);
    }
  }

  revalidatePath("/admin/team");
  return { success: true };
}
