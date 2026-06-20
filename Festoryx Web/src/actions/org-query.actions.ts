"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
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

export async function submitOrgQuery(
  orgSlug: string,
  data: { name: string; email: string; subject: string; message: string }
): Promise<ActionResponse> {
  try {
    if (!data.name || !data.email || !data.subject || !data.message) {
      return { success: false, error: "All fields are required." };
    }

    const org = await prisma.organization.findUnique({
      where: { slug: orgSlug },
    });
    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    await prisma.orgQuery.create({
      data: {
        organizationId: org.id,
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    });

    revalidatePath(`/org/${orgSlug}`);
    revalidatePath("/dashboard/messages");
    return { success: true };
  } catch (error: any) {
    console.error("Submit org query error:", error);
    return { success: false, error: error.message || "Failed to submit query" };
  }
}

export async function getOrgQueries(): Promise<any[]> {
  try {
    const orgId = await getOrgIdForCurrentUser();
    return await prisma.orgQuery.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Get org queries error:", error);
    return [];
  }
}

export async function getSuperAdminOrgQueries(): Promise<any[]> {
  try {
    return await prisma.orgQuery.findMany({
      include: {
        organization: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Get superadmin org queries error:", error);
    return [];
  }
}

export async function updateOrgQueryStatus(id: string, status: string): Promise<ActionResponse> {
  try {
    await prisma.orgQuery.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/dashboard/messages");
    revalidatePath("/superadmin/messages");
    return { success: true };
  } catch (error) {
    console.error("Update org query status error:", error);
    return { success: false, error: "Failed to update query status" };
  }
}

export async function deleteOrgQuery(id: string): Promise<ActionResponse> {
  try {
    await prisma.orgQuery.delete({
      where: { id },
    });
    revalidatePath("/dashboard/messages");
    revalidatePath("/superadmin/messages");
    return { success: true };
  } catch (error) {
    console.error("Delete org query error:", error);
    return { success: false, error: "Failed to delete query" };
  }
}
