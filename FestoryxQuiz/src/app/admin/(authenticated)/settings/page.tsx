import { prisma } from "@/lib/prisma";
import SiteSettingsForm from "./site-settings-form";
import { Shield, Users, BookOpen, Activity, Play } from "lucide-react";
import { requireAuth, isSuperAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSettings } from "@/actions/settings.actions";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await requireAuth();
  if (!isSuperAdmin(user)) {
    redirect("/admin");
  }

  const dbUrl = process.env.DATABASE_URL || "";
  const maskedDbUrl = dbUrl.replace(/:([^@]+)@/, ":******@");

  // Fetch stats for Super Admin dashboard
  const [totalOrgs, totalQuizzes, activeSessions, totalParticipants] = await Promise.all([
    prisma.organization.count(),
    prisma.quiz.count(),
    prisma.quizSession.count({ where: { status: "ACTIVE" } }),
    prisma.quizParticipant.count(),
  ]);

  // Fetch site configurations
  const siteSettings = await getSettings();
  const socketUrl = siteSettings?.socketUrl || "";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl font-heading">
          Platform Settings & Super-Admin Console
        </h1>
        <p className="mt-1 text-gray-400">
          Configure site-wide branding, real-time socket overrides, diagnostics, and view portal statistics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Organizations</p>
            <p className="text-2xl font-bold text-white mt-0.5">{totalOrgs}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Quizzes</p>
            <p className="text-2xl font-bold text-white mt-0.5">{totalQuizzes}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Activity className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Active Sessions</p>
            <p className="text-2xl font-bold text-white mt-0.5">{activeSessions}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Play className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Participants Joined</p>
            <p className="text-2xl font-bold text-white mt-0.5">{totalParticipants}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        {/* Site Branding Settings */}
        <SiteSettingsForm initialSettings={siteSettings || {}} />
      </div>

      {/* Password warning/note section */}
      <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-5 backdrop-blur-xl flex gap-3">
        <Shield className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white font-heading">Security & Credentials Note</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Admin credentials and password modifications can only be managed from the main Festoryx portal settings. This ensures single-sign-on (SSO) credentials remain strictly unified across the entire techfest platform.
          </p>
        </div>
      </div>
    </div>
  );
}
