import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding-form";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requireAuth();

  // Find if user already belongs to an organization (One Clerk user per organization rule)
  const memberRelation = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  // If already belongs to an organization, redirect directly to dashboard
  if (memberRelation) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#030014] text-[#f4f0ff] flex flex-col justify-center items-center p-4">
      <OnboardingForm />
    </div>
  );
}
