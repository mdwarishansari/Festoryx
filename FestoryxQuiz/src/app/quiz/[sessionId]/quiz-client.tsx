"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";
import {
  Trophy,
  Zap,
  Volume2,
  Clock,
  Award,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Shield,
  Activity,
  Flame,
} from "lucide-react";
import { RealtimeQuizState } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

// Premium Animation System Variants
const fadeUpVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 }
  },
  exit: { 
    opacity: 0, 
    y: -15, 
    scale: 0.98,
    transition: { duration: 0.2 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 10, scale: 0.97 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 14 }
  }
};

interface QuizClientProps {
  session: any;
  participantId?: string;
}

export function QuizClient({ session, participantId }: QuizClientProps) {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [state, setState] = useState<RealtimeQuizState | null>(null);

  // Resolve participant ID at the component level
  const [resolvedPlayerId, setResolvedPlayerId] = useState<string>("");

  useEffect(() => {
    let rid = participantId;
    if (!rid && typeof window !== "undefined") {
      rid = localStorage.getItem(`session_${session.id}_player`) || "";
    }
    if (rid) {
      setResolvedPlayerId(rid);
    }
  }, [participantId, session.id]);

  // Participant specific inputs
  const [submittedOptionId, setSubmittedOptionId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const [buzzerRank, setBuzzerRank] = useState<number | null>(null);
  const [revealState, setRevealState] = useState<{
    isCorrect: boolean;
    hasSubmitted: boolean;
    selectedOptionId: string | null;
    correctOptionId?: string | null;
  } | null>(null);
  const [buzzerCountdown, setBuzzerCountdown] = useState<number | null>(null);

  // Time tracking
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!resolvedPlayerId) return;

    const socket = getSocket();
    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join-session", {
        sessionId: session.id,
        participantId: resolvedPlayerId,
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("state-sync", (updatedState: RealtimeQuizState) => {
      setState((prevState) => {
        // Reset inputs if:
        // 1. The active question ID changes
        // 2. The active round type changes
        // 3. The rapid fire running state turns off
        const questionChanged = prevState?.activeQuestion?.id !== updatedState.activeQuestion?.id;
        const roundChanged = prevState?.currentRoundType !== updatedState.currentRoundType;
        const rfTurnEnded = prevState?.rapidFireState?.isRunning === true && updatedState.rapidFireState?.isRunning === false;
        
        if (questionChanged || roundChanged || rfTurnEnded) {
          setSubmittedOptionId(null);
          setSelectedOptionId(null);
          setHasBuzzed(false);
          setBuzzerRank(null);
          setRevealState(null);
          setBuzzerCountdown(null);
        }
        return updatedState;
      });

      if (updatedState.status === "COMPLETED") {
        toast.info("Quiz has completed. Loading results!");
        router.push(`/leaderboard/${session.id}`);
      } else if (updatedState.status === "WAITING") {
        router.push(`/lobby/${session.id}`);
      }
    });

    socket.on("answer-feedback", (res: { success: boolean; isCorrect?: boolean; error?: string }) => {
      if (res.success) {
        toast.success("Answer logged.");
      } else {
        toast.error(res.error || "Failed to log answer.");
      }
    });

    socket.on("buzzer-hit", ({ participantId: hitPid, rank }) => {
      if (hitPid === resolvedPlayerId) {
        setBuzzerRank(rank);
        toast.success(`You buzzed! Rank #${rank}`);
      }
    });

    socket.on("buzzer-reset", () => {
      setHasBuzzed(false);
      setBuzzerRank(null);
    });

    socket.on("reveal-answer", ({ isCorrect, hasSubmitted, selectedOptionId, correctOptionId }) => {
      setRevealState({ isCorrect, hasSubmitted, selectedOptionId, correctOptionId });
    });

    socket.on("buzzer-countdown", ({ count }) => {
      setBuzzerCountdown(count > 0 ? count : null);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("state-sync");
      socket.off("answer-feedback");
      socket.off("buzzer-hit");
      socket.off("buzzer-reset");
      socket.off("reveal-answer");
      socket.off("buzzer-countdown");
      socket.disconnect();
    };
  }, [session.id, resolvedPlayerId, router]);

  // Synchronized Client countdown ticker
  useEffect(() => {
    if (!state?.questionEndsAt) {
      setTimeRemaining(0);
      return;
    }

    const calculateTime = () => {
      const ends = new Date(state.questionEndsAt!).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.ceil((ends - now) / 1000));
      setTimeRemaining(diff);
      return diff;
    };

    calculateTime();
    const timer = setInterval(() => {
      const remaining = calculateTime();
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [state?.questionEndsAt]);

  const handleOptionSelect = (optionId: string) => {
    if (timeRemaining <= 0 || revealState) return;
    
    if (state?.currentRoundType === "RAPID_FIRE") {
      setSelectedOptionId(optionId);
      getSocket().emit("rapid-fire:select-option", {
        sessionId: session.id,
        selectedOptionId: optionId,
      });
    } else {
      setSubmittedOptionId(optionId);
      getSocket().emit("submit-answer", {
        sessionId: session.id,
        participantId: resolvedPlayerId,
        questionId: state?.activeQuestion?.id,
        selectedOptionId: optionId,
      });
    }
  };

  const handleRapidFireSubmit = () => {
    if (!selectedOptionId || !state?.activeQuestion?.id) return;
    setSubmittedOptionId(selectedOptionId);
    getSocket().emit("submit-answer", {
      sessionId: session.id,
      participantId: resolvedPlayerId,
      questionId: state.activeQuestion.id,
      selectedOptionId: selectedOptionId,
    });
  };

  const handleBuzzerPress = () => {
    if (hasBuzzed || !state?.buzzerOpen || buzzerCountdown !== null) return;
    setHasBuzzed(true);
    getSocket().emit("buzzer-pressed", {
      sessionId: session.id,
      participantId: resolvedPlayerId,
    });
  };
  if (!state) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0f0f23] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-sm text-gray-400">Connecting to live quiz session...</p>
      </div>
    );
  }

  const currentPlayer = state.participants.find((p) => p.id === resolvedPlayerId);
  const currentTeam = state.teams.find((t) => t.id === currentPlayer?.teamId);

  // Active check for Rapid Fire
  const isRapidFireActiveTurn = state.currentRoundType === "RAPID_FIRE" && 
    state.rapidFireState && 
    state.rapidFireState.isRunning &&
    (state.rapidFireState.activeParticipantId === resolvedPlayerId || 
     (currentPlayer?.teamId && state.rapidFireState.activeTeamId === currentPlayer.teamId));

  const isSelectedForRapidFire = state.currentRoundType === "RAPID_FIRE" &&
    state.rapidFireState &&
    (state.rapidFireState.activeParticipantId === resolvedPlayerId ||
     (currentPlayer?.teamId && state.rapidFireState.activeTeamId === currentPlayer.teamId));

  // Active check for Pass Round
  const isPassRoundActiveTurn = state.currentRoundType === "PASS_ROUND" &&
    state.passRoundState &&
    (state.passRoundState.activeParticipantId === resolvedPlayerId ||
     (currentPlayer?.teamId && state.passRoundState.activeTeamId === currentPlayer.teamId));

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0f0f23]">
      {/* Background Blurs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-[300px] w-[300px] rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="absolute -right-20 top-40 h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      {/* Header bar */}
      <header className="border-b border-white/10 py-3.5 glass">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-black/20">
              <img src="/Logo.gif" alt="Festoryx Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest leading-none">
                {state?.sessionName || "Active Game"}
              </span>
              {state?.currentRoundTitle && (
                <h2 className="text-sm font-bold text-indigo-400 font-heading leading-none mt-0.5">
                  Round {state.currentRoundNumber}: {state.currentRoundTitle}
                </h2>
              )}
            </div>
          </div>

          {/* Current Score Indicator */}
          <div className="flex items-center gap-3">
            {currentPlayer && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-xl text-center">
                <span className="text-[8px] text-indigo-400 uppercase font-bold tracking-wider block">Your Score</span>
                <span className="text-sm font-mono font-bold text-white block">{currentPlayer.score} pts</span>
              </div>
            )}
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              }`}
            />
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 flex flex-col justify-center relative z-10">
        <AnimatePresence mode="wait">
          {state?.status === "PAUSED" ? (
            <motion.div
              key="paused"
              variants={fadeUpVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center space-y-4 backdrop-blur-xl"
            >
              <Loader2 className="mx-auto h-12 w-12 text-amber-500 animate-spin" />
              <h2 className="text-xl font-bold text-amber-400 font-heading">Quiz Paused</h2>
              <p className="text-sm text-gray-400">
                The coordinator has paused the game. Please stand by.
              </p>
            </motion.div>
          ) : state?.currentRoundType === "RAPID_FIRE" ? (
            /* ─────────── RAPID FIRE ROUND UI ─────────── */
            <motion.div
              key="rapid_fire"
              variants={fadeUpVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="space-y-6"
            >
              <AnimatePresence mode="wait">
                {state.rapidFireState?.isRunning ? (
                  isSelectedForRapidFire ? (
                    /* Active Running UI */
                    <motion.div
                      key="rf-active"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 space-y-6 backdrop-blur-xl text-left"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider flex items-center gap-1.5 animate-pulse">
                          <Flame className="h-4.5 w-4.5 text-amber-500" />
                          YOUR RAPID FIRE TURN!
                        </span>
                        <div className="flex gap-2">
                          <span className="bg-black/35 px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-red-400 border border-red-500/20">
                            Round: {state.rapidFireState?.timeLeft}s
                          </span>
                          <span className="bg-black/35 px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-indigo-400 border border-indigo-500/20">
                            Q Limit: {state.rapidFireState?.questionTimeLeft}s
                          </span>
                        </div>
                      </div>

                      {state.activeQuestion ? (
                        <div className="space-y-4">
                          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                            Question #{(state.rapidFireState?.questionIndex || 0) + 1}
                          </div>
                          <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed font-heading">
                            {state.activeQuestion.text}
                          </h2>

                          {state.activeQuestion.options && state.activeQuestion.options.length > 0 && (
                            <div className="space-y-4 pt-2">
                              <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="show"
                                key={state.activeQuestion.id}
                                className="grid gap-3 sm:grid-cols-2"
                              >
                                {state.activeQuestion.options.map((opt, idx) => {
                                  const isSelected = selectedOptionId === opt.id || submittedOptionId === opt.id;
                                  const prefix = String.fromCharCode(65 + idx);
                                  
                                  const isRevealed = revealState !== null;
                                  const isCorrectOption = isRevealed && revealState.correctOptionId === opt.id;
                                  const wasSelectedAtReveal = isRevealed && revealState.selectedOptionId === opt.id;

                                  let optionStyle = isSelected
                                    ? "bg-indigo-600/20 border-indigo-500 text-white font-bold"
                                    : "bg-white/5 border-white/10 text-gray-300 hover:border-indigo-500/30 hover:bg-white/[0.08]";

                                  if (isRevealed) {
                                    if (isCorrectOption) {
                                      optionStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                                    } else if (wasSelectedAtReveal && !isCorrectOption) {
                                      optionStyle = "bg-red-500/20 border-red-500 text-red-400 font-bold";
                                    } else {
                                      optionStyle = "bg-white/5 border-white/5 text-gray-600 cursor-not-allowed";
                                    }
                                  }

                                  return (
                                    <motion.button
                                      variants={staggerItem}
                                      whileHover={isRevealed || !!submittedOptionId ? {} : { scale: 1.015, x: 2, borderColor: isSelected ? "rgba(99, 102, 241, 0.8)" : "rgba(99, 102, 241, 0.45)", backgroundColor: "rgba(255, 255, 255, 0.07)" }}
                                      whileTap={isRevealed || !!submittedOptionId ? {} : { scale: 0.985 }}
                                      key={opt.id}
                                      onClick={() => handleOptionSelect(opt.id)}
                                      disabled={!!submittedOptionId || isRevealed}
                                      className={`flex items-center gap-3 w-full border text-left p-3.5 rounded-xl text-xs font-semibold transition-all duration-150 ${optionStyle}`}
                                    >
                                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                                        isSelected ? "bg-indigo-500 text-white" : "bg-white/10 text-gray-400"
                                      }`}>
                                        {prefix}
                                      </span>
                                      <span className="truncate">{opt.text}</span>
                                    </motion.button>
                                  );
                                })}
                              </motion.div>
                              {selectedOptionId && !submittedOptionId && !revealState && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex justify-end"
                                >
                                  <button
                                    onClick={handleRapidFireSubmit}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                                  >
                                    Submit Answer
                                  </button>
                                </motion.div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-xs text-gray-500 italic">
                          Waiting for rapid fire questions to start...
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    /* Spectator Active Turn Mirror UI (Real-time Mirroring) */
                    <motion.div
                      key="rf-spectator"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      className="rounded-2xl border border-indigo-500/20 bg-indigo-950/10 p-6 space-y-6 backdrop-blur-xl text-left"
                    >
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block">Spectating Turn</span>
                          <span className="text-sm font-bold text-indigo-400 font-heading">
                            Contestant: {state.rapidFireState?.activeTeamId 
                              ? state.teams.find(t => t.id === state.rapidFireState?.activeTeamId)?.name 
                              : (state.rapidFireState?.activeParticipantId 
                                  ? state.participants.find(p => p.id === state.rapidFireState?.activeParticipantId)?.displayName 
                                  : "Waiting...")}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="bg-black/35 px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-red-400 border border-red-500/20">
                            Round: {state.rapidFireState?.timeLeft}s
                          </span>
                          <span className="bg-black/35 px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-indigo-400 border border-indigo-500/20">
                            Q Limit: {state.rapidFireState?.questionTimeLeft}s
                          </span>
                        </div>
                      </div>

                      {state.activeQuestion ? (
                        <div className="space-y-4">
                          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                            Question #{(state.rapidFireState?.questionIndex || 0) + 1}
                          </div>
                          <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed font-heading">
                            {state.activeQuestion.text}
                          </h2>

                          {state.activeQuestion.options && state.activeQuestion.options.length > 0 && (
                            <motion.div
                              variants={staggerContainer}
                              initial="hidden"
                              animate="show"
                              key={state.activeQuestion.id}
                              className="grid gap-3 sm:grid-cols-2 pt-2"
                            >
                              {state.activeQuestion.options.map((opt, idx) => {
                                const prefix = String.fromCharCode(65 + idx);
                                const isSelectedByContestant = state.rapidFireState?.selectedOptionId === opt.id;

                                let optionStyle = isSelectedByContestant
                                  ? "bg-amber-500/15 border-amber-500 text-amber-400 font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse"
                                  : "bg-white/5 border-white/10 text-gray-400 cursor-not-allowed";

                                let badgeStyle = isSelectedByContestant
                                  ? "bg-amber-500 text-black border border-amber-500"
                                  : "bg-white/10 text-gray-500";

                                return (
                                  <motion.div
                                    variants={staggerItem}
                                    key={opt.id}
                                    className={`flex items-center gap-3 w-full border text-left p-3.5 rounded-xl text-xs font-semibold ${optionStyle}`}
                                  >
                                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${badgeStyle}`}>
                                      {prefix}
                                    </span>
                                    <span className="truncate">{opt.text}</span>
                                  </motion.div>
                                );
                              })}
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-xs text-gray-500 italic">
                          Waiting for rapid fire questions...
                        </div>
                      )}
                    </motion.div>
                  )
                ) : state.rapidFireState && (state.rapidFireState.stats?.attempted ?? 0) > 0 ? (
                  /* Turn Completed Results Screen */
                  <motion.div
                    key="rf-completed"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-8 text-center space-y-4 backdrop-blur-xl"
                  >
                    <Trophy className="mx-auto h-12 w-12 text-emerald-400 animate-bounce" />
                    <h2 className="text-xl font-bold text-white font-heading">Rapid Fire Completed!</h2>
                    <p className="text-sm text-gray-400">
                      {isSelectedForRapidFire ? "Your rapid fire turn has ended." : `Turn ended for: ${
                        state.rapidFireState?.activeTeamId 
                          ? state.teams.find(t => t.id === state.rapidFireState?.activeTeamId)?.name 
                          : (state.rapidFireState?.activeParticipantId 
                              ? state.participants.find(p => p.id === state.rapidFireState?.activeParticipantId)?.displayName 
                              : "Contestant")
                      }`}
                    </p>

                    <div className="inline-grid grid-cols-3 gap-6 bg-black/25 p-4 border border-white/5 rounded-xl text-xs font-mono text-gray-300 mt-2">
                      <div>Correct: <span className="text-emerald-400 font-bold">{state.rapidFireState.stats?.correct || 0}</span></div>
                      <div>Attempted: <span className="text-white font-bold">{state.rapidFireState.stats?.attempted || 0}</span></div>
                      <div>Score: <span className="text-indigo-400 font-bold">{state.rapidFireState.stats?.score || 0} pts</span></div>
                    </div>

                    <p className="text-xs text-gray-500 animate-pulse pt-4">
                      Waiting for host to configure the next team...
                    </p>
                  </motion.div>
                ) : (
                  /* Ready / Configured Screen */
                  <motion.div
                    key="rf-configured"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center space-y-4 backdrop-blur-xl"
                  >
                    <Clock className="mx-auto h-12 w-12 text-indigo-400 animate-pulse" />
                    <h2 className="text-xl font-bold text-white font-heading">
                      {isSelectedForRapidFire ? "Ready for Rapid Fire!" : "Next Team Up"}
                    </h2>
                    <p className="text-sm text-gray-400">
                      Configured Contestant: <span className="text-indigo-400 font-bold">
                        {state.rapidFireState?.activeTeamId 
                          ? state.teams.find(t => t.id === state.rapidFireState?.activeTeamId)?.name 
                          : (state.rapidFireState?.activeParticipantId 
                              ? state.participants.find(p => p.id === state.rapidFireState?.activeParticipantId)?.displayName 
                              : "None configured")}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
                      {isSelectedForRapidFire ? "You are selected for this turn. Stand by for the host to start..." : "Stand by as they prepare for their turn..."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : state?.currentRoundType !== "MCQ" && state?.currentRoundType !== "BUZZER" ? (
            /* ─────────── TURN / PASS ROUND UI ─────────── */
            <motion.div
              key="pass_round"
              variants={fadeUpVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="space-y-6"
            >
              {isPassRoundActiveTurn ? (
                <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-8 text-center space-y-6 backdrop-blur-xl shadow-lg shadow-yellow-500/10">
                  <Zap className="mx-auto h-16 w-16 text-yellow-400 animate-pulse" />
                  <div className="space-y-2">
                    <h1 className="text-2xl font-black text-white font-heading uppercase tracking-wide">IT IS YOUR TURN!</h1>
                    <p className="text-sm text-yellow-300 font-medium">
                      Answer the question verbally to the quiz host.
                    </p>
                    {state.passRoundState?.passCount && state.passRoundState.passCount > 0 ? (
                      <span className="inline-block bg-yellow-500/20 text-yellow-300 text-xs px-3 py-1 rounded-full font-bold uppercase">
                        Question Passed ({state.passRoundState.passCount} times)
                      </span>
                    ) : null}
                  </div>
                  {state.activeQuestion && (
                    <div className="bg-black/20 p-5 rounded-xl border border-yellow-500/20 text-left">
                      <p className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-2">Question Box</p>
                      <h2 className="text-md sm:text-lg font-bold text-white leading-relaxed">{state.activeQuestion.text}</h2>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center space-y-4 backdrop-blur-xl">
                  <Shield className="mx-auto h-12 w-12 text-gray-600" />
                  <h2 className="text-xl font-bold text-white font-heading">Spectating Turn</h2>
                  <p className="text-sm text-gray-400">
                    Turn Team: <span className="text-indigo-400 font-bold">{state.passRoundState?.activeTeamId ? state.teams.find(t => t.id === state.passRoundState?.activeTeamId)?.name : "Waiting..."}</span>
                  </p>
                  {state.activeQuestion && (
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-left mt-4">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Question Box</p>
                      <p className="text-sm text-gray-300">{state.activeQuestion.text}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : state?.activeQuestion ? (
            /* ─────────── MCQ / BUZZER ROUND UI ─────────── */
            <motion.div
              key="mcq_buzzer"
              variants={fadeUpVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="space-y-6"
            >
              {/* Question card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-indigo-400 tracking-widest block">
                    Question Box
                  </span>
                  
                  {state.currentRoundType === "MCQ" && timeRemaining > 0 && (
                    <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-2.5 py-1 rounded-xl text-red-400 font-mono font-bold text-xs">
                      <Clock className="h-3.5 w-3.5 animate-pulse" />
                      <span>{timeRemaining}s</span>
                    </div>
                  )}

                  {state.currentRoundType === "MCQ" && timeRemaining <= 0 && (
                    <div className="flex items-center gap-1.5 bg-gray-500/10 border border-white/5 px-2.5 py-1 rounded-xl text-gray-400 text-xs font-semibold">
                      <span>Timer Expired</span>
                    </div>
                  )}
                </div>

                <h1 className="text-lg sm:text-xl font-bold text-white leading-relaxed font-heading">
                  {state.activeQuestion.text}
                </h1>
              </div>

              {/* MCQ Options / Buzzer area */}
              {state.currentRoundType === "BUZZER" ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-6">
                  {/* Mega Buzzer Button */}
                  <motion.button
                    onClick={handleBuzzerPress}
                    disabled={hasBuzzed || !state.buzzerOpen || state.questionCompleted}
                    whileHover={state.buzzerOpen && !hasBuzzed && !state.questionCompleted ? { scale: 1.05 } : {}}
                    whileTap={state.buzzerOpen && !hasBuzzed && !state.questionCompleted ? { scale: 0.95 } : {}}
                    animate={state.buzzerOpen && !hasBuzzed && !state.questionCompleted ? { boxShadow: ["0 0 0px rgba(239, 68, 68, 0.4)", "0 0 25px rgba(239, 68, 68, 0.7)", "0 0 0px rgba(239, 68, 68, 0.4)"] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={`relative flex h-48 w-48 items-center justify-center rounded-full border-8 font-heading text-lg font-extrabold uppercase tracking-wider text-white shadow-2xl transition-all duration-300 active:scale-95 ${
                      state.questionCompleted
                        ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-500 cursor-not-allowed shadow-none"
                        : hasBuzzed
                        ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                        : !state.buzzerOpen
                        ? "bg-gray-900/60 border-white/5 text-gray-600 cursor-not-allowed shadow-none"
                        : "bg-gradient-to-br from-red-500 to-red-700 border-red-400 hover:brightness-110 shadow-red-500/25 hover:shadow-red-500/40 animate-pulse-glow"
                    }`}
                  >
                    <Volume2 className="absolute top-10 h-6 w-6 opacity-60" />
                    <span className="mt-4">
                      {state.questionCompleted ? "Resolved" : hasBuzzed ? "Buzzed" : !state.buzzerOpen ? "Locked" : "Buzz!"}
                    </span>
                  </motion.button>

                  {/* Status/Rank display */}
                  {state.questionCompleted ? (
                    <p className="text-sm text-emerald-400 font-bold uppercase tracking-wider animate-pulse text-center">Question completed! Points awarded.</p>
                  ) : hasBuzzed ? (
                    <div className="text-center space-y-1">
                      <p className="text-sm text-gray-400">Buzzer registered!</p>
                      {buzzerRank !== null ? (
                        <h3 className="text-lg font-bold text-emerald-400 animate-bounce">
                          Rank Arrival: #{buzzerRank}
                        </h3>
                      ) : (
                        <p className="text-xs text-gray-500 animate-pulse">Calculating order...</p>
                      )}
                    </div>
                  ) : !state.buzzerOpen ? (
                    <p className="text-xs text-gray-500 italic">Wait for host to unlock buzzers...</p>
                  ) : (
                    <p className="text-xs text-red-400 font-bold uppercase tracking-wider animate-pulse">Press the Buzzer NOW!</p>
                  )}

                  {/* Options display in Buzzer round */}
                  {state.activeQuestion.options && state.activeQuestion.options.length > 0 && (
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="show"
                      key={state.activeQuestion.id}
                      className="w-full max-w-md grid gap-3 sm:grid-cols-2 mt-6 text-left"
                    >
                      {state.activeQuestion.options.map((opt, index) => {
                        const isRevealed = revealState !== null;
                        const isCorrectOption = isRevealed && revealState.correctOptionId === opt.id;
                        
                        let optionStyle = "bg-white/5 border-white/10 text-gray-300";
                        let badgeStyle = "bg-white/10 text-gray-400";
                        
                        if (isRevealed) {
                          if (isCorrectOption) {
                            optionStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                            badgeStyle = "bg-emerald-500 text-white";
                          } else {
                            optionStyle = "bg-white/5 border-white/5 text-gray-600";
                            badgeStyle = "bg-white/5 text-gray-600";
                          }
                        }
                        
                        const prefix = String.fromCharCode(65 + index);
                        
                        return (
                          <motion.div
                            variants={staggerItem}
                            key={opt.id}
                            className={`flex items-center gap-3 border p-3.5 rounded-xl text-xs font-semibold ${optionStyle}`}
                          >
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${badgeStyle}`}>
                              {prefix}
                            </span>
                            <span className="truncate">{opt.text}</span>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              ) : (
                /* MCQ Option Grid */
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  key={state.activeQuestion.id}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {state.activeQuestion.options.map((opt, index) => {
                    const isSelected = submittedOptionId === opt.id;
                    const isRevealed = revealState !== null;
                    const wasSelectedAtReveal = isRevealed && revealState.selectedOptionId === opt.id;
                    
                    let optionStyle = "bg-white/5 border-white/10 text-gray-300 hover:border-indigo-500/30 hover:bg-white/[0.08]";
                    let badgeStyle = "bg-white/10 text-gray-400";
                    
                    if (isRevealed) {
                      const isCorrectOption = revealState.correctOptionId === opt.id;
                      const wasSelected = revealState.selectedOptionId === opt.id;
                      if (isCorrectOption) {
                        optionStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                        badgeStyle = "bg-emerald-500 text-white";
                      } else if (wasSelected) {
                        optionStyle = "bg-red-500/20 border-red-500 text-red-400 font-bold";
                        badgeStyle = "bg-red-500 text-white";
                      } else {
                        optionStyle = "bg-white/5 border-white/5 text-gray-600 cursor-not-allowed";
                        badgeStyle = "bg-white/5 text-gray-600";
                      }
                    } else if (isSelected) {
                      optionStyle = "bg-indigo-600/20 border-indigo-500 text-white font-bold";
                      badgeStyle = "bg-indigo-500 text-white";
                    } else if (timeRemaining <= 0) {
                      optionStyle = "bg-white/5 border-white/5 text-gray-500 cursor-not-allowed";
                      badgeStyle = "bg-white/5 text-gray-500";
                    }

                    const prefix = String.fromCharCode(65 + index); // A, B, C, D...

                    return (
                      <motion.button
                        variants={staggerItem}
                        whileHover={isRevealed || timeRemaining <= 0 ? {} : { scale: 1.015, x: 2, borderColor: isSelected ? "rgba(99, 102, 241, 0.8)" : "rgba(99, 102, 241, 0.45)", backgroundColor: "rgba(255, 255, 255, 0.07)" }}
                        whileTap={isRevealed || timeRemaining <= 0 ? {} : { scale: 0.985 }}
                        key={opt.id}
                        onClick={() => handleOptionSelect(opt.id)}
                        disabled={isRevealed || timeRemaining <= 0}
                        className={`flex items-center gap-3 w-full border text-left p-4 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${optionStyle}`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${badgeStyle}`}>
                          {prefix}
                        </span>
                        <span className="truncate">{opt.text}</span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="prepare"
              variants={fadeUpVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center space-y-4 backdrop-blur-xl"
            >
              <Zap className="mx-auto h-12 w-12 text-indigo-400 animate-pulse" />
              <h2 className="text-xl font-bold text-white font-heading">Prepare Contestant!</h2>
              <p className="text-sm text-gray-400">
                The round is active. Stand by for the coordinator to push the next question.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Buzzer countdown overlay */}
      <AnimatePresence>
        {buzzerCountdown !== null && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 px-4"
          >
            <div className="text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Get Ready to Buzz!</span>
              <motion.div
                key={buzzerCountdown}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [1, 1.25, 1], opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-8xl font-black font-heading text-white"
              >
                {buzzerCountdown}
              </motion.div>
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider block mt-2">
                Buzzer button unlocks in {buzzerCountdown}s
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
