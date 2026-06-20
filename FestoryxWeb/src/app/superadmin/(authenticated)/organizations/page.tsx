import { prisma } from "@/lib/prisma";
import { requireAuth, isSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  approveOrganization,
  rejectOrganization,
  suspendOrganization,
} from "@/actions/organization.actions";
import { DeleteOrgButton } from "./delete-org-button";
import { Building2, CheckCircle, XCircle, AlertTriangle, ShieldAlert, History } from "lucide-react";
import { getOrgTypeEmoji } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SuperAdminOrganizationsPage() {
  const user = await requireAuth();

  if (!isSuperAdmin(user)) {
    redirect("/dashboard");
  }

  // Fetch all organizations with member info
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

  const pendingOrgs = organizations.filter((o) => o.status === "PENDING_VERIFICATION");
  const activeOrgs = organizations.filter((o) => o.status === "ACTIVE");
  const rejectedOrgs = organizations.filter((o) => o.status === "REJECTED");
  const suspendedOrgs = organizations.filter((o) => o.status === "SUSPENDED");
  const inactiveOrgs = organizations.filter((o) => o.status === "NEEDS_REVIEW");

  return (
    <div className="space-y-8 text-[#f4f0ff]">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Building2 className="h-8 w-8 text-indigo-400" />
          <span>Organizations & Tenants</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Verify new organization applications, manage active tenants, and handle suspensions.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#060317] border border-white/5 p-4 rounded-[12px]">
          <p className="text-[10px] text-[#918ea0] uppercase tracking-wider font-semibold">Pending Review</p>
          <p className="text-xl font-bold mt-1 text-amber-400">{pendingOrgs.length}</p>
        </div>
        <div className="bg-[#060317] border border-white/5 p-4 rounded-[12px]">
          <p className="text-[10px] text-[#918ea0] uppercase tracking-wider font-semibold">Active Tenants</p>
          <p className="text-xl font-bold mt-1 text-emerald-400">{activeOrgs.length}</p>
        </div>
        <div className="bg-[#060317] border border-white/5 p-4 rounded-[12px]">
          <p className="text-[10px] text-[#918ea0] uppercase tracking-wider font-semibold">Suspended</p>
          <p className="text-xl font-bold mt-1 text-red-400">{suspendedOrgs.length}</p>
        </div>
        <div className="bg-[#060317] border border-white/5 p-4 rounded-[12px]">
          <p className="text-[10px] text-[#918ea0] uppercase tracking-wider font-semibold">Rejected</p>
          <p className="text-xl font-bold mt-1 text-gray-400">{rejectedOrgs.length}</p>
        </div>
        <div className="bg-[#060317] border border-white/5 p-4 rounded-[12px]">
          <p className="text-[10px] text-[#918ea0] uppercase tracking-wider font-semibold">Inactive (Needs Review)</p>
          <p className="text-xl font-bold mt-1 text-purple-400">{inactiveOrgs.length}</p>
        </div>
      </div>

      {/* 1. Pending Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <span>Pending Verification ({pendingOrgs.length})</span>
        </h2>
        {pendingOrgs.length === 0 ? (
          <p className="text-xs text-gray-500 italic bg-[#060317] p-4 rounded-[12px] border border-white/5">No pending organizations requiring review.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pendingOrgs.map((org) => (
              <OrgCard key={org.id} org={org} />
            ))}
          </div>
        )}
      </div>

      {/* 2. Active Section */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <span>Active Organizations ({activeOrgs.length})</span>
        </h2>
        {activeOrgs.length === 0 ? (
          <p className="text-xs text-gray-500 italic bg-[#060317] p-4 rounded-[12px] border border-white/5">No active organizations on the platform.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeOrgs.map((org) => (
              <OrgCard key={org.id} org={org} />
            ))}
          </div>
        )}
      </div>

      {/* 3. Inactive / Needs Review Section */}
      {inactiveOrgs.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-purple-400" />
            <span>Inactive / Needs Review ({inactiveOrgs.length})</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {inactiveOrgs.map((org) => (
              <OrgCard key={org.id} org={org} />
            ))}
          </div>
        </div>
      )}

      {/* 4. Suspended & Rejected Section */}
      {(suspendedOrgs.length > 0 || rejectedOrgs.length > 0) && (
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-400" />
            <span>Suspended or Rejected ({suspendedOrgs.length + rejectedOrgs.length})</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[...suspendedOrgs, ...rejectedOrgs].map((org) => (
              <OrgCard key={org.id} org={org} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrgCard({ org }: { org: any }) {
  const owner = org.members.find((m: any) => m.role === "OWNER")?.user;

  // Build social list helper
  const socials = org.socialLinks as Record<string, string> | null;
  const links = [];
  if (org.websiteUrl) links.push({ name: "Website", url: org.websiteUrl });
  if (socials) {
    if (socials.instagram) links.push({ name: "Instagram", url: socials.instagram });
    if (socials.linkedin) links.push({ name: "LinkedIn", url: socials.linkedin });
    if (socials.youtube) links.push({ name: "YouTube", url: socials.youtube });
    if (socials.whatsapp) links.push({ name: "WhatsApp", url: `https://wa.me/${socials.whatsapp}` });
  }

  return (
    <div className="rounded-[16px] border border-white/5 bg-[#060317] p-5 shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] hover:border-white/10 transition-all flex flex-col justify-between space-y-4 relative">
      <div className="space-y-3">
        {/* Org Header */}
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl overflow-hidden bg-[#10093a]/40 border border-white/10 flex items-center justify-center shrink-0">
            {org.logoUrl ? (
              <img src={org.logoUrl} alt={org.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl">{getOrgTypeEmoji(org.type)}</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">{org.name}</h3>
            <span className="text-xs text-[#918ea0] capitalize">{org.type} • {org.city}, {org.state}</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-xs space-y-1 text-gray-400">
          <div><strong className="text-gray-300">Email:</strong> {org.email}</div>
          <div><strong className="text-gray-300">Phone:</strong> {org.phone}</div>
          {owner && (
            <div>
              <strong className="text-gray-300">Owner:</strong> {owner.name} ({owner.email})
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-[#a8a6b7] line-clamp-3 leading-relaxed">
          {org.description || "No description provided."}
        </p>

        {/* Social / Links */}
        {links.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-indigo-300 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        )}

        {/* Status Notes */}
        {org.statusNote && (
          <div className="text-[11px] rounded bg-red-500/5 border border-red-500/10 p-2 text-rose-400 mt-2">
            <strong>Notes:</strong> {org.statusNote}
          </div>
        )}
      </div>

      {/* Action Forms */}
      <div className="pt-3 border-t border-white/5 flex flex-wrap gap-2 items-center justify-end">
        {org.status === "PENDING_VERIFICATION" && (
          <>
            <form action={approveOrganization.bind(null, org.id)} className="inline-block">
              <button type="submit" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[5px] text-xs font-semibold transition-colors">
                Approve Activation
              </button>
            </form>
            
            <form action={async (formData) => {
              "use server";
              const note = formData.get("reason") as string;
              if (note && note.trim()) {
                await rejectOrganization(org.id, note);
              }
            }} className="flex items-center gap-1.5 w-full mt-2 sm:mt-0 sm:w-auto">
              <input
                name="reason"
                required
                placeholder="Reason for rejection"
                className="px-2 py-1 bg-[#030014] border border-white/10 rounded-[5px] text-xs text-white placeholder-gray-600 focus:outline-none w-full sm:w-44"
              />
              <button type="submit" className="px-3 py-1.5 bg-red-950/40 border border-red-800/30 hover:bg-red-900/30 text-rose-400 rounded-[5px] text-xs font-semibold transition-colors whitespace-nowrap">
                Reject Application
              </button>
            </form>
          </>
        )}

        {org.status === "ACTIVE" && (
          <form action={suspendOrganization.bind(null, org.id)} className="inline-block">
            <button type="submit" className="px-3 py-1.5 bg-red-950/40 border border-red-800/30 hover:bg-red-900/30 text-rose-400 rounded-[5px] text-xs font-semibold transition-colors">
              Suspend Tenant
            </button>
          </form>
        )}

        {(org.status === "SUSPENDED" || org.status === "REJECTED" || org.status === "NEEDS_REVIEW") && (
          <form action={approveOrganization.bind(null, org.id)} className="inline-block">
            <button type="submit" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[5px] text-xs font-semibold transition-colors">
              Reactivate / Approve
            </button>
          </form>
        )}

        <DeleteOrgButton orgId={org.id} orgName={org.name} />
      </div>
    </div>
  );
}
