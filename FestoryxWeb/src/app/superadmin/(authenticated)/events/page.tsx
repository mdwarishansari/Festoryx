import { getSuperAdminEventsPaginated } from "@/actions/superadmin.actions";
import { AdminEventActions } from "./admin-event-actions";
import Link from "next/link";
import { Plus, Trophy, Calendar } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ page?: string }> | { page?: string };
}

export default async function AdminEventsListPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const page = resolvedParams?.page ? parseInt(resolvedParams.page, 10) : 1;
  const pageSize = 10;

  const { events, total, pages } = await getSuperAdminEventsPaginated(page, pageSize);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="h-8 w-8 text-indigo-400" />
            <span>Manage Platform Competitions</span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            View, inspect, and configure events across all platform organizations.
          </p>
        </div>

        <Link
          href="/superadmin/events/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          <span>Create Global Event</span>
        </Link>
      </div>

      {/* Events Table Container */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-16 text-center backdrop-blur-md">
          <Trophy className="h-12 w-12 text-gray-500 mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-white">No Competitions Scaffolding</h3>
          <p className="mt-1 text-sm text-gray-400 max-w-sm">
            Create your first competition to display on the platform landing page.
          </p>
          <Link
            href="/superadmin/events/new"
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500"
          >
            Add Competition
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-300">
              <thead className="border-b border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-6 py-4">Competition Name</th>
                  <th className="px-6 py-4">Host Org</th>
                  <th className="px-6 py-4">Participation Type</th>
                  <th className="px-6 py-4">Per Participant Fee</th>
                  <th className="px-6 py-4">Schedule Date</th>
                  <th className="px-6 py-4 text-center">Registrations</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((event: any) => {
                  const fee = event.registrationFee ? Number(event.registrationFee) : 0;
                  return (
                    <tr
                      key={event.id}
                      className="transition-colors hover:bg-white/5"
                    >
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="flex flex-col">
                          <span>{event.name}</span>
                          <span className="text-[11px] font-mono text-gray-500">
                            /{event.slug}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-300">
                        {event.organization?.name || "-"}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        <span className="rounded-md bg-white/5 border border-white/10 px-2.5 py-1 text-xs">
                          {event.participationType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-xs">
                        {fee === 0 ? "Free" : `₹${fee}`}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-IN") : "-"}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-indigo-400">
                        {event._count.registrations}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              event.isPublished ? "bg-indigo-500 shadow-indigo-500/50" : "bg-gray-600"
                            }`}
                          />
                          <span className="text-xs">
                            {event.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <AdminEventActions
                          eventId={event.id}
                          eventSlug={event.slug}
                          isPublished={event.isPublished}
                          isRegistrationOpen={event.isRegistrationOpen}
                          eventName={event.name}
                          registrationsCount={event._count.registrations}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-white/5">
              <div className="flex flex-1 justify-between sm:hidden">
                {page > 1 ? (
                  <a
                    href={`?page=${page - 1}`}
                    className="relative inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Previous
                  </a>
                ) : (
                  <span className="relative inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed">
                    Previous
                  </span>
                )}
                {page < pages ? (
                  <a
                    href={`?page=${page + 1}`}
                    className="relative ml-3 inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                  >
                    Next
                  </a>
                ) : (
                  <span className="relative ml-3 inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed">
                    Next
                  </span>
                )}
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Showing <span className="font-semibold text-white">{(page - 1) * pageSize + 1}</span> to{" "}
                    <span className="font-semibold text-white">
                      {Math.min(page * pageSize, total)}
                    </span>{" "}
                    of <span className="font-semibold text-white">{total}</span> events
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    {page > 1 ? (
                      <a
                        href={`?page=${page - 1}`}
                        className="relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-medium text-gray-400 ring-1 ring-inset ring-white/10 hover:bg-white/10"
                      >
                        Previous
                      </a>
                    ) : (
                      <span className="relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-medium text-gray-600 ring-1 ring-inset ring-white/10 cursor-not-allowed">
                        Previous
                      </span>
                    )}

                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 bg-indigo-600">
                      {page}
                    </span>

                    {page < pages ? (
                      <a
                        href={`?page=${page + 1}`}
                        className="relative inline-flex items-center rounded-r-md px-3 py-2 text-sm font-medium text-gray-400 ring-1 ring-inset ring-white/10 hover:bg-white/10"
                      >
                        Next
                      </a>
                    ) : (
                      <span className="relative inline-flex items-center rounded-r-md px-3 py-2 text-sm font-medium text-gray-600 ring-1 ring-inset ring-white/10 cursor-not-allowed">
                        Next
                      </span>
                    )}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
