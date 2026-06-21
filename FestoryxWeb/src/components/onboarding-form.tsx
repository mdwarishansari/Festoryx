"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "@/actions/organization.actions";
import { toast } from "sonner";
import { Upload, Loader2, Link2, Instagram, Linkedin, Youtube, MessageCircle, Building2 } from "lucide-react";
import { getOrgTypeEmoji } from "@/lib/utils";

export function OnboardingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    type: "club",
    email: "",
    phone: "",
    state: "",
    city: "",
    description: "",
    logoUrl: "",
    logoPublicId: "",
    websiteUrl: "",
    socialLinks: {
      instagram: "",
      linkedin: "",
      youtube: "",
      whatsapp: "",
    },
  });

  const dynamicLabel = formData.type === "company" || formData.type === "startup" 
    ? "Company Name *" 
    : formData.type === "college" || formData.type === "university"
    ? "Institution Name *"
    : "Organization Name *";

  const dynamicPlaceholder = formData.type === "company" || formData.type === "startup"
    ? "e.g. Acme Corporation, TechStart Inc."
    : formData.type === "college" || formData.type === "university"
    ? "e.g. Harvard University, MIT"
    : "e.g. Computer Science Club, Alpha Tech";

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }

    setLogoUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", `festoryx/logos/${formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
    
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        logoUrl: data.url,
        logoPublicId: data.publicId || "",
      }));
      toast.success("Logo uploaded successfully!");
    } catch {
      toast.error("Failed to upload logo.");
    } finally {
      setLogoUploading(false);
      e.target.value = "";
    }
  };

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
      router.push("/verification-pending");
    } catch (error: any) {
      toast.error(error.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-[#060317] border border-white/5 rounded-[16px] p-8 shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#e59cff] via-[#ba9cff] to-[#9cb2ff]"></div>
      
      <h1 className="font-heading text-3xl font-medium mb-2 tracking-tight text-center text-[#f4f0ff]">
        Welcome to Festoryx
      </h1>
      <p className="text-sm text-[#a8a6b7] mb-8 text-center">
        To get started, please set up your organizer profile and create your organization.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Type */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#a8a6b7] mb-1.5">
              {dynamicLabel}
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-[#030014] border border-white/10 rounded-[5px] focus:outline-none focus:border-[#9382ff] text-[#f4f0ff] placeholder-[#54525f] text-sm"
              placeholder={dynamicPlaceholder}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#a8a6b7] mb-1.5">
              Organization Type *
            </label>
            <select
              className="w-full px-4 py-2.5 bg-[#030014] border border-white/10 rounded-[5px] focus:outline-none focus:border-[#9382ff] text-[#f4f0ff] text-sm"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="college">College</option>
              <option value="university">University</option>
              <option value="company">Company</option>
              <option value="startup">Startup</option>
              <option value="community">Community</option>
              <option value="club">Club</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Contact details */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#a8a6b7] mb-1.5">
              Contact Email *
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2.5 bg-[#030014] border border-white/10 rounded-[5px] focus:outline-none focus:border-[#9382ff] text-[#f4f0ff] placeholder-[#54525f] text-sm"
              placeholder="org@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#a8a6b7] mb-1.5">
              Phone Number *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-[#030014] border border-white/10 rounded-[5px] focus:outline-none focus:border-[#9382ff] text-[#f4f0ff] placeholder-[#54525f] text-sm"
              placeholder="+91..."
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        {/* Locale details */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#a8a6b7] mb-1.5">
              City *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-[#030014] border border-white/10 rounded-[5px] focus:outline-none focus:border-[#9382ff] text-[#f4f0ff] placeholder-[#54525f] text-sm"
              placeholder="e.g. Bangalore"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#a8a6b7] mb-1.5">
              State *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-[#030014] border border-white/10 rounded-[5px] focus:outline-none focus:border-[#9382ff] text-[#f4f0ff] placeholder-[#54525f] text-sm"
              placeholder="e.g. Karnataka"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[#a8a6b7] mb-1.5">
            Description *
          </label>
          <textarea
            required
            rows={3}
            className="w-full px-4 py-2.5 bg-[#030014] border border-white/10 rounded-[5px] focus:outline-none focus:border-[#9382ff] text-[#f4f0ff] placeholder-[#54525f] text-sm resize-none"
            placeholder="Tell us about your organization..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Logo and Website */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-[#a8a6b7] mb-1.5">
              Website URL <span className="text-[10px] text-gray-500 font-normal">(Optional External Link)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Link2 className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#030014] border border-white/10 rounded-[5px] focus:outline-none focus:border-[#9382ff] text-[#f4f0ff] placeholder-[#54525f] text-sm"
                  placeholder="https://myorg.com"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#a8a6b7] mb-1.5">
              Logo Profile
            </label>
            <div className="flex items-center gap-3">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Logo Preview"
                  className="h-10 w-10 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full border border-dashed border-white/10 flex items-center justify-center bg-[#030014] text-lg">
                  {getOrgTypeEmoji(formData.type)}
                </div>
              )}
              <label className="flex h-10 cursor-pointer items-center gap-2 justify-center rounded-[5px] border border-white/10 bg-white/5 px-4 text-xs font-semibold text-white hover:bg-white/10 transition-all">
                {logoUploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                <span>Upload Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={logoUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h3 className="text-sm font-semibold text-[#f4f0ff]">Social Networks Links</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="relative">
                <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#030014] border border-white/10 rounded-[5px] focus:outline-none focus:border-[#9382ff] text-[#f4f0ff] placeholder-[#54525f] text-xs"
                  placeholder="Instagram Profile URL"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                  })}
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#030014] border border-white/10 rounded-[5px] focus:outline-none focus:border-[#9382ff] text-[#f4f0ff] placeholder-[#54525f] text-xs"
                  placeholder="LinkedIn Profile URL"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                  })}
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Youtube className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#030014] border border-white/10 rounded-[5px] focus:outline-none focus:border-[#9382ff] text-[#f4f0ff] placeholder-[#54525f] text-xs"
                  placeholder="YouTube Channel URL"
                  value={formData.socialLinks.youtube}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                  })}
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#030014] border border-white/10 rounded-[5px] focus:outline-none focus:border-[#9382ff] text-[#f4f0ff] placeholder-[#54525f] text-xs"
                  placeholder="WhatsApp Contact Number"
                  value={formData.socialLinks.whatsapp}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, whatsapp: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || logoUploading}
          className="w-full py-3 bg-[#9382ff] hover:bg-[#816eff] transition-all rounded-[5px] font-semibold text-white shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)] disabled:opacity-50 text-sm flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{loading ? "Creating Organization..." : "Create Organization & Continue"}</span>
        </button>
      </form>
    </div>
  );
}
