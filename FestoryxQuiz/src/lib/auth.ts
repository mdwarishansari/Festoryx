import { currentUser, auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { User } from "@prisma/client";

export async function getOrCreateDbUser(): Promise<User | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "User";
  const avatarUrl = clerkUser.imageUrl;
  const isSuperAdminEmail = email === process.env.SUPER_ADMIN_EMAIL || email === process.env.ADMIN_EMAIL || email === "warishprojects@gmail.com";

  const dbUser = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email,
      name,
      avatarUrl,
      role: isSuperAdminEmail ? "SUPER_ADMIN" : undefined,
    },
    create: {
      clerkId: clerkUser.id,
      email,
      name,
      avatarUrl,
      role: isSuperAdminEmail ? "SUPER_ADMIN" : "ORG_ADMIN",
    },
  });

  return dbUser;
}

export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    return getOrCreateDbUser();
  }

  // Update role dynamically if email matches SUPER_ADMIN_EMAIL, ADMIN_EMAIL or warishprojects@gmail.com
  const isSuperAdminEmail = dbUser.email === process.env.SUPER_ADMIN_EMAIL || dbUser.email === process.env.ADMIN_EMAIL || dbUser.email === "warishprojects@gmail.com";
  if (isSuperAdminEmail && dbUser.role !== "SUPER_ADMIN") {
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { role: "SUPER_ADMIN" },
    });
  }

  return dbUser;
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

export function isSuperAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.role === "SUPER_ADMIN" || 
         user.email === process.env.SUPER_ADMIN_EMAIL || 
         user.email === process.env.ADMIN_EMAIL || 
         user.email === "warishprojects@gmail.com";
}
