"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { joinSessionAction } from "@/actions/participant.actions";
import { toast } from "sonner";
import { LogIn, Key, Award, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function JoinLobbyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f23]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    }>
      <JoinLobbyContent />
    </Suspense>
  );
}

function JoinLobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [registrationCode, setRegistrationCode] = useState("");
  const [accessCode, setAccessCode] = useState("");

  // Process auto-join URL parameters if provided
  useEffect(() => {
    const regParam = searchParams.get("regCode");
    const accessParam = searchParams.get("accessCode");

    if (regParam) setRegistrationCode(regParam);
    if (accessParam) setAccessCode(accessParam);

    if (regParam && accessParam) {
      startTransition(async () => {
        const res = await joinSessionAction({
          registrationCode: regParam.trim(),
          accessCode: accessParam.trim(),
        });

        if (res.success && res.data) {
          toast.success("Joined lobby successfully!");
          localStorage.setItem(`session_${res.data.sessionId}_player`, res.data.participantId);
          router.push(`/lobby/${res.data.sessionId}?participantId=${res.data.participantId}`);
        } else {
          toast.error(res.error || "Failed to join session.");
        }
      });
    }
  }, [searchParams, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!registrationCode.trim() || !accessCode.trim()) {
      toast.error("Please enter both credentials.");
      return;
    }

    startTransition(async () => {
      const res = await joinSessionAction({
        registrationCode: registrationCode.trim(),
        accessCode: accessCode.trim(),
      });

      if (res.success && res.data) {
        toast.success("Joined lobby successfully!");
        // Store in localStorage for persistence / reconnection
        localStorage.setItem(`session_${res.data.sessionId}_player`, res.data.participantId);
        
        router.push(`/lobby/${res.data.sessionId}?participantId=${res.data.participantId}`);
      } else {
        toast.error(res.error || "Failed to join session.");
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f0f23]"
    >
      {/* Background blurs */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[128px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[128px]" 
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Header link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to public site
          </Link>
        </motion.div>

        {/* Branding */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 text-center flex flex-col items-center"
        >
          <div className="h-12 w-12 overflow-hidden rounded-full border border-white/10 bg-black/40 mb-3 flex items-center justify-center shadow-lg">
            <img src="/Logo.gif" alt="Festoryx Logo" className="h-8 w-8 object-contain" />
          </div>
          <h1 className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent font-heading">
            Festoryx QUIZ ARENA
          </h1>
          <p className="mt-1 text-xs text-gray-400 font-medium">
            Enter credentials to join the live game lobby
          </p>
        </motion.div>

        {/* Card Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[inset_0_0_24px_rgba(255,255,255,0.03)] backdrop-blur-xl hover:border-indigo-500/20 transition-all duration-350"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Registration ID */}
            <div className="space-y-1.5">
              <label htmlFor="regCode" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Festoryx Registration ID
              </label>
              <div className="relative group">
                <Award className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  id="regCode"
                  type="text"
                  required
                  disabled={isPending}
                  value={registrationCode}
                  onChange={(e) => setRegistrationCode(e.target.value)}
                  placeholder="e.g. cm1a23b45 or REG-1234"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>
              <p className="text-[10px] text-gray-500">
                Found on your event registration ticket.
              </p>
            </div>

            {/* Access Code */}
            <div className="space-y-1.5">
              <label htmlFor="accCode" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Lobby Access Code (6-char)
              </label>
              <div className="relative group">
                <Key className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  id="accCode"
                  type="text"
                  required
                  maxLength={6}
                  disabled={isPending}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="e.g. A9B8C7"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 uppercase font-mono tracking-widest text-center"
                />
              </div>
              <p className="text-[10px] text-gray-500">
                Displayed on the coordinator&apos;s projector screen.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Join Live Lobby</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-center text-[10px] text-gray-500 font-medium"
        >
          Ensure your registration status is approved to enter live lobbies.
        </motion.p>
      </div>
    </motion.div>
  );
}
