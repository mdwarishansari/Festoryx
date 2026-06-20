"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight, Users, Globe } from "lucide-react";
import { useEffect, useState } from "react";

export function HomeHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-[#030014] py-20 px-4">
      {/* ─── BLACK HOLE / PURPLE GRAVITY BACKGROUND EFFECT ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(147,130,255,0.08)_0%,rgba(79,70,229,0.02)_50%,transparent_70%)] blur-[60px]" />
        
        {/* The Gravity Well / Accretion Disk System */}
        {mounted && (
          <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center scale-75 md:scale-100 opacity-80">
            {/* Outer Accretion Aura */}
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.12)_0%,rgba(99,102,241,0.04)_40%,transparent_70%)] blur-[40px]"
              animate={{
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Rotating Conic Energy Disk (Tilted) */}
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full opacity-60 mix-blend-screen blur-[12px]"
              style={{
                background: "conic-gradient(from 0deg, transparent 20%, rgba(147, 130, 255, 0.25) 45%, rgba(236, 72, 153, 0.15) 60%, transparent 80%)",
                transform: "rotateX(75deg) rotateY(12deg)",
              }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Opposite Rotating Accretion Ring */}
            <motion.div
              className="absolute w-[460px] h-[460px] rounded-full opacity-40 mix-blend-color-dodge blur-[8px]"
              style={{
                background: "conic-gradient(from 180deg, transparent 15%, rgba(99, 102, 241, 0.25) 45%, rgba(139, 92, 246, 0.15) 70%, transparent 90%)",
                transform: "rotateX(75deg) rotateY(-8deg)",
              }}
              animate={{
                rotate: [360, 0],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Gravity Warp Distortion Rings */}
            <motion.div
              className="absolute w-[320px] h-[320px] rounded-full border border-purple-500/20 shadow-[0_0_50px_rgba(147,130,255,0.15)]"
              style={{
                transform: "rotateX(72deg) rotateY(10deg)",
              }}
              animate={{
                scale: [0.95, 1.05, 0.95],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Neon Event Horizon Glow Ring */}
            <motion.div
              className="absolute w-[220px] h-[220px] rounded-full border-[1.5px] border-indigo-400/80 bg-transparent shadow-[0_0_40px_rgba(99,102,241,0.5),inset_0_0_30px_rgba(168,85,247,0.4)] blur-[0.5px]"
              animate={{
                scale: [0.98, 1.02, 0.98],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* The Black Hole Center / Singularity */}
            <div className="absolute w-[180px] h-[180px] bg-[#030014] rounded-full shadow-[0_0_60px_rgba(0,0,0,1)] border border-white/5 z-10 flex items-center justify-center">
              <div className="absolute inset-2 rounded-full bg-black shadow-[inset_0_0_20px_rgba(147,130,255,0.15)]" />
            </div>

            {/* Orbiting Gravitational Particles */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 360) / 12;
              const radius = 240 + Math.random() * 80;
              const duration = 12 + Math.random() * 8;
              const delay = -Math.random() * 15;
              
              return (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                  style={{
                    transformOrigin: "center center",
                  }}
                  animate={{
                    rotate: [0, 360],
                    scale: [0.6, 1.1, 0.6],
                  }}
                  transition={{
                    duration,
                    repeat: Infinity,
                    ease: "linear",
                    delay,
                  }}
                  // Offset the initial position
                  custom={radius}
                  variants={{
                    animate: (r: number) => ({
                      x: Math.cos((angle * Math.PI) / 180) * r,
                      y: Math.sin((angle * Math.PI) / 180) * r * 0.25, // compressed vertically to match tilt
                    })
                  }}
                  initial={{
                    x: Math.cos((angle * Math.PI) / 180) * radius,
                    y: Math.sin((angle * Math.PI) / 180) * radius * 0.25,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Fading bottom mask so it dissolves cleanly into the next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#030014] to-transparent z-1" />
      </div>

      {/* ─── HERO CONTENT (with Framer Motion Reveal) ─── */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 w-full text-center">
        {/* Sparkle Badge */}
        <motion.div 
          className="mb-6 inline-block"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-[32px] border border-[#9382ff]/30 bg-[#060317]/80 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-[#f4f0ff] shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)] hover:border-[#9382ff]/60 transition-colors">
            <Sparkles className="h-3.5 w-3.5 text-[#9382ff]" />
            <span>Next-Gen Competition OS</span>
          </div>
        </motion.div>

        {/* Title */}
        <div className="text-center mb-12">
          <motion.h1 
            className="font-heading text-5xl font-medium tracking-tight text-white sm:text-7xl md:text-8xl select-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            FESTORYX
          </motion.h1>
          <motion.p 
            className="mx-auto mt-4 max-w-xl text-sm text-[#a8a6b7] sm:text-base leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            The multi-tenant event operating system and interactive competition suite. Select your path below to continue.
          </motion.p>
        </div>

        {/* Dual Paths Separation */}
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto mt-6">
          {/* PATH 1: Organizers */}
          <motion.div 
            className="flex flex-col justify-between rounded-[20px] border border-white/5 bg-[#060317]/70 backdrop-blur-md p-8 shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] relative overflow-hidden group hover:border-[#9382ff]/20 hover:bg-[#060317]/90 transition-all duration-300"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50"></div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-[#9382ff]" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-white text-left">Want to Organize an Event?</h2>
              <p className="text-xs text-[#a8a6b7] text-left leading-relaxed">
                Register your college, club, university, or tech community. Manage event schedules, forms, payments, submissions, and live quizzes.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="flex-1 flex h-11 items-center justify-center gap-2 rounded-[5px] bg-[#9382ff] px-6 text-xs font-semibold text-white transition-all hover:bg-[#816eff] hover:scale-[1.02] shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)] active:scale-[0.98]"
              >
                Create Organization
              </Link>
              <Link
                href="/sign-in"
                className="flex-1 flex h-11 items-center justify-center gap-2 rounded-[5px] border border-white/10 bg-[#060317]/50 px-6 text-xs font-semibold text-[#f4f0ff] transition-all hover:bg-[#10093a]/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* PATH 2: Participants */}
          <motion.div 
            className="flex flex-col justify-between rounded-[20px] border border-white/5 bg-[#060317]/70 backdrop-blur-md p-8 shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] relative overflow-hidden group hover:border-[#9382ff]/20 hover:bg-[#060317]/90 transition-all duration-300"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4 }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500 opacity-50"></div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Globe className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-white text-left">Want to Participate?</h2>
              <p className="text-xs text-[#a8a6b7] text-left leading-relaxed">
                Browse public tech festivals, hackathons, and quizzes. Fill in registration details, secure your spot, and join the arena.
              </p>
            </div>

            <div className="mt-8">
              <Link
                href="/events"
                className="w-full flex h-11 items-center justify-center gap-2 rounded-[5px] bg-indigo-600/15 border border-indigo-500/30 px-6 text-xs font-semibold text-[#a5b4fc] transition-all hover:bg-indigo-600/25 hover:border-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Browse Events</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
