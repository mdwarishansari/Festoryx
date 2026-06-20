"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function getOrgIdForCurrentUser(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const member = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  if (member) return member.organizationId;

  if (user.role === "SUPER_ADMIN" || user.email === "warishprojects@gmail.com") {
    const firstOrg = await prisma.organization.findFirst();
    if (firstOrg) return firstOrg.id;
  }

  throw new Error("No organization found for user");
}

export async function getSettings(): Promise<any | null> {
  try {
    const orgId = await getOrgIdForCurrentUser();
    const settings = await prisma.orgSettings.findUnique({
      where: { organizationId: orgId },
    });
    if (!settings) return null;

    const socialLinks = settings.socialLinks as any;
    return {
      socketUrl: socialLinks?.socketUrl || "",
      instagramUrl: socialLinks?.instagram || "",
      githubUrl: socialLinks?.github || "",
      twitterUrl: socialLinks?.twitter || "",
      linkedinUrl: socialLinks?.linkedin || "",
      youtubeUrl: socialLinks?.youtube || "",
    };
  } catch (error) {
    console.warn("⚠️ [Prisma] Database error in getSettings:", error);
    return null;
  }
}

export async function saveSocketUrlAction(url: string | null) {
  try {
    const orgId = await getOrgIdForCurrentUser();
    const settings = await prisma.orgSettings.findUnique({
      where: { organizationId: orgId },
    });

    const socialLinks = {
      ...(settings?.socialLinks as any),
      socketUrl: url || "",
    };

    await prisma.orgSettings.upsert({
      where: { organizationId: orgId },
      update: { socialLinks },
      create: { organizationId: orgId, socialLinks },
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/admin/settings");

    return { success: true };
  } catch (error) {
    console.error("Failed to save socket URL:", error);
    return { success: false, error: "Failed to save to database" };
  }
}
