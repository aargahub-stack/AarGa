"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browserClient";
import AargaLogo from "@/components/AargaLogo";

function WorkspaceLoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "unregistered_employee") {
      setErrorMsg("Access denied. Your account is not registered as an active team member.");
    }
  }, [searchParams]);

  useEffect(() => {
    let timer;
    if (lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (lockoutTime > 0) return;

    setErrorMsg("");
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          setLockoutTime(30);
          setFailedAttempts(0);
          setErrorMsg("Too many failed login attempts. Submit disabled for 30 seconds.");
        } else {
          setErrorMsg(error.message || "Invalid credentials. Please check email and password.");
        }
        setLoading(false);
        return;
      }

      // Check if user is an Admin
      const { data: adminRecord } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (adminRecord) {
        setFailedAttempts(0);
        router.push("/admin");
        router.refresh();
        return;
      }

      // Check if user is an Employee / Team Member
      const { data: teamMember } = await supabase
        .from("team_members")
        .select("id, name")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (teamMember) {
        setFailedAttempts(0);
        router.push("/workspace");
        router.refresh();
        return;
      }

      // Neither admin nor team member
      await supabase.auth.signOut();
      setErrorMsg(
        "Access denied. Your account is not registered as an Admin or Active Team Member."
      );
      setLoading(false);
      return;
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred during login.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-glass sm:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white shadow-md">
            <AargaLogo className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-ink">
            Unified AarGa OS Sign In
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            AarGa Portal Command & Execution Engine
          </p>
        </div>

        {errorMsg && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 break-words">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Work Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kiran@aarga.org"
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading || lockoutTime > 0}
            className="mt-2 w-full rounded-full bg-ink py-3.5 text-sm font-bold text-white shadow-glass transition-transform hover:scale-[1.01] hover:bg-moss-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading
              ? "Authenticating..."
              : lockoutTime > 0
              ? `Locked out (${lockoutTime}s)`
              : "Sign In to Workspace"}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-200/60 pt-6 text-center text-xs font-medium text-slate-400">
          Daily Execution Queue · Protected by Team Member RLS
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <div className="text-xs font-bold text-slate-400">Loading...</div>
        </div>
      }
    >
      <WorkspaceLoginFormContent />
    </Suspense>
  );
}
