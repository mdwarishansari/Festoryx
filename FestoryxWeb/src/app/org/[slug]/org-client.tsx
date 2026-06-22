"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  Trophy,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  MapPin,
  Share2,
  QrCode,
  Download,
  Flame,
  ArrowRight,
  Clock,
  Building,
  Check,
  Copy,
  Image as ImageIcon,
  UserCheck,
  CreditCard,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { getOrgTypeEmoji } from "@/lib/utils";

interface OrgClientProps {
  org: any;
  events: any[];
  showQuiz: boolean;
  orgUrl: string;
  qrCodeUrl: string;
  queryForm: React.ReactNode;
  quizArenaUrl: string;
}

export function OrgClient({
  org,
  events,
  showQuiz,
  orgUrl,
  qrCodeUrl,
  queryForm,
  quizArenaUrl
}: OrgClientProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Helper to ensure external links are not treated as relative paths
  const normalizeExternalUrl = (url?: string | null): string => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed === "") return "";
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  // Find next upcoming event for the countdown
  const now = new Date();
  const upcomingEvents = events
    .filter((e) => e.eventDate && new Date(e.eventDate) > now)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  const nextEvent = upcomingEvents[0];

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!nextEvent?.eventDate) return;

    const eventTime = new Date(nextEvent.eventDate).getTime();

    const updateTimer = () => {
      const difference = eventTime - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextEvent]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: org.name,
          text: `Check out ${org.name} on Festoryx!`,
          url: orgUrl,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        console.warn("Share cancelled or failed", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(orgUrl);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error("Failed to copy link.");
      }
    }
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${org.slug}-qr-code.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success("QR Code downloaded!");
    } catch {
      toast.error("Failed to download QR code.");
    }
  };

  const socials = org.socialLinks || {};
  const settingsSocials = org.settings?.socialLinks || {};

  // Combine socials from organization profile and organization settings
  const mergedSocials = {
    instagram: normalizeExternalUrl(socials.instagram || settingsSocials.instagram),
    linkedin: normalizeExternalUrl(socials.linkedin || settingsSocials.linkedin),
    youtube: normalizeExternalUrl(socials.youtube || settingsSocials.youtube),
    whatsapp: socials.whatsapp || settingsSocials.whatsapp || "",
    github: normalizeExternalUrl(socials.github || settingsSocials.github),
    twitter: normalizeExternalUrl(socials.twitter || settingsSocials.twitter),
  };

  // Determine active tabs and hide empty ones automatically
  const hasWinners = events.some((e) => e.winner1Id || e.winner2Id || e.winner3Id);
  const hasEvents = events.length > 0;
  const hasCountdown = !!nextEvent && !!timeLeft;
  const hasLinks = !!org.websiteUrl || Object.values(mergedSocials).some(Boolean);

  const tabs = [
    { id: "overview", label: "Overview", icon: Building },
    { id: "events", label: "Events", icon: Calendar, hidden: !hasEvents },
    { id: "winners", label: "Winners", icon: Trophy, hidden: !hasWinners },
    { id: "links", label: "Links", icon: Globe, hidden: !hasLinks },
    { id: "quiz", label: "Quiz Arena", icon: Flame, hidden: !showQuiz },
    { id: "contact", label: "Contact", icon: Mail },
  ];

  const visibleTabs = tabs.filter((t) => !t.hidden);

  return (
    <div className="space-y-12">
      {/* ─── PREMIUM PROFILE HERO HEADER ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-[#0c0828]/75 via-[#08041c]/90 to-[#030014] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-[0_0_50px_rgba(147,130,255,0.08)] flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-[#9382ff] to-pink-500"></div>
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full md:w-auto">
          {/* Logo container */}
          <div className="w-24 h-24 md:w-32 md:h-32 bg-[#050212] border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg relative group">
            {org.logoUrl ? (
              <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <span className="text-4xl text-[#9382ff] select-none">{getOrgTypeEmoji(org.type)}</span>
            )}
          </div>

          {/* Org details metadata */}
          <div className="text-center md:text-left space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-full mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              {org.type}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-heading">{org.name}</h1>
            <p className="text-xs text-gray-400 flex items-center justify-center md:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{org.city}, {org.state}</span>
            </p>
          </div>
        </div>

        {/* Share System Center (Inline QR code & download on right side) */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl md:self-stretch justify-center w-full md:w-auto">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="bg-white p-1.5 rounded-lg border border-white/10 cursor-pointer hover:scale-105 transition-transform" onClick={() => setShowQrModal(true)}>
              <img src={qrCodeUrl} alt="QR Link" className="w-20 h-20 object-contain" />
            </div>
            <button
              onClick={handleDownloadQR}
              className="text-[10px] font-semibold text-indigo-300 hover:text-white transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Download QR</span>
            </button>
          </div>

          <div className="w-[1px] self-stretch bg-white/10 mx-2" />

          <div className="flex flex-col gap-2">
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 h-10 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Link" : "Share Page"}</span>
            </button>
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center justify-center gap-2 h-10 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-xs font-semibold text-white transition-all"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Zoom QR</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ─── DYNAMIC TABBED NAVIGATION ─── */}
      <div className="border-b border-white/10 flex overflow-x-auto gap-6 text-sm font-semibold scrollbar-none pb-px">
        {visibleTabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 flex items-center gap-2 relative transition-all duration-200 border-b-2 hover:text-white cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "border-[#9382ff] text-white"
                  : "border-transparent text-gray-400"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isSelected ? "text-[#9382ff]" : "text-gray-500"}`} />
              <span>{tab.label}</span>
              {isSelected && (
                <motion.div
                  layoutId="activeOrgTabUnderline"
                  className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ─── TAB CONTENT PANELS ─── */}
      <div className="min-h-[350px]">
        <AnimatePresence mode="wait">
          {/* PANEL 1: OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div
              key="overview-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {nextEvent && timeLeft && (
                <div className="relative rounded-3xl border border-indigo-500/20 bg-indigo-950/10 backdrop-blur-md p-6 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center gap-4 text-left">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/25 text-indigo-400 shrink-0">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Next Challenge Starts In</p>
                      <h4 className="text-white font-extrabold text-lg mt-0.5 max-w-md">{nextEvent.name}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">Scheduled: {nextEvent.eventDate ? new Date(nextEvent.eventDate).toLocaleString("en-IN", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : "TBD"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { val: timeLeft.days, label: "Days" },
                        { val: timeLeft.hours, label: "Hours" },
                        { val: timeLeft.minutes, label: "Min" },
                        { val: timeLeft.seconds, label: "Sec" }
                      ].map((unit, i) => (
                        <div key={i} className="flex flex-col items-center justify-center w-12 h-12 rounded-xl border border-white/5 bg-[#030014]/50 shadow-inner">
                          <span className="text-sm font-extrabold font-mono text-white leading-none">{String(unit.val).padStart(2, "0")}</span>
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest mt-1 font-bold">{unit.label}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      href={`/org/${org.slug}/events/${nextEvent.slug}`}
                      className="flex h-12 px-5 items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all"
                    >
                      <span>Register</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              <div className="grid gap-8 md:grid-cols-12">
                <div className="md:col-span-8 space-y-6">
                  <div className="bg-[#0b071e]/40 border border-white/5 rounded-3xl p-8 space-y-4">
                    <h3 className="text-lg font-bold text-white font-heading">About Our Organization</h3>
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      {org.description || "Welcome to our profile page. Discover our events, live challenges, and winner lists."}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-4 space-y-6">
                  <div className="bg-[#0b071e]/40 border border-white/5 rounded-3xl p-6 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 border-b border-white/5 pb-2">Quick Stats</h4>
                    <div className="space-y-3.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Events</span>
                        <span className="text-white font-bold">{events.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Status</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4" /> Active Verified
                        </span>
                      </div>
                      {org.settings?.paymentUpiId && (
                        <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-3">
                          <span className="text-gray-400">Payment UPI ID</span>
                          <span className="text-white font-mono text-xs">{org.settings.paymentUpiId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PANEL 2: EVENTS */}
          {activeTab === "events" && (
            <motion.div
              key="events-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {events.map((event) => {
                  const fee = event.registrationFee ? Number(event.registrationFee) : 0;
                  return (
                    <motion.div
                      key={event.id}
                      whileHover={{ y: -4 }}
                      className="flex flex-col bg-[#0b071e]/40 border border-white/10 rounded-2xl overflow-hidden hover:border-[#9382ff]/50 hover:shadow-[0_0_20px_rgba(147,130,255,0.15)] transition-all duration-300 h-full"
                    >
                      <div className="h-44 bg-[#0a061e] border-b border-white/5 overflow-hidden relative shrink-0">
                        {event.bannerUrl ? (
                          <img src={event.bannerUrl} alt={event.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30 select-none">🏆</div>
                        )}
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-white">
                          {fee === 0 ? "FREE" : event.feePerParticipant ? `₹${fee} / Member` : `₹${fee}`}
                        </div>
                      </div>

                      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-bold text-white text-base leading-tight truncate">{event.name}</h3>
                          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{event.shortDescription || "No description provided."}</p>
                        </div>
                        <div className="text-[11px] text-[#9382ff] font-semibold pt-3 flex items-center justify-between border-t border-white/5 mt-auto">
                          <span>📅 {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "TBD"}</span>
                          <Link href={`/org/${org.slug}/events/${event.slug}`} className="hover:underline flex items-center gap-1">
                            <span>Details & Join</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* PANEL 3: WINNERS */}
          {activeTab === "winners" && (
            <motion.div
              key="winners-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 sm:grid-cols-2"
            >
              {events
                .filter((e) => e.winner1Id || e.winner2Id || e.winner3Id)
                .map((event) => (
                  <div key={event.id} className="bg-[#0b071e]/50 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl" />
                    <h3 className="font-bold text-white text-base border-b border-white/5 pb-2 font-heading">{event.name}</h3>
                    <div className="space-y-3">
                      {event.winner1 && (
                        <div className="flex items-center justify-between text-xs bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                          <span className="font-bold text-amber-400 flex items-center gap-1">🥇 1st Place</span>
                          <span className="font-semibold text-white">{event.winner1.participantName}</span>
                        </div>
                      )}
                      {event.winner2 && (
                        <div className="flex items-center justify-between text-xs bg-slate-400/10 border border-slate-400/20 rounded-xl p-3">
                          <span className="font-bold text-slate-300 flex items-center gap-1">🥈 2nd Place</span>
                          <span className="font-semibold text-white">{event.winner2.participantName}</span>
                        </div>
                      )}
                      {event.winner3 && (
                        <div className="flex items-center justify-between text-xs bg-amber-700/10 border border-amber-700/20 rounded-xl p-3">
                          <span className="font-bold text-amber-600 flex items-center gap-1">🥉 3rd Place</span>
                          <span className="font-semibold text-white">{event.winner3.participantName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </motion.div>
          )}



          {/* PANEL 6: LINKS */}
          {activeTab === "links" && (
            <motion.div
              key="links-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="max-w-xl mx-auto w-full"
            >
              <div className="bg-[#0b071e]/40 border border-white/5 rounded-3xl p-8 space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2 font-heading">Websites & Networks</h3>
                
                <div className="space-y-4">
                  {org.websiteUrl && (
                    <a
                      href={normalizeExternalUrl(org.websiteUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 hover:border-indigo-500/35 transition-all text-sm group"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-indigo-400" />
                        <span className="font-semibold text-white">Official Website</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                    </a>
                  )}

                  {mergedSocials.instagram && (
                    <a
                      href={mergedSocials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 hover:border-[#e1306c]/30 transition-all text-sm group"
                    >
                      <div className="flex items-center gap-3">
                        <Instagram className="w-5 h-5 text-[#e1306c]" />
                        <span className="font-semibold text-white">Instagram Profile</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                    </a>
                  )}

                  {mergedSocials.linkedin && (
                    <a
                      href={mergedSocials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 hover:border-[#0a66c2]/30 transition-all text-sm group"
                    >
                      <div className="flex items-center gap-3">
                        <Linkedin className="w-5 h-5 text-[#0a66c2]" />
                        <span className="font-semibold text-white">LinkedIn Page</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                    </a>
                  )}

                  {mergedSocials.youtube && (
                    <a
                      href={mergedSocials.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 hover:border-[#ff0000]/30 transition-all text-sm group"
                    >
                      <div className="flex items-center gap-3">
                        <Youtube className="w-5 h-5 text-[#ff0000]" />
                        <span className="font-semibold text-white">YouTube Channel</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                    </a>
                  )}

                  {mergedSocials.twitter && (
                    <a
                      href={mergedSocials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 hover:border-[#1da1f2]/30 transition-all text-sm group"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-[#1da1f2]" />
                        <span className="font-semibold text-white">X / Twitter</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                    </a>
                  )}

                  {mergedSocials.github && (
                    <a
                      href={mergedSocials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 hover:border-gray-400/30 transition-all text-sm group"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-300" />
                        <span className="font-semibold text-white">GitHub Org / Repo</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                    </a>
                  )}

                  {mergedSocials.whatsapp && (
                    <a
                      href={`https://wa.me/${mergedSocials.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 hover:border-[#25d366]/30 transition-all text-sm group"
                    >
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-[#25d366]" />
                        <span className="font-semibold text-white">WhatsApp Contact</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* PANEL 7: QUIZ ARENA */}
          {activeTab === "quiz" && (
            <motion.div
              key="quiz-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto w-full"
            >
              <div className="bg-[#0f0b29]/80 border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl space-y-6 text-center">
                <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/35 flex items-center justify-center text-indigo-400 mx-auto">
                  <Flame className="w-8 h-8 text-[#9382ff]" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading text-2xl font-bold text-white">Festoryx Quiz Arena</h3>
                  <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                    Test your knowledge, compete in real-time, and climb the leaderboard in our multiplayer live Quiz room.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-col items-center justify-center gap-3">
                  <a
                    href={`${quizArenaUrl}/join`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 px-8 items-center gap-2 justify-center rounded-xl bg-[#9382ff] hover:bg-[#816eff] text-white font-bold text-sm shadow-lg shadow-indigo-600/25 w-full sm:w-auto transition-transform active:scale-95"
                  >
                    <span>Enter Quiz Arena Lobby</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <p className="text-[10px] text-gray-500">Redirects to our hosted Quiz Arena client platform.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* PANEL 8: CONTACT */}
          {activeTab === "contact" && (
            <motion.div
              key="contact-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="grid gap-8 md:grid-cols-12"
            >
              {/* Contact Details cards */}
              <div className="md:col-span-5 space-y-6">
                <div className="bg-[#0b071e]/40 border border-white/5 rounded-3xl p-6 space-y-5">
                  <h3 className="text-md font-bold text-white tracking-wide border-b border-white/5 pb-2">Direct Contact</h3>
                  
                  <div className="space-y-4 text-sm text-[#94a3b8]">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                      <a href={`mailto:${org.email}`} className="hover:text-white transition-colors">{org.email}</a>
                    </div>
                    <div className="flex items-center gap-3">
                      {org.settings?.socialLinks && (org.settings.socialLinks as any).contactPhoneIsWhatsapp === true ? (
                        <MessageCircle className="w-4 h-4 text-[#25d366] shrink-0" />
                      ) : (
                        <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                      )}
                      <a 
                        href={org.settings?.socialLinks && (org.settings.socialLinks as any).contactPhoneIsWhatsapp === true 
                          ? `https://wa.me/${(org.settings?.contactPhone || org.phone).replace(/[^0-9]/g, "")}` 
                          : `tel:${org.settings?.contactPhone || org.phone}`} 
                        className="hover:text-white transition-colors"
                      >
                        {org.settings?.contactPhone || org.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {org.settings?.paymentInstructions && (
                  <div className="bg-[#0b071e]/40 border border-white/5 rounded-3xl p-6 space-y-4">
                    <h3 className="text-md font-bold text-white tracking-wide border-b border-white/5 pb-2 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      <span>Payment Instructions</span>
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">
                      {org.settings.paymentInstructions}
                    </p>
                  </div>
                )}
              </div>

              {/* Org Contact Form */}
              <div className="md:col-span-7">
                {queryForm}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── SHARE / QR ZOOM MODAL POPUP ─── */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c0828]/95 border border-white/10 rounded-3xl p-6 max-w-sm w-full relative z-10 shadow-2xl flex flex-col items-center text-center space-y-6"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-[#9382ff] to-pink-500"></div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-heading">{org.name}</h3>
                <p className="text-xs text-gray-500">Scan to visit this organization page</p>
              </div>

              {/* QR Image */}
              <div className="bg-white p-3 rounded-2xl border border-white/10">
                <img src={qrCodeUrl} alt="QR Code Link" className="w-56 h-56 object-contain" />
              </div>

              <div className="grid grid-cols-2 gap-4 w-full pt-2">
                <button
                  onClick={handleDownloadQR}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download QR</span>
                </button>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="flex h-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
