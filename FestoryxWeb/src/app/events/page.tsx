export const dynamic = "force-dynamic";

import { getPublishedEvents } from "@/actions/event.actions";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { EventCard } from "@/components/events/event-card";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CosmicBackground } from "@/components/ui/cosmic-background";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech Events & Hackathons List | Festoryx Competitions",
  description: "Browse our dynamic schedule of competitive arenas including fast coding challenges, tech quizzes, UI/UX sprints, and 24-hour hackathons. Register solo or in teams!",
  keywords: ["Festoryx Events", "Coding Challenges", "Tech Hackathon", "Design Competition", "Registration"],
};

interface PageProps {
  searchParams: Promise<{
    type?: string;
    q?: string;
    adv_q?: string;
    org?: string;
    format?: string;
    date?: string;
    page?: string;
  }>;
}

function simpleSearchFilter(event: any, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  return event.name.toLowerCase().includes(q) || (event.shortDescription || "").toLowerCase().includes(q);
}

function advancedSearchFilter(event: any, query: string): boolean {
  if (!query) return true;
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  // Verify all tokens match in at least one of description, rules, eligibility, venue, prizeDetails
  return tokens.every(token => 
    event.description.toLowerCase().includes(token) ||
    (event.rules || "").toLowerCase().includes(token) ||
    (event.eligibility || "").toLowerCase().includes(token) ||
    (event.venue || "").toLowerCase().includes(token) ||
    (event.prizeDetails || "").toLowerCase().includes(token)
  );
}

export default async function EventsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const filterType = resolvedSearchParams.type || "ALL";
  const query = (resolvedSearchParams.q || "").trim();
  const advQuery = (resolvedSearchParams.adv_q || "").trim();
  const orgSlug = resolvedSearchParams.org || "ALL";
  const formatFilter = resolvedSearchParams.format || "ALL";
  const dateFilter = resolvedSearchParams.date || "UPCOMING";
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 8;

  const [allEvents, activeOrgs] = await Promise.all([
    getPublishedEvents(),
    prisma.organization.findMany({
      where: { status: "ACTIVE" },
      select: { name: true, slug: true },
      orderBy: { name: "asc" }
    })
  ]);

  const filteredEvents = allEvents.filter((event) => {
    // 1. Participation Type Filter
    if (filterType !== "ALL" && event.participationType !== filterType) return false;

    // 2. Simple Search Query Filter
    if (query !== "") {
      if (!simpleSearchFilter(event, query)) return false;
    }

    // 3. Advanced Search Query Filter
    if (advQuery !== "") {
      if (!advancedSearchFilter(event, advQuery)) return false;
    }

    // 4. Organization Filter
    if (orgSlug !== "ALL" && event.organization?.slug !== orgSlug) return false;

    // 5. Format Filter
    if (formatFilter !== "ALL" && (event.format || "").toLowerCase() !== formatFilter.toLowerCase()) return false;

    // 6. Date Filter (Upcoming vs Past vs All)
    const now = new Date();
    const eventDate = event.eventDate ? new Date(event.eventDate) : null;
    if (dateFilter === "UPCOMING") {
      if (eventDate && eventDate < now) return false;
    } else if (dateFilter === "PAST") {
      if (!eventDate || eventDate >= now) return false;
    }

    return true;
  });

  // Pagination slicing
  const total = filteredEvents.length;
  const pages = Math.ceil(total / pageSize);
  const paginatedEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize);

  // Helper to build URL with page index
  function getPageUrl(pageNum: number) {
    const params = new URLSearchParams();
    if (filterType !== "ALL") params.set("type", filterType);
    if (query) params.set("q", query);
    if (advQuery) params.set("adv_q", advQuery);
    if (orgSlug !== "ALL") params.set("org", orgSlug);
    if (formatFilter !== "ALL") params.set("format", formatFilter);
    if (dateFilter !== "UPCOMING") params.set("date", dateFilter);
    params.set("page", String(pageNum));
    return `/events?${params.toString()}`;
  }

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-[#f4f0ff] font-sans relative">
      <CosmicBackground />
      <Header />
      <main className="flex-grow pt-28 pb-16 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center md:text-left md:flex md:items-end md:justify-between border-b border-white/10 pb-8">
            <div>
              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                <span className="bg-gradient-to-r from-indigo-200 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                  All Competitions
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-400">
                Explore our lineup of exciting tech challenges, pick your arena, and show what you've got.
              </p>
            </div>
          </div>

          {/* Search and Filters Panel */}
          <form method="GET" action="/events" className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-6 items-end bg-[#060317] border border-white/5 p-4 rounded-xl shadow-[inset_0_0_12px_rgba(255,255,255,0.02)]">
            {/* Simple Search Input */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Simple Search</label>
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Name or short summary..."
                className="w-full px-3 py-2 bg-[#030014] border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#9382ff]"
              />
            </div>

            {/* Advanced Search Input */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-indigo-400">Deep Search (Tokens)</label>
              <input
                type="text"
                name="adv_q"
                defaultValue={advQuery}
                placeholder="Deep rules, venue or prizes..."
                className="w-full px-3 py-2 bg-[#030014] border border-indigo-500/25 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#9382ff] focus:ring-1 focus:ring-[#9382ff]"
              />
            </div>

            {/* Organization Filter */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Host Organization</label>
              <select
                name="org"
                defaultValue={orgSlug}
                className="w-full px-3 py-2 bg-[#030014] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#9382ff]"
              >
                <option value="ALL">All Hosts</option>
                {activeOrgs.map((org) => (
                  <option key={org.slug} value={org.slug}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Filter */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Event Format</label>
              <select
                name="format"
                defaultValue={formatFilter}
                className="w-full px-3 py-2 bg-[#030014] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#9382ff]"
              >
                <option value="ALL">All Formats</option>
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Participation Type Filter */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Participation</label>
              <select
                name="type"
                defaultValue={filterType}
                className="w-full px-3 py-2 bg-[#030014] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#9382ff]"
              >
                <option value="ALL">All Toggles</option>
                <option value="SOLO">Solo Only</option>
                <option value="TEAM">Team Only</option>
                <option value="BOTH">Solo & Team</option>
              </select>
            </div>

            {/* Date / Status Filter */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Timeline</label>
              <div className="flex gap-2">
                <select
                  name="date"
                  defaultValue={dateFilter}
                  className="flex-grow px-3 py-2 bg-[#030014] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#9382ff]"
                >
                  <option value="ALL">All Dates</option>
                  <option value="UPCOMING">Upcoming Only</option>
                  <option value="PAST">Past Events</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </form>

          {/* Grid list */}
          {paginatedEvents.length === 0 ? (
            <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/5 p-16 text-center backdrop-blur-md">
              <Trophy className="h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-bold text-white">No Competitions Found</h3>
              <p className="mt-2 text-sm text-gray-400 max-w-sm">
                We couldn't find any events matching your filter search. Try resetting the filters.
              </p>
              <Link
                href="/events"
                className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-500"
              >
                Reset Filters
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Pagination controls */}
              {pages > 1 && (
                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                  <span className="text-xs text-gray-400">
                    Showing page <strong className="text-white">{page}</strong> of{" "}
                    <strong className="text-white">{pages}</strong> (Total: {total} events)
                  </span>

                  <div className="flex items-center gap-2">
                    {page > 1 ? (
                      <Link
                        href={getPageUrl(page - 1)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-gray-300 hover:text-white transition-all"
                      >
                        ← Previous
                      </Link>
                    ) : (
                      <div className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/5 bg-white/0 px-3 text-xs font-semibold text-gray-600 cursor-not-allowed">
                        ← Previous
                      </div>
                    )}

                    {page < pages ? (
                      <Link
                        href={getPageUrl(page + 1)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-gray-300 hover:text-white transition-all"
                      >
                        Next →
                      </Link>
                    ) : (
                      <div className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/5 bg-white/0 px-3 text-xs font-semibold text-gray-600 cursor-not-allowed">
                        Next →
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
