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

  if (!member) {
    if (user.role === "SUPER_ADMIN" || user.email === "warishprojects@gmail.com") {
      const firstOrg = await prisma.organization.findFirst();
      if (firstOrg) return firstOrg.id;
    }
    throw new Error("No organization found for user");
  }
  return member.organizationId;
}

export async function getSettings(): Promise<any | null> {
  try {
    const user = await getCurrentUser();
    let orgId: string | null = null;
    
    if (user) {
      const member = await prisma.organizationMember.findFirst({
        where: { userId: user.id },
      });
      if (member) {
        orgId = member.organizationId;
      } else if (user.role === "SUPER_ADMIN" || user.email === "warishprojects@gmail.com") {
        const firstOrg = await prisma.organization.findFirst();
        if (firstOrg) orgId = firstOrg.id;
      }
    }

    if (!orgId) {
      const firstOrg = await prisma.organization.findFirst({
        include: { settings: true }
      });
      if (firstOrg) {
        orgId = firstOrg.id;
      } else {
        return {
          siteName: "Festoryx",
          slug: "festoryx",
          eventTitle: "Festoryx Events",
          tagline: "Innovate. Compete. Excel.",
          aboutContent: "",
          contactEmail: "warishhclhome@gmail.com",
          contactPhone: "+910000000000",
          contactAddress: "University Campus, Main Road",
          footerText: `© ${new Date().getFullYear()} Festoryx. All rights reserved.`,
          paymentInstructions: "",
          logoUrl: "/Logo.gif",
          paymentQrCodeUrl: "",
          instagramUrl: "https://instagram.com/festoryx",
          githubUrl: "https://github.com/mdwarishansari/Festoryx",
          twitterUrl: "https://twitter.com/festoryx",
          linkedinUrl: "https://linkedin.com/company/festoryx",
          youtubeUrl: "https://www.youtube.com/@Festoryx",
        };
      }
    }

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
      contactEmail: orgSettings?.contactEmail || "warishhclhome@gmail.com",
      contactPhone: orgSettings?.contactPhone || "+910000000000",
      contactAddress: org.city && org.state ? `${org.city}, ${org.state}` : "University Campus, Main Road",
      footerText: `© ${new Date().getFullYear()} Festoryx. All rights reserved.`,
      paymentInstructions: orgSettings?.paymentInstructions || "",
      logoUrl: org.logoUrl || "/Logo.gif",
      paymentQrCodeUrl: orgSettings?.paymentQrCodeUrl,
      instagramUrl: socialLinks?.instagram || "https://instagram.com/festoryx",
      githubUrl: socialLinks?.github || "https://github.com/mdwarishansari/Festoryx",
      twitterUrl: socialLinks?.twitter || "https://twitter.com/festoryx",
      linkedinUrl: socialLinks?.linkedin || "https://linkedin.com/company/festoryx",
      youtubeUrl: socialLinks?.youtube || "https://www.youtube.com/@Festoryx",
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
