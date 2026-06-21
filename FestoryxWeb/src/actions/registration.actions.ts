"use server";

import { prisma } from "@/lib/prisma";
import { registrationSchema } from "@/schemas/registration.schema";
import { generateRegistrationId } from "@/lib/registration-id";
import { sendEmail, getRegistrationConfirmationEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import type { ActionResponse, RegistrationFilters } from "@/types";
import { formatDate, getPublicIdFromUrl } from "@/lib/utils";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { Prisma } from "@prisma/client";
import { deleteFromCloudinary } from "@/lib/cloudinary";
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

export async function submitRegistration(
  eventSlug: string,
  formData: Record<string, unknown>,
  paymentScreenshotUrl?: string
): Promise<ActionResponse<{ registrationId: string }>> {
  try {
    const parsed = registrationSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const event = await prisma.event.findUnique({
      where: { slug: eventSlug },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    // Dynamic field validation against database config
    let dbFormFields = await prisma.formFieldConfig.findMany({
      where: { eventId: event.id },
      orderBy: { sortOrder: "asc" },
    });

    if (dbFormFields.length === 0) {
      dbFormFields = await prisma.formFieldConfig.findMany({
        where: {
          organizationId: event.organizationId,
          eventId: null,
        },
        orderBy: { sortOrder: "asc" },
      });
    }

    if (dbFormFields.length === 0) {
      dbFormFields = [
        { id: "f1", fieldName: "participantName", label: "Full Name", type: "text", isRequired: true, isVisible: true },
        { id: "f2", fieldName: "email", label: "Email Address", type: "email", isRequired: true, isVisible: true },
        { id: "f3", fieldName: "phone", label: "Phone Number", type: "tel", isRequired: true, isVisible: true },
        { id: "f4", fieldName: "collegeName", label: "College / University", type: "text", isRequired: true, isVisible: true },
        { id: "f5", fieldName: "department", label: "Department", type: "text", isRequired: false, isVisible: true },
        { id: "f6", fieldName: "yearOrSemester", label: "Year / Semester", type: "text", isRequired: false, isVisible: true },
      ] as any;
    }

    for (const field of dbFormFields) {
      if (!field.isVisible) continue;
      const value = (formData[field.fieldName] as string | undefined)?.trim();

      if (field.isRequired && (!value || value === "")) {
        return { success: false, error: `${field.label} is required.` };
      }

      if (value) {
        if (field.type === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return { success: false, error: `Please enter a valid email address for ${field.label}.` };
          }
        } else if (field.type === "tel") {
          if (value.length < 10 || !/^[0-9+\-\s()]+$/.test(value)) {
            return { success: false, error: `Please enter a valid phone number for ${field.label} (minimum 10 digits).` };
          }
        }
      }
    }

    const isTeamRegistration = event.participationType === "TEAM" ||
      (event.participationType === "BOTH" && parsed.data.teamMembers && parsed.data.teamMembers.length > 0);

    if (isTeamRegistration && (!parsed.data.teamName || parsed.data.teamName.trim() === "")) {
      return { success: false, error: "Team name is required for team registration." };
    }

    if (!event.isRegistrationOpen) {
      return { success: false, error: "Registration is closed for this event" };
    }

    if (event.lastRegistrationDate && new Date() > event.lastRegistrationDate) {
      return { success: false, error: "Registration deadline has passed" };
    }

    // Check for duplicate registration
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        email: parsed.data.email,
        eventId: event.id,
      },
    });

    if (existingRegistration) {
      return { success: false, error: "You have already registered for this event" };
    }

    const registrationId = await generateRegistrationId(eventSlug);

    const standardKeys = [
      "participantName",
      "email",
      "phone",
      "collegeName",
      "department",
      "yearOrSemester",
      "teamName",
      "paymentReference",
      "notes",
      "teamMembers",
    ];

    const customFields: Record<string, any> = {};
    for (const key of Object.keys(parsed.data)) {
      if (!standardKeys.includes(key)) {
        customFields[key] = (parsed.data as any)[key];
      }
    }

    const registration = await prisma.registration.create({
      data: {
        registrationId,
        eventId: event.id,
        organizationId: event.organizationId,
        participantName: parsed.data.participantName || "",
        email: parsed.data.email || "",
        phone: parsed.data.phone || "",
        collegeName: parsed.data.collegeName || "",
        department: parsed.data.department || null,
        yearOrSemester: parsed.data.yearOrSemester || null,
        teamName: parsed.data.teamName || null,
        paymentReference: parsed.data.paymentReference || null,
        paymentScreenshot: paymentScreenshotUrl || null,
        paymentAmount: event.registrationFee
          ? event.feePerParticipant
            ? new Prisma.Decimal(Number(event.registrationFee) * (1 + (parsed.data.teamMembers?.length || 0)))
            : event.registrationFee
          : null,
        notes: parsed.data.notes || null,
        status: "SUBMITTED",
        paymentStatus: event.registrationFee ? "PENDING" : "APPROVED",
        customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
        teamMembers: parsed.data.teamMembers?.length
          ? {
              create: parsed.data.teamMembers.map((member) => ({
                name: member.name,
                email: member.email || null,
                phone: member.phone || null,
                collegeName: member.collegeName || null,
                department: member.department || null,
                yearOrSemester: member.yearOrSemester || null,
                role: member.role || "Member",
              })),
            }
          : undefined,
      },
    });

    // Send confirmation email (non-blocking)
    try {
      const emailContent = await getRegistrationConfirmationEmail({
        participantName: registration.participantName,
        eventName: event.name,
        registrationId,
        paymentStatus: event.registrationFee ? "PENDING" : "APPROVED",
        eventDate: event.eventDate ? formatDate(event.eventDate) : undefined,
      });

      await sendEmail({
        to: registration.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    revalidatePath("/dashboard/registrations");
    revalidatePath("/dashboard/payments");
    return { success: true, data: { registrationId: registration.registrationId } };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Failed to submit registration. Please try again." };
  }
}

export async function getRegistrations(filters: RegistrationFilters = {}) {
  try {
    const orgId = await getOrgIdForCurrentUser();
    const { eventId, paymentStatus, status, search, token, page = 1, pageSize = ITEMS_PER_PAGE } = filters;

    const where: Prisma.RegistrationWhereInput = {
      organizationId: orgId,
    };

    if (eventId) where.eventId = eventId;
    if (paymentStatus) where.paymentStatus = paymentStatus as Prisma.EnumPaymentStatusFilter;
    if (status) where.status = status as Prisma.EnumRegistrationStatusFilter;
    if (search) {
      where.OR = [
        { participantName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }
    if (token) {
      where.registrationId = { contains: token, mode: "insensitive" };
    }

    const [registrations, total] = await Promise.all([
      prisma.registration.findMany({
        where,
        include: { event: true, teamMembers: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.registration.count({ where }),
    ]);

    return {
      registrations,
      total,
      pages: Math.ceil(total / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.warn("⚠️ [Prisma] Database error in getRegistrations:", error);
    return {
      registrations: [],
      total: 0,
      pages: 0,
      currentPage: filters.page || 1,
    };
  }
}

export async function getRegistrationById(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    
    const isSuper = user.role === "SUPER_ADMIN" || user.email === "warishprojects@gmail.com";
    if (isSuper) {
      return await prisma.registration.findUnique({
        where: { id },
        include: { event: true, teamMembers: true, submission: true },
      });
    }

    const orgId = await getOrgIdForCurrentUser();
    return await prisma.registration.findFirst({
      where: { id, organizationId: orgId },
      include: { event: true, teamMembers: true, submission: true },
    });
  } catch (error) {
    console.warn(`⚠️ [Prisma] Database error in getRegistrationById: ${id}`, error);
    return null;
  }
}

export async function updateRegistrationStatus(
  id: string,
  status: string
): Promise<ActionResponse> {
  try {
    const orgId = await getOrgIdForCurrentUser();

    // Verify ownership
    const existing = await prisma.registration.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      return { success: false, error: "Registration not found or unauthorized" };
    }

    await prisma.registration.update({
      where: { id },
      data: { status: status as any },
    });

    revalidatePath("/dashboard/registrations");
    return { success: true };
  } catch (error) {
    console.error("Update registration status error:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteRegistration(id: string): Promise<ActionResponse> {
  try {
    const orgId = await getOrgIdForCurrentUser();

    // Verify ownership
    const existing = await prisma.registration.findFirst({
      where: { id, organizationId: orgId },
      select: { paymentScreenshot: true },
    });
    if (!existing) {
      return { success: false, error: "Registration not found or unauthorized" };
    }

    if (existing.paymentScreenshot) {
      const publicId = getPublicIdFromUrl(existing.paymentScreenshot);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
          await prisma.uploadedMedia.deleteMany({ where: { publicId } });
        } catch (cloudinaryError) {
          console.error(`Failed to delete Cloudinary receipt for registration ${id}:`, cloudinaryError);
        }
      }
    }

    await prisma.registration.delete({ where: { id } });

    revalidatePath("/dashboard/registrations");
    revalidatePath("/dashboard/payments");
    return { success: true };
  } catch (error) {
    console.error("Delete registration error:", error);
    return { success: false, error: "Failed to delete registration" };
  }
}
