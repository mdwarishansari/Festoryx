"use client";

import { motion } from "framer-motion";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface Org {
  name: string;
  slug: string;
}

interface FilterPanelProps {
  activeOrgs: Org[];
}

export function FilterPanel({ activeOrgs }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentOrg = searchParams.get("org") || "ALL";
  const currentFormat = searchParams.get("format") || "ALL";
  const currentType = searchParams.get("type") || "ALL";
  const currentDate = searchParams.get("date") || "UPCOMING";

  const handleFilterChange = (name: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "ALL" && name !== "date") {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      params.set("page", "1"); // Reset to page 1
      router.push(`/events?${params.toString()}`);
    });
  };

  const handleReset = () => {
    startTransition(() => {
      const params = new URLSearchParams();
      // Keep only simple search or deep search query if present
      const q = searchParams.get("q");
      const advQ = searchParams.get("adv_q");
      if (q) params.set("q", q);
      if (advQ) params.set("adv_q", advQ);
      router.push(`/events?${params.toString()}`);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      className="w-full bg-[#060317]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-md shadow-[inset_0_0_12px_rgba(255,255,255,0.02)] space-y-4"
    >
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-white">
          <SlidersHorizontal className="h-4 w-4 text-[#9382ff]" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Refine Competitions</h2>
        </div>
        <button
          onClick={handleReset}
          disabled={isPending}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
        >
          <RotateCcw className="h-3 w-3" />
          Reset Filters
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {/* Organization Filter */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Host Organization</label>
          <select
            value={currentOrg}
            onChange={(e) => handleFilterChange("org", e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 bg-[#030014] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#9382ff]/50 focus:ring-1 focus:ring-[#9382ff]/50 transition-all duration-200"
          >
            <option value="ALL">All Hosts</option>
            {activeOrgs.map((org) => (
              <option key={org.slug} value={org.slug}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        {/* Format Filter */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Event Format</label>
          <select
            value={currentFormat}
            onChange={(e) => handleFilterChange("format", e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 bg-[#030014] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#9382ff]/50 focus:ring-1 focus:ring-[#9382ff]/50 transition-all duration-200"
          >
            <option value="ALL">All Formats</option>
            <option value="Offline">Offline</option>
            <option value="Online">Online</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        {/* Participation Type Filter */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Participation</label>
          <select
            value={currentType}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 bg-[#030014] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#9382ff]/50 focus:ring-1 focus:ring-[#9382ff]/50 transition-all duration-200"
          >
            <option value="ALL">All Formats</option>
            <option value="SOLO">Solo Only</option>
            <option value="TEAM">Team Only</option>
            <option value="BOTH">Solo & Team</option>
          </select>
        </div>

        {/* Date / Status Filter */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Timeline</label>
          <select
            value={currentDate}
            onChange={(e) => handleFilterChange("date", e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 bg-[#030014] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#9382ff]/50 focus:ring-1 focus:ring-[#9382ff]/50 transition-all duration-200"
          >
            <option value="ALL">All Dates</option>
            <option value="UPCOMING">Upcoming Only</option>
            <option value="PAST">Past Events</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}
