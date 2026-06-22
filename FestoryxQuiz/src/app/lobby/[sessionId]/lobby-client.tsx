"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { Loader2, Users, Key } from "lucide-react";
import { toast } from "sonner";
import { RealtimeQuizState } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface LobbyClientProps {
  session: any;
  participantId?: string;
}

export function LobbyClient({ session, participantId }: LobbyClientProps) {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [state, setState] = useState<RealtimeQuizState | null>(null);

  useEffect(() => {
    // Resolve participantId from localStorage if not in URL parameters
    let resolvedParticipantId = participantId;
    if (!resolvedParticipantId) {
      resolvedParticipantId = localStorage.getItem(`session_${session.id}_player`) || undefined;
    }

    if (!resolvedParticipantId) {
      toast.error("Participant credentials not found. Redirecting to join page.");
      router.push("/join");
      return;
    }

    const socket = getSocket();
    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join-session", {
        sessionId: session.id,
        participantId: resolvedParticipantId,
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("state-sync", (updatedState: RealtimeQuizState) => {
      setState(updatedState);

      // Auto-redirect to active quiz page when session state becomes ACTIVE
      if (updatedState.status === "ACTIVE") {
        router.push(`/quiz/${session.id}?participantId=${resolvedParticipantId}`);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("state-sync");
      socket.disconnect();
    };
  }, [session.id, participantId, router]);

  const currentPlayer = state?.participants.find((p) => p.id === participantId);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex min-h-screen flex-col bg-[#0f0f23]"
    >
      {/* Background Blurs */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-20 top-10 h-[300px] w-[300px] rounded-full bg-indigo-600/10 blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 3.5 }}
          className="absolute -right-20 top-40 h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[100px]" 
        />
      </div>

      {/* Header Info */}
      <header className="border-b border-white/10 py-4 backdrop-blur-md bg-[#0f0f23]/60 relative z-25">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full border border-white/15 bg-black/40 p-0.5 shadow-md">
              <img src="/Logo.gif" alt="Festoryx Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading leading-none">
                Lobby Waiting Room
              </h2>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5 block">
                {session.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-gray-400 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-lg">
              <Key className="h-3 w-3 text-indigo-500/70" />
              Lobby: {session.accessCode}
            </span>
            <span
              className={`h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-300 ${
                isConnected ? "bg-emerald-500 text-emerald-500/40 animate-pulse" : "bg-red-500 text-red-500/40"
              }`}
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 flex flex-col justify-center items-center space-y-8 relative z-10">
        
        {/* Glowing Radar scan area */}
        <div className="relative flex items-center justify-center h-44 w-44">
          <motion.div 
            animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border border-indigo-500/30" 
          />
          <motion.div 
            animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1.5 }}
            className="absolute inset-4 rounded-full border border-purple-500/25" 
          />
          <div className="h-24 w-24 rounded-full bg-indigo-500/5 border border-white/10 flex items-center justify-center shadow-2xl shadow-indigo-600/5 relative z-10 backdrop-blur-md">
            <Loader2 className="h-10 w-10 text-indigo-400 animate-spin" />
          </div>
        </div>

        {/* Status text */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center space-y-2.5"
        >
          <h1 className="text-xl font-bold text-white font-heading tracking-wide">
            Waiting for Coordinator...
          </h1>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
            Once the admin starts the round, the competition screen will load automatically.
          </p>
          <AnimatePresence mode="wait">
            {currentPlayer && (
              <motion.p 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 rounded-full w-fit mx-auto mt-2.5"
              >
                Joined as: {currentPlayer.displayName}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Contestants listing */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[inset_0_0_24px_rgba(255,255,255,0.03)] backdrop-blur-xl space-y-4"
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Users className="h-4 w-4 text-indigo-400" />
            contending players joined ({state?.participants.length || 0})
          </h2>

          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 max-h-[220px] overflow-y-auto pr-1">
            {state?.participants.map((p, idx) => {
              const isMe = p.id === participantId;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.3) }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs transition-colors duration-250 ${
                    isMe
                      ? "bg-indigo-500/15 border-indigo-500/35 text-indigo-300 font-bold shadow-[0_0_12px_rgba(99,102,241,0.1)]"
                      : "bg-black/25 border-white/5 text-gray-400 hover:border-white/10"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      p.isConnected ? "bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" : "bg-gray-600"
                    }`}
                  />
                  <span className="truncate">{p.displayName}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
}
