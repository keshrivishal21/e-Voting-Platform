import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testQueries() {
  try {
    const studentCount = await prisma.sTUDENT.count();
    console.log("Total Students:", studentCount);
    
    const students = await prisma.sTUDENT.findMany({
      take: 5,
      select: {
        Std_id: true,
        Std_name: true,
        Std_email: true,
      },
    });
    console.log("Sample Students:", students);
    
    const electionCount = await prisma.eLECTION.count();
    console.log("Total Elections:", electionCount);
    
    const candidateCount = await prisma.cANDIDATE.count();
    console.log("Total Candidates:", candidateCount);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testQueries();
