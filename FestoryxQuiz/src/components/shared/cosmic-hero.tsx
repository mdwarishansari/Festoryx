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
    <section className="relative w-full min-h-[75vh] flex items-center justify-center lg:justify-start lg:px-[10%] overflow-hidden bg-[#05020a] py-16 px-4">
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
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#05020a] to-transparent z-1" />

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
