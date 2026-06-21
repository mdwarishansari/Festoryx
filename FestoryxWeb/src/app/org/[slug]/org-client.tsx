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
  Copy
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
  const [activeTab, setActiveTab] = useState<"about" | "events" | "winners" | "quiz">("about");
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="space-y-12">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#0b071e]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-8"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-[#9382ff] to-pink-500"></div>

        {/* Logo */}
        <div className="w-28 h-28 md:w-36 md:h-36 bg-[#0a061e] border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg relative group">
          {org.logoUrl ? (
            <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <span className="text-5xl text-[#9382ff]">{getOrgTypeEmoji(org.type)}</span>
          )}
        </div>

        {/* Details */}
        <div className="flex-grow text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-full mb-2">
                {org.type}
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-heading">{org.name}</h1>
              <p className="text-sm text-gray-400 mt-1 flex items-center justify-center md:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{org.city}, {org.state}</span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 h-10 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all"
                title="Share link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? "Copied" : "Share"}</span>
              </button>
              <button
                onClick={() => setShowQrModal(true)}
                className="flex items-center justify-center gap-2 h-10 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all"
                title="View QR Code"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code</span>
              </button>
            </div>
          </div>

          <p className="text-[#a5b4fc]/70 text-sm md:text-base leading-relaxed max-w-3xl">{org.description}</p>
        </div>
      </motion.div>

      {/* Countdown Timer for Next Event */}
      {nextEvent && timeLeft && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative rounded-3xl border border-indigo-500/20 bg-indigo-950/20 backdrop-blur-md p-6 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-indigo-300 font-semibold uppercase tracking-widest">Next Challenge Starts In</p>
              <h4 className="text-white font-bold text-sm md:text-base mt-0.5 truncate max-w-xs">{nextEvent.name}</h4>
            </div>
          </div>

          <div className="flex gap-4">
            {[
              { val: timeLeft.days, label: "Days" },
              { val: timeLeft.hours, label: "Hrs" },
              { val: timeLeft.minutes, label: "Min" },
              { val: timeLeft.seconds, label: "Sec" }
            ].map((unit, i) => (
              <div key={i} className="flex flex-col items-center justify-center w-16 h-16 rounded-xl border border-white/5 bg-white/5">
                <span className="text-xl md:text-2xl font-bold font-mono text-white leading-none">{String(unit.val).padStart(2, "0")}</span>
                <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-1.5 font-bold">{unit.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-white/10 flex overflow-x-auto gap-8 text-sm font-semibold scrollbar-none">
        {[
          { id: "about", label: "About & Info", icon: Building },
          { id: "events", label: `Competitions (${events.length})`, icon: Calendar },
          { id: "winners", label: "Winners Arena", icon: Trophy, hidden: events.filter(e => e.winner1Id || e.winner2Id || e.winner3Id).length === 0 },
          { id: "quiz", label: "Quiz Arena", icon: Flame, hidden: !showQuiz }
        ].map((tab) => {
          if (tab.hidden) return null;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 flex items-center gap-2 relative transition-all duration-200 border-b-2 hover:text-white cursor-pointer ${
                isSelected
                  ? "border-[#9382ff] text-white"
                  : "border-transparent text-gray-400"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isSelected ? "text-[#9382ff]" : "text-gray-500"}`} />
              <span>{tab.label}</span>
              {isSelected && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {activeTab === "about" && (
            <motion.div
              key="about-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid gap-8 md:grid-cols-12"
            >
              {/* Info Details */}
              <div className="md:col-span-5 space-y-6">
                <div className="bg-[#0b071e]/40 border border-white/5 rounded-3xl p-6 space-y-5">
                  <h3 className="text-md font-bold text-white tracking-wide border-b border-white/5 pb-2">Contact & Details</h3>
                  
                  <div className="space-y-4 text-sm text-[#94a3b8]">
                    {org.websiteUrl && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                        <a href={org.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                          <span>Official Website</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                      <a href={`mailto:${org.email}`} className="hover:text-white transition-colors">{org.email}</a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                      <a href={`tel:${org.phone}`} className="hover:text-white transition-colors">{org.phone}</a>
                    </div>
                  </div>
                </div>

                {/* Social links box */}
                {(socials.instagram || socials.linkedin || socials.youtube || socials.whatsapp) && (
                  <div className="bg-[#0b071e]/40 border border-white/5 rounded-3xl p-6 space-y-4">
                    <h3 className="text-md font-bold text-white tracking-wide border-b border-white/5 pb-2">Social Channels</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-300">
                      {socials.instagram && (
                        <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-white/5 rounded-xl hover:bg-white/10 hover:text-[#e1306c] transition-all">
                          <Instagram className="w-4 h-4 text-[#e1306c]" />
                          <span>Instagram</span>
                        </a>
                      )}
                      {socials.linkedin && (
                        <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-white/5 rounded-xl hover:bg-white/10 hover:text-[#0a66c2] transition-all">
                          <Linkedin className="w-4 h-4 text-[#0a66c2]" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                      {socials.youtube && (
                        <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-white/5 rounded-xl hover:bg-white/10 hover:text-[#ff0000] transition-all">
                          <Youtube className="w-4 h-4 text-[#ff0000]" />
                          <span>YouTube</span>
                        </a>
                      )}
                      {socials.whatsapp && (
                        <a href={`https://wa.me/${socials.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-white/5 rounded-xl hover:bg-white/10 hover:text-[#25d366] transition-all">
                          <MessageCircle className="w-4 h-4 text-[#25d366]" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Form */}
              <div className="md:col-span-7">
                {queryForm}
              </div>
            </motion.div>
          )}

          {activeTab === "events" && (
            <motion.div
              key="events-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {events.length === 0 ? (
                <div className="bg-[#0b071e]/40 border border-white/5 rounded-3xl py-20 text-center flex flex-col items-center justify-center">
                  <Calendar className="w-12 h-12 text-gray-600 mb-3" />
                  <p className="text-gray-400">No public events listed yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {events.map((event) => {
                    const fee = event.registrationFee ? Number(event.registrationFee) : 0;
                    return (
                      <motion.div
                        key={event.id}
                        whileHover={{ y: -4 }}
                        className="flex flex-col bg-[#0b071e]/40 border border-white/10 rounded-2xl overflow-hidden hover:border-[#9382ff]/50 hover:shadow-[0_0_20px_rgba(147,130,255,0.15)] transition-all duration-300 h-full"
                      >
                        {/* Image */}
                        <div className="h-44 bg-[#0a061e] border-b border-white/5 overflow-hidden relative shrink-0">
                          {event.bannerUrl ? (
                            <img src={event.bannerUrl} alt={event.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl opacity-30 select-none">🏆</div>
                          )}
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-white">
                            {fee === 0 ? "FREE" : `₹${fee}`}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <h3 className="font-bold text-white text-base leading-tight truncate">{event.name}</h3>
                            <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{event.shortDescription || "No description provided."}</p>
                          </div>
                          <div className="text-[11px] text-[#9382ff] font-semibold pt-3 flex items-center justify-between border-t border-white/5 mt-auto">
                            <span>📅 {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "TBD"}</span>
                            <Link href={`/org/${org.slug}/events/${event.slug}`} className="hover:underline flex items-center gap-1">
                              <span>Details & Join</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "winners" && (
            <motion.div
              key="winners-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
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

          {activeTab === "quiz" && (
            <motion.div
              key="quiz-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-[#0f0b29]/80 border border-indigo-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl space-y-6 text-center">
                <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-44 h-44 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/35 flex items-center justify-center text-indigo-400 mx-auto">
                  <Flame className="w-8 h-8 text-indigo-400" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading text-2xl font-bold text-white">Festoryx Quiz Arena</h3>
                  <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                    Test your knowledge, compete in real-time, and climb the leaderboard in our multiplayer multiplayer live Quiz room.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-col items-center justify-center gap-3">
                  <a
                    href={`${quizArenaUrl}/join`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 px-8 items-center gap-2 justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 w-full sm:w-auto"
                  >
                    <span>Enter Quiz Arena Lobby</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <p className="text-[10px] text-gray-500">Redirects to our hosted Quiz Arena client platform.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* QR Code Modal Popup */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b081f] border border-white/10 rounded-3xl p-6 max-w-sm w-full relative z-10 shadow-2xl flex flex-col items-center text-center space-y-6"
            >
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
