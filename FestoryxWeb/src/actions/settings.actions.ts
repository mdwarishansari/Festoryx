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

// Global Site Settings CRUD (Super Admin only for writes)
export async function getSiteSettings(): Promise<any | null> {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "global" },
    });
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: "global",
          siteName: "Festoryx",
          eventTitle: "Festoryx Events",
          tagline: "Innovate. Compete. Excel.",
          aboutContent: "Festoryx is the ultimate techfest platform.",
          contactEmail: "warishhclhome@gmail.com",
          contactPhone: "+910000000000",
          contactAddress: "University Campus, Main Road",
          footerText: `© ${new Date().getFullYear()} Festoryx. All rights reserved.`,
          instagramUrl: "https://instagram.com/festoryx",
          githubUrl: "https://github.com/mdwarishansari/Festoryx",
          twitterUrl: "https://twitter.com/festoryx",
          linkedinUrl: "https://linkedin.com/company/festoryx",
          youtubeUrl: "https://www.youtube.com/@Festoryx",
        },
      });
    }
    return settings;
  } catch (error) {
    console.error("Error in getSiteSettings:", error);
    return null;
  }
}

export async function updateSiteSettings(data: Record<string, unknown>): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized. Super Admin role required." };
    }

    const {
      siteName,
      eventTitle,
      tagline,
      aboutContent,
      contactEmail,
      contactPhone,
      contactAddress,
      footerText,
      logoUrl,
      headerLogoUrl,
      footerLogoUrl,
      faviconUrl,
      instagramUrl,
      githubUrl,
      twitterUrl,
      linkedinUrl,
      youtubeUrl,
      countdownDate,
    } = data as any;

    const parsedCountdown = (countdownDate && typeof countdownDate === "string" && countdownDate.trim() !== "") ? new Date(countdownDate) : null;
    const finalCountdown = (parsedCountdown && !isNaN(parsedCountdown.getTime())) ? parsedCountdown : null;

    await prisma.siteSettings.upsert({
      where: { id: "global" },
      update: {
        siteName: siteName || "Festoryx",
        eventTitle: eventTitle || "Festoryx Events",
        tagline: tagline || null,
        aboutContent: aboutContent || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        contactAddress: contactAddress || null,
        footerText: footerText || null,
        logoUrl: logoUrl || null,
        headerLogoUrl: headerLogoUrl || null,
        footerLogoUrl: footerLogoUrl || null,
        faviconUrl: faviconUrl || null,
        instagramUrl: instagramUrl || null,
        githubUrl: githubUrl || null,
        twitterUrl: twitterUrl || null,
        linkedinUrl: linkedinUrl || null,
        youtubeUrl: youtubeUrl || null,
        countdownDate: finalCountdown,
      },
      create: {
        id: "global",
        siteName: siteName || "Festoryx",
        eventTitle: eventTitle || "Festoryx Events",
        tagline: tagline || null,
        aboutContent: aboutContent || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        contactAddress: contactAddress || null,
        footerText: footerText || null,
        logoUrl: logoUrl || null,
        headerLogoUrl: headerLogoUrl || null,
        footerLogoUrl: footerLogoUrl || null,
        faviconUrl: faviconUrl || null,
        instagramUrl: instagramUrl || null,
        githubUrl: githubUrl || null,
        twitterUrl: twitterUrl || null,
        linkedinUrl: linkedinUrl || null,
        youtubeUrl: youtubeUrl || null,
        countdownDate: finalCountdown,
      },
    });

    revalidatePath("/");
    revalidatePath("/superadmin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating site settings:", error);
    return { success: false, error: "Failed to update site settings" };
  }
}

// Organization settings CRUD (Org Admin)
export async function getOrgSettings(): Promise<any | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const member = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      include: {
        organization: {
          include: { settings: true },
        },
      },
    });

    let org = member?.organization;
    if (!org) {
      if (user.role === "SUPER_ADMIN" || user.email === "warishprojects@gmail.com") {
        org = await prisma.organization.findFirst({
          include: { settings: true },
        }) || undefined;
      }
    }

    if (!org) return null;

    const orgSettings = org.settings;
    const socialLinks = orgSettings?.socialLinks as any;

    return {
      id: org.id,
      siteName: org.name,
      slug: org.slug,
      eventTitle: org.name + " Events",
      tagline: org.description ? org.description.slice(0, 100) : "",
      aboutContent: org.description || "",
      contactEmail: orgSettings?.contactEmail || "",
      contactPhone: orgSettings?.contactPhone || "",
      contactAddress: org.city && org.state ? `${org.city}, ${org.state}` : "",
      footerText: `© ${new Date().getFullYear()} ${org.name}. All rights reserved.`,
      paymentInstructions: orgSettings?.paymentInstructions || "",
      logoUrl: org.logoUrl || "/Logo.gif",
      paymentQrCodeUrl: orgSettings?.paymentQrCodeUrl || "",
      showQuiz: orgSettings?.showQuiz ?? false,
      instagramUrl: socialLinks?.instagram || "",
      githubUrl: socialLinks?.github || "",
      twitterUrl: socialLinks?.twitter || "",
      linkedinUrl: socialLinks?.linkedin || "",
      youtubeUrl: socialLinks?.youtube || "",
    };
  } catch (error) {
    console.error("Error in getOrgSettings:", error);
    return null;
  }
}

export async function updateOrgSettings(data: Record<string, unknown>): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const orgId = await getOrgIdForCurrentUser();

    const {
      siteName,
      logoUrl,
      aboutContent,
      contactEmail,
      contactPhone,
      paymentInstructions,
      paymentQrCodeUrl,
      showQuiz,
      instagramUrl,
      githubUrl,
      twitterUrl,
      linkedinUrl,
      youtubeUrl,
    } = data as any;

    const socialLinks = {
      instagram: instagramUrl || "",
      github: githubUrl || "",
      twitter: twitterUrl || "",
      linkedin: linkedinUrl || "",
      youtube: youtubeUrl || "",
    };

    await prisma.$transaction(async (tx) => {
      await tx.organization.update({
        where: { id: orgId },
        data: {
          name: siteName || "",
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
          showQuiz: showQuiz === true || showQuiz === "true",
        },
        create: {
          organizationId: orgId,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          paymentQrCodeUrl: paymentQrCodeUrl || null,
          paymentInstructions: paymentInstructions || null,
          socialLinks,
          showQuiz: showQuiz === true || showQuiz === "true",
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
    console.error("Update org settings error:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

// Fallbacks for public pages
export async function getSettings(): Promise<any | null> {
  return getSiteSettings();
}

// Router actions for backward compatibility & dynamic routing
export async function updateSettings(data: Record<string, unknown>): Promise<ActionResponse> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  if (user.role === "SUPER_ADMIN") {
    return updateSiteSettings(data);
  } else {
    return updateOrgSettings(data);
  }
}

export async function updateSettingsField(
  field: string,
  value: string
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    if (user.role === "SUPER_ADMIN") {
      await prisma.siteSettings.upsert({
        where: { id: "global" },
        update: { [field]: value },
        create: { id: "global", [field]: value },
      });
      revalidatePath("/");
      revalidatePath("/superadmin/settings");
      return { success: true };
    }

    const orgId = await getOrgIdForCurrentUser();

    if (field === "logoUrl") {
      await prisma.organization.update({
        where: { id: orgId },
        data: { logoUrl: value },
      });
    } else if (field === "aboutContent") {
      await prisma.organization.update({
        where: { id: orgId },
        data: { description: value },
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
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    if (user.role === "SUPER_ADMIN") {
      await prisma.siteSettings.update({
        where: { id: "global" },
        data: { countdownDate: null },
      });
      revalidatePath("/");
      revalidatePath("/superadmin/settings");
    }
    return { success: true };
  } catch (error) {
    console.error("Reset countdown date error:", error);
    return { success: false, error: "Failed to reset countdown" };
  }
}
