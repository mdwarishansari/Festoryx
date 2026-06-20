import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

  // 2. Seed Sample Org Owner/Admin User
  const orgAdminEmail = "orgadmin@festoryx.com";
  let orgAdmin = await prisma.user.findUnique({
    where: { email: orgAdminEmail },
  });

  if (!orgAdmin) {
    orgAdmin = await prisma.user.create({
      data: {
        clerkId: "user_org_admin_clerk_placeholder",
        email: orgAdminEmail,
        name: "Festoryx University Organizer",
        role: "ORG_ADMIN",
      },
    });
    console.log(`✅ Org Admin created: ${orgAdminEmail}`);
  } else {
    console.log(`✅ Org Admin already exists: ${orgAdminEmail}`);
  }

  // 3. Seed Sample Organization
  const orgSlug = "festoryx-university";
  let organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        slug: orgSlug,
        name: "Festoryx University",
        type: "college",
        email: "events@festoryx.edu",
        phone: "+91 9876543210",
        state: "Maharashtra",
        city: "Mumbai",
        description: "The official events organization of Festoryx University, facilitating college festivals and hackathons.",
        status: "ACTIVE",
      },
    });
    console.log(`✅ Organization created: ${organization.name}`);
  } else {
    console.log(`✅ Organization already exists: ${organization.name}`);
  }

  // 4. Link Member to Organization
  const existingMember = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: orgAdmin.id,
      },
    },
  });

  if (!existingMember) {
    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: orgAdmin.id,
        role: "OWNER",
      },
    });
    console.log(`✅ Member linked as OWNER to organization`);
  }

  // 5. Create Org Settings
  const existingSettings = await prisma.orgSettings.findUnique({
    where: { organizationId: organization.id },
  });

  if (!existingSettings) {
    await prisma.orgSettings.create({
      data: {
        organizationId: organization.id,
        paymentUpiId: "festoryx@upi",
        paymentInstructions: "Please scan the QR code or pay to the UPI ID: festoryx@upi. Upload the payment proof screenshot with UTR reference number.",
        contactEmail: "events@festoryx.edu",
        contactPhone: "+91 9876543210",
      },
    });
    console.log(`✅ Organization settings created`);
  }

  // 6. Seed default FormFieldConfig (Global default fields)
  const defaultFields = [
    { fieldName: "participantName", label: "Full Name", type: "text", isRequired: true, sortOrder: 1 },
    { fieldName: "email", label: "Email Address", type: "email", isRequired: true, sortOrder: 2 },
    { fieldName: "phone", label: "Phone Number", type: "tel", isRequired: true, sortOrder: 3 },
    { fieldName: "collegeName", label: "College / University", type: "text", isRequired: true, sortOrder: 4 },
    { fieldName: "department", label: "Department", type: "text", isRequired: false, sortOrder: 5 },
    { fieldName: "yearOrSemester", label: "Year / Semester", type: "text", isRequired: false, sortOrder: 6 },
  ];

  const fieldCount = await prisma.formFieldConfig.count({
    where: { organizationId: organization.id },
  });

  if (fieldCount === 0) {
    for (const field of defaultFields) {
      await prisma.formFieldConfig.create({
        data: {
          organizationId: organization.id,
          ...field,
        },
      });
    }
    console.log(`✅ Form field config library seeded for organization`);
  }

  // 7. Seed Sample Events
  const eventCount = await prisma.event.count({
    where: { organizationId: organization.id },
  });

  if (eventCount > 0) {
    console.log(`✅ Events already exist (${eventCount} found)`);
  } else {
    const events = [
      {
        slug: "fast-coding",
        name: "Fast Coding Challenge",
        shortDescription: "Race against time to solve coding problems",
        description: "Put your coding skills to the test in this high-speed programming competition. Solve algorithmic challenges under time pressure and compete for the top spot on the leaderboard.",
        rules: "• Individual participation only\n• 3 coding problems in 90 minutes\n• Languages allowed: C, C++, Java, Python\n• No external resources or AI tools\n• Plagiarism leads to disqualification",
        eligibility: "Open to all undergraduate and postgraduate students",
        format: "Offline",
        participationType: "SOLO" as const,
        minTeamSize: 1,
        maxTeamSize: 1,
        prizeDetails: "🥇 1st Place: ₹5,000\n🥈 2nd Place: ₹3,000\n🥉 3rd Place: ₹2,000",
        venue: "Computer Lab, Block A",
        registrationFee: 100,
        isPublished: true,
        isRegistrationOpen: true,
        sortOrder: 1,
        organizationId: organization.id,
        visibility: "PUBLIC" as const,
      },
      {
        slug: "quiz",
        name: "Tech Quiz Championship",
        shortDescription: "Test your knowledge across tech domains",
        description: "A thrilling quiz competition covering programming, computer science fundamentals, current tech trends, and general knowledge. Teams compete in multiple rounds with increasing difficulty.",
        rules: "• Teams of 2 members\n• 3 rounds: MCQ, Rapid Fire, Buzzer Round\n• No mobile phones during the quiz\n• Judges' decision is final",
        eligibility: "Open to all undergraduate and postgraduate students",
        format: "Offline",
        participationType: "TEAM" as const,
        minTeamSize: 2,
        maxTeamSize: 2,
        prizeDetails: "🥇 1st Place: ₹4,000\n🥈 2nd Place: ₹2,500\n🥉 3rd Place: ₹1,500",
        venue: "Seminar Hall, Block B",
        registrationFee: 80,
        isPublished: true,
        isRegistrationOpen: true,
        sortOrder: 2,
        organizationId: organization.id,
        visibility: "PUBLIC" as const,
      },
      {
        slug: "ui-ux",
        name: "UI/UX Design Sprint",
        shortDescription: "Design stunning user interfaces and experiences",
        description: "Showcase your design thinking skills in this creative competition. You'll receive a problem statement and have to design a complete UI/UX solution using any design tool of your choice.",
        rules: "• Individual or team (max 2)\n• Design tools: Figma, Adobe XD, or Sketch\n• Problem statement revealed at the start\n• 4 hours to complete the design\n• Present your design to the judges",
        eligibility: "Open to all students with basic design knowledge",
        format: "Hybrid",
        participationType: "BOTH" as const,
        minTeamSize: 1,
        maxTeamSize: 2,
        prizeDetails: "🥇 1st Place: ₹5,000\n🥈 2nd Place: ₹3,000\n🥉 3rd Place: ₹2,000",
        venue: "Design Lab, Block C",
        registrationFee: 150,
        isPublished: true,
        isRegistrationOpen: true,
        sortOrder: 3,
        organizationId: organization.id,
        visibility: "PUBLIC" as const,
      },
      {
        slug: "hackathon",
        name: "24-Hour Hackathon",
        shortDescription: "Build innovative solutions in 24 hours",
        description: "The flagship event of Festoryx! Form a team, pick a problem statement, and build a working prototype in 24 hours. This is where ideas become reality. Food and refreshments provided.",
        rules: "• Teams of 3-5 members\n• Problem statements released 30 min after start\n• Any tech stack allowed\n• Must have a working demo at the end\n• Code must be original (no pre-built projects)\n• Participants must stay in the venue",
        eligibility: "Open to all undergraduate and postgraduate students",
        format: "Offline",
        participationType: "TEAM" as const,
        minTeamSize: 3,
        maxTeamSize: 5,
        prizeDetails: "🥇 1st Place: ₹15,000\n🥈 2nd Place: ₹10,000\n🥉 3rd Place: ₹5,000\n⭐ Best Innovation: ₹3,000",
        venue: "Innovation Center, Main Building",
        registrationFee: 250,
        isPublished: true,
        isRegistrationOpen: true,
        sortOrder: 4,
        organizationId: organization.id,
        visibility: "PUBLIC" as const,
        problemSummary: "Build solutions for real-world problems in Education, Healthcare, or Sustainability domains.",
      },
    ];

    for (const event of events) {
      await prisma.event.create({ data: event });
    }
    console.log(`✅ ${events.length} sample events created`);
  }

  // 8. Seed Email Templates
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

  // 9. Seed About Cards
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
