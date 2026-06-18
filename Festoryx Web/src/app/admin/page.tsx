import { requireAuth, isSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  approveOrganization,
  rejectOrganization,
  suspendOrganization,
  requestChanges,
} from "@/actions/organization.actions";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const user = await requireAuth();

  if (!isSuperAdmin(user)) {
    return (
      <div className="min-h-screen bg-[#030014] text-[#f4f0ff] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-[#060317] border border-red-500/20 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-600"></div>
          <h1 className="text-2xl font-bold mb-3 tracking-wide text-red-500">Access Denied</h1>
          <p className="text-sm text-[#94a3b8] mb-6 leading-relaxed">
            You do not have permission to access the Super Admin control panel. This section is restricted to the platform owner.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Go to Organizer Dashboard
          </a>
        </div>
      </div>
    );
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-[#9382ff] bg-clip-text text-transparent">
              Super Admin Console
            </h1>
            <p className="text-sm text-[#94a3b8] mt-1">
              Verify organizations, inspect audits, and manage platform-wide tenants.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              Super Admin
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#060317] border border-white/5 p-5 rounded-2xl">
            <p className="text-xs text-[#64748b] uppercase tracking-wider font-semibold">Total Organizations</p>
            <p className="text-2xl font-bold mt-1 text-white">{totalOrgs}</p>
          </div>
          <div className="bg-[#060317] border border-white/5 p-5 rounded-2xl">
            <p className="text-xs text-[#64748b] uppercase tracking-wider font-semibold">Pending Review</p>
            <p className="text-2xl font-bold mt-1 text-yellow-500">{pendingOrgs}</p>
          </div>
          <div className="bg-[#060317] border border-white/5 p-5 rounded-2xl">
            <p className="text-xs text-[#64748b] uppercase tracking-wider font-semibold">Active Tenants</p>
            <p className="text-2xl font-bold mt-1 text-emerald-500">{activeOrgs}</p>
          </div>
          <div className="bg-[#060317] border border-white/5 p-5 rounded-2xl">
            <p className="text-xs text-[#64748b] uppercase tracking-wider font-semibold">Suspended / Rejected</p>
            <p className="text-2xl font-bold mt-1 text-red-500">{suspendedOrgs}</p>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="bg-[#060317] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-white/10 bg-[#0a061e]">
            <h2 className="text-lg font-bold text-white">Tenants Registry</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase text-[#64748b] tracking-wider bg-[#08051a]">
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
                        <div className="font-semibold text-white">{org.name}</div>
                        <div className="text-xs text-[#64748b]">slug: {org.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        {owner ? (
                          <div>
                            <div className="text-sm font-medium text-white">{owner.name}</div>
                            <div className="text-xs text-[#64748b]">{owner.email}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-[#64748b]">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300 capitalize">{org.type}</div>
                        <div className="text-xs text-[#64748b]">{org.city}, {org.state}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                            org.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : org.status === "PENDING_VERIFICATION"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {org.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        {org.status === "PENDING_VERIFICATION" && (
                          <>
                            <form action={async () => { "use server"; await approveOrganization(org.id); }} className="inline-block">
                              <button type="submit" className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold">
                                Approve
                              </button>
                            </form>
                            <form action={async (formData) => { "use server"; const reason = formData.get("reason") as string; await rejectOrganization(org.id, reason || "Documents invalid"); }} className="inline-block">
                              <input type="hidden" name="reason" value="Application details rejected" />
                              <button type="submit" className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold">
                                Reject
                              </button>
                            </form>
                          </>
                        )}
                        {org.status === "ACTIVE" && (
                          <form action={async () => { "use server"; await suspendOrganization(org.id); }} className="inline-block">
                            <button type="submit" className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-xs font-semibold">
                              Suspend
                            </button>
                          </form>
                        )}
                        {org.status === "SUSPENDED" && (
                          <form action={async () => { "use server"; await approveOrganization(org.id); }} className="inline-block">
                            <button type="submit" className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold">
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
