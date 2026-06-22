import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed for Festoryx...\n");

  // 1. Seed Super Admin User
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "superadmin@festoryx.com";
  let superAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        clerkId: "user_super_admin_clerk_placeholder",
        email: superAdminEmail,
        name: "Festoryx Super Admin",
        role: "SUPER_ADMIN",
      },
    });
    console.log(`✅ Super Admin created: ${superAdminEmail}`);
  } else {
    console.log(`✅ Super Admin already exists: ${superAdminEmail}`);
  }

  // 2. Seed Email Templates
  const templateCount = await prisma.emailTemplate.count();

  if (templateCount > 0) {
    console.log(`✅ Email templates already exist (${templateCount} found)`);
  } else {
    await prisma.emailTemplate.createMany({
      data: [
        {
          name: "registration_success",
          subject: "Registration Confirmed - {{eventName}} | Festoryx",
          body: "Your registration for {{eventName}} has been submitted successfully. Registration ID: {{registrationId}}",
        },
        {
          name: "payment_approved",
          subject: "Payment Verified - {{eventName}} | Festoryx",
          body: "Your payment for {{eventName}} has been verified and approved. Registration ID: {{registrationId}}",
        },
        {
          name: "payment_rejected",
          subject: "Payment Verification Failed - {{eventName}} | Festoryx",
          body: "Your payment for {{eventName}} could not be verified. Registration ID: {{registrationId}}. Please contact the organizers.",
        },
      ],
    });
    console.log("✅ Email templates created");
  }

  // 3. Seed About Cards
  const aboutCardCount = await prisma.aboutCard.count();
  if (aboutCardCount > 0) {
    console.log(`✅ About cards already exist (${aboutCardCount} found)`);
  } else {
    await prisma.aboutCard.createMany({
      data: [
        {
          iconName: "Target",
          title: "Our Mission",
          description: "To foster technical innovation, creative thinking, and competitive spirit among students through hands-on challenges and live events.",
          sortOrder: 1,
        },
        {
          iconName: "Compass",
          title: "Our Vision",
          description: "To build a vibrant and collaborative tech community where learning meets excitement and technical skills translate to real-world achievements.",
          sortOrder: 2,
        },
        {
          iconName: "Award",
          title: "Core Values",
          description: "Technical excellence, fair competition, student empowerment, and building real-time event technologies that push the boundaries of fun.",
          sortOrder: 3,
        },
      ],
    });
    console.log("✅ Default about cards seeded");
  }

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
