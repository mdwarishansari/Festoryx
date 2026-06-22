"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
import { getCurrentUser } from "@/lib/auth";

async function verifySessionAccess(sessionId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const member = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  const session = await prisma.quizSession.findUnique({
    where: { id: sessionId },
    include: { quiz: true },
  });

  if (!session) throw new Error("Session not found");

  const isSuperAdmin = user.role === "SUPER_ADMIN" || user.email === "warishprojects@gmail.com";
  if (!isSuperAdmin && (!member || member.organizationId !== session.quiz.organizationId)) {
    throw new Error("Unauthorized");
  }

  const settings = await prisma.orgSettings.findUnique({
    where: { organizationId: session.quiz.organizationId },
  });

  if (!settings || !settings.showQuiz) {
    throw new Error("Quiz Arena is not enabled for this organization.");
  }
}

export async function adjustParticipantScore(
  sessionId: string,
  participantId: string,
  pointsDelta: number,
  note?: string
): Promise<ActionResponse> {
  try {
    await verifySessionAccess(sessionId);
    await prisma.$transaction(async (tx) => {
      // Log manual correction record
      await tx.quizScore.create({
        data: {
          sessionId,
          participantId,
          points: pointsDelta,
          isManualCorrection: true,
          note: note || "Manual score adjustment",
        },
      });

      // Atomically update participant aggregate score
      const p = await tx.quizParticipant.update({
        where: { id: participantId },
        data: {
          totalScore: {
            increment: pointsDelta,
          },
        },
        select: { teamId: true },
      });

      // Update team aggregate score if team exists
      if (p.teamId) {
        await tx.quizTeam.update({
          where: { id: p.teamId },
          data: {
            totalScore: {
              increment: pointsDelta,
            },
          },
        });
      }
    });

    revalidatePath(`/admin/sessions/${sessionId}`);
    revalidatePath(`/admin/sessions`);
    return { success: true };
  } catch (error) {
    console.error("Score correction failed:", error);
    return { success: false, error: "Failed to apply score adjustment" };
  }
}
