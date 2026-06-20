"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";
import { serializePrisma } from "@/lib/utils";
import type { RegistrationFilters } from "@/types";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

async function verifySuperAdmin() {
  const user = await getCurrentUser();
  if (!user || !isSuperAdmin(user)) {
    throw new Error("Unauthorized: Restricted to Super Admins only");
  }
  return user;
}

export async function getSuperAdminStats() {
  await verifySuperAdmin();
  try {
    const [
      totalOrgs,
      pendingOrgs,
      activeOrgs,
      suspendedOrgs,
      totalEvents,
      totalRegistrations,
      pendingPayments,
      approvedPayments
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { status: "PENDING_VERIFICATION" } }),
      prisma.organization.count({ where: { status: "ACTIVE" } }),
      prisma.organization.count({ where: { OR: [{ status: "SUSPENDED" }, { status: "REJECTED" }] } }),
      prisma.event.count(),
      prisma.registration.count(),
      prisma.registration.count({ where: { paymentStatus: "PENDING" } }),
      prisma.registration.count({ where: { paymentStatus: "APPROVED" } }),
    ]);

    return {
      totalOrgs,
      pendingOrgs,
      activeOrgs,
      suspendedOrgs,
      totalEvents,
      totalRegistrations,
      pendingPayments,
      approvedPayments,
    };
  } catch (error) {
    console.error("Error fetching superadmin stats:", error);
    return {
      totalOrgs: 0,
      pendingOrgs: 0,
      activeOrgs: 0,
      suspendedOrgs: 0,
      totalEvents: 0,
      totalRegistrations: 0,
      pendingPayments: 0,
      approvedPayments: 0,
    };
  }
}

export async function getSuperAdminEvents() {
  await verifySuperAdmin();
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
        _count: { select: { registrations: true } },
      },
    });
    return serializePrisma(events);
  } catch (error) {
    console.error("Error fetching superadmin events:", error);
    return [];
  }
}

export async function getSuperAdminRegistrations(filters: RegistrationFilters = {}) {
  await verifySuperAdmin();
  try {
    const { eventId, paymentStatus, status, search, page = 1, pageSize = ITEMS_PER_PAGE } = filters;

    const where: Prisma.RegistrationWhereInput = {};

    if (eventId) where.eventId = eventId;
    if (paymentStatus) where.paymentStatus = paymentStatus as Prisma.EnumPaymentStatusFilter;
    if (status) where.status = status as Prisma.EnumRegistrationStatusFilter;
    if (search) {
      where.OR = [
        { participantName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { registrationId: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        include: { event: true, teamMembers: true, organization: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.registration.count({ where }),
    ]);

    return {
      registrations: serializePrisma(registrations),
      total,
      pages: Math.ceil(total / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching superadmin registrations:", error);
    return {
      registrations: [],
      total: 0,
      pages: 0,
      currentPage: filters.page || 1,
    };
  }
}

export async function getSuperAdminPendingPayments() {
  await verifySuperAdmin();
  try {
    const payments = await prisma.registration.findMany({
      where: { paymentStatus: "PENDING" },
      include: { event: true, organization: true },
      orderBy: { createdAt: "asc" },
    });
    return serializePrisma(payments);
  } catch (error) {
    console.error("Error fetching superadmin pending payments:", error);
    return [];
  }
}

export async function getSuperAdminPaymentStats() {
  await verifySuperAdmin();
  try {
    const [pending, approved, rejected] = await Promise.all([
      prisma.registration.count({ where: { paymentStatus: "PENDING" } }),
      prisma.registration.count({ where: { paymentStatus: "APPROVED" } }),
      prisma.registration.count({ where: { paymentStatus: "REJECTED" } }),
    ]);
    return { pending, approved, rejected, total: pending + approved + rejected };
  } catch (error) {
    console.error("Error fetching superadmin payment stats:", error);
    return { pending: 0, approved: 0, rejected: 0, total: 0 };
  }
}

export async function getSuperAdminWinners() {
  await verifySuperAdmin();
  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { winner1Id: { not: null } },
          { winner2Id: { not: null } },
          { winner3Id: { not: null } },
        ],
      },
      include: {
        winner1: true,
        winner2: true,
        winner3: true,
        organization: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    return serializePrisma(events);
  } catch (error) {
    console.error("Error fetching superadmin winners:", error);
    return [];
  }
}

export async function getSuperAdminEventsPaginated(page = 1, pageSize = 10) {
  await verifySuperAdmin();
  try {
    const skip = (page - 1) * pageSize;
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          organization: {
            select: {
              name: true,
              slug: true,
            },
          },
          _count: { select: { registrations: true } },
        },
        skip,
        take: pageSize,
      }),
      prisma.event.count(),
    ]);
    return {
      events: serializePrisma(events),
      total,
      pages: Math.ceil(total / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching superadmin events paginated:", error);
    return {
      events: [],
      total: 0,
      pages: 0,
      currentPage: page,
    };
  }
}
