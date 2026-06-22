"use client";

import { useEffect, useRef } from "react";

export function DataGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const gridSize = 45;
    const pulses: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
    }> = [];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 500;
    };

    window.addEventListener("resize", handleResize);

    // Spawn pulse signal randomly
    const spawnPulse = () => {
      if (pulses.length > 10) return;
      const xGrid = Math.floor(Math.random() * (width / gridSize)) * gridSize;
      const yGrid = Math.floor(Math.random() * (height / gridSize)) * gridSize;
      
      const dir = Math.floor(Math.random() * 4);
      let vx = 0, vy = 0;
      if (dir === 0) vx = 1.5;
      else if (dir === 1) vx = -1.5;
      else if (dir === 2) vy = 1.5;
      else vy = -1.5;

      pulses.push({
        x: xGrid,
        y: yGrid,
        vx,
        vy,
        life: 0,
        maxLife: Math.random() * 80 + 40,
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw Grid Lines
      ctx.strokeStyle = "rgba(147, 130, 255, 0.03)";
      ctx.lineWidth = 0.5;

      // Vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Randomly spawn pulses
      if (Math.random() < 0.05) {
        spawnPulse();
      }

      // Draw and update energy pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (p.life > p.maxLife || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          pulses.splice(i, 1);
          continue;
        }

        // Draw pulse as a small bright glow dot
        const opacity = (1 - p.life / p.maxLife) * 0.4;
        ctx.fillStyle = `rgba(168, 85, 247, ${opacity})`;
        ctx.shadowColor = "rgba(147, 130, 255, 0.8)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-40"
    />
  );
}
