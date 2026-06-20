"use client";

import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Shield, Zap } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 overflow-hidden bg-[#030014] lg:grid-cols-12 relative font-sans text-white">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      {/* Left Pane: Branding Info */}
      <div className="relative hidden flex-col justify-between p-12 bg-black/40 border-r border-white/5 lg:col-span-5 lg:flex">
        {/* Glowing grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex items-center gap-2 group cursor-pointer"
        >
          <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/20 transition-all duration-200 group-hover:border-indigo-400">
            <img src="/Logo.gif" alt="Festoryx Logo" className="h-full w-full object-cover" />
          </div>
          <span className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            Festoryx
          </span>
        </motion.div>

        <div className="relative z-10 my-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-2"
          >
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Launch Your <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                Organizer Persona
              </span>
            </h1>
            <p className="text-sm text-gray-400 max-w-md">
              Create events, build custom registration forms, track payments with verification pipelines, and host live Quiz games.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-4 pt-4 border-t border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                <Trophy className="h-4 w-4" />
              </div>
              <span className="text-xs text-gray-300 font-medium">Verify credentials & claim event prizes</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-xs text-gray-300 font-medium">Join real-time interactive Quiz Sessions</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-xs text-gray-300 font-medium">Full permission boundaries & secure UPI verification</span>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 text-[10px] uppercase tracking-wider text-gray-500 font-semibold"
        >
          © {new Date().getFullYear()} Festoryx. All rights reserved.
        </motion.p>
      </div>

      {/* Right Pane: Sign-Up Form Container */}
      <div className="flex items-center justify-center p-6 lg:col-span-7 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="w-full max-w-md flex flex-col items-center justify-center"
        >
          {/* Logo on mobile only */}
          <div className="lg:hidden flex flex-col items-center gap-2 mb-8">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/20">
              <img src="/Logo.gif" alt="Festoryx Logo" className="h-full w-full object-cover" />
            </div>
            <span className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
              Festoryx
            </span>
          </div>

          <SignUp
            routing="path"
            path="/sign-up"
            appearance={{
              variables: {
                colorPrimary: "#6366f1",
                colorBackground: "#060317",
                colorInputBackground: "#030014",
                colorInputText: "#f4f0ff",
                colorText: "#f4f0ff",
                colorTextSecondary: "#a8a6b7",
                borderRadius: "12px",
              },
              elements: {
                card: "border border-white/10 shadow-2xl bg-[#060317]/90 backdrop-blur-xl shadow-indigo-500/5 max-w-full",
                formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 transition-all font-semibold py-2.5",
                footerActionLink: "text-indigo-400 hover:text-indigo-300",
                dividerLine: "bg-white/10",
                dividerText: "text-gray-500 text-xs uppercase font-semibold",
                formFieldLabel: "text-xs font-semibold text-gray-300",
                formFieldInput: "border-white/10 focus:border-indigo-500 text-white placeholder-gray-600",
                headerTitle: "text-white text-xl font-bold font-heading",
                headerSubtitle: "text-gray-400 text-xs",
                socialButtonsBlockButton: "border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all",
                socialButtonsBlockButtonText: "text-white",
              }
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
