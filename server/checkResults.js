import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Check completed elections
    const completedElections = await prisma.eLECTION.findMany({
      where: {
        Status: 'Completed'
      },
      select: {
        Election_id: true,
        Title: true,
        Status: true,
        Start_date: true,
        End_date: true
      }
    });

    console.log("=== COMPLETED ELECTIONS ===");
    console.log(JSON.stringify(completedElections, null, 2));

    // Check if there are any results
    const results = await prisma.rESULT.findMany({
      include: {
        candidate: {
          select: {
            Can_name: true,
            Position: true
          }
        },
        election: {
          select: {
            Title: true
          }
        }
      }
    });

    console.log("\n=== RESULTS IN DATABASE ===");
    console.log(JSON.stringify(results, null, 2));

    // Check all elections
    const allElections = await prisma.eLECTION.findMany({
      select: {
        Election_id: true,
        Title: true,
        Status: true,
        Start_date: true,
        End_date: true
      }
    });

    console.log("\n=== ALL ELECTIONS ===");
    console.log(JSON.stringify(allElections, null, 2));

    // Check votes
    const votes = await prisma.vOTE.findMany({
      select: {
        Vote_id: true,
        Can_id: true,
        Election_id: true,
        Std_id: true
      }
    });

    console.log("\n=== VOTES IN DATABASE ===");
    console.log(JSON.stringify(votes, null, 2));

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
