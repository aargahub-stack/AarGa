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
 * Helper: Generates a unique username derived directly from the email handle before @.
 * - Email: e.g. yuvarani@gmail.com -> Handle: yuvarani
 * - If collision exists in DB: appends numbers (e.g. yuvarani4761)
 * - Default Password:
 *    If intern: int@${first4}#${dobYear} (e.g. int@yuva#2007)
 *    If employee: emp@${first4}#${dobYear} (e.g. emp@yuva#2007)
 */
async function generateCredentialsFromEmail(name, rawEmail, employmentType, dobYear = 2005) {
  let email = (rawEmail || "").trim().toLowerCase();
  let handle = "";

  if (email && email.includes("@")) {
    handle = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  } else {
    handle = (name || "user").toLowerCase().replace(/[^a-z0-9]/g, "");
    email = `${handle}@aarga.com`;
  }

  if (!handle) handle = "user";

  const first4 = (handle.slice(0, 4) || "user").padEnd(4, "x");
  const year = Number(dobYear) || 2005;
  const prefix = employmentType === "intern" ? "int@" : "emp@";
  const defaultPassword = `${prefix}${first4}#${year}`;

  let username = handle;
  let attempts = 0;

  while (attempts < 20) {
    const { data: existing } = await supabaseServer
      .from("team_members")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (!existing) break;

    const suffix = Math.floor(10 + Math.random() * 9000);
    username = `${handle}${suffix}`;
    attempts++;
  }

  return { username, email, defaultPassword };
}

/**
 * Creates a new team_members row and auto-provisions Supabase Auth credentials using email handle.
 */
export async function createTeamMember({
  name,
  role,
  email: inputEmail = "",
  employmentType = "full_time",
  currentCapacity = 40,
  dobYear = 2005,
  userId = null,
  linkedInternId = null,
  autoCreateAccount = true,
  importSkills = false,
  customSkills = [],
}) {
  const { supabase } = await getAdminSession();

  if (!name || !role) {
    return { success: false, error: "Name and role are required." };
  }

  let finalUserId = userId || null;
  let generatedCredentials = null;

  const creds = await generateCredentialsFromEmail(name, inputEmail, employmentType, dobYear);
  const targetEmail = creds.email;
  const username = creds.username;
  const defaultPasswordHint = creds.defaultPassword;

  // Auto-provision Supabase Auth User if requested & no existing user linked
  if (autoCreateAccount && !finalUserId) {
    try {
      const { data: authUser, error: authErr } = await supabaseServer.auth.admin.createUser({
        email: targetEmail,
        password: creds.defaultPassword,
        email_confirm: true,
        user_metadata: {
          name,
          role,
          username: creds.username,
          employment_type: employmentType,
        },
      });

      if (authErr) {
        console.warn("[createTeamMember] Warning creating auth user:", authErr.message);
      } else if (authUser?.user) {
        finalUserId = authUser.user.id;
        generatedCredentials = {
          username: creds.username,
          email: targetEmail,
          password: creds.defaultPassword,
        };
      }
    } catch (err) {
      console.warn("[createTeamMember] Exception creating auth user:", err);
    }
  }

  // Insert into team_members table
  const insertPayload = {
    name,
    role,
    employment_type: employmentType,
    current_capacity_hours_per_week: Number(currentCapacity) || 40,
    user_id: finalUserId,
    linked_intern_id: linkedInternId || null,
    active: true,
    email: targetEmail,
    username,
    dob_year: Number(dobYear) || 2005,
    default_password_hint: defaultPasswordHint,
  };

  const { data: newMember, error: insertErr } = await supabase
    .from("team_members")
    .insert([insertPayload])
    .select()
    .single();

  if (insertErr || !newMember) {
    // Retry without optional new columns in case migration was not run
    delete insertPayload.email;
    delete insertPayload.username;
    delete insertPayload.dob_year;
    delete insertPayload.default_password_hint;

    const { data: retryMember, error: retryErr } = await supabase
      .from("team_members")
      .insert([insertPayload])
      .select()
      .single();

    if (retryErr || !retryMember) {
      return { success: false, error: retryErr?.message || insertErr?.message || "Failed to create team member." };
    }

    return await processSkillImports(retryMember, generatedCredentials || { username, email: targetEmail, password: defaultPasswordHint });
  }

  return await processSkillImports(newMember, generatedCredentials || { username, email: targetEmail, password: defaultPasswordHint });
}

async function processSkillImports(newMember, generatedCredentials) {
  const { supabase } = await getAdminSession();
  let skillsToImport = [];

  if (newMember.linked_intern_id) {
    const { data: intern } = await supabase
      .from("interns")
      .select("skills")
      .eq("id", newMember.linked_intern_id)
      .single();

    if (intern?.skills && Array.isArray(intern.skills)) {
      skillsToImport = [
        ...skillsToImport,
        ...intern.skills.map((s) => ({
          name: s,
          proficiencyLevel: 4,
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
          proficiency_level: Number(skillItem.proficiencyLevel) || 4,
          verified: Boolean(skillItem.verified),
        },
      ]);
    }
  }

  revalidatePath("/admin/team");
  return {
    success: true,
    teamMemberId: newMember.id,
    credentials: generatedCredentials,
  };
}

/**
 * Updates team_member_skills for a specific team member.
 */
export async function updateTeamMemberSkills(teamMemberId, skillsList = []) {
  const { supabase } = await getAdminSession();

  if (!teamMemberId) {
    return { success: false, error: "Team Member ID is required." };
  }

  const { error: delErr } = await supabase
    .from("team_member_skills")
    .delete()
    .eq("team_member_id", teamMemberId);

  if (delErr) {
    return { success: false, error: `Failed to reset skills: ${delErr.message}` };
  }

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
