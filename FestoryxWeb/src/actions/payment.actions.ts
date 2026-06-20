"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail, getPaymentApprovedEmail, getPaymentRejectedEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";

export async function verifyPayment(
  registrationId: string,
  status: "APPROVED" | "REJECTED",
  notes?: string
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const registration = await prisma.registration.findUnique({
      where: { id: registrationId },
      include: { event: true },
    });

    if (!registration) {
      return { success: false, error: "Registration not found" };
    }

    const isSuper = isSuperAdmin(user);
    if (!isSuper) {
      const member = await prisma.organizationMember.findFirst({
        where: { userId: user.id, organizationId: registration.organizationId },
      });
      if (!member) {
        return { success: false, error: "Unauthorized" };
      }
    }

    if (status === "REJECTED" && (!notes || notes.trim() === "")) {
      return { success: false, error: "Rejection notes are required to reject payment." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.registration.update({
        where: { id: registrationId },
        data: {
          paymentStatus: status,
          paymentNotes: notes || null,
          paymentVerifiedAt: new Date(),
          status: status === "APPROVED" ? "APPROVED" : "REJECTED",
        },
      });

      await tx.auditLog.create({
        data: {
          organizationId: registration.organizationId,
          userId: user.id,
          action: status === "APPROVED" ? "PAYMENT_APPROVED" : "PAYMENT_REJECTED",
          entityType: "payment",
          entityId: registration.id,
          details: {
            registrationId: registration.registrationId,
            reference: registration.paymentReference,
            notes: notes || undefined,
          },
        },
      });
    });

    // Send email notification (non-blocking)
    try {
      if (status === "APPROVED") {
        const emailContent = await getPaymentApprovedEmail({
          participantName: registration.participantName,
          eventName: registration.event.name,
          registrationId: registration.registrationId,
        });
        await sendEmail({
          to: registration.email,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      } else {
        const emailContent = await getPaymentRejectedEmail({
          participantName: registration.participantName,
          eventName: registration.event.name,
          registrationId: registration.registrationId,
          reason: notes,
        });
        await sendEmail({
          to: registration.email,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      }
    } catch (emailError) {
      console.error("Failed to send payment email:", emailError);
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin/registrations");
    return { success: true };
  } catch (error) {
    console.error("Verify payment error:", error);
    return { success: false, error: "Failed to verify payment" };
  }
}

export async function getPendingPayments(orgId?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const isSuper = isSuperAdmin(user);
    let targetOrgId = orgId;

    if (!isSuper) {
      const member = await prisma.organizationMember.findFirst({
        where: { userId: user.id },
      });
      if (!member) throw new Error("Unauthorized");
      targetOrgId = member.organizationId;
    }

    if (!targetOrgId) {
      return await prisma.registration.findMany({
        where: { paymentStatus: "PENDING" },
        include: { event: true, organization: true },
        orderBy: { createdAt: "asc" },
      });
    }

    return await prisma.registration.findMany({
      where: {
        paymentStatus: "PENDING",
        organizationId: targetOrgId,
      },
      include: { event: true },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.warn("⚠️ [Prisma] Database error in getPendingPayments:", error);
    return [];
  }
}

export async function getPaymentStats(orgId?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const isSuper = isSuperAdmin(user);
    let targetOrgId = orgId;

    if (!isSuper) {
      const member = await prisma.organizationMember.findFirst({
        where: { userId: user.id },
      });
      if (!member) throw new Error("Unauthorized");
      targetOrgId = member.organizationId;
    }

    const where: any = targetOrgId ? { organizationId: targetOrgId } : {};

    const [pending, approved, rejected] = await Promise.all([
      prisma.registration.count({ where: { ...where, paymentStatus: "PENDING" } }),
      prisma.registration.count({ where: { ...where, paymentStatus: "APPROVED" } }),
      prisma.registration.count({ where: { ...where, paymentStatus: "REJECTED" } }),
    ]);

    return { pending, approved, rejected, total: pending + approved + rejected };
  } catch (error) {
    console.warn("⚠️ [Prisma] Database error in getPaymentStats:", error);
    return { pending: 0, approved: 0, rejected: 0, total: 0 };
  }
}
