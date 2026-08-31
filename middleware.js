import { NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middlewareClient";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  const isMainDomain =
    hostname === "aarga.org" ||
    hostname === "www.aarga.org" ||
    hostname.endsWith(".aarga.org") && !hostname.startsWith("portal.");

  // -------------------------------------------------------------
  // 1. STRICT MAIN DOMAIN (aarga.org) ACCESS RESTRICTION
  // Prevent any /admin, /workspace, /interns or login access on main domain
  // Redirect to main public landing (/) or to portal.aarga.org if requesting portal features
  // -------------------------------------------------------------
  if (isMainDomain) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/workspace") ||
      pathname.startsWith("/interns")
    ) {
      // Redirect portal attempts on main domain straight to portal.aarga.org
      const portalUrl = new URL(pathname, "https://portal.aarga.org");
      return NextResponse.redirect(portalUrl, 301);
    }
    return NextResponse.next();
  }

  // -------------------------------------------------------------
  // 2. PORTAL DOMAIN (portal.aarga.org) ROUTING & AUTH
  // -------------------------------------------------------------
  // If user hits root of portal (portal.aarga.org/), rewrite to unified login /workspace/login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/workspace/login", request.url));
  }

  // Allow login pages without redirect loops
  if (pathname === "/admin/login" || pathname === "/workspace/login") {
    return NextResponse.next();
  }

  // Intercept all /admin routes on portal
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
      const loginUrl = new URL("/workspace/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const { data: adminRecord, error: adminError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !adminRecord) {
      const unauthorizedUrl = new URL("/workspace/login", request.url);
      unauthorizedUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(unauthorizedUrl);
    }

    return response;
  }

  // Intercept all /workspace routes on portal
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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
