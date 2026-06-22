const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    include: {
      modules: true,
      organization: {
        include: {
          settings: true,
          members: {
            include: {
              user: true
            }
          }
        }
      }
    }
  });
  console.log("EVENTS IN DB:", JSON.stringify(events, null, 2));
}

main().catch(console.error);
