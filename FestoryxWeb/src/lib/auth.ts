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
  const checkEmail = (email || "").trim().toLowerCase();
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "").trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const fixedEmail = "warishprojects@gmail.com";
  const isSuperAdminEmail = (superAdminEmail !== "" && checkEmail === superAdminEmail) || (adminEmail !== "" && checkEmail === adminEmail) || checkEmail === fixedEmail;

  // Check if a user with same clerkId or email exists to handle seeded placeholder clerkId
  let dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { clerkId: clerkUser.id },
        { email }
      ]
    }
  });

  if (dbUser) {
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        clerkId: clerkUser.id,
        email,
        name,
        avatarUrl,
        role: isSuperAdminEmail ? "SUPER_ADMIN" : dbUser.role,
      }
    });
  } else {
    dbUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name,
        avatarUrl,
        role: isSuperAdminEmail ? "SUPER_ADMIN" : "ORG_ADMIN",
      }
    });
  }

  return dbUser;
}

export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!dbUser) {
    // Falls back to creating/linking user in DB
    return getOrCreateDbUser();
  }

  // Update role dynamically if email matches SUPER_ADMIN_EMAIL, ADMIN_EMAIL or warishprojects@gmail.com
  const checkEmail = (dbUser.email || "").trim().toLowerCase();
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "").trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const fixedEmail = "warishprojects@gmail.com";
  const isSuperAdminEmail = (superAdminEmail !== "" && checkEmail === superAdminEmail) || (adminEmail !== "" && checkEmail === adminEmail) || checkEmail === fixedEmail;
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
    redirect("/sign-in");
  }
  return user;
}

export function isSuperAdmin(user: User | null | undefined): boolean {
  if (!user || !user.email) return false;
  const email = user.email.trim().toLowerCase();
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "").trim().toLowerCase();
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const fixedEmail = "warishprojects@gmail.com";
  return (
    (superAdminEmail !== "" && email === superAdminEmail) ||
    (adminEmail !== "" && email === adminEmail) ||
    email === fixedEmail ||
    user.role === "SUPER_ADMIN"
  );
}
