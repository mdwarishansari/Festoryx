import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanupCloudinaryAssets } from "@/actions/organization.actions";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.warn("⚠️ CLERK_WEBHOOK_SECRET is not set. Webhook verification is bypassed in development.");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: any;

  // Verify the payload if secret is set
  if (WEBHOOK_SECRET) {
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Error occured -- no svix headers", {
        status: 400,
      });
    }

    const wh = new Webhook(WEBHOOK_SECRET);

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as any;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occured during verification", {
        status: 400,
      });
    }
  } else {
    // In development fallback, parse payload directly
    evt = payload;
  }

  const eventType = evt.type;
  console.log(`[Clerk Webhook] Received event of type: ${eventType}`);

  if (eventType === "user.deleted") {
    const clerkId = evt.data.id;

    if (!clerkId) {
      return NextResponse.json({ error: "Missing Clerk User ID" }, { status: 400 });
    }

    try {
      // Find the user in our database
      const dbUser = await prisma.user.findUnique({
        where: { clerkId },
      });

      if (!dbUser) {
        console.warn(`[Clerk Webhook] User with clerkId ${clerkId} not found in DB.`);
        return NextResponse.json({ success: true, message: "User not found in DB, skipping." });
      }

      console.log(`[Clerk Webhook] Cleaning up data for user ${dbUser.name} (${dbUser.email})...`);

      // 1. Find all organizations where this user is OWNER
      const memberships = await prisma.organizationMember.findMany({
        where: {
          userId: dbUser.id,
          role: "OWNER",
        },
      });

      console.log(`[Clerk Webhook] Found ${memberships.length} owned organization(s) to delete.`);

      // 2. Cascade delete organizations & clear their Cloudinary assets
      for (const member of memberships) {
        console.log(`[Clerk Webhook] Deleting organization ${member.organizationId}...`);
        await cleanupCloudinaryAssets(member.organizationId);
        
        await prisma.organization.delete({
          where: { id: member.organizationId },
        });
      }

      // 3. Delete the user (which deletes the rest via DB cascades)
      await prisma.user.delete({
        where: { id: dbUser.id },
      });

      console.log(`[Clerk Webhook] User ${dbUser.name} successfully deleted.`);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error("[Clerk Webhook] Error cleaning up user data:", error);
      return NextResponse.json({ error: error.message || "Failed to cleanup user data" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
