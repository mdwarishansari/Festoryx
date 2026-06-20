import { prisma } from "@/lib/prisma";

/**
 * Generate a unique registration ID like FESTORYX-TEST-001
 * Uses the event and organization names to generate the ID
 */
export async function generateRegistrationId(eventSlug: string): Promise<string> {
  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    select: {
      id: true,
      name: true,
      organization: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!event) {
    throw new Error(`Event not found: ${eventSlug}`);
  }

  const count = await prisma.registration.count({
    where: { eventId: event.id },
  });

  const orgNameClean = event.organization.name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 12);
    
  const eventNameClean = event.name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 12);

  const sequenceNumber = String(count + 1).padStart(3, "0");
  return `${orgNameClean}-${eventNameClean}-${sequenceNumber}`;
}
