import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BarChart3, Users, IndianRupee, Clock, Calendar, CheckSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await requireAuth();

  // Find organization member relation
  const memberRelation = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  if (!memberRelation) {
    redirect("/onboarding");
  }

  const orgId = memberRelation.organizationId;

  // Fetch all events with registration counts
  const events = await prisma.event.findMany({
    where: { organizationId: orgId },
    include: {
      _count: {
        select: { registrations: true },
      },
      registrations: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate totals
  let totalRegistrations = 0;
  let approvedPaymentsTotal = 0;
  let pendingPaymentsTotal = 0;
  let rejectedPaymentsCount = 0;

  events.forEach((evt) => {
    totalRegistrations += evt._count.registrations;
    evt.registrations.forEach((reg) => {
      const amt = reg.paymentAmount ? Number(reg.paymentAmount) : 0;
      if (reg.paymentStatus === "APPROVED") {
        approvedPaymentsTotal += amt;
      } else if (reg.paymentStatus === "PENDING") {
        pendingPaymentsTotal += amt;
      } else if (reg.paymentStatus === "REJECTED") {
        rejectedPaymentsCount++;
      }
    });
  });

  return (
    <div className="space-y-8 text-[#f4f0ff]">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-indigo-400" />
          <span>Analytics & Insights</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Track registration metrics, ticket sales revenue, payment verifications, and event-wise participant distribution.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-[#060317] border border-white/5 p-5 rounded-[16px] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] flex items-center justify-between">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Total Competitors</span>
            <span className="mt-2 block font-heading text-3xl font-bold text-white">{totalRegistrations}</span>
          </div>
          <Users className="h-8 w-8 text-indigo-400 opacity-80" />
        </div>

        <div className="bg-[#060317] border border-white/5 p-5 rounded-[16px] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] flex items-center justify-between">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Revenue Approved</span>
            <span className="mt-2 block font-heading text-3xl font-bold text-emerald-400">₹{approvedPaymentsTotal.toLocaleString()}</span>
          </div>
          <IndianRupee className="h-8 w-8 text-emerald-400 opacity-80" />
        </div>

        <div className="bg-[#060317] border border-white/5 p-5 rounded-[16px] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] flex items-center justify-between">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Payments Pending</span>
            <span className="mt-2 block font-heading text-3xl font-bold text-amber-400">₹{pendingPaymentsTotal.toLocaleString()}</span>
          </div>
          <Clock className="h-8 w-8 text-amber-400 opacity-80" />
        </div>

        <div className="bg-[#060317] border border-white/5 p-5 rounded-[16px] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] flex items-center justify-between">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Rejected Payments</span>
            <span className="mt-2 block font-heading text-3xl font-bold text-rose-400">{rejectedPaymentsCount}</span>
          </div>
          <CheckSquare className="h-8 w-8 text-rose-400 opacity-80" />
        </div>
      </div>

      {/* Events Breakdown */}
      <div className="bg-[#060317] border border-white/5 rounded-[16px] overflow-hidden shadow-[inset_0_0_24px_rgba(255,255,255,0.04)]">
        <div className="px-6 py-4 border-b border-white/5 bg-[#0a061e]/50">
          <h2 className="text-base font-semibold text-white">Event Registration Breakdown</h2>
        </div>

        {events.length === 0 ? (
          <p className="p-8 text-center text-xs text-gray-500 italic">No events configured for this organization.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-[#0a061e]/20">
                <tr>
                  <th className="px-6 py-3">Event Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Fee</th>
                  <th className="px-6 py-3 text-center">Registrations</th>
                  <th className="px-6 py-3 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((evt) => {
                  const fee = evt.registrationFee ? Number(evt.registrationFee) : 0;
                  const revenue = evt.registrations
                    .filter((r) => r.paymentStatus === "APPROVED")
                    .reduce((acc, curr) => acc + (curr.paymentAmount ? Number(curr.paymentAmount) : 0), 0);

                  return (
                    <tr key={evt.id} className="hover:bg-white/[0.01]">
                      <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-400" />
                        <span>{evt.name}</span>
                      </td>
                      <td className="px-6 py-4 text-xs capitalize">{evt.participationType}</td>
                      <td className="px-6 py-4 text-xs font-semibold">{fee === 0 ? "Free" : `₹${fee}`}</td>
                      <td className="px-6 py-4 text-center font-bold text-indigo-300">{evt._count.registrations}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-400">₹{revenue.toLocaleString()}</td>
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
