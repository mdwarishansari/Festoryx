"use client";

import { motion } from "framer-motion";
import { HelpCircle, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function DeepSearchPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [advQuery, setAdvQuery] = useState(searchParams.get("adv_q") || "");
  const [isPending, startTransition] = useTransition();

  const handleDeepSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (advQuery.trim()) {
        params.set("adv_q", advQuery.trim());
      } else {
        params.delete("adv_q");
      }
      params.set("page", "1"); // Reset to page 1
      router.push(`/events?${params.toString()}`);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      className="w-full bg-gradient-to-r from-[#110e2e]/60 to-[#0b0720]/60 border border-indigo-500/20 p-6 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(99,102,241,0.05)] relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-500/5 to-purple-500/0 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
        <h3 className="text-sm font-semibold text-indigo-200">Deep Text AI Indexer</h3>
        <div className="group relative ml-1">
          <HelpCircle className="h-3.5 w-3.5 text-gray-500 cursor-pointer hover:text-gray-300 transition-colors" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 border border-white/10 rounded-lg text-[10px] text-gray-300 z-50 text-center leading-normal shadow-xl">
            Deep search indexes the full text of event descriptions, eligibility criteria, official rules, and prize info.
          </div>
        </div>
      </div>

      <form onSubmit={handleDeepSearch} className="flex gap-2 max-w-xl">
        <input
          type="text"
          value={advQuery}
          onChange={(e) => setAdvQuery(e.target.value)}
          placeholder="E.g., cash prizes, eligibility criteria, specific rules..."
          className="flex-grow px-3 py-2 bg-[#030014] border border-indigo-500/30 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all duration-200"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50"
        >
          {isPending ? "Indexing..." : "Deep Query"}
        </button>
      </form>
    </motion.div>
  );
}
