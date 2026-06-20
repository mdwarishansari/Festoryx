import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function runInactivityChecks() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const inactiveOrgs = await prisma.organization.findMany({
    where: {
      status: "ACTIVE",
      lastActiveAt: {
        lt: sixMonthsAgo,
      },
    },
  });

  console.log(`[Inactivity Checker] Found ${inactiveOrgs.length} inactive organizations.`);

  for (const org of inactiveOrgs) {
    if (org.inactivityReminders < 3) {
      const reminders = org.inactivityReminders + 1;
      await prisma.organization.update({
        where: { id: org.id },
        data: {
          inactivityReminders: reminders,
        },
      });

      // Send email
      await sendEmail({
        to: org.email,
        subject: `[Warning] Your organization "${org.name}" is inactive on Festoryx`,
        html: `
          <h2>Inactivity Warning</h2>
          <p>Hi Admin, your organization <strong>${org.name}</strong> has been inactive for 6 months.</p>
          <p>This is reminder #${reminders} of 3. Please log in and perform an action to keep your account active.</p>
          <p>Thank you, <br/>Festoryx Team</p>
        `,
      });
      console.log(`[Inactivity Checker] Sent reminder #${reminders} to "${org.name}" (${org.email}).`);
    } else {
      // Flag as needs review
      await prisma.organization.update({
        where: { id: org.id },
        data: {
          status: "NEEDS_REVIEW",
          statusNote: "Automatically flagged due to 6+ months of inactivity and 3 reminders sent.",
        },
      });

      await sendEmail({
        to: org.email,
        subject: `[Important] Your organization "${org.name}" has been flagged for review`,
        html: `
          <h2>Account Flagged for Review</h2>
          <p>Hi Admin, because your organization <strong>${org.name}</strong> has remained inactive after 3 warnings, it has been flagged for administrative review.</p>
          <p>Please contact support to restore active status.</p>
          <p>Thank you, <br/>Festoryx Team</p>
        `,
      });
      console.log(`[Inactivity Checker] Flagged "${org.name}" as NEEDS_REVIEW.`);
    }
  }
}
