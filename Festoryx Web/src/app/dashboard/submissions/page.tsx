import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FolderKanban, ExternalLink, Calendar, User, Award } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const user = await requireAuth();

  // Find organization member relation
  const memberRelation = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  if (!memberRelation) {
    redirect("/onboarding");
  }

  const orgId = memberRelation.organizationId;

  // Fetch all submissions for the organization's events
  const submissions = await prisma.submission.findMany({
    where: { organizationId: orgId },
    include: {
      registration: {
        include: {
          event: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 text-[#f4f0ff]">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <FolderKanban className="h-8 w-8 text-indigo-400" />
          <span>Project Submissions</span>
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Review hackathon deliverables, GitHub repository URLs, and project links submitted by competitors.
        </p>
      </div>

      {/* Submissions Table */}
      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-16 text-center backdrop-blur-md">
          <Award className="h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-bold text-white">No Submissions Yet</h3>
          <p className="mt-1 text-sm text-gray-400 max-w-sm">
            Once participants begin submitting their projects, they will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-300">
              <thead className="border-b border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-6 py-4">Participant</th>
                  <th className="px-6 py-4">Competition / Event</th>
                  <th className="px-6 py-4">Registration ID</th>
                  <th className="px-6 py-4">Project Link</th>
                  <th className="px-6 py-4">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {submissions.map((sub) => {
                  const reg = sub.registration;
                  const eventName = reg?.event?.name || "Unknown Event";

                  return (
                    <tr key={sub.id} className="transition-colors hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-white font-medium text-xs">{sub.participantName}</span>
                            <span className="text-[10px] text-gray-500 font-mono">{sub.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-300 font-medium text-xs">
                          {eventName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-[#a5b4fc] font-bold">
                        {reg?.registrationId || "Unknown"}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={sub.projectLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#34d399] hover:underline"
                        >
                          <span>Open Project URL</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {formatDateTime(sub.createdAt)}
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
