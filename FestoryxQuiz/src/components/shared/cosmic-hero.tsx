"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import { SocketStatusIndicator } from "../shared/status-indicator";

export function CosmicHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full min-h-[75vh] flex flex-col items-center justify-center overflow-hidden bg-[#030014] py-16 px-4">
      {/* ─── CENTRED BLACK HOLE (GARGANTUA GRAVITY EFFECT) ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
        {/* Soft Ambient Purple/Indigo Glow */}
        <div className="absolute w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,rgba(99,102,241,0.02)_50%,transparent_70%)] blur-[80px]" />
        
        {mounted && (
          <div className="absolute flex items-center justify-center scale-90 md:scale-100 opacity-90 w-full h-[400px]">
            
            {/* Central Violet Core Glow */}
            <div className="absolute w-[220px] h-[220px] rounded-full bg-violet-600/30 blur-[40px] animate-pulse z-0" />

            {/* 1. Lensed Einstein Ring */}
            <motion.div
              className="absolute w-[300px] h-[300px] rounded-full border-[3px] border-indigo-500/40 opacity-70 blur-[1px] shadow-[0_0_80px_rgba(99,102,241,0.5),inset_0_0_40px_rgba(139,92,246,0.3)]"
              style={{
                background: "radial-gradient(circle, transparent 55%, rgba(147,130,255,0.2) 65%, rgba(236,72,153,0.1) 80%, transparent 100%)",
                transform: "rotateY(15deg) rotateX(5deg)",
              }}
              animate={{
                rotate: [0, 360],
                scale: [0.97, 1.03, 0.97],
              }}
              transition={{
                rotate: { duration: 35, repeat: Infinity, ease: "linear" },
                scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
              }}
            />

            {/* 2. Secondary Lensed Ring */}
            <motion.div
              className="absolute w-[280px] h-[280px] rounded-full border border-purple-500/30 opacity-55 blur-[2px] shadow-[0_0_60px_rgba(168,85,247,0.4)]"
              style={{
                background: "conic-gradient(from 180deg, transparent, rgba(99,102,241,0.15), rgba(236,72,153,0.1), transparent)",
                transform: "rotateY(-15deg) rotateX(10deg)",
              }}
              animate={{
                rotate: [360, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* 3. Event Horizon */}
            <div className="absolute w-[180px] h-[180px] bg-black rounded-full border border-white/10 z-10 shadow-[0_0_100px_rgba(0,0,0,1)] flex items-center justify-center">
              <div className="w-[172px] h-[172px] rounded-full bg-black shadow-[inset_0_0_30px_rgba(147,130,255,0.2)]" />
            </div>

            {/* 4. Side-View Accretion Disk */}
            <motion.div
              className="absolute w-[460px] h-[34px] rounded-full bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent blur-[0.5px] z-20"
              style={{
                boxShadow: "0 0 40px rgba(99,102,241,0.6), 0 0 80px rgba(168,85,247,0.4)",
                transform: "rotateX(82deg) rotateY(-2deg) rotateZ(3deg)",
              }}
              animate={{
                scaleY: [0.9, 1.1, 0.9],
                rotateZ: [2, 4, 2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Secondary wider Horizontal gas veil */}
            <motion.div
              className="absolute w-[540px] h-[48px] rounded-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent blur-[4px] z-20"
              style={{
                transform: "rotateX(84deg) rotateY(-2deg) rotateZ(2deg)",
              }}
              animate={{
                opacity: [0.6, 0.8, 0.6],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Orbiting dust particles */}
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 360) / 16;
              const radius = 220 + Math.random() * 60;
              const duration = 10 + Math.random() * 6;
              const delay = -Math.random() * 12;
              
              return (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-indigo-200 shadow-[0_0_6px_rgba(99,102,241,0.8)] z-10"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration,
                    repeat: Infinity,
                    ease: "linear",
                    delay,
                  }}
                  style={{
                    x: Math.cos((angle * Math.PI) / 180) * radius,
                    y: Math.sin((angle * Math.PI) / 180) * radius * 0.18,
                  }}
                />
              );
            })}
          </div>
        )}
        
        {/* Fading mask */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030014] to-transparent z-1" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-400 font-medium"
        >
          <Trophy className="h-4 w-4" />
          University Live Competition Portal
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-4xl sm:text-6xl font-extrabold tracking-tight text-transparent font-heading leading-tight max-w-4xl mx-auto"
        >
          Welcome to the <br />
          <span className="bg-gradient-to-r from-indigo-200 via-indigo-400 to-purple-500 bg-clip-text text-transparent inline-block hover:scale-[1.02] transition-transform duration-500 cursor-default">
            Festoryx Quiz Arena
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto text-base sm:text-lg text-gray-400 leading-relaxed"
        >
          Participate in real-time solo or team quiz battles. Watch live questions, trigger fast buzzers, and check your rank on the live screen instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center pt-2"
        >
          <SocketStatusIndicator />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <Link
            href="/join"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:scale-[1.02]"
          >
            Enter Game Lobby
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/live-sessions"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10 hover:border-white/20"
          >
            Check Live Sessions
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
