"use server";

import { prisma } from "@/lib/prisma";
import { eventSchema, type EventFormData } from "@/schemas/event.schema";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
import type { Event, EventVisibility, ModuleType } from "@prisma/client";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { getPublicIdFromUrl, serializePrisma } from "@/lib/utils";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";

async function getOrgIdForCurrentUser(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const member = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  if (!member) throw new Error("No organization found for user");
  return member.organizationId;
}

export async function createEvent(data: EventFormData): Promise<ActionResponse<Event>> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    const orgId = await getOrgIdForCurrentUser();

    const parsed = eventSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const existing = await prisma.event.findUnique({
      where: { slug: parsed.data.slug },
    });

    if (existing) {
      return { success: false, error: "An event with this slug already exists" };
    }

    // Extract modules and formFields from formData
    const { modules, formFields, ...eventData } = parsed.data;

    const event = await prisma.$transaction(async (tx) => {
      // Create Event
      const evt = await tx.event.create({
        data: {
          ...eventData,
          registrationFee: eventData.registrationFee ?? undefined,
          organizationId: orgId,
          visibility: (eventData.visibility as EventVisibility) || "PUBLIC",
        },
      });

      // Save Module Toggles
      if (modules && modules.length > 0) {
        await tx.eventModule.createMany({
          data: modules.map((m) => ({
            eventId: evt.id,
            module: m as ModuleType,
            enabled: true,
          })),
        });
      }

      // Save Form Field Configuration Toggles
      if (formFields && formFields.length > 0) {
        await tx.formFieldConfig.createMany({
          data: formFields.map((field, index) => ({
            eventId: evt.id,
            organizationId: orgId,
            fieldName: field.fieldName,
            label: field.label,
            type: field.type,
            isRequired: field.isRequired,
            isVisible: field.isVisible,
            sortOrder: field.sortOrder ?? index,
          })),
        });
      }

      // Write Audit Log
      await tx.auditLog.create({
        data: {
          organizationId: orgId,
          userId: user.id,
          action: "EVENT_CREATED",
          entityType: "event",
          entityId: evt.id,
          details: { name: evt.name, slug: evt.slug },
        },
      });

      return evt;
    });

    revalidatePath("/dashboard/events");
    revalidatePath("/events");
    return { success: true, data: serializePrisma(event) };
  } catch (error: any) {
    console.error("Create event error:", error);
    return { success: false, error: error.message || "Failed to create event" };
  }
}

export async function updateEvent(id: string, data: EventFormData): Promise<ActionResponse<Event>> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const isSuper = isSuperAdmin(user);
    const orgId = !isSuper ? await getOrgIdForCurrentUser() : "";

    const parsed = eventSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // Verify ownership
    const currentEvent = await prisma.event.findFirst({
      where: isSuper ? { id } : { id, organizationId: orgId },
      select: { bannerUrl: true },
    });
    if (!currentEvent) {
      return { success: false, error: "Event not found or unauthorized" };
    }

    const existing = await prisma.event.findFirst({
      where: { slug: parsed.data.slug, NOT: { id } },
    });

    if (existing) {
      return { success: false, error: "An event with this slug already exists" };
    }

    // Cloudinary Banner Cleanup
    if (
      currentEvent.bannerUrl &&
      parsed.data.bannerUrl &&
      currentEvent.bannerUrl !== parsed.data.bannerUrl &&
      currentEvent.bannerUrl.includes("res.cloudinary.com")
    ) {
      const publicId = getPublicIdFromUrl(currentEvent.bannerUrl);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
          console.log(`[Cloudinary] Deleted old event banner: ${publicId}`);
        } catch (err) {
          console.error(`[Cloudinary] Failed to delete old banner:`, err);
        }
      }
    }

    const { modules, formFields, ...eventData } = parsed.data;

    const event = await prisma.$transaction(async (tx) => {
      const evt = await tx.event.update({
        where: { id },
        data: {
          ...eventData,
          registrationFee: eventData.registrationFee ?? undefined,
          visibility: (eventData.visibility as EventVisibility) || "PUBLIC",
        },
      });

      // Update modules: delete existing and create new ones (or sync)
      await tx.eventModule.deleteMany({
        where: { eventId: id },
      });

      if (modules && modules.length > 0) {
        await tx.eventModule.createMany({
          data: modules.map((m) => ({
            eventId: id,
            module: m as ModuleType,
            enabled: true,
          })),
        });
      }

      // Update Form Fields: delete existing and create new ones
      await tx.formFieldConfig.deleteMany({
        where: { eventId: id },
      });

      if (formFields && formFields.length > 0) {
        await tx.formFieldConfig.createMany({
          data: formFields.map((field, index) => ({
            eventId: id,
            organizationId: evt.organizationId,
            fieldName: field.fieldName,
            label: field.label,
            type: field.type,
            isRequired: field.isRequired,
            isVisible: field.isVisible,
            sortOrder: field.sortOrder ?? index,
          })),
        });
      }

      // Write Audit Log
      await tx.auditLog.create({
        data: {
          organizationId: evt.organizationId,
          userId: user.id,
          action: "EVENT_UPDATED",
          entityType: "event",
          entityId: evt.id,
          details: { name: evt.name, slug: evt.slug },
        },
      });

      return evt;
    });

    revalidatePath("/dashboard/events");
    revalidatePath(`/dashboard/events/${id}`);
    revalidatePath("/events");
    revalidatePath(`/events/${event.slug}`);
    return { success: true, data: serializePrisma(event) };
  } catch (error: any) {
    console.error("Update event error:", error);
    return { success: false, error: error.message || "Failed to update event" };
  }
}

export async function deleteEvent(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const isSuper = isSuperAdmin(user);
    const orgId = !isSuper ? await getOrgIdForCurrentUser() : "";

    // Verify ownership
    const existing = await prisma.event.findFirst({
      where: isSuper ? { id } : { id, organizationId: orgId },
      select: { bannerUrl: true, name: true, slug: true, organizationId: true },
    });
    if (!existing) {
      return { success: false, error: "Event not found or unauthorized" };
    }

    const registrationCount = await prisma.registration.count({
      where: { eventId: id },
    });

    if (registrationCount > 0) {
      return {
        success: false,
        error: `Cannot delete event because it has ${registrationCount} active registrations. Please delete all registrations for this event first.`,
      };
    }

    if (existing.bannerUrl) {
      const publicId = getPublicIdFromUrl(existing.bannerUrl);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
          await prisma.uploadedMedia.deleteMany({ where: { publicId } });
        } catch (cloudinaryError) {
          console.error(`Failed to delete Cloudinary banner for event ${id}:`, cloudinaryError);
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      // Write audit log
      await tx.auditLog.create({
        data: {
          organizationId: existing.organizationId,
          userId: user.id,
          action: "EVENT_DELETED",
          entityType: "event",
          entityId: id,
          details: { name: existing.name, slug: existing.slug },
        },
      });

      // Delete event
      await tx.event.delete({ where: { id } });
    });

    revalidatePath("/dashboard/events");
    revalidatePath("/events");
    return { success: true };
  } catch (error: any) {
    console.error("Delete event error:", error);
    return { success: false, error: error.message || "Failed to delete event" };
  }
}

export async function toggleEventPublish(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const isSuper = isSuperAdmin(user);
    const orgId = !isSuper ? await getOrgIdForCurrentUser() : "";

    const event = await prisma.event.findFirst({
      where: isSuper ? { id } : { id, organizationId: orgId }
    });
    if (!event) return { success: false, error: "Event not found or unauthorized" };

    await prisma.event.update({
      where: { id },
      data: { isPublished: !event.isPublished },
    });

    revalidatePath("/dashboard/events");
    revalidatePath("/events");
    return { success: true };
  } catch (error: any) {
    console.error("Toggle publish error:", error);
    return { success: false, error: error.message || "Failed to toggle publish status" };
  }
}

export async function toggleEventRegistration(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const isSuper = isSuperAdmin(user);
    const orgId = !isSuper ? await getOrgIdForCurrentUser() : "";

    const event = await prisma.event.findFirst({
      where: isSuper ? { id } : { id, organizationId: orgId }
    });
    if (!event) return { success: false, error: "Event not found or unauthorized" };

    await prisma.event.update({
      where: { id },
      data: { isRegistrationOpen: !event.isRegistrationOpen },
    });

    revalidatePath("/dashboard/events");
    revalidatePath("/events");
    return { success: true };
  } catch (error: any) {
    console.error("Toggle registration error:", error);
    return { success: false, error: error.message || "Failed to toggle registration status" };
  }
}

export async function getEvents() {
  try {
    const orgId = await getOrgIdForCurrentUser();
    return await prisma.event.findMany({
      where: { organizationId: orgId },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { registrations: true } },
        modules: true,
      },
    });
  } catch (error) {
    console.warn("⚠️ [Prisma] Database error in getEvents:", error);
    return [];
  }
}

export async function getPublishedEvents(organizationId?: string) {
  try {
    return await prisma.event.findMany({
      where: {
        isPublished: true,
        visibility: "PUBLIC",
        organizationId: organizationId || undefined,
      },
      orderBy: { sortOrder: "asc" },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });
  } catch (error) {
    console.warn("⚠️ [Prisma] Database error in getPublishedEvents:", error);
    return [];
  }
}

export async function getEventBySlug(slug: string) {
  try {
    return await prisma.event.findUnique({
      where: { slug },
      include: {
        winner1: true,
        winner2: true,
        winner3: true,
        modules: true,
        formFields: {
          orderBy: { sortOrder: "asc" },
        },
        organization: {
          select: {
            name: true,
            slug: true,
            settings: true,
          },
        },
      },
    });
  } catch (error) {
    console.warn(`⚠️ [Prisma] Database error in getEventBySlug for: ${slug}`, error);
    return null;
  }
}

export async function getEventById(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const isSuper = isSuperAdmin(user);
    const orgId = !isSuper ? await getOrgIdForCurrentUser() : "";

    return await prisma.event.findFirst({
      where: isSuper ? { id } : { id, organizationId: orgId },
      include: {
        _count: { select: { registrations: true } },
        modules: true,
        formFields: true,
      },
    });
  } catch (error) {
    console.warn(`⚠️ [Prisma] Database error in getEventById for: ${id}`, error);
    return null;
  }
}
