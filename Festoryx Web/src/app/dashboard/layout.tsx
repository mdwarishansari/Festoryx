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

  if (org.status !== "ACTIVE") {
    redirect("/verification-pending");
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
