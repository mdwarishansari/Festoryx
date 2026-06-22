"use server";

import { prisma } from "@/lib/prisma";
import { quizSchema } from "@/schemas/quiz.schema";
import { revalidatePath } from "next/cache";
import type { ActionResponse, QuizWithDetails } from "@/types";
import { getCurrentUser } from "@/lib/auth";

async function getOrgIdForCurrentUser(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const member = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  let orgId = member?.organizationId;

  if (!orgId && (user.role === "SUPER_ADMIN" || user.email === "warishprojects@gmail.com")) {
    const firstOrg = await prisma.organization.findFirst();
    if (firstOrg) orgId = firstOrg.id;
  }

  if (!orgId) {
    throw new Error("No organization found for user");
  }

  const settings = await prisma.orgSettings.findUnique({
    where: { organizationId: orgId },
  });

  if (!settings || !settings.showQuiz) {
    throw new Error("Quiz Arena is not enabled for your organization.");
  }

  return orgId;
}

export async function getQuizzes(): Promise<QuizWithDetails[]> {
  try {
    const orgId = await getOrgIdForCurrentUser();
    return await prisma.quiz.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      include: {
        event: true,
        _count: {
          select: { questions: true, sessions: true },
        },
      },
    }) as QuizWithDetails[];
  } catch (error) {
    console.error("Failed to get quizzes:", error);
    return [];
  }
}

export async function getQuizById(id: string): Promise<any | null> {
  try {
    const orgId = await getOrgIdForCurrentUser();
    return await prisma.quiz.findFirst({
      where: { id, organizationId: orgId },
      include: {
        event: true,
        templateRounds: {
          orderBy: { roundNumber: "asc" },
        },
        questions: {
          orderBy: { sortOrder: "asc" },
          include: {
            options: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        _count: {
          select: { sessions: true },
        },
      },
    });
  } catch (error) {
    console.error(`Failed to get quiz ${id}:`, error);
    return null;
  }
}

export async function createQuiz(data: Record<string, any>): Promise<ActionResponse<string>> {
  try {
    const orgId = await getOrgIdForCurrentUser();
    const parsed = quizSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const quiz = await prisma.quiz.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        eventId: parsed.data.eventId || null,
        mode: parsed.data.mode,
        status: parsed.data.status,
        settings: parsed.data.settings || {},
        organizationId: orgId,
      },
    });

    revalidatePath("/admin/quizzes");
    return { success: true, data: quiz.id };
  } catch (error) {
    console.error("Failed to create quiz:", error);
    return { success: false, error: "Failed to create quiz" };
  }
}

export async function updateQuiz(id: string, data: Record<string, any>): Promise<ActionResponse> {
  try {
    const orgId = await getOrgIdForCurrentUser();
    const parsed = quizSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // Verify ownership
    const existing = await prisma.quiz.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      return { success: false, error: "Quiz not found or unauthorized" };
    }

    await prisma.quiz.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        eventId: parsed.data.eventId || null,
        mode: parsed.data.mode,
        status: parsed.data.status,
        settings: parsed.data.settings || {},
      },
    });

    revalidatePath("/admin/quizzes");
    revalidatePath(`/admin/quizzes/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update quiz:", error);
    return { success: false, error: "Failed to update quiz" };
  }
}

export async function updateQuizStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
): Promise<ActionResponse> {
  try {
    const orgId = await getOrgIdForCurrentUser();
    const existing = await prisma.quiz.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      return { success: false, error: "Quiz not found or unauthorized" };
    }

    await prisma.quiz.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/quizzes");
    revalidatePath(`/admin/quizzes/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update quiz status:", error);
    return { success: false, error: "Failed to update quiz status" };
  }
}

export async function deleteQuiz(id: string): Promise<ActionResponse> {
  try {
    const orgId = await getOrgIdForCurrentUser();
    const existing = await prisma.quiz.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      return { success: false, error: "Quiz not found or unauthorized" };
    }

    await prisma.quiz.delete({
      where: { id },
    });
    revalidatePath("/admin/quizzes");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete quiz:", error);
    return { success: false, error: "Failed to delete quiz. It may be referenced in an active session." };
  }
}
