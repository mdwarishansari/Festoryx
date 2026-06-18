import { prisma } from "@/lib/prisma";
import { requireAuth, isSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { History, User, Building2, Calendar, Database } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SuperAdminAuditLogsPage() {
  const user = await requireAuth();

  if (!isSuperAdmin(user)) {
    redirect("/dashboard");
  }

  // Fetch all audit logs with relations
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      organization: true,
    },
    take: 100, // Limit to 100 most recent logs
  });

  return (
    <div className="space-y-8 text-[#f4f0ff]">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <History className="h-8 w-8 text-indigo-400" />
          <span>Audit Logs</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Monitor platform transactions, settings changes, organization approvals, and administrative history.
        </p>
      </div>

      {/* Logs Table */}
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-16 text-center backdrop-blur-md">
          <Database className="h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-bold text-white">No Audit Logs</h3>
          <p className="mt-1 text-sm text-gray-400 max-w-sm">
            Platform activities will be automatically recorded here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-300">
              <thead className="border-b border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Tenant Org</th>
                  <th className="px-6 py-4">Target Entity</th>
                  <th className="px-6 py-4 text-right">Payload Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {logs.map((log) => {
                  return (
                    <tr key={log.id} className="transition-colors hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="rounded-md bg-white/5 border border-white/10 px-2 py-1 text-xs font-semibold font-mono text-indigo-300 uppercase tracking-wide">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {log.user ? (
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-white font-medium text-xs">{log.user.name}</span>
                              <span className="text-[10px] text-gray-500 font-mono">{log.user.email}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic">System Process</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {log.organization ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-white font-medium text-xs">{log.organization.name}</span>
                              <span className="text-[10px] text-gray-500 font-mono">slug: {log.organization.slug}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.entityType ? (
                          <div className="flex flex-col text-[11px]">
                            <span className="text-gray-300 capitalize">{log.entityType}</span>
                            <span className="text-[10px] text-gray-500 font-mono">id: {log.entityId}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {log.details ? (
                          <pre className="inline-block text-[10px] font-mono text-gray-400 bg-black/40 border border-white/5 rounded p-2 text-left max-w-xs overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        ) : (
                          <span className="text-xs text-gray-500 italic">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
