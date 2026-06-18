import { redirect } from "next/navigation";
import { requireAuth, isSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  if (isSuperAdmin(user)) {
    redirect("/superadmin");
  }

  // Find organization member relation
  const memberRelation = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  });

  if (!memberRelation) {
    redirect("/onboarding");
  }

  const org = memberRelation.organization;

  if (org.status === "PENDING_VERIFICATION") {
    return (
      <div className="min-h-screen bg-[#030014] text-[#f4f0ff] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-[#060317] border border-white/10 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500"></div>
          <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">⏳</span>
          </div>
          <h1 className="text-2xl font-bold mb-3 tracking-wide text-yellow-500">Verification Pending</h1>
          <p className="text-sm text-[#94a3b8] mb-6 leading-relaxed">
            Your organization <strong>{org.name}</strong> is currently being reviewed by our platform administrators.
          </p>
          <div className="text-xs text-[#64748b] bg-[#0a061e] p-3 rounded-lg border border-white/5">
            We'll send an email once your account is activated. Usually this takes less than 24 hours.
          </div>
        </div>
      </div>
    );
  }

  if (org.status === "REJECTED") {
    return (
      <div className="min-h-screen bg-[#030014] text-[#f4f0ff] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-[#060317] border border-red-500/20 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold mb-3 tracking-wide text-red-500">Application Rejected</h1>
          <p className="text-sm text-[#94a3b8] mb-6 leading-relaxed">
            Unfortunately, your request to register <strong>{org.name}</strong> has been rejected.
          </p>
          {org.statusNote && (
            <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-6 text-left">
              <strong>Reason:</strong> {org.statusNote}
            </div>
          )}
          <div className="text-xs text-[#64748b]">
            Please contact support if you believe this was in error.
          </div>
        </div>
      </div>
    );
  }

  if (org.status === "SUSPENDED") {
    return (
      <div className="min-h-screen bg-[#030014] text-[#f4f0ff] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-[#060317] border border-red-500/20 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-600"></div>
          <div className="w-16 h-16 bg-red-600/10 border border-red-600/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold mb-3 tracking-wide text-red-600">Organization Suspended</h1>
          <p className="text-sm text-[#94a3b8] mb-6 leading-relaxed">
            Your organization <strong>{org.name}</strong> has been suspended due to policy violations.
          </p>
          <div className="text-xs text-[#64748b]">
            Please contact support for restoration details.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f0f23]">
      <DashboardSidebar
        adminName={user.name}
        adminEmail={user.email}
        avatarUrl={user.avatarUrl}
        orgName={org.name}
      />
      <main className="flex-1 overflow-y-auto lg:ml-64">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
