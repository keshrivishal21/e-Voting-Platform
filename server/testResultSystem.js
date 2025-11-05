import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testResultDeclarationProcess() {
  console.log("=".repeat(70));
  console.log("TESTING RESULT DECLARATION PROCESS");
  console.log("=".repeat(70));

  try {
    // 1. Check current elections
    console.log("\n1. CURRENT ELECTIONS:");
    const elections = await prisma.eLECTION.findMany({
      select: {
        Election_id: true,
        Title: true,
        Status: true,
        Start_date: true,
        End_date: true
      }
    });
    
    elections.forEach(e => {
      console.log(`   - ID: ${e.Election_id}, Title: "${e.Title}", Status: ${e.Status}`);
      console.log(`     Start: ${e.Start_date.toLocaleString()}`);
      console.log(`     End: ${e.End_date.toLocaleString()}`);
      
      const now = new Date();
      if (now > e.End_date && e.Status !== 'Completed') {
        console.log(`     ⚠️  Election should be completed! Current time: ${now.toLocaleString()}`);
      } else if (now > e.End_date) {
        console.log(`     ✅ Election properly completed`);
      } else {
        const timeLeft = e.End_date - now;
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        console.log(`     ⏰ Time remaining: ${hoursLeft}h ${minutesLeft}m`);
      }
    });

    // 2. Check candidates
    console.log("\n2. CANDIDATES IN ELECTIONS:");
    const candidates = await prisma.cANDIDATE.findMany({
      select: {
        Can_id: true,
        Can_name: true,
        Position: true,
        Election_id: true,
        Status: true
      }
    });
    
    if (candidates.length === 0) {
      console.log("   ⚠️  No candidates found!");
    } else {
      candidates.forEach(c => {
        console.log(`   - ${c.Can_name} (ID: ${c.Can_id})`);
        console.log(`     Position: ${c.Position}, Election: ${c.Election_id}, Status: ${c.Status}`);
      });
    }

    // 3. Check votes
    console.log("\n3. VOTES CAST:");
    const voteCount = await prisma.vOTE.count();
    console.log(`   Total votes: ${voteCount}`);
    
    if (voteCount > 0) {
      const votesByCandidateRaw = await prisma.vOTE.groupBy({
        by: ['Can_id'],
        _count: {
          Vote_id: true
        }
      });

      // Get candidate names
      for (const v of votesByCandidateRaw) {
        const candidate = await prisma.cANDIDATE.findUnique({
          where: { Can_id: v.Can_id },
          select: { Can_name: true, Position: true }
        });
        console.log(`   - Candidate ${v.Can_id} (${candidate?.Can_name || 'Unknown'} - ${candidate?.Position || 'Unknown'}): ${v._count.Vote_id} votes`);
      }
    }

    // 4. Check results table
    console.log("\n4. RESULTS IN DATABASE:");
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
            Title: true,
            Status: true
          }
        }
      }
    });

    if (results.length === 0) {
      console.log("   ⚠️  No results declared yet!");
      console.log("   💡 Results will be declared automatically when election ends,");
      console.log("      or can be triggered manually by admin.");
    } else {
      results.forEach(r => {
        console.log(`   - ${r.candidate.Can_name} (${r.candidate.Position})`);
        console.log(`     Election: "${r.election.Title}" (${r.election.Status})`);
        console.log(`     Votes: ${r.Vote_count}`);
      });
    }

    // 5. Test API endpoint simulation
    console.log("\n5. SIMULATING API RESPONSE:");
    const completedElections = await prisma.eLECTION.findMany({
      where: { Status: 'Completed' },
      select: {
        Election_id: true,
        Title: true,
        Start_date: true,
        End_date: true,
        Status: true
      }
    });

    if (completedElections.length === 0) {
      console.log("   ℹ️  No completed elections - API would return empty array");
    } else {
      console.log(`   ✅ ${completedElections.length} completed election(s) found`);
      
      for (const election of completedElections) {
        const electionResults = await prisma.rESULT.findMany({
          where: { Election_id: election.Election_id },
          include: {
            candidate: {
              select: {
                Can_id: true,
                Can_name: true,
                Can_email: true,
                Position: true,
                Branch: true,
                Year: true,
                Profile_pic: true
              }
            }
          },
          orderBy: { Vote_count: 'desc' }
        });

        console.log(`\n   Election: "${election.Title}"`);
        
        // Group by position
        const byPosition = {};
        electionResults.forEach(r => {
          if (!byPosition[r.candidate.Position]) {
            byPosition[r.candidate.Position] = [];
          }
          byPosition[r.candidate.Position].push({
            name: r.candidate.Can_name,
            votes: r.Vote_count,
            isWinner: byPosition[r.candidate.Position].length === 0
          });
        });

        Object.entries(byPosition).forEach(([position, candidates]) => {
          console.log(`   ${position}:`);
          candidates.forEach((c, idx) => {
            const medal = idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
            console.log(`     ${medal} ${c.name}: ${c.votes} votes${c.isWinner ? ' (WINNER)' : ''}`);
          });
        });
      }
    }

    // 6. Scheduler check
    console.log("\n6. SCHEDULER STATUS:");
    const now = new Date();
    const upcomingToStart = await prisma.eLECTION.count({
      where: {
        Status: 'Upcoming',
        Start_date: { lte: now }
      }
    });

    const ongoingToEnd = await prisma.eLECTION.count({
      where: {
        Status: 'Ongoing',
        End_date: { lte: now }
      }
    });

    if (upcomingToStart > 0) {
      console.log(`   ⚠️  ${upcomingToStart} election(s) should be started by scheduler!`);
    }
    if (ongoingToEnd > 0) {
      console.log(`   ⚠️  ${ongoingToEnd} election(s) should be ended and results declared!`);
    }
    if (upcomingToStart === 0 && ongoingToEnd === 0) {
      console.log(`   ✅ No pending scheduler actions`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("SUMMARY:");
    console.log("=".repeat(70));
    console.log(`Elections: ${elections.length} total, ${elections.filter(e => e.Status === 'Completed').length} completed`);
    console.log(`Candidates: ${candidates.length}`);
    console.log(`Votes: ${voteCount}`);
    console.log(`Results declared: ${results.length > 0 ? 'Yes' : 'No'}`);
    
    if (results.length === 0 && voteCount > 0 && elections.some(e => e.Status === 'Ongoing' && now > e.End_date)) {
      console.log("\n⚠️  ACTION NEEDED: Scheduler should end election and declare results!");
    } else if (elections.some(e => e.Status === 'Completed') && results.length === 0) {
      console.log("\n⚠️  WARNING: Election is completed but no results declared!");
    } else if (elections.every(e => e.Status !== 'Completed')) {
      console.log("\n✅ Status: Waiting for election to complete");
    } else if (results.length > 0) {
      console.log("\n✅ Status: Results successfully declared!");
    }

  } catch (error) {
    console.error("\n❌ ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testResultDeclarationProcess();
