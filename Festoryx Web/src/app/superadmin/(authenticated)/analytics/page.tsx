import { prisma } from "@/lib/prisma";
import { requireAuth, isSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BarChart3, Users, IndianRupee, Building2, Calendar, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuperAdminAnalyticsPage() {
  const user = await requireAuth();

  if (!isSuperAdmin(user)) {
    redirect("/dashboard");
  }

  // Fetch all organizations with their counts
  const organizations = await prisma.organization.findMany({
    include: {
      events: {
        include: {
          _count: { select: { registrations: true } },
          registrations: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate platform wide stats
  const totalOrgs = organizations.length;
  let totalEvents = 0;
  let totalRegistrations = 0;
  let platformApprovedRevenue = 0;

  organizations.forEach((org) => {
    totalEvents += org.events.length;
    org.events.forEach((evt) => {
      totalRegistrations += evt._count.registrations;
      evt.registrations.forEach((reg) => {
        if (reg.paymentStatus === "APPROVED") {
          platformApprovedRevenue += reg.paymentAmount ? Number(reg.paymentAmount) : 0;
        }
      });
    });
  });

  return (
    <div className="space-y-8 text-[#f4f0ff]">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-indigo-400" />
          <span>Platform Global Analytics</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Superadmin overview of all active tenants, platform-wide user acquisition, and overall transaction volume.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-[#060317] border border-white/5 p-5 rounded-[16px] flex items-center justify-between">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Active Tenants</span>
            <span className="mt-2 block font-heading text-3xl font-bold text-white">{totalOrgs}</span>
          </div>
          <Building2 className="h-8 w-8 text-indigo-400 opacity-80" />
        </div>

        <div className="bg-[#060317] border border-white/5 p-5 rounded-[16px] flex items-center justify-between">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Global Events</span>
            <span className="mt-2 block font-heading text-3xl font-bold text-indigo-400">{totalEvents}</span>
          </div>
          <Calendar className="h-8 w-8 text-indigo-400 opacity-80" />
        </div>

        <div className="bg-[#060317] border border-white/5 p-5 rounded-[16px] flex items-center justify-between">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Global Registrations</span>
            <span className="mt-2 block font-heading text-3xl font-bold text-[#9382ff]">{totalRegistrations}</span>
          </div>
          <Users className="h-8 w-8 text-[#9382ff] opacity-80" />
        </div>

        <div className="bg-[#060317] border border-white/5 p-5 rounded-[16px] flex items-center justify-between">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Platform Approved Sales</span>
            <span className="mt-2 block font-heading text-3xl font-bold text-emerald-400">₹{platformApprovedRevenue.toLocaleString()}</span>
          </div>
          <IndianRupee className="h-8 w-8 text-emerald-400 opacity-80" />
        </div>
      </div>

      {/* Tenant Breakdown */}
      <div className="bg-[#060317] border border-white/5 rounded-[16px] overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/5 bg-[#0a061e]/50">
          <h2 className="text-base font-semibold text-white">Tenant Breakdown & Performance</h2>
        </div>

        {organizations.length === 0 ? (
          <p className="p-8 text-center text-xs text-gray-500 italic">No tenants onboarded on this platform yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-[#0a061e]/20">
                <tr>
                  <th className="px-6 py-3">Tenant Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Events Hosted</th>
                  <th className="px-6 py-3 text-center">Registrations</th>
                  <th className="px-6 py-3 text-right">Revenue Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {organizations.map((org) => {
                  let orgRegs = 0;
                  let orgRev = 0;
                  org.events.forEach((evt) => {
                    orgRegs += evt._count.registrations;
                    evt.registrations.forEach((reg) => {
                      if (reg.paymentStatus === "APPROVED") {
                        orgRev += reg.paymentAmount ? Number(reg.paymentAmount) : 0;
                      }
                    });
                  });

                  return (
                    <tr key={org.id} className="hover:bg-white/[0.01]">
                      <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-indigo-400 shrink-0" />
                        <div className="flex flex-col">
                          <span>{org.name}</span>
                          <span className="text-[10px] text-gray-500 font-mono">slug: {org.slug}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs capitalize">{org.type}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-[32px] px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          org.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : org.status === "PENDING_VERIFICATION"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold">{org.events.length}</td>
                      <td className="px-6 py-4 text-center font-semibold text-indigo-300">{orgRegs}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-400">₹{orgRev.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
