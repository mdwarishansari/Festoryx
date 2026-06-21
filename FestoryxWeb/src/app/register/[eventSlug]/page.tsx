export const dynamic = "force-dynamic";

import { getEventBySlug } from "@/actions/event.actions";
import { RegistrationFormClient } from "./registration-form";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { notFound } from "next/navigation";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";
import { CosmicBackground } from "@/components/ui/cosmic-background";
import Link from "next/link";
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import { serializePrisma, formatDateTime } from "@/lib/utils";
import { ReleaseCountdown } from "@/components/events/release-countdown";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{
    eventSlug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const event = await getEventBySlug(resolvedParams.eventSlug);

  if (!event) {
    return {
      title: "Event Registration | Festoryx",
    };
  }

  return {
    title: `Register for ${event.name} | ${event.organization.name} | Festoryx`,
    description: `Complete your registration for ${event.name} run by ${event.organization.name}.`,
  };
}

export default async function RegisterPage({ params }: PageProps) {
  const resolvedParams = await params;
  const dbEvent = await getEventBySlug(resolvedParams.eventSlug);

  if (!dbEvent) {
    notFound();
  }

  // Enforce visibility protection for PRIVATE events
  if (dbEvent.visibility === "PRIVATE") {
    const user = await getCurrentUser();
    if (!user) {
      notFound();
    }
    const isSuper = isSuperAdmin(user);
    if (!isSuper) {
      const member = await prisma.organizationMember.findFirst({
        where: {
          userId: user.id,
          organizationId: dbEvent.organizationId,
        },
      });
      if (!member) {
        notFound();
      }
    }
  }

  // Load form fields for this event (or organization default)
  let dbFormFields = dbEvent.formFields || [];
  if (dbFormFields.length === 0) {
    dbFormFields = await prisma.formFieldConfig.findMany({
      where: {
        organizationId: dbEvent.organizationId,
        eventId: null,
      },
      orderBy: { sortOrder: "asc" },
    });
  }

  if (dbFormFields.length === 0) {
    dbFormFields = [
      { id: "f1", fieldName: "participantName", label: "Full Name", type: "text", isRequired: true, isVisible: true },
      { id: "f2", fieldName: "email", label: "Email Address", type: "email", isRequired: true, isVisible: true },
      { id: "f3", fieldName: "phone", label: "Phone Number", type: "tel", isRequired: true, isVisible: true },
      { id: "f4", fieldName: "collegeName", label: "College / University", type: "text", isRequired: true, isVisible: true },
      { id: "f5", fieldName: "department", label: "Department", type: "text", isRequired: false, isVisible: true },
      { id: "f6", fieldName: "yearOrSemester", label: "Year / Semester", type: "text", isRequired: false, isVisible: true },
    ] as any;
  }

  const event = serializePrisma(dbEvent);
  const formFields = serializePrisma(dbFormFields);
  const org = event.organization;
  const settings = org.settings;

  // Check if registration is allowed
  const now = new Date();
  const isDeadlinePassed =
    event.lastRegistrationDate && now > new Date(event.lastRegistrationDate);
  const isRegistrationOpen = event.isRegistrationOpen && !isDeadlinePassed;

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-[#f4f0ff] font-sans relative">
      <CosmicBackground />
      <Header />
      <main className="flex-grow pt-28 pb-16 relative z-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Back button */}
          <Link
            href={`/org/${org.slug}/events/${event.slug}`}
            className="inline-flex items-center gap-2 text-sm text-[#9382ff] hover:text-[#816eff] mb-8 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to event details</span>
          </Link>

          {/* Heading */}
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Event Registration</span>
            </div>
            <h1 className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
              Register for {event.name}
            </h1>
            <p className="mt-2 text-sm text-gray-400 max-w-lg mx-auto">
              Please fill in the details below to complete your registration. Double check your information before submitting.
            </p>
          </div>

          {/* Challenge Statement Banner */}
          <div className="mb-8 rounded-3xl border border-white/10 bg-[#060317] p-4 sm:p-6 backdrop-blur-md max-w-2xl mx-auto shadow-xl">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#9382ff] text-center mb-2">Challenge Statement</h4>
            {event.problemReleaseTime && new Date() < new Date(event.problemReleaseTime) ? (
              <div className="space-y-4">
                <p className="text-center text-xs text-gray-300">
                  The challenge details will be released in:
                </p>
                <div className="my-2 max-w-sm mx-auto">
                  <ReleaseCountdown releaseTime={event.problemReleaseTime.toString()} />
                </div>
                <p className="text-center text-[11px] text-gray-500 mt-2">
                  Release Time: <span className="text-indigo-300 font-semibold">{formatDateTime(event.problemReleaseTime)}</span>
                </p>
              </div>
            ) : event.problemStatement ? (
              <p className="text-center text-sm font-medium text-emerald-400 py-2">
                Challenge statement has been released! View it on the competition page.
              </p>
            ) : (
              <p className="text-center text-sm font-medium text-amber-400 animate-pulse py-2">
                Problem Statement details will be declared soon!
              </p>
            )}
          </div>

          {!isRegistrationOpen ? (
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 text-center backdrop-blur-md max-w-2xl mx-auto">
              <AlertCircle className="mx-auto h-12 w-12 text-rose-400 mb-4" />
              <h3 className="text-xl font-bold text-white">Registration Closed</h3>
              <p className="mt-2 text-sm text-gray-400">
                Registrations for {event.name} are currently closed.
                {isDeadlinePassed && " The registration deadline has passed."}
              </p>
              <Link
                href={`/org/${org.slug}`}
                className="mt-6 inline-flex rounded-xl bg-white/5 border border-white/10 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10"
              >
                Explore Other Events
              </Link>
            </div>
          ) : (
            <div>
              <RegistrationFormClient
                event={{
                  slug: event.slug,
                  name: event.name,
                  participationType: event.participationType,
                  minTeamSize: event.minTeamSize,
                  maxTeamSize: event.maxTeamSize,
                  registrationFee: event.registrationFee,
                  feePerParticipant: event.feePerParticipant,
                }}
                settings={settings}
                formFields={formFields}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
