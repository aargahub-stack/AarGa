import { NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middlewareClient";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow login page access without redirect loops
  if (pathname === "/admin/login") {
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

    // Validate Supabase Auth session via JWT
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verify user has a valid row in admin_users table (RBAC enforcement)
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
