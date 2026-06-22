export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CosmicBackground } from "@/components/ui/cosmic-background";
import Link from "next/link";
import { headers } from "next/headers";
import { OrgClient } from "./org-client";
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
      settings: true,
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

  // Read headers to generate canonical URLs dynamically
  const headersList = await headers();
  const host = headersList.get("host") || "festoryx.com";
  const proto = headersList.get("x-forwarded-proto") || "https";
  const orgUrl = `${proto}://${host}/org/${slug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(orgUrl)}`;
  const quizArenaUrl = process.env.NEXT_PUBLIC_QUIZ_ARENA_URL || "https://festoryx-quiz.vercel.app";

  const showQuiz = org.settings?.showQuiz ?? false;

  return (
    <div className="min-h-screen bg-transparent text-[#f4f0ff] font-sans relative">
      <CosmicBackground />

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-12">
        {/* Back Link */}
        <Link href="/" className="text-xs text-[#9382ff] hover:text-[#816eff] transition-colors flex items-center gap-1 w-fit">
          ← Back to Marketplace
        </Link>

        <OrgClient
          org={org}
          events={org.events}
          showQuiz={showQuiz}
          orgUrl={orgUrl}
          qrCodeUrl={qrCodeUrl}
          quizArenaUrl={quizArenaUrl}
          queryForm={<OrgQueryForm orgSlug={org.slug} />}
        />
      </div>
    </div>
  );
}

