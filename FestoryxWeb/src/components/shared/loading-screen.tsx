"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function LoadingScreen() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show splash screen for at least 5 seconds
    const fadeTimeout = setTimeout(() => {
      setFadeOut(true);
    }, 4700); // Start fade-out slightly before 5s

    const removeTimeout = setTimeout(() => {
      setShow(false);
    }, 5200); // Fully remove from DOM after fade-out transition

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(removeTimeout);
    };
  }, []);

  useEffect(() => {
    if (show && !fadeOut) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [show, fadeOut]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={fadeOut ? { opacity: 0 } : { opacity: 1 }}
      transition={{
        duration: fadeOut ? 0.5 : 0.8,
        ease: "easeOut",
      }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-b from-[#040816] via-[#070b19] to-[#02040d]"
      style={{
        backgroundImage: `radial-gradient(circle at center, rgba(124, 58, 237, 0.15), transparent 70%), linear-gradient(to bottom, #040816, #070b19, #02040d)`,
      }}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Glow layers centered exactly at logo center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 blur-[220px] rounded-full pointer-events-none" />

        {/* Animated Logo Container with entrance and exit scale animations */}
        <motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={fadeOut ? { scale: 1.05, opacity: 0 } : { scale: 1, opacity: 1 }}
  transition={{
    duration: fadeOut ? 0.5 : 0.8,
    ease: "easeOut",
  }}
  className="
    relative
    w-[160px] h-[160px]
    md:w-[200px] md:h-[200px]
    lg:w-[260px] lg:h-[260px]
    rounded-full
    overflow-hidden
    border border-white/10
    bg-black/30
    backdrop-blur-sm
    shadow-2xl shadow-violet-500/20
  "
>
          <Link href="/" className="relative block w-full h-full">
            <Image
              src="/Logo.gif"
              alt="Festoryx Logo"
              fill
              priority
              unoptimized
              className="object-contain"
            />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
