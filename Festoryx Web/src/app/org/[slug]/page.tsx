export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CosmicBackground } from "@/components/ui/cosmic-background";
import Link from "next/link";
import { Calendar, Globe, Mail, Phone, ExternalLink, Trophy, Instagram, Linkedin, Youtube, MessageCircle, MapPin } from "lucide-react";
import { getOrgTypeEmoji } from "@/lib/utils";
import { OrgQueryForm } from "./org-query-form";

interface OrgProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function OrgProfilePage({ params }: OrgProfilePageProps) {
  const { slug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug },
    include: {
      events: {
        where: {
          isPublished: true,
          visibility: "PUBLIC",
        },
        include: {
          winner1: true,
          winner2: true,
          winner3: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!org) {
    notFound();
  }

  // Filter events that have winners assigned
  const eventsWithWinners = org.events.filter(
    (e) => e.winner1Id || e.winner2Id || e.winner3Id
  );

  const socials = (org.socialLinks as any) || {};

  return (
    <div className="min-h-screen bg-transparent text-[#f4f0ff] font-sans relative">
      <CosmicBackground />

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-12">
        {/* Back Link */}
        <Link href="/" className="text-xs text-[#9382ff] hover:text-[#816eff] transition-colors flex items-center gap-1">
          ← Back to Marketplace
        </Link>

        {/* Profile Card */}
        <div className="bg-[#060317]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-8">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-[#9382ff] to-pink-500"></div>

          {/* Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 bg-[#0a061e] border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
            {org.logoUrl ? (
              <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl text-[#9382ff]">{getOrgTypeEmoji(org.type)}</span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs rounded-full uppercase tracking-wider font-semibold capitalize mb-2">
                {org.type}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">{org.name}</h1>
              <p className="text-sm text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-600" />
                <span>{org.city}, {org.state}</span>
              </p>
            </div>

            <p className="text-[#94a3b8] text-sm md:text-base leading-relaxed max-w-2xl">{org.description}</p>

            {/* Contact info grid */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2 text-xs text-[#64748b]">
              {org.websiteUrl && (
                <a href={org.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <a href={`mailto:${org.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5" />
                <span>{org.email}</span>
              </a>
              <a href={`tel:${org.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5" />
                <span>{org.phone}</span>
              </a>
            </div>

            {/* Social Links */}
            {(socials.instagram || socials.linkedin || socials.youtube || socials.whatsapp) && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 border-t border-white/5 text-xs text-gray-400">
                {socials.instagram && (
                  <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                    <Instagram className="w-3.5 h-3.5 text-[#e1306c]" />
                    <span>Instagram</span>
                  </a>
                )}
                {socials.linkedin && (
                  <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                    <Linkedin className="w-3.5 h-3.5 text-[#0a66c2]" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {socials.youtube && (
                  <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                    <Youtube className="w-3.5 h-3.5 text-[#ff0000]" />
                    <span>YouTube</span>
                  </a>
                )}
                {socials.whatsapp && (
                  <a href={`https://wa.me/${socials.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-400 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5 text-[#25d366]" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Public Events Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#9382ff]" />
              <span>Events Listing</span>
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">Explore active events run by {org.name}</p>
          </div>

          {org.events.length === 0 ? (
            <div className="bg-[#060317]/50 border border-white/5 rounded-2xl py-16 text-center">
              <p className="text-sm text-gray-500">No public events scheduled currently.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {org.events.map((event) => {
                const fee = event.registrationFee ? Number(event.registrationFee) : 0;
                return (
                  <Link
                    key={event.id}
                    href={`/org/${org.slug}/events/${event.slug}`}
                    className="group bg-[#060317]/40 hover:bg-[#060317]/90 border border-white/10 rounded-2xl overflow-hidden hover:border-[#9382ff]/50 hover:shadow-[0_0_20px_rgba(147,130,255,0.15)] transition-all duration-300"
                  >
                    {/* Image / Card cover */}
                    <div className="h-40 bg-[#0a061e] border-b border-white/5 overflow-hidden relative">
                      {event.bannerUrl ? (
                        <img
                          src={event.bannerUrl}
                          alt={event.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-35">🏆</div>
                      )}
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide">
                        {fee === 0 ? "FREE" : `₹${fee}`}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-white group-hover:text-[#9382ff] transition-colors truncate">{event.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 h-8 leading-relaxed">{event.shortDescription}</p>
                      <div className="text-[10px] text-[#9382ff] pt-2 flex items-center justify-between border-t border-white/5">
                        <span>📅 {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "TBD"}</span>
                        <span>Learn more →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Winners Arena Section */}
        {eventsWithWinners.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-white/5">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                <span>Winners Arena</span>
              </h2>
              <p className="text-xs text-[#64748b] mt-0.5">Celebrate the champions of our recent competitions</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {eventsWithWinners.map((event) => (
                <div key={event.id} className="bg-[#060317]/50 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-md">
                  <h3 className="font-bold text-white text-base border-b border-white/5 pb-2">{event.name}</h3>
                  <div className="space-y-3">
                    {event.winner1 && (
                      <div className="flex items-center justify-between text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                        <span className="font-semibold text-amber-400">🥇 1st Place</span>
                        <span className="font-medium text-white">{event.winner1.participantName}</span>
                      </div>
                    )}
                    {event.winner2 && (
                      <div className="flex items-center justify-between text-xs bg-slate-400/10 border border-slate-400/20 rounded-lg p-2">
                        <span className="font-semibold text-slate-300">🥈 2nd Place</span>
                        <span className="font-medium text-white">{event.winner2.participantName}</span>
                      </div>
                    )}
                    {event.winner3 && (
                      <div className="flex items-center justify-between text-xs bg-amber-700/10 border border-amber-700/20 rounded-lg p-2">
                        <span className="font-semibold text-amber-600">🥉 3rd Place</span>
                        <span className="font-medium text-white">{event.winner3.participantName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Form and Query Support Form */}
        <div className="pt-6 border-t border-white/5">
          <OrgQueryForm orgSlug={org.slug} />
        </div>
      </div>
    </div>
  );
}
