"use client";

import { useState, useTransition } from "react";
import { submitOrgQuery } from "@/actions/org-query.actions";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

interface OrgQueryFormProps {
  orgSlug: string;
}

export function OrgQueryForm({ orgSlug }: OrgQueryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    startTransition(async () => {
      const res = await submitOrgQuery(orgSlug, formData);
      if (res.success) {
        toast.success("Your message has been sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(res.error || "Failed to send message.");
      }
    });
  };

  return (
    <div className="bg-[#060317]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
      <div>
        <h3 className="font-heading text-lg font-bold text-white">Contact & Support</h3>
        <p className="text-xs text-gray-400 mt-1">Have any queries regarding upcoming events or registrations? Ask the organizers directly.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">Your Name *</label>
            <input
              type="text"
              required
              disabled={isPending}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#030014] border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#9382ff]"
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">Email Address *</label>
            <input
              type="email"
              required
              disabled={isPending}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-[#030014] border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#9382ff]"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">Subject *</label>
          <input
            type="text"
            required
            disabled={isPending}
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-3 py-2 bg-[#030014] border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#9382ff]"
            placeholder="How can we help you?"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">Message *</label>
          <textarea
            required
            rows={4}
            disabled={isPending}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-3 py-2 bg-[#030014] border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#9382ff] resize-none"
            placeholder="Type your query/message detail here..."
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 transition-all font-semibold rounded-lg text-xs text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Sending Inquiry...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Send Query</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
