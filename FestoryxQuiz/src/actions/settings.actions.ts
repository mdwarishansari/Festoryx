"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";

async function getOrgIdForCurrentUser(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const member = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  let orgId = member?.organizationId;
  const isSuper = isSuperAdmin(user);

  if (!orgId && isSuper) {
    const firstOrg = await prisma.organization.findFirst();
    if (firstOrg) orgId = firstOrg.id;
  }

  if (!orgId) {
    throw new Error("No organization found for user");
  }

  if (!isSuper) {
    const settings = await prisma.orgSettings.findUnique({
      where: { organizationId: orgId },
    });

    if (!settings || !settings.showQuiz) {
      throw new Error("Quiz Arena is not enabled for your organization.");
    }
  }

  return orgId;
}
export async function getSettings(): Promise<any | null> {
  try {
    let siteSettings = await prisma.siteSettings.findUnique({
      where: { id: "global" },
    });
    if (!siteSettings) {
      siteSettings = await prisma.siteSettings.create({
        data: {
          id: "global",
          siteName: "Festoryx",
          eventTitle: "Festoryx Events",
          logoUrl: "/Logo.gif",
          headerLogoUrl: "/Logo.gif",
          footerLogoUrl: "/Logo.gif",
          footerText: "© 2026 Festoryx. All rights reserved. Built with ❤️ for live competitions.",
          contactEmail: "contact@festoryx.tech",
          contactPhone: "+91 98765 43210",
          contactAddress: "University Campus",
        }
      });
    }

    let socketUrl = "";
    try {
      const orgId = await getOrgIdForCurrentUser();
      const orgSettings = await prisma.orgSettings.findUnique({
        where: { organizationId: orgId },
      });
      if (orgSettings) {
        const socialLinks = orgSettings.socialLinks as any;
        socketUrl = socialLinks?.socketUrl || "";
      }
    } catch (e) {
      // ignore org error for users without org membership
    }

    return {
      ...siteSettings,
      socketUrl,
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

export async function updateSiteSettingsAction(data: any) {
  try {
    const user = await getCurrentUser();
    if (!user || !isSuperAdmin(user)) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.siteSettings.upsert({
      where: { id: "global" },
      update: {
        siteName: data.siteName || "Festoryx",
        logoUrl: data.logoUrl || null,
        headerLogoUrl: data.headerLogoUrl || null,
        footerLogoUrl: data.footerLogoUrl || null,
        footerText: data.footerText || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        contactAddress: data.contactAddress || null,
      },
      create: {
        id: "global",
        siteName: data.siteName || "Festoryx",
        logoUrl: data.logoUrl || null,
        headerLogoUrl: data.headerLogoUrl || null,
        footerLogoUrl: data.footerLogoUrl || null,
        footerText: data.footerText || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        contactAddress: data.contactAddress || null,
      },
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/admin/settings");

    return { success: true };
  } catch (error) {
    console.error("Failed to save site settings:", error);
    return { success: false, error: "Failed to save settings" };
  }
}
