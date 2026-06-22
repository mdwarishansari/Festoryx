"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";

async function verifyQuizAccess(quizId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const isSuper = isSuperAdmin(user);
  if (isSuper) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });
    if (!quiz) throw new Error("Quiz not found");
    return;
  }

  const member = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });
  if (!member) throw new Error("Unauthorized");

  const settings = await prisma.orgSettings.findUnique({
    where: { organizationId: member.organizationId },
  });

  if (!settings || !settings.showQuiz) {
    throw new Error("Quiz Arena is not enabled for your organization.");
  }

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, organizationId: member.organizationId },
  });
  if (!quiz) throw new Error("Quiz not found or unauthorized");
}

async function verifyTemplateRoundAccess(roundId: string): Promise<string> {
  const round = await prisma.quizTemplateRound.findUnique({
    where: { id: roundId },
  });
  if (!round) throw new Error("Template round not found");
  await verifyQuizAccess(round.quizId);
  return round.quizId;
}

export async function getTemplateRounds(quizId: string): Promise<any[]> {
  try {
    await verifyQuizAccess(quizId);
    return await prisma.quizTemplateRound.findMany({
      where: { quizId },
      orderBy: { roundNumber: "asc" },
    });
  } catch (error) {
    console.error("Failed to get template rounds:", error);
    return [];
  }
}

export async function createTemplateRound(
  quizId: string,
  data: {
    roundNumber: number;
    title: string;
    type: "MCQ" | "BUZZER" | "HAND_RAISE" | "RAPID_FIRE" | "TEAM_ANSWER" | "PASS_TO_MEMBER" | "PASS_ROUND";
    timeLimit: number;
    pointsPerQuestion: number;
    settings?: any;
  }
): Promise<ActionResponse<string>> {
  try {
    await verifyQuizAccess(quizId);
    const round = await prisma.quizTemplateRound.create({
      data: {
        quizId,
        roundNumber: data.roundNumber,
        title: data.title,
        type: data.type,
        timeLimit: data.timeLimit,
        pointsPerQuestion: data.pointsPerQuestion,
        settings: data.settings || {},
      },
    });

    revalidatePath(`/admin/quizzes/${quizId}`);
    return { success: true, data: round.id };
  } catch (error) {
    console.error("Failed to create template round:", error);
    return { success: false, error: "Failed to create template round" };
  }
}

export async function updateTemplateRound(
  roundId: string,
  data: {
    roundNumber?: number;
    title?: string;
    type?: "MCQ" | "BUZZER" | "HAND_RAISE" | "RAPID_FIRE" | "TEAM_ANSWER" | "PASS_TO_MEMBER" | "PASS_ROUND";
    timeLimit?: number;
    pointsPerQuestion?: number;
    settings?: any;
  }
): Promise<ActionResponse> {
  try {
    const quizId = await verifyTemplateRoundAccess(roundId);
    const round = await prisma.quizTemplateRound.update({
      where: { id: roundId },
      data: {
        roundNumber: data.roundNumber,
        title: data.title,
        type: data.type,
        timeLimit: data.timeLimit,
        pointsPerQuestion: data.pointsPerQuestion,
        settings: data.settings,
      },
    });

    revalidatePath(`/admin/quizzes/${round.quizId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update template round:", error);
    return { success: false, error: "Failed to update template round" };
  }
}

export async function deleteTemplateRound(roundId: string): Promise<ActionResponse> {
  try {
    const quizId = await verifyTemplateRoundAccess(roundId);
    const round = await prisma.quizTemplateRound.findUnique({
      where: { id: roundId },
      select: { quizId: true },
    });

    if (!round) {
      return { success: false, error: "Round not found" };
    }

    // Set any questions linked to this template round to null
    await prisma.quizQuestion.updateMany({
      where: { templateRoundId: roundId },
      data: { templateRoundId: null },
    });

    await prisma.quizTemplateRound.delete({
      where: { id: roundId },
    });

    revalidatePath(`/admin/quizzes/${round.quizId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete template round:", error);
    return { success: false, error: "Failed to delete template round" };
  }
}
