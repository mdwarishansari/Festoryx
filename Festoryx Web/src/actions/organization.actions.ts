"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Organization } from "@prisma/client";

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
        websiteUrl: data.websiteUrl,
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
        websiteUrl: data.websiteUrl,
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

  await prisma.organization.update({
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

  revalidatePath("/admin/organizations");
}

export async function rejectOrganization(orgId: string, note: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !isSuperAdmin(user)) throw new Error("Unauthorized");

  await prisma.organization.update({
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
