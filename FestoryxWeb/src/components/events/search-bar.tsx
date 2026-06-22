"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({ placeholder = "Search events by name, tagline, or details..." }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }
      params.set("page", "1"); // Reset to page 1
      router.push(`/events?${params.toString()}`);
    });
  };

  return (
    <motion.form
      onSubmit={handleSearch}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative flex items-center w-full max-w-2xl mx-auto"
    >
      <div className="relative w-full group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#9382ff] transition-colors duration-200">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-28 py-3.5 bg-[#060317]/60 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#9382ff]/50 focus:ring-1 focus:ring-[#9382ff]/50 backdrop-blur-md shadow-[inset_0_0_12px_rgba(255,255,255,0.02)] transition-all duration-300 hover:border-white/20"
        />
        <button
          type="submit"
          disabled={isPending}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50"
        >
          {isPending ? (
            <span className="h-3 w-3 animate-spin border-2 border-white border-t-transparent rounded-full" />
          ) : null}
          Search
        </button>
      </div>
    </motion.form>
  );
}
