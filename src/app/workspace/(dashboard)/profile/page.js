import { getWorkspaceSession } from "@/lib/supabase/workspaceAuth";
import ProfileView from "@/components/workspace/profile/ProfileView";

export const metadata = {
  title: "User Profile — AarGa Workspace",
};

export default async function ProfilePage() {
  const { teamMember, isAdminOversight, user } = await getWorkspaceSession();

  if (isAdminOversight || !teamMember) {
    return (
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-8 font-sans text-ink">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-2xl">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">{user?.email?.split("@")[0] || "Administrator"}</h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Administrative Oversight Account
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-xs text-amber-900 shadow-xs">
          <p className="font-bold text-sm text-amber-950">Administrative Profile Notice</p>
          <p className="mt-1 leading-relaxed text-amber-800">
            You are logged in with administrative oversight authority. Operational operator profiles (phone, bio, skills, shift logs) are managed through dedicated operator onboarding. Administrative settings and system configuration can be managed from the Founder Command Center.
          </p>
        </div>
      </div>
    );
  }

  return <ProfileView teamMember={teamMember} />;
}
