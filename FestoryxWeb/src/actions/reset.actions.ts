"use server";

import { prisma } from "@/lib/prisma";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
import { getPublicIdFromUrl } from "@/lib/utils";

export async function resetSystemAction(confirmationText: string): Promise<ActionResponse> {
  try {
    // Basic verification to prevent accidental destruction
    if (confirmationText !== "RESET SYSTEM FOR NEW YEAR") {
      return { success: false, error: "Incorrect confirmation text." };
    }

    console.log("Starting full system reset...");

    // 1. Delete and clean Cloudinary assets
    try {
      // Clean event banners
      const events = await prisma.event.findMany({ select: { bannerUrl: true } });
      for (const event of events) {
        if (event.bannerUrl && event.bannerUrl.includes("res.cloudinary.com")) {
          const publicId = getPublicIdFromUrl(event.bannerUrl);
          if (publicId) {
            try {
              await deleteFromCloudinary(publicId);
            } catch (e) {
              console.error(`Failed to delete event banner from Cloudinary during reset:`, e);
            }
          }
        }
      }

      // Clean registration payment screenshots
      const registrations = await prisma.registration.findMany({ select: { paymentScreenshot: true } });
      for (const reg of registrations) {
        if (reg.paymentScreenshot && reg.paymentScreenshot.includes("res.cloudinary.com")) {
          const publicId = getPublicIdFromUrl(reg.paymentScreenshot);
          if (publicId) {
            try {
              await deleteFromCloudinary(publicId);
            } catch (e) {
              console.error(`Failed to delete registration screenshot from Cloudinary during reset:`, e);
            }
          }
        }
      }

      // Clean custom settings images (Org Settings QRs and Org Logos)
      const orgs = await prisma.organization.findMany({ select: { logoUrl: true } });
      for (const org of orgs) {
        if (org.logoUrl && org.logoUrl.includes("res.cloudinary.com")) {
          const publicId = getPublicIdFromUrl(org.logoUrl);
          if (publicId) {
            try {
              await deleteFromCloudinary(publicId);
            } catch (e) {
              console.error(`Failed to delete organization logo during reset:`, e);
            }
          }
        }
      }

      const orgSettings = await prisma.orgSettings.findMany({ select: { paymentQrCodeUrl: true } });
      for (const settings of orgSettings) {
        if (settings.paymentQrCodeUrl && settings.paymentQrCodeUrl.includes("res.cloudinary.com")) {
          const publicId = getPublicIdFromUrl(settings.paymentQrCodeUrl);
          if (publicId) {
            try {
              await deleteFromCloudinary(publicId);
            } catch (e) {
              console.error(`Failed to delete payment QR code during reset:`, e);
            }
          }
        }
      }

      // Clean media uploaded in the UploadedMedia table
      const mediaList = await prisma.uploadedMedia.findMany();
      console.log(`Found ${mediaList.length} media files to delete from Cloudinary.`);
      
      for (const media of mediaList) {
        if (media.publicId) {
          try {
            await deleteFromCloudinary(media.publicId);
            console.log(`Deleted Cloudinary asset: ${media.publicId}`);
          } catch (clErr) {
            console.error(`Failed to delete Cloudinary asset ${media.publicId}:`, clErr);
          }
        }
      }
    } catch (mediaErr) {
      console.error("Error reading or deleting uploaded media from Cloudinary during reset:", mediaErr);
    }

    // 2. Clear Database collections
    // Quiz data
    await prisma.quizAnswer.deleteMany();
    await prisma.quizBuzzerEvent.deleteMany();
    await prisma.quizScore.deleteMany();
    await prisma.quizLeaderboardSnapshot.deleteMany();
    await prisma.quizAuditLog.deleteMany();
    await prisma.quizQuestionUsage.deleteMany();
    await prisma.quizParticipant.deleteMany();
    await prisma.quizTeam.deleteMany();
    await prisma.quizQuestionOption.deleteMany();
    await prisma.quizQuestion.deleteMany();
    await prisma.quizRound.deleteMany();
    await prisma.quizTemplateRound.deleteMany();
    await prisma.quizSession.deleteMany();
    await prisma.quiz.deleteMany();

    // Event & Registration data
    await prisma.submission.deleteMany();
    await prisma.registration.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.eventModule.deleteMany();
    await prisma.event.deleteMany();
    await prisma.formFieldConfig.deleteMany();

    // Org Settings, Members, Organizations
    await prisma.orgSettings.deleteMany();
    await prisma.organizationMember.deleteMany();
    await prisma.organization.deleteMany();

    // Users (except Super Admin)
    await prisma.user.deleteMany({
      where: { role: { not: "SUPER_ADMIN" } },
    });

    // General Collections
    await prisma.auditLog.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.contactMessage.deleteMany();
    await prisma.uploadedMedia.deleteMany();
    await prisma.aboutCard.deleteMany();

    console.log("System reset completed successfully!");

    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/admin/events");
    revalidatePath("/admin/registrations");
    revalidatePath("/admin/payments");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/messages");

    return { success: true };
  } catch (error) {
    console.error("System reset error:", error);
    return { success: false, error: "Failed to perform system reset. Please check database logs." };
  }
}
