import { getAdminSession } from "@/lib/supabase/authServer";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Portal — AarGa Ecosystem",
  description: "Secure administrative management console for AarGa ecosystem products and verified talent.",
};

export default async function AdminDashboardLayout({ children }) {
  // getAdminSession performs defense-in-depth verification and redirects to /admin/login if unauthorized
  const { user, role } = await getAdminSession();

  return (
    <div className="flex min-h-screen bg-paper font-sans text-ink antialiased">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/70 px-8 py-4 shadow-glass">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Admin Portal
            </span>
            <h2 className="text-lg font-black tracking-tight text-ink">
              System Management Console
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-ink">{user.email}</div>
              <div className="text-[10px] font-semibold text-slate-400">
                User ID: {user.id.slice(0, 8)}...
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-emerald-800 border border-emerald-200">
              {role}
            </span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto no-scrollbar">{children}</main>
      </div>
    </div>
  );
}
