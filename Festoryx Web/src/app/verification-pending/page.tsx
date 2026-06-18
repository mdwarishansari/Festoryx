import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Building2, Mail, Phone, Calendar, Clock, AlertTriangle, ShieldClose } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const dynamic = "force-dynamic";

export default async function VerificationPendingPage() {
  const user = await requireAuth();

  // Find organization member relation
  const memberRelation = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  });

  if (!memberRelation) {
    redirect("/onboarding");
  }

  const org = memberRelation.organization;

  // If already active, redirect back to dashboard
  if (org.status === "ACTIVE") {
    redirect("/dashboard");
  }

  const submissionDate = org.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let statusTitle = "Verification Pending";
  let statusColor = "text-amber-400";
  let statusBg = "bg-amber-400/10 border-amber-400/20";
  let statusIcon = <Clock className="h-8 w-8 text-amber-400 animate-pulse" />;
  let statusMessage = "Your organization profile is currently being reviewed by our platform administrators. We usually verify and approve applications in less than 24 hours.";

  if (org.status === "REJECTED") {
    statusTitle = "Application Rejected";
    statusColor = "text-rose-500";
    statusBg = "bg-rose-500/10 border-rose-500/20";
    statusIcon = <AlertTriangle className="h-8 w-8 text-rose-500" />;
    statusMessage = "Unfortunately, your application to register this organization has been rejected by our team. Please review the reason below or contact support.";
  } else if (org.status === "SUSPENDED") {
    statusTitle = "Organization Suspended";
    statusColor = "text-red-500";
    statusBg = "bg-red-500/10 border-red-500/20";
    statusIcon = <ShieldClose className="h-8 w-8 text-red-500" />;
    statusMessage = "This organization profile has been suspended due to violations of our terms of service. Please contact our support team to appeal this decision.";
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#030014] text-[#f4f0ff] font-sans">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-24 px-4 relative">
        {/* Background Star field effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] -z-10" />

        <div className="w-full max-w-xl bg-[#060317] border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Accent strip */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${org.status === "PENDING_VERIFICATION" ? "from-amber-500 via-amber-400 to-amber-600" : "from-red-600 via-red-500 to-red-700"}`}></div>

          {/* Icon */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border ${org.status === "PENDING_VERIFICATION" ? "bg-amber-500/10 border-amber-500/30" : "bg-red-500/10 border-red-500/30"}`}>
            {statusIcon}
          </div>

          <h1 className={`text-2xl font-bold mb-3 tracking-wide text-center ${statusColor}`}>
            {statusTitle}
          </h1>
          
          <p className="text-sm text-[#94a3b8] mb-8 leading-relaxed text-center">
            {statusMessage}
          </p>

          {/* Reason if rejected */}
          {org.status === "REJECTED" && org.statusNote && (
            <div className="mb-6 text-xs text-rose-400 bg-rose-500/5 p-4 rounded-xl border border-rose-500/10 text-left">
              <strong className="block text-rose-300 mb-1">Reason for Rejection:</strong>
              {org.statusNote}
            </div>
          )}

          {/* Details Table */}
          <div className="border-t border-b border-white/10 py-6 mb-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>Organization Name</span>
              </span>
              <span className="font-semibold text-white">{org.name}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Status</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${statusBg} ${statusColor}`}>
                {org.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Submission Date</span>
              </span>
              <span className="font-semibold text-white">{submissionDate}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Contact Email</span>
              </span>
              <span className="font-semibold text-white">{org.email}</span>
            </div>

            {org.phone && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Contact Phone</span>
                </span>
                <span className="font-semibold text-white">{org.phone}</span>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-[#54525f]">
              We will send a notification email to <strong className="text-indigo-300">{user.email}</strong> once your account activation status is modified.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
