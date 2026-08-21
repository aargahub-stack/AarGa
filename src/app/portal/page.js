"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import AargaLogo from "@/components/AargaLogo";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Enter both an email and a password to continue.");
      return;
    }

    setLoading(true);
    // Simulated auth round-trip. Swap this block for a real
    // credentials/OAuth call against your auth provider.
    setTimeout(() => {
      signIn(email);
      router.push("/portal/dashboard");
    }, 600);
  }

  return (
    <div className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden bg-ink px-6 py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(110,231,183,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(110,231,183,0.12) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glass-lg backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <AargaLogo className="h-9 w-9" />
          <span className="text-lg font-extrabold tracking-tight text-white">
            Founder Portal
          </span>
        </div>

        <p className="mt-3 text-sm text-slate-300">
          Restricted access. Sign in to reach the founder dashboard skeleton.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-300">
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@aarga.org"
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-gold-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-ink transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in to Portal"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Simulated auth — any email + password combination will grant a
          local session for demo purposes.
        </p>
      </div>
    </div>
  );
}
