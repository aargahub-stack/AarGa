import { NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middlewareClient";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow login pages without redirect loops
  if (pathname === "/admin/login" || pathname === "/workspace/login") {
    return NextResponse.next();
  }

  // Intercept all /admin routes
  if (pathname.startsWith("/admin")) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createMiddlewareSupabaseClient(request, response);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const { data: adminRecord, error: adminError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !adminRecord) {
      const unauthorizedUrl = new URL("/admin/login", request.url);
      unauthorizedUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(unauthorizedUrl);
    }

    return response;
  }

  // Intercept all /workspace routes
  if (pathname.startsWith("/workspace")) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createMiddlewareSupabaseClient(request, response);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const loginUrl = new URL("/workspace/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verify user has a linked team_members row OR is an admin_users member
    const { data: teamMember } = await supabase
      .from("team_members")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!teamMember) {
      const { data: adminRecord } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!adminRecord) {
        const unauthorizedUrl = new URL("/workspace/login", request.url);
        unauthorizedUrl.searchParams.set("error", "unregistered_employee");
        return NextResponse.redirect(unauthorizedUrl);
      }
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/workspace/:path*"],
};
