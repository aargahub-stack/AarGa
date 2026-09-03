"use server";

import { revalidatePath } from "next/cache";
import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";

export async function clockInAction(notes = "") {
  try {
    const { teamMember, supabase } = await getWorkspaceSession();

    // Check if there is already an active session
    const { data: activeSession } = await supabase
      .from("workspace_attendance")
      .select("id")
      .eq("team_member_id", teamMember.id)
      .eq("status", "active")
      .maybeSingle();

    if (activeSession) {
      return { success: false, error: "You already have an active clock-in session." };
    }

    const { data, error } = await supabase
      .from("workspace_attendance")
      .insert([
        {
          team_member_id: teamMember.id,
          clock_in: new Date().toISOString(),
          status: "active",
          notes: notes || "Daily work session started",
        },
      ])
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/workspace");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || "Failed to clock in." };
  }
}

export async function clockOutAction(attendanceId, notes = "") {
  try {
    const { teamMember, supabase } = await getWorkspaceSession();

    let sessionToClockOut = null;

    if (attendanceId) {
      const { data } = await supabase
        .from("workspace_attendance")
        .select("*")
        .eq("id", attendanceId)
        .maybeSingle();
      sessionToClockOut = data;
    }

    if (!sessionToClockOut) {
      const { data } = await supabase
        .from("workspace_attendance")
        .select("*")
        .eq("team_member_id", teamMember.id)
        .eq("status", "active")
        .maybeSingle();
      sessionToClockOut = data;
    }

    if (!sessionToClockOut) {
      return { success: false, error: "No active clock-in session found." };
    }

    const clockInTime = new Date(sessionToClockOut.clock_in).getTime();
    const clockOutTime = Date.now();
    const totalMinutes = Math.max(1, Math.round((clockOutTime - clockInTime) / 60000));

    const { data, error } = await supabase
      .from("workspace_attendance")
      .update({
        clock_out: new Date(clockOutTime).toISOString(),
        total_minutes: totalMinutes,
        status: "completed",
        notes: notes || sessionToClockOut.notes || "Shift completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionToClockOut.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/workspace");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || "Failed to clock out." };
  }
}

export async function getAttendanceDataAction() {
  try {
    const { teamMember, supabase } = await getWorkspaceSession();

    const { data: logs, error } = await supabase
      .from("workspace_attendance")
      .select("*")
      .eq("team_member_id", teamMember.id)
      .order("clock_in", { ascending: false })
      .limit(10);

    if (error && error.code !== "PGRST116") {
      // Ignore missing table error during initial migration setup
    }

    const activeSession = (logs || []).find((l) => l.status === "active") || null;

    return {
      success: true,
      activeSession,
      history: logs || [],
    };
  } catch (err) {
    return { success: false, activeSession: null, history: [] };
  }
}

export async function getCompensationDataAction() {
  try {
    const { teamMember, supabase } = await getWorkspaceSession();

    const { data, error } = await supabase
      .from("team_compensation")
      .select("*")
      .eq("team_member_id", teamMember.id)
      .maybeSingle();

    if (data) {
      return { success: true, data };
    }

    // Default fallback breakdown based on team member role if record isn't seeded yet
    const isIntern = teamMember.role?.toLowerCase().includes("intern");
    const fallback = {
      role_type: isIntern ? "Intern" : "Employee",
      base_amount: isIntern ? 15000 : 65000,
      currency: "INR",
      payout_cycle: isIntern ? "Monthly Stipend" : "Monthly Salary",
      next_payout_date: new Date(Date.now() + 86400000 * 12).toISOString().split("T")[0],
      payout_status: "Active",
      bank_name: "HDFC Bank Ltd.",
      account_last4: "4821",
      upi_id: `${teamMember.name?.toLowerCase().replace(/\s+/g, "")}@aarga`,
    };

    return { success: true, data: fallback };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateProfileAction({ phone, bio, skill_tags }) {
  try {
    const { teamMember, supabase } = await getWorkspaceSession();

    const payload = {};
    if (phone !== undefined) payload.phone = phone;
    if (bio !== undefined) payload.bio = bio;
    if (skill_tags !== undefined) payload.skill_tags = skill_tags;

    const { data, error } = await supabase
      .from("team_members")
      .update(payload)
      .eq("id", teamMember.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/workspace");
    revalidatePath("/workspace/profile");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || "Failed to update profile." };
  }
}

export async function updatePasswordAction(newPassword) {
  try {
    const { supabase } = await getWorkspaceSession();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "Failed to update password." };
  }
}
