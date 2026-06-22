import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Trophy, Zap, Users, BarChart3, ArrowRight } from "lucide-react";
import { SocketStatusIndicator } from "@/components/shared/status-indicator";
import { prisma } from "@/lib/prisma";

import { CosmicHero } from "@/components/shared/cosmic-hero";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  // Fetch active/recent quiz sessions to allow public spectators
  const rawSessions = await prisma.quizSession.findMany({
    where: {
      status: { in: ["ACTIVE", "PAUSED", "WAITING", "COMPLETED"] },
    },
    include: {
      quiz: { select: { name: true, mode: true, settings: true } },
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const activeSessions = rawSessions.filter((session) => {
    const isLive = session.status === "ACTIVE" || session.status === "PAUSED" || session.status === "WAITING";
    const settings = (session.quiz.settings as any) || {};
    const showAuditorium = settings.publicAuditorium !== false;
    const showLeaderboard = settings.publicLeaderboard !== false;

    if (isLive && !showAuditorium) {
      return false; // Hide live sessions with private auditorium
    }
    if (session.status === "COMPLETED" && !showLeaderboard) {
      return false; // Hide completed sessions with private leaderboard
    }
    return true;
  }).slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-[#030014]">
      <Header />

      <main className="flex-1">
        <CosmicHero />

        {/* Live Sessions Section */}
        {activeSessions.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-white/5 space-y-10">
            <div className="text-center space-y-3">
              <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
                Live & Recent Event Matches
              </h2>
              <p className="max-w-xl mx-auto text-sm text-gray-400">
                Spectate active rounds on the auditorium screen or check final standings on the leaderboard.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {activeSessions.map((session) => {
                const isLive = session.status === "ACTIVE" || session.status === "PAUSED";
                return (
                  <div
                    key={session.id}
                    className={`rounded-2xl border bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between hover:scale-[1.01] ${
                      isLive 
                        ? "border-indigo-500/30 shadow-lg shadow-indigo-500/5 hover:border-indigo-500/50 bg-indigo-950/5" 
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded font-bold">
                          {session.accessCode}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          isLive 
                            ? "bg-emerald-500/10 text-emerald-400 animate-pulse border border-emerald-500/20" 
                            : session.status === "WAITING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-white/5 text-gray-400 border border-white/10"
                        }`}>
                          {isLive ? "● Live Match" : session.status.toLowerCase()}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white font-heading truncate">
                          {session.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          Quiz: {session.quiz.name} ({session.quiz.mode})
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-center text-xs">
                      {((session.status === "ACTIVE" || session.status === "PAUSED" || session.status === "WAITING") &&
                        ((session.quiz.settings as any)?.publicAuditorium !== false)) ? (
                        <Link
                          href={`/screen/${session.accessCode}`}
                          target="_blank"
                          className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 font-semibold text-white transition-all flex items-center justify-center gap-1 hover:border-white/25"
                        >
                          🖥️ Auditorium Screen
                        </Link>
                      ) : (
                        <div className="rounded-xl bg-white/5 border border-white/5 py-2.5 font-semibold text-gray-600 cursor-not-allowed flex items-center justify-center gap-1">
                          🔒 Private Screen
                        </div>
                      )}

                      {((session.quiz.settings as any)?.publicLeaderboard !== false) ? (
                        <Link
                          href={`/leaderboard/${session.accessCode}`}
                          target="_blank"
                          className="rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 py-2.5 font-semibold text-indigo-300 hover:text-white transition-all flex items-center justify-center gap-1"
                        >
                          🏆 Leaderboard
                        </Link>
                      ) : (
                        <div className="rounded-xl bg-white/5 border border-white/5 py-2.5 font-semibold text-gray-600 cursor-not-allowed flex items-center justify-center gap-1">
                          🔒 Private Rank
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Features list */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-white/5">
          <h2 className="text-center font-heading text-2xl font-bold text-white mb-12">
            Engineered for Real-Time Event Hosting
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:border-indigo-500/20 transition-all duration-200">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                <Zap className="h-5 w-5 text-indigo-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                Instant Buzzers
              </h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Server-side millisecond timestamp queue guarantees fair buzz orders for rapid-fire rounds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:border-indigo-500/20 transition-all duration-200">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                Live Leaderboard
              </h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Watch point tallies update live on the central projector as players submit choices.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:border-indigo-500/20 transition-all duration-200">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                Team Aggregates
              </h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Supports team dynamics. Members score points which accumulate automatically for their team.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl hover:border-indigo-500/20 transition-all duration-200">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Trophy className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                Verified Identity
              </h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Contestants authenticate using their unique Festoryx Event Registration ID for security.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
