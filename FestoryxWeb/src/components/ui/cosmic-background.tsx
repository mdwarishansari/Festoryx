"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function CosmicBackground() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const starsCount = 45;
    const generatedStars = Array.from({ length: starsCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.8 + 0.6,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 5,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#030014] pointer-events-none">
      {/* Void Ambient Radial Glow Layer A */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(147,130,255,0.08),transparent_65%)]" />

      {/* Void Ambient Radial Glow Layer B */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(79,70,229,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(125,98,255,0.04),transparent_55%)]" />

      {/* Code-based Star Field */}
      <div className="absolute inset-0 opacity-40">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              boxShadow: star.size > 1.2 ? "0 0 4px rgba(255, 255, 255, 0.8)" : "none",
            }}
            animate={{
              opacity: [0.1, 0.9, 0.1],
              scale: [0.9, 1.2, 0.9],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
