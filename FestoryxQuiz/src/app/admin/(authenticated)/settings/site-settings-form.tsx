"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateSiteSettingsAction } from "@/actions/settings.actions";
import { Save, Sparkles, Image, Mail, Phone, MapPin, AlignLeft } from "lucide-react";

interface SiteSettingsFormProps {
  initialSettings: {
    siteName?: string;
    logoUrl?: string;
    headerLogoUrl?: string;
    footerLogoUrl?: string;
    footerText?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
  };
}

export default function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
  const [siteName, setSiteName] = useState(initialSettings.siteName || "");
  const [logoUrl, setLogoUrl] = useState(initialSettings.logoUrl || "");
  const [footerText, setFooterText] = useState(initialSettings.footerText || "");
  const [contactEmail, setContactEmail] = useState(initialSettings.contactEmail || "");
  const [contactPhone, setContactPhone] = useState(initialSettings.contactPhone || "");
  const [contactAddress, setContactAddress] = useState(initialSettings.contactAddress || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const res = await updateSiteSettingsAction({
      siteName,
      logoUrl,
      footerText,
      contactEmail,
      contactPhone,
      contactAddress,
    });

    setIsSaving(false);

    if (res.success) {
      toast.success("Site branding configurations updated successfully.");
      window.location.reload();
    } else {
      toast.error(res.error || "Failed to update site settings.");
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 font-heading">
        <Sparkles className="h-5 w-5 text-indigo-400" />
        Branding & Site Configuration
      </h3>
      <p className="text-xs text-gray-400 leading-relaxed">
        Configure the platform-level branding, logos, contact information, and public footer values.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Site Name
          </label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Festoryx"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block flex items-center gap-1.5">
            <Image className="h-3.5 w-3.5" /> Quiz Logo URL
          </label>
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="e.g. /Logo.gif or https://cdn.com/logo.png"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Contact Email
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="contact@festoryx.tech"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> Contact Phone
          </label>
          <input
            type="text"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Contact Address
          </label>
          <input
            type="text"
            value={contactAddress}
            onChange={(e) => setContactAddress(e.target.value)}
            placeholder="University Campus"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block flex items-center gap-1.5">
            <AlignLeft className="h-3.5 w-3.5" /> Footer Text
          </label>
          <textarea
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            rows={2}
            placeholder="© 2026 Festoryx. All rights reserved."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Branding"}
        </button>
      </form>
    </div>
  );
}
