"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Organization } from "@prisma/client";
import { sendEmail, getOrganizationApprovedEmail, getOrganizationRejectedEmail } from "@/lib/email";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { getPublicIdFromUrl } from "@/lib/utils";

function normalizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (trimmed === "") return "";
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export async function createOrganization(data: {
  name: string;
  type: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  description: string;
  logoUrl?: string;
  logoPublicId?: string;
  websiteUrl?: string;
  socialLinks?: any;
}): Promise<Organization> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Enforce V1 Ownership Rule: one Clerk user may own only one organization
  const existingMember = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });
  if (existingMember) {
    throw new Error("You already belong to or own an organization.");
  }

  // Generate unique slug
  const baseSlug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const organization = await prisma.$transaction(async (tx) => {
    // Create organization
    const org = await tx.organization.create({
      data: {
        slug,
        name: data.name,
        type: data.type,
        email: data.email,
        phone: data.phone,
        state: data.state,
        city: data.city,
        description: data.description,
        logoUrl: data.logoUrl,
        logoPublicId: data.logoPublicId,
        websiteUrl: normalizeUrl(data.websiteUrl),
        socialLinks: data.socialLinks || {},
        status: "PENDING_VERIFICATION",
      },
    });

    // Create member as OWNER
    await tx.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: "OWNER",
      },
    });

    // Create default org settings
    await tx.orgSettings.create({
      data: {
        organizationId: org.id,
      },
    });

    // Write audit log
    await tx.auditLog.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        action: "CREATE_ORGANIZATION",
        details: { name: org.name, slug: org.slug },
      },
    });

    return org;
  });

  revalidatePath("/dashboard");
  return organization;
}

export async function updateOrganization(
  orgId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    state?: string;
    city?: string;
    description?: string;
    logoUrl?: string;
    logoPublicId?: string;
    websiteUrl?: string;
    socialLinks?: any;
    paymentQrCodeUrl?: string;
    paymentQrPublicId?: string;
    paymentUpiId?: string;
    paymentInstructions?: string;
  }
): Promise<Organization> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Verify membership
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: user.id,
      },
    },
  });

  if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
    throw new Error("Unauthorized: Must be an Org Admin or Owner");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Update org details
    const org = await tx.organization.update({
      where: { id: orgId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        state: data.state,
        city: data.city,
        description: data.description,
        logoUrl: data.logoUrl,
        logoPublicId: data.logoPublicId,
        websiteUrl: data.websiteUrl !== undefined ? normalizeUrl(data.websiteUrl) : undefined,
        socialLinks: data.socialLinks,
      },
    });

    // Update settings if settings fields are provided
    if (
      data.paymentQrCodeUrl !== undefined ||
      data.paymentQrPublicId !== undefined ||
      data.paymentUpiId !== undefined ||
      data.paymentInstructions !== undefined ||
      data.email !== undefined ||
      data.phone !== undefined ||
      data.socialLinks !== undefined
    ) {
      await tx.orgSettings.upsert({
        where: { organizationId: orgId },
        update: {
          paymentQrCodeUrl: data.paymentQrCodeUrl,
          paymentQrPublicId: data.paymentQrPublicId,
          paymentUpiId: data.paymentUpiId,
          paymentInstructions: data.paymentInstructions,
          contactEmail: data.email,
          contactPhone: data.phone,
          socialLinks: data.socialLinks,
        },
        create: {
          organizationId: orgId,
          paymentQrCodeUrl: data.paymentQrCodeUrl,
          paymentQrPublicId: data.paymentQrPublicId,
          paymentUpiId: data.paymentUpiId,
          paymentInstructions: data.paymentInstructions,
          contactEmail: data.email,
          contactPhone: data.phone,
          socialLinks: data.socialLinks,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        organizationId: orgId,
        userId: user.id,
        action: "UPDATE_ORGANIZATION",
      },
    });

    return org;
  });

  revalidatePath("/dashboard/organization");
  return result;
}

export async function getUserOrganizations() {
  const user = await getCurrentUser();
  if (!user) return [];

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    include: {
      organization: {
        include: {
          settings: true,
        },
      },
    },
  });

  return memberships.map((m) => m.organization);
}

export async function approveOrganization(orgId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !isSuperAdmin(user)) throw new Error("Unauthorized");

  const org = await prisma.organization.update({
    where: { id: orgId },
    data: { status: "ACTIVE", statusNote: null },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: orgId,
      userId: user.id,
      action: "APPROVE_ORGANIZATION",
    },
  });

  // Fetch owner member's details
  const ownerMember = await prisma.organizationMember.findFirst({
    where: { organizationId: orgId, role: "OWNER" },
    include: { user: true },
  });

  const recipientEmail = ownerMember?.user.email || org.email;
  const adminName = ownerMember?.user.name || "Organizer";
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://festoryx.vercel.app"}/dashboard`;

  try {
    const { subject, html } = await getOrganizationApprovedEmail({
      adminName,
      organizationName: org.name,
      dashboardUrl,
    });
    await sendEmail({
      to: recipientEmail,
      subject,
      html,
    });
  } catch (emailError) {
    console.error("Failed to send organization approved email:", emailError);
  }

  revalidatePath("/admin/organizations");
}

export async function rejectOrganization(orgId: string, note: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !isSuperAdmin(user)) throw new Error("Unauthorized");

  const org = await prisma.organization.update({
    where: { id: orgId },
    data: { status: "REJECTED", statusNote: note },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: orgId,
      userId: user.id,
      action: "REJECT_ORGANIZATION",
      details: { note },
    },
  });

  // Fetch owner member's details
  const ownerMember = await prisma.organizationMember.findFirst({
    where: { organizationId: orgId, role: "OWNER" },
    include: { user: true },
  });

  const recipientEmail = ownerMember?.user.email || org.email;
  const adminName = ownerMember?.user.name || "Organizer";

  try {
    const { subject, html } = await getOrganizationRejectedEmail({
      adminName,
      organizationName: org.name,
      reason: note,
    });
    await sendEmail({
      to: recipientEmail,
      subject,
      html,
    });
  } catch (emailError) {
    console.error("Failed to send organization rejected email:", emailError);
  }

  revalidatePath("/admin/organizations");
}

export async function suspendOrganization(orgId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !isSuperAdmin(user)) throw new Error("Unauthorized");

  await prisma.organization.update({
    where: { id: orgId },
    data: { status: "SUSPENDED" },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: orgId,
      userId: user.id,
      action: "SUSPEND_ORGANIZATION",
    },
  });

  revalidatePath("/admin/organizations");
}

export async function requestChanges(orgId: string, note: string): Promise<Organization> {
  const user = await getCurrentUser();
  if (!user || !isSuperAdmin(user)) throw new Error("Unauthorized");

  const org = await prisma.organization.update({
    where: { id: orgId },
    data: { status: "NEEDS_REVIEW", statusNote: note },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: orgId,
      userId: user.id,
      action: "REQUEST_CHANGES",
      details: { note },
    },
  });

  revalidatePath("/admin/organizations");
  return org;
}

export async function deleteOrganization(orgId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !isSuperAdmin(user)) throw new Error("Unauthorized");

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  });

  if (!org) throw new Error("Organization not found");

  // Cleanup Cloudinary uploads first
  await cleanupCloudinaryAssets(orgId);

  await prisma.organization.delete({
    where: { id: orgId },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "DELETE_ORGANIZATION",
      details: { organizationName: org.name, orgId },
    },
  });

  revalidatePath("/superadmin/organizations");
  revalidatePath("/superadmin");
  revalidatePath("/admin/organizations");
}

async function cleanupCloudinaryAssets(orgId: string) {
  try {
    // 1. Get org logo
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { settings: true },
    });
    if (org?.logoPublicId) {
      await deleteFromCloudinary(org.logoPublicId);
    } else if (org?.logoUrl) {
      const publicId = getPublicIdFromUrl(org.logoUrl);
      if (publicId) await deleteFromCloudinary(publicId);
    }

    // 2. Get org settings QR code
    if (org?.settings?.paymentQrCodeUrl) {
      const publicId = getPublicIdFromUrl(org.settings.paymentQrCodeUrl);
      if (publicId) await deleteFromCloudinary(publicId);
    }

    // 3. Get all events banners
    const events = await prisma.event.findMany({
      where: { organizationId: orgId },
      select: { bannerUrl: true },
    });
    for (const event of events) {
      if (event.bannerUrl) {
        const publicId = getPublicIdFromUrl(event.bannerUrl);
        if (publicId) await deleteFromCloudinary(publicId);
      }
    }

    // 4. Get all registration payment screenshots
    const registrations = await prisma.registration.findMany({
      where: { organizationId: orgId },
      select: { paymentScreenshot: true },
    });
    for (const reg of registrations) {
      if (reg.paymentScreenshot) {
        const publicId = getPublicIdFromUrl(reg.paymentScreenshot);
        if (publicId) await deleteFromCloudinary(publicId);
      }
    }
  } catch (error) {
    console.error("Error during Cloudinary assets cleanup for organization deletion:", error);
  }
}

export async function requestOrgDeletionOTP(orgId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Verify ownership
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: user.id,
      },
    },
  });
  if (!member || member.role !== "OWNER") {
    throw new Error("Only the organization owner can request deletion.");
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store OTP
  await prisma.otpVerification.upsert({
    where: { email: user.email },
    update: {
      code: otp,
      expiresAt,
    },
    create: {
      email: user.email,
      code: otp,
      expiresAt,
    },
  });

  // Send email
  await sendEmail({
    to: user.email,
    subject: "Festoryx - Confirm Organization Deletion",
    html: `
      <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; background-color: #0c081e; color: #f4f0ff; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #ffffff; font-size: 20px; font-weight: bold; margin-bottom: 16px;">Confirm Deletion Request</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
          You have requested to delete your organization. This action is **permanent** and **irreversible**. All your events, registrations, settings, and linked files will be destroyed.
        </p>
        <div style="margin: 24px 0; padding: 16px; background-color: rgba(255,255,255,0.05); border-radius: 8px; text-align: center;">
          <span style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #9382ff;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #64748b;">
          This OTP code is valid for 10 minutes. If you did not request this, please ignore this email.
        </p>
      </div>
    `,
  });

  return { success: true };
}

export async function confirmOrgDeletion(orgId: string, code: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Verify ownership
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: user.id,
      },
    },
  });
  if (!member || member.role !== "OWNER") {
    throw new Error("Only the organization owner can delete the organization.");
  }

  const otp = await prisma.otpVerification.findUnique({
    where: { email: user.email },
  });

  if (!otp || otp.code !== code || otp.expiresAt < new Date()) {
    throw new Error("Invalid or expired OTP.");
  }

  // Delete OTP verification record
  await prisma.otpVerification.delete({
    where: { email: user.email },
  });

  // Cleanup Cloudinary uploads first
  await cleanupCloudinaryAssets(orgId);

  // Delete organization (which cascades everything else in database)
  await prisma.organization.delete({
    where: { id: orgId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/superadmin");
  revalidatePath("/admin/organizations");

  return { success: true };
}
