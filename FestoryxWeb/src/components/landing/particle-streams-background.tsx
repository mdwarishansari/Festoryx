"use client";

import { useEffect, useRef } from "react";

export function ParticleStreamsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const streams: Array<{
      y: number;
      speed: number;
      length: number;
      width: number;
      color: string;
      progress: number;
    }> = [];

    // Initialize 8 horizontal streams
    const streamCount = 8;
    const colors = [
      "rgba(99, 102, 241, 0.15)",  // indigo
      "rgba(139, 92, 246, 0.12)",  // purple
      "rgba(236, 72, 153, 0.1)"    // pink
    ];

    for (let i = 0; i < streamCount; i++) {
      streams.push({
        y: Math.random() * height,
        speed: Math.random() * 0.8 + 0.3,
        length: Math.random() * 200 + 100,
        width: Math.random() * 1.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        progress: Math.random() * width,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 500;
    };

    window.addEventListener("resize", handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      streams.forEach((stream) => {
        stream.progress += stream.speed;
        if (stream.progress > width + stream.length) {
          stream.progress = -stream.length;
          stream.y = Math.random() * height;
        }

        // Draw horizontal stream as a faded line segment
        const grad = ctx.createLinearGradient(
          stream.progress,
          stream.y,
          stream.progress + stream.length,
          stream.y
        );
        grad.addColorStop(0, "rgba(0, 0, 0, 0)");
        grad.addColorStop(0.5, stream.color);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = stream.width;
        ctx.beginPath();
        ctx.moveTo(stream.progress, stream.y);
        ctx.lineTo(stream.progress + stream.length, stream.y);
        ctx.stroke();
      });

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
      className="absolute inset-0 pointer-events-none z-0 opacity-50"
    />
  );
}
