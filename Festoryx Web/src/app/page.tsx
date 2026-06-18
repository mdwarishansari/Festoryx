import { getPublishedEvents } from "@/actions/event.actions";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { prisma } from "@/lib/prisma";
import { CosmicBackground } from "@/components/ui/cosmic-background";
import { HomeHero } from "@/components/landing/home-hero";
import { 
  FadeIn, 
  HoverCard, 
  StaggerContainer, 
  StaggerItem, 
  ScaleIn 
} from "@/components/landing/motion-components";
import type { Metadata } from "next";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  Globe, 
  Users, 
  CheckCircle, 
  Award, 
  Flame, 
  Settings, 
  Tv 
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Festoryx | Competition OS & Interactive Event Suite",
  description: "Festoryx is a multi-tenant event operating system and interactive competition suite for colleges, clubs, and tech festivals. Manage events, registrations, QR payments, and host real-time buzzer quizzes.",
  keywords: ["Festoryx", "Competition OS", "Hackathon platform", "Interactive Quiz Arena", "Multi-Tenant SaaS", "Buzzer Quiz"],
};

export default async function Home() {
  const [
    publishedEvents,
    activeOrgs,
    totalEvents,
    totalRegistrations,
    totalOrganizations
  ] = await Promise.all([
    getPublishedEvents().catch(() => []),
    prisma.organization.findMany({
      where: { status: "ACTIVE" },
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        type: true,
        city: true,
        state: true,
        description: true,
      }
    }).catch(() => []),
    prisma.event.count({ where: { isPublished: true } }).catch(() => 0),
    prisma.registration.count().catch(() => 0),
    prisma.organization.count({ where: { status: "ACTIVE" } }).catch(() => 0),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-[#030014] text-[#f4f0ff] font-sans relative overflow-x-hidden">
      <CosmicBackground />
      <Header />
      
      <main className="flex-grow flex flex-col items-center relative z-10 w-full">
        {/* Hero Section containing the circling purple gravity / black-hole animation */}
        <HomeHero />
        
        {/* ─── Platform Stats ─────────────────────────────────── */}
        <section className="border-y border-white/5 bg-[#060317]/20 py-12 backdrop-blur-sm w-full">
          <div className="mx-auto max-w-6xl px-4">
            <StaggerContainer className="grid grid-cols-3 gap-8 text-center" delay={0.1}>
              <StaggerItem>
                <span className="block font-heading text-3xl font-medium text-white sm:text-4xl">{totalOrganizations}</span>
                <span className="mt-1 block text-xs uppercase tracking-wider text-[#918ea0] font-medium">Active Tenants</span>
              </StaggerItem>
              <StaggerItem>
                <span className="block font-heading text-3xl font-medium text-[#9382ff] sm:text-4xl">{totalEvents}</span>
                <span className="mt-1 block text-xs uppercase tracking-wider text-[#918ea0] font-medium">Active Arenas</span>
              </StaggerItem>
              <StaggerItem>
                <span className="block font-heading text-3xl font-medium text-white sm:text-4xl">{totalRegistrations}</span>
                <span className="mt-1 block text-xs uppercase tracking-wider text-[#918ea0] font-medium">Competitors Onboarded</span>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* ─── Featured Active Organizations ──────────────────── */}
        <section className="py-24 w-full max-w-6xl mx-auto px-4 space-y-12">
          <FadeIn className="text-center space-y-2">
            <span className="rounded-[32px] border border-[#9382ff]/20 bg-[#060317] px-3.5 py-1 text-[11px] font-semibold text-[#9382ff] shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)]">
              Tenants
            </span>
            <h2 className="font-heading text-3xl font-medium text-[#f4f0ff]">Featured Organizations</h2>
            <p className="text-sm text-[#918ea0] max-w-md mx-auto">Colleges and clubs hosting their technical festivals with Festoryx.</p>
          </FadeIn>

          {activeOrgs.length === 0 ? (
            <FadeIn>
              <div className="rounded-[16px] border border-white/5 bg-[#060317] p-8 text-center text-sm text-[#918ea0] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)]">
                No featured organizations yet. Get started and register yours today!
              </div>
            </FadeIn>
          ) : (
            <StaggerContainer className="grid gap-6 md:grid-cols-2">
              {activeOrgs.map((org) => (
                <StaggerItem key={org.id}>
                  <HoverCard className="rounded-[16px] border border-white/5 bg-[#060317]/80 backdrop-blur-sm p-6 shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] flex flex-col justify-between hover:border-[#9382ff]/20 transition-all group h-full">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-[16px] overflow-hidden bg-[#10093a]/40 border border-white/10 flex items-center justify-center shrink-0">
                          {org.logoUrl ? (
                            <img src={org.logoUrl} alt={org.name} className="h-full w-full object-cover" />
                          ) : (
                            <Users className="h-6 w-6 text-[#9382ff]" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-[#9382ff] transition-colors">{org.name}</h3>
                          <span className="text-xs text-[#918ea0] capitalize">{org.type} • {org.city}, {org.state}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#a8a6b7] line-clamp-3 leading-relaxed mb-6">
                        {org.description || "No description provided."}
                      </p>
                    </div>
                    
                    <Link 
                      href={`/org/${org.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9382ff] hover:text-[#f4f0ff] transition-colors self-start"
                    >
                      <span>Visit Organization Page</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </section>

        {/* ─── Active Public Events ──────────────────────────── */}
        <section className="py-24 border-t border-white/5 bg-[#060317]/10 w-full">
          <div className="mx-auto max-w-6xl px-4 space-y-12">
            <FadeIn className="text-center space-y-2">
              <span className="rounded-[32px] border border-[#9382ff]/20 bg-[#060317] px-3.5 py-1 text-[11px] font-semibold text-[#9382ff] shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)]">
                Arenas
              </span>
              <h2 className="font-heading text-3xl font-medium text-[#f4f0ff]">Active Public Competitions</h2>
              <p className="text-sm text-[#918ea0] max-w-md mx-auto">Explore active events and challenges currently accepting registrations.</p>
            </FadeIn>

            {publishedEvents.length === 0 ? (
              <FadeIn>
                <div className="rounded-[16px] border border-white/5 bg-[#060317] p-8 text-center text-sm text-[#918ea0] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)]">
                  No active events at this moment. Check back soon!
                </div>
              </FadeIn>
            ) : (
              <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {publishedEvents.map((event) => (
                  <StaggerItem key={event.id}>
                    <HoverCard className="rounded-[16px] border border-white/5 bg-[#060317]/80 backdrop-blur-sm overflow-hidden flex flex-col shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] hover:border-[#9382ff]/20 transition-all group h-full">
                      {event.bannerUrl ? (
                        <div className="h-40 overflow-hidden relative border-b border-white/5 bg-black">
                          <img 
                            src={event.bannerUrl} 
                            alt={event.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                        </div>
                      ) : (
                        <div className="h-40 bg-[#10093a]/40 border-b border-white/5 flex items-center justify-center">
                          <Award className="h-10 w-10 text-[#9382ff]" />
                        </div>
                      )}
                      
                      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                        <div>
                          <span className="text-[10px] text-[#9382ff] font-bold uppercase tracking-wider">
                            {event.organization?.name}
                          </span>
                          <h3 className="font-semibold text-[#f4f0ff] text-base mt-1 line-clamp-1 group-hover:text-[#9382ff] transition-colors">
                            {event.name}
                          </h3>
                          <p className="text-xs text-[#a8a6b7] mt-2 line-clamp-2 leading-relaxed">
                            {event.shortDescription || "No description provided."}
                          </p>
                        </div>

                        <div className="flex justify-between items-center text-xs text-[#918ea0] border-t border-white/5 pt-3">
                          <span>{event.participationType}</span>
                          <Link 
                            href={`/events/${event.slug}`}
                            className="inline-flex items-center gap-1 text-white font-semibold hover:text-[#9382ff] transition-colors"
                          >
                            <span>Join Event</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </HoverCard>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </section>

        {/* ─── Quiz Arena Preview ────────────────────────────── */}
        <section className="py-24 w-full max-w-6xl mx-auto px-4">
          <ScaleIn className="rounded-[24px] border border-white/5 bg-gradient-to-br from-[#060317] to-[#10093a]/30 p-8 md:p-12 shadow-[inset_0_0_32px_rgba(255,255,255,0.04)] relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#9382ff] to-transparent"></div>
            
            <div className="space-y-6 md:w-1/2">
              <div className="inline-flex items-center gap-2 rounded-[32px] border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-[11px] font-semibold text-amber-400">
                <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>Interactive Module</span>
              </div>
              <h2 className="font-heading text-3xl font-medium tracking-tight text-white sm:text-4xl">
                The Live Quiz Arena
              </h2>
              <p className="text-sm text-[#a8a6b7] leading-relaxed">
                Connect your contestants in real-time. Host buzzer rounds, rapid-fire sessions, and multiple-choice questions with a dedicated live-updating projector dashboard and instant leaderboard snapshots.
              </p>
              
              <div className="space-y-3 text-xs text-[#918ea0]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#9382ff]" />
                  <span>Real-time WebSocket Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#9382ff]" />
                  <span>Interactive Buzzer System & Rank Sorting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#9382ff]" />
                  <span>Projector Client & Live Leaderboards</span>
                </div>
              </div>

              <a 
                href="http://localhost:3002"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border border-[#9382ff]/30 bg-[#9382ff]/10 hover:bg-[#9382ff]/20 px-5 text-xs font-semibold text-[#9382ff] transition-all"
              >
                <span>Launch Quiz Arena Demo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
            
            {/* Visual Preview */}
            <div className="md:w-1/2 w-full relative">
              <div className="rounded-[16px] border border-white/10 bg-[#030014]/60 p-4 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/60"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/60"></span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">quiz-arena-projector.local</span>
                </div>
                
                {/* Projector Mock */}
                <div className="space-y-4">
                  <div className="bg-[#10093a]/40 p-4 rounded-lg border border-white/5 text-center">
                    <span className="text-[10px] text-[#9382ff] font-bold tracking-widest uppercase">Round 2: Buzzer Round</span>
                    <p className="text-sm font-semibold text-white mt-1">Which data structure uses LIFO order?</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs bg-[#060317] border border-white/5 p-2 rounded">
                      <span className="text-[#a8a6b7]">1. Team Alpha</span>
                      <span className="font-semibold text-emerald-400">+10 pts (Buzzed first)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs bg-[#060317] border border-white/5 p-2 rounded">
                      <span className="text-[#a8a6b7]">2. Byte Club</span>
                      <span className="text-[#54525f] font-mono">Buzzed +0.4s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScaleIn>
        </section>

        {/* ─── Modules & Features ────────────────────────────── */}
        <section className="py-24 border-t border-white/5 bg-[#060317]/10 w-full">
          <div className="mx-auto max-w-6xl px-4 space-y-12">
            <FadeIn className="text-center space-y-2">
              <span className="rounded-[32px] border border-[#9382ff]/20 bg-[#060317] px-3.5 py-1 text-[11px] font-semibold text-[#9382ff] shadow-[inset_0_-7px_11px_rgba(164,143,255,0.12)]">
                Capabilities
              </span>
              <h2 className="font-heading text-3xl font-medium text-[#f4f0ff]">Modular Competition OS</h2>
              <p className="text-sm text-[#918ea0] max-w-md mx-auto">Toggle modules on and off per competition. Build exact event workflows.</p>
            </FadeIn>

            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Dynamic Registrations", icon: Users, desc: "Build custom form configurations per event. Solo or team modes with size limits." },
                { title: "QR Payment Approval", icon: CheckCircle, desc: "Review transaction details and matching proof receipts within the admin console." },
                { title: "Project Submissions", icon: Award, desc: "Provide secure file uploads and repositories links for hackathon and design sprints." },
                { title: "SSO Live Quiz Arena", icon: Flame, desc: "Synchronized buzzers and projectors connecting organizers, projection screens, and play devices." },
                { title: "Branding Settings", icon: Settings, desc: "Tailor event descriptions, cover banners, deadlines, rules, and contact info." },
                { title: "Winner Broadcasts", icon: Tv, desc: "Announce winners and podium results on customized public landing pages instantly." },
              ].map((feat, idx) => (
                <StaggerItem key={idx}>
                  <HoverCard className="bg-[#060317]/80 backdrop-blur-sm border border-white/5 p-6 rounded-[16px] shadow-[inset_0_0_24px_rgba(255,255,255,0.04)] space-y-3 hover:border-white/10 transition-all h-full">
                    <div className="h-10 w-10 rounded-lg bg-[#10093a]/60 border border-white/10 flex items-center justify-center">
                      <feat.icon className="h-5 w-5 text-[#9382ff]" />
                    </div>
                    <h3 className="font-medium text-white text-sm">{feat.title}</h3>
                    <p className="text-xs text-[#a8a6b7] leading-relaxed">{feat.desc}</p>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
