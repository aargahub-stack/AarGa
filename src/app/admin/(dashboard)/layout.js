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
    <div className="flex h-screen w-full overflow-hidden bg-paper font-sans text-ink antialiased">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Workspace */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Top Management Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md shadow-sm">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Admin Portal
            </span>
            <h2 className="text-sm font-black tracking-tight text-ink">
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
            <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wide text-emerald-800 border border-emerald-200">
              {role}
            </span>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">{children}</div>
      </div>
    </div>
  );
}
