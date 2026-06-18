import { requireAuth, isSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  approveOrganization,
  rejectOrganization,
  suspendOrganization,
} from "@/actions/organization.actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const user = await requireAuth();

  if (!isSuperAdmin(user)) {
    redirect("/dashboard");
  }

  // Fetch all organizations
  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  // Calculate stats
  const totalOrgs = organizations.length;
  const pendingOrgs = organizations.filter((o) => o.status === "PENDING_VERIFICATION").length;
  const activeOrgs = organizations.filter((o) => o.status === "ACTIVE").length;
  const suspendedOrgs = organizations.filter((o) => o.status === "SUSPENDED" || o.status === "REJECTED").length;

  return (
    <div className="min-h-screen bg-[#030014] text-[#f4f0ff] p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="font-heading text-3xl font-medium tracking-tight text-[#f4f0ff]">
              Platform Console
            </h1>
            <p className="text-sm text-[#918ea0] mt-1">
              Verify organizations, inspect tenants registry, and manage platform-wide access controls.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-[32px] border border-[#9382ff]/30 bg-[#9382ff]/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[#9382ff] shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)]">
              Super Admin Console
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#060317] border border-white/5 p-5 rounded-[16px] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)]">
            <p className="text-xs text-[#918ea0] uppercase tracking-wider font-medium">Total Organizations</p>
            <p className="text-2xl font-medium mt-1 text-white">{totalOrgs}</p>
          </div>
          <div className="bg-[#060317] border border-white/5 p-5 rounded-[16px] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)]">
            <p className="text-xs text-[#918ea0] uppercase tracking-wider font-medium">Pending Review</p>
            <p className="text-2xl font-medium mt-1 text-amber-400">{pendingOrgs}</p>
          </div>
          <div className="bg-[#060317] border border-white/5 p-5 rounded-[16px] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)]">
            <p className="text-xs text-[#918ea0] uppercase tracking-wider font-medium">Active Tenants</p>
            <p className="text-2xl font-medium mt-1 text-emerald-400">{activeOrgs}</p>
          </div>
          <div className="bg-[#060317] border border-white/5 p-5 rounded-[16px] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)]">
            <p className="text-xs text-[#918ea0] uppercase tracking-wider font-medium">Suspended / Rejected</p>
            <p className="text-2xl font-medium mt-1 text-red-400">{suspendedOrgs}</p>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="bg-[#060317] border border-white/5 rounded-[16px] overflow-hidden shadow-[inset_0_0_24px_rgba(255,255,255,0.04)]">
          <div className="px-6 py-4 border-b border-white/5 bg-[#0a061e]/50">
            <h2 className="text-base font-medium text-white">Tenants Registry</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[11px] uppercase text-[#918ea0] tracking-wider bg-[#0a061e]/20">
                  <th className="px-6 py-4 font-semibold">Organization</th>
                  <th className="px-6 py-4 font-semibold">Owner</th>
                  <th className="px-6 py-4 font-semibold">Type / Locale</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {organizations.map((org) => {
                  const owner = org.members.find((m) => m.role === "OWNER")?.user;

                  return (
                    <tr key={org.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white text-sm">{org.name}</div>
                        <div className="text-xs text-[#918ea0]">slug: {org.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        {owner ? (
                          <div>
                            <div className="text-sm font-medium text-white">{owner.name}</div>
                            <div className="text-xs text-[#918ea0]">{owner.email}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-[#918ea0]">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300 capitalize">{org.type}</div>
                        <div className="text-xs text-[#918ea0]">{org.city}, {org.state}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-[32px] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                            org.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : org.status === "PENDING_VERIFICATION"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {org.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        {org.status === "PENDING_VERIFICATION" && (
                          <>
                            <form action={approveOrganization.bind(null, org.id)} className="inline-block">
                              <button type="submit" className="px-3 py-1.5 bg-[#9382ff] hover:bg-[#816eff] text-white rounded-[5px] text-xs font-medium transition-colors">
                                Approve
                              </button>
                            </form>
                            <form action={rejectOrganization.bind(null, org.id, "Application details rejected")} className="inline-block">
                              <button type="submit" className="px-3 py-1.5 bg-[#10093a] border border-white/5 hover:bg-[#180e55] text-red-400 rounded-[5px] text-xs font-medium transition-colors">
                                Reject
                              </button>
                            </form>
                          </>
                        )}
                        {org.status === "ACTIVE" && (
                          <form action={suspendOrganization.bind(null, org.id)} className="inline-block">
                            <button type="submit" className="px-3 py-1.5 bg-[#10093a] border border-white/5 hover:bg-red-950/20 hover:border-red-900/30 text-red-400 rounded-[5px] text-xs font-medium transition-colors">
                              Suspend
                            </button>
                          </form>
                        )}
                        {org.status === "SUSPENDED" && (
                          <form action={approveOrganization.bind(null, org.id)} className="inline-block">
                            <button type="submit" className="px-3 py-1.5 bg-[#9382ff] hover:bg-[#816eff] text-white rounded-[5px] text-xs font-medium transition-colors">
                              Reactivate
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
