import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Clock, Play, Monitor, RefreshCw } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LiveSessionsPage() {
  // Fetch active/running public sessions
  const activeSessions = await prisma.quizSession.findMany({
    where: {
      status: { in: ["ACTIVE", "PAUSED", "WAITING"] },
      isPublic: true,
    },
    include: {
      quiz: { select: { name: true, mode: true } },
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <div className="flex min-h-screen flex-col bg-[#030014] text-[#f4f0ff] relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#9382ff]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-16 space-y-12 z-10">
        {/* Header Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-xs font-semibold text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-time Matches</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
            Live Quiz Sessions
          </h1>
          <p className="max-w-xl mx-auto text-sm text-gray-400">
            Spectate active tournament sessions and watch participants answer in real-time.
          </p>
        </div>

        {/* Sessions Catalog */}
        {activeSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-white/5 bg-white/[0.01] rounded-3xl p-8 backdrop-blur-2xl">
            <Clock className="w-12 h-12 text-gray-500 mb-4 animate-pulse" />
            <h3 className="text-base font-bold text-white">No Public Sessions Running</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Check back later when organizers launch public quizzes.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex h-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 px-4 text-xs font-semibold hover:bg-white/10 transition-all text-white"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeSessions.map((session) => {
              const isLive = session.status === "ACTIVE" || session.status === "PAUSED";
              return (
                <div
                  key={session.id}
                  className={`rounded-2xl border bg-white/[0.02] border-white/10 p-6 backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 ${
                    isLive ? "border-indigo-500/20 shadow-lg shadow-indigo-500/5" : ""
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        {session.accessCode}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                        isLive
                          ? "bg-emerald-500/10 text-emerald-400 animate-pulse border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {isLive ? "● Live Now" : "Lobby Waiting"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white font-heading truncate">
                        {session.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        Quiz Template: {session.quiz.name} ({session.quiz.mode})
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2">
                    <Link
                      href={`/screen/${session.accessCode}`}
                      target="_blank"
                      className="flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Open Auditorium Screen</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
