"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, ArrowRight, Users, Globe, Lock } from "lucide-react";
import { useEffect, useState } from "react";

interface HomeHeroProps {
  countdownDate?: Date | string | null;
}

export function HomeHero({ countdownDate }: HomeHeroProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!countdownDate) return;
    const target = new Date(countdownDate).getTime();
    if (isNaN(target)) return;

    const tick = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setIsExpired(false);
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [countdownDate]);

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[#030014] py-16 px-4">
      {/* ─── SIDE-VIEW BLACK HOLE (GARGANTUA GRAVITY EFFECT) ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
        {/* Soft Ambient Purple/Indigo Background Glow */}
        <div className="absolute w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,rgba(99,102,241,0.02)_50%,transparent_70%)] blur-[80px]" />
        
        {mounted && (
          <div className="absolute top-[35%] flex items-center justify-center scale-90 md:scale-100 opacity-90 relative w-full h-[400px]">
            
            {/* 1. Lensed Einstein Ring (Light bent from behind, wrapping around the black hole vertically) */}
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

            {/* 2. Secondary Lensed Ring (Opposite rotation, slightly tilted) */}
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

            {/* 3. The Singular Dark Shadow (Event Horizon) */}
            <div className="absolute w-[180px] h-[180px] bg-black rounded-full border border-white/10 z-10 shadow-[0_0_100px_rgba(0,0,0,1)] flex items-center justify-center">
              {/* Inner core depth */}
              <div className="w-[172px] h-[172px] rounded-full bg-black shadow-[inset_0_0_30px_rgba(147,130,255,0.2)]" />
            </div>

            {/* 4. Side-View Accretion Disk (Passes directly in FRONT of the black hole, z-index 20) */}
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

            {/* Secondary wider horizontal gas veil */}
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

            {/* Gravitational Dust Particles orbiting along the lens plane */}
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
                    y: Math.sin((angle * Math.PI) / 180) * radius * 0.18, // flat projection for side view
                  }}
                />
              );
            })}
          </div>
        )}
        
        {/* Soft bottom mask fading into dark background */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#030014] to-transparent z-1" />
      </div>

      {/* ─── HERO CONTENT ─── */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 w-full text-center mt-6">
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
        <div className="text-center mb-8">
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

        {/* ─── LIVE COUNTDOWN DISPLAY (Site-wide Countdown) ─── */}
        {countdownDate && !isExpired && (
          <motion.div 
            className="mx-auto mb-12 max-w-xl rounded-2xl border border-white/5 bg-[#060317]/40 backdrop-blur-md p-5 shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#9382ff] to-transparent"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9382ff] mb-3">Portal Launch / Mega Event Countdown</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-[#030014]/50 py-2.5 px-2 hover:border-[#9382ff]/20 transition-all duration-300"
                >
                  <span className="font-heading text-xl font-bold text-white sm:text-2xl">
                    {String(item.value).padStart(2, "0")}
                  </span>
                  <span className="mt-0.5 text-[8px] font-medium uppercase tracking-wider text-gray-500">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Dual Paths Separation */}
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto mt-6">
          {/* PATH 1: Organizers */}
          <motion.div 
            className="flex flex-col justify-between rounded-[20px] border border-white/5 bg-[#060317]/70 backdrop-blur-md p-8 shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] relative overflow-hidden group hover:border-[#9382ff]/20 hover:bg-[#060317]/90 transition-all duration-300 animate-slide-left"
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
            className="flex flex-col justify-between rounded-[20px] border border-white/5 bg-[#060317]/70 backdrop-blur-md p-8 shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] relative overflow-hidden group hover:border-[#9382ff]/20 hover:bg-[#060317]/90 transition-all duration-300 animate-slide-right"
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
