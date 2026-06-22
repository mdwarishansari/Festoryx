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
    <section className="relative w-full min-h-[90vh] flex items-center justify-center lg:justify-start lg:px-[10%] overflow-hidden bg-[#05020a] py-16 px-4">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes drift {
          0% { transform: translateY(0) translateX(0); }
          100% { transform: translateY(-500px) translateX(-500px); }
        }
        @keyframes pulse {
          0%, 100% { 
              transform: translate(-50%, -50%) scale(1); 
              box-shadow: 0 0 100px #6e07f0, 0 0 200px rgba(110, 7, 240, 0.4); 
          }
          50% { 
              transform: translate(-50%, -50%) scale(1.04); 
              box-shadow: 0 0 130px #a435f0, 0 0 240px rgba(164, 53, 240, 0.6); 
          }
        }
        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotateX(75deg) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotateX(75deg) rotate(360deg); }
        }
        @keyframes consume {
          0% { transform: translate(-50%, -50%) rotateX(75deg) rotate(0deg) scale(1); }
          50% { transform: translate(-50%, -50%) rotateX(75deg) rotate(180deg) scale(0.97); }
          100% { transform: translate(-50%, -50%) rotateX(75deg) rotate(360deg) scale(1); }
        }
        .space-dust {
            position: absolute;
            top: 0;
            left: 0;
            width: 200%;
            height: 200%;
            background-image: radial-gradient(#6e07f0, transparent 20%),
                              radial-gradient(#05020a, transparent 60%);
            background-size: 500px 500px;
            opacity: 0.25;
            animation: drift 60s linear infinite;
            z-index: 0;
        }
        .black-hole-graphic {
            position: absolute;
            right: -150px; 
            top: 50%;
            transform: translateY(-50%);
            width: 800px;
            height: 800px;
            perspective: 1000px;
            z-index: 1;
            pointer-events: none;
        }
        .accretion-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 650px;
            height: 650px;
            transform: translate(-50%, -50%) rotateX(75deg); 
            border-radius: 50%;
            border: 6px solid transparent;
            border-top-color: #a435f0;
            border-bottom-color: #6e07f0;
            animation: spin 16s linear infinite;
            box-shadow: 0 0 60px rgba(164, 53, 240, 0.5), inset 0 0 40px rgba(110, 7, 240, 0.5);
        }
        .event-horizon {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 280px;
            height: 280px;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, #05020a 40%, #150a2b 75%, #6e07f0 95%, transparent 100%);
            border-radius: 50%;
            box-shadow: 0 0 100px #6e07f0, 0 0 200px rgba(110, 7, 240, 0.4);
            animation: pulse 4s ease-in-out infinite;
        }
        .light-consumption {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 550px;
            height: 550px;
            transform: translate(-50%, -50%) rotateX(75deg);
            border-radius: 50%;
            background: conic-gradient(from 0deg, transparent 0%, rgba(164, 53, 240, 0.25) 25%, transparent 50%),
                        radial-gradient(ellipse at center, rgba(110, 7, 240, 0.2) 10%, transparent 60%);
            animation: consume 8s linear infinite;
        }
        @media (max-width: 1024px) {
            .black-hole-graphic {
                right: 50%;
                transform: translate(50%, -50%);
                top: 75%;
                width: 500px;
                height: 500px;
            }
            .accretion-ring {
                width: 400px;
                height: 400px;
            }
            .event-horizon {
                width: 180px;
                height: 180px;
            }
            .light-consumption {
                width: 340px;
                height: 340px;
            }
        }
      ` }} />

      {/* Space dust background */}
      <div className="space-dust" />

      {/* Black Hole graphic elements */}
      {mounted && (
        <div className="black-hole-graphic">
          <div className="accretion-ring" />
          <div className="event-horizon" />
          <div className="light-consumption" />
        </div>
      )}

      {/* Fading bottom mask */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#05020a] to-transparent z-1" />
      
      {/* ─── HERO CONTENT ─── */}
      <div className="relative z-10 mx-auto lg:mx-0 max-w-5xl px-4 w-full text-center lg:text-left mt-6">
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
        <div className="text-center lg:text-left mb-8">
          <motion.h1 
            className="font-heading text-5xl font-medium tracking-tight text-white sm:text-7xl md:text-8xl select-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            FESTORYX
          </motion.h1>
          <motion.p 
            className="mt-4 max-w-xl text-sm text-[#a8a6b7] sm:text-base leading-relaxed lg:mx-0 mx-auto"
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
            className="mb-12 max-w-xl rounded-2xl border border-white/5 bg-[#060317]/40 backdrop-blur-md p-5 shadow-2xl relative overflow-hidden lg:mx-0 mx-auto"
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
