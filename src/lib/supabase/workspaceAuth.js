import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getWorkspaceSupabaseClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[workspaceAuth] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env variables."
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored in Server Components
        }
      },
    },
  });
}

export async function getWorkspaceSession() {
  const supabase = await getWorkspaceSupabaseClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/workspace/login");
  }

  // 1. Check if authenticated user is linked to a team_members row
  let { data: teamMember } = await supabase
    .from("team_members")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // 2. Fallback check for admin_users member
  if (!teamMember) {
    const { data: adminRecord } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminRecord) {
      teamMember = {
        id: user.id,
        name: user.email?.split("@")[0] || "Administrator",
        role: `System Lead (${adminRecord.role})`,
        user_id: user.id,
      };
    }
  }

  if (!teamMember) {
    redirect("/workspace/login?error=unregistered_employee");
  }

  return {
    user,
    teamMember,
    supabase,
  };
}
