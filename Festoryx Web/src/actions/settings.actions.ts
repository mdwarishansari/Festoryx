"use server";

import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/schemas/settings.schema";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
import { getCurrentUser } from "@/lib/auth";

async function getOrgIdForCurrentUser(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const member = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  if (!member) throw new Error("No organization found for user");
  return member.organizationId;
}

export async function getSettings(): Promise<any | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const member = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
    });
    if (!member) return null;

    const orgId = member.organizationId;
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { settings: true },
    });
    if (!org) return null;

    const orgSettings = org.settings;
    const socialLinks = orgSettings?.socialLinks as any;

    return {
      siteName: org.name,
      slug: org.slug,
      eventTitle: org.name + " Events",
      tagline: org.description ? org.description.slice(0, 100) : "",
      aboutContent: org.description || "",
      contactEmail: orgSettings?.contactEmail || org.email,
      contactPhone: orgSettings?.contactPhone || org.phone,
      footerText: `© ${new Date().getFullYear()} ${org.name}. All rights reserved.`,
      paymentInstructions: orgSettings?.paymentInstructions || "",
      logoUrl: org.logoUrl,
      paymentQrCodeUrl: orgSettings?.paymentQrCodeUrl,
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

export async function updateSettings(data: Record<string, unknown>): Promise<ActionResponse> {
  try {
    const orgId = await getOrgIdForCurrentUser();
    const parsed = settingsSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const {
      siteName,
      logoUrl,
      aboutContent,
      contactEmail,
      contactPhone,
      paymentInstructions,
      paymentQrCodeUrl,
      instagramUrl,
      githubUrl,
      twitterUrl,
      linkedinUrl,
      youtubeUrl,
    } = parsed.data;

    const socialLinks = {
      instagram: instagramUrl || "",
      github: githubUrl || "",
      twitter: twitterUrl || "",
      linkedin: linkedinUrl || "",
      youtube: youtubeUrl || "",
    };

    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.$transaction(async (tx) => {
      await tx.organization.update({
        where: { id: orgId },
        data: {
          name: siteName,
          logoUrl: logoUrl || null,
          description: aboutContent || "",
        },
      });

      await tx.orgSettings.upsert({
        where: { organizationId: orgId },
        update: {
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          paymentQrCodeUrl: paymentQrCodeUrl || null,
          paymentInstructions: paymentInstructions || null,
          socialLinks,
        },
        create: {
          organizationId: orgId,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          paymentQrCodeUrl: paymentQrCodeUrl || null,
          paymentInstructions: paymentInstructions || null,
          socialLinks,
        },
      });

      // Write Audit Log
      await tx.auditLog.create({
        data: {
          organizationId: orgId,
          userId: user.id,
          action: "SETTINGS_UPDATED",
          entityType: "settings",
          details: { siteName },
        },
      });
    });

    revalidatePath("/");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Update settings error:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

export async function updateSettingsField(
  field: string,
  value: string
): Promise<ActionResponse> {
  try {
    const orgId = await getOrgIdForCurrentUser();

    if (field === "logoUrl") {
      await prisma.organization.update({
        where: { id: orgId },
        data: { logoUrl: value },
      });
    } else {
      await prisma.orgSettings.upsert({
        where: { organizationId: orgId },
        update: { [field]: value },
        create: { organizationId: orgId, [field]: value },
      });
    }

    revalidatePath("/");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Update settings field error:", error);
    return { success: false, error: "Failed to update" };
  }
}

export async function resetCountdownDate(): Promise<ActionResponse> {
  // Dummy implementation for compatibility
  return { success: true };
}
