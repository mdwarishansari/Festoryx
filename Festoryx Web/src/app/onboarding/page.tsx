"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "@/actions/organization.actions";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "club",
    email: "",
    phone: "",
    state: "",
    city: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.description) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await createOrganization(formData);
      toast.success("Organization created successfully! Pending verification.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-[#f4f0ff] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl bg-[#060317] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <h1 className="text-3xl font-bold mb-2 tracking-wide text-center bg-gradient-to-r from-[#f4f0ff] to-[#9382ff] bg-clip-text text-transparent">Welcome to Festoryx!</h1>
        <p className="text-sm text-[#94a3b8] mb-8 text-center">To get started, please set up your organizer profile and create your organization.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#c7d2fe] mb-1">Organization Name *</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-[#0a061e] border border-white/10 rounded-lg focus:outline-none focus:border-[#9382ff] text-white"
              placeholder="e.g. Computer Science Club, Alpha Tech"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#c7d2fe] mb-1">Organization Type *</label>
              <select
                className="w-full px-4 py-2.5 bg-[#0a061e] border border-white/10 rounded-lg focus:outline-none focus:border-[#9382ff] text-white"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="college">College / University</option>
                <option value="club">Student Club / Community</option>
                <option value="company">Company</option>
                <option value="community">Independent Community</option>
                <option value="startup">Startup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#c7d2fe] mb-1">Contact Email *</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 bg-[#0a061e] border border-white/10 rounded-lg focus:outline-none focus:border-[#9382ff] text-white"
                placeholder="org@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#c7d2fe] mb-1">Phone *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-[#0a061e] border border-white/10 rounded-lg focus:outline-none focus:border-[#9382ff] text-white"
                placeholder="+91..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#c7d2fe] mb-1">City *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-[#0a061e] border border-white/10 rounded-lg focus:outline-none focus:border-[#9382ff] text-white"
                placeholder="e.g. Bangalore"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#c7d2fe] mb-1">State *</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-[#0a061e] border border-white/10 rounded-lg focus:outline-none focus:border-[#9382ff] text-white"
                placeholder="e.g. Karnataka"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#c7d2fe] mb-1">Description *</label>
            <textarea
              required
              rows={3}
              className="w-full px-4 py-2.5 bg-[#0a061e] border border-white/10 rounded-lg focus:outline-none focus:border-[#9382ff] text-white resize-none"
              placeholder="Tell us about your organization..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#9382ff] hover:bg-[#816eff] transition-colors rounded-lg font-medium text-white shadow-[0_0_15px_rgba(147,130,255,0.4)] disabled:opacity-50"
          >
            {loading ? "Creating Organization..." : "Create Organization & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
