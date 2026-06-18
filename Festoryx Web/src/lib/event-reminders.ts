import { prisma } from "@/lib/prisma";
import { sendEmail, getEventReminderEmail } from "@/lib/email";

export async function runEventReminders() {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Find events happening within the next 24 hours that are published
  const events = await prisma.event.findMany({
    where: {
      isPublished: true,
      eventDate: {
        gte: now,
        lte: next24Hours,
      },
    },
    include: {
      organization: true,
    },
  });

  console.log(`[Event Reminders] Found ${events.length} events scheduled in the next 24 hours.`);

  for (const event of events) {
    // Check if reminder was already sent for this event (prevent duplicate alerts)
    const existingLog = await prisma.auditLog.findFirst({
      where: {
        action: "EVENT_REMINDER_SENT",
        entityType: "event",
        entityId: event.id,
      },
    });

    if (existingLog) {
      console.log(`[Event Reminders] Reminder already sent for event "${event.name}" (ID: ${event.id}). Skipping.`);
      continue;
    }

    // Fetch all approved registrations
    const registrations = await prisma.registration.findMany({
      where: {
        eventId: event.id,
        status: "APPROVED",
      },
    });

    console.log(`[Event Reminders] Sending reminders to ${registrations.length} approved participants for "${event.name}".`);

    for (const reg of registrations) {
      try {
        const formattedDate = event.eventDate
          ? event.eventDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "TBA";

        const { subject, html } = await getEventReminderEmail({
          participantName: reg.participantName,
          eventName: event.name,
          registrationId: reg.registrationId,
          eventDate: formattedDate,
          venue: event.venue || "To Be Announced",
        });

        await sendEmail({
          to: reg.email,
          subject,
          html,
        });
      } catch (error) {
        console.error(`[Event Reminders] Failed to send reminder email to ${reg.email} for event "${event.name}":`, error);
      }
    }

    // Record audit log to signify that reminders were successfully sent
    await prisma.auditLog.create({
      data: {
        organizationId: event.organizationId,
        action: "EVENT_REMINDER_SENT",
        entityType: "event",
        entityId: event.id,
        details: {
          eventName: event.name,
          recipientCount: registrations.length,
        },
      },
    });

    console.log(`[Event Reminders] Finished sending reminders and logged audit trail for event "${event.name}".`);
  }
}
