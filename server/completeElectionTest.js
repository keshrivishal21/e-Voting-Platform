import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function manuallyCompleteElectionForTesting() {
  console.log("=".repeat(70));
  console.log("MANUAL TEST: Completing Election and Declaring Results");
  console.log("=".repeat(70));

  try {
    // 1. Get the ongoing election
    const ongoingElection = await prisma.eLECTION.findFirst({
      where: { Status: 'Ongoing' }
    });

    if (!ongoingElection) {
      console.log("❌ No ongoing election found!");
      return;
    }

    console.log(`\n📋 Found election: "${ongoingElection.Title}" (ID: ${ongoingElection.Election_id})`);
    console.log(`   Current Status: ${ongoingElection.Status}`);

    // 2. Check votes
    const votes = await prisma.vOTE.findMany({
      where: { Election_id: ongoingElection.Election_id },
      include: {
        candidate: {
          select: {
            Can_name: true,
            Position: true
          }
        }
      }
    });

    console.log(`\n📊 Votes cast: ${votes.length}`);
    if (votes.length === 0) {
      console.log("⚠️  No votes cast yet! Results will be empty.");
    } else {
      const voteCount = new Map();
      votes.forEach(v => {
        const key = v.Can_id.toString();
        voteCount.set(key, (voteCount.get(key) || 0) + 1);
      });

      console.log("   Vote breakdown:");
      voteCount.forEach((count, candidateId) => {
        const vote = votes.find(v => v.Can_id.toString() === candidateId);
        console.log(`   - ${vote.candidate.Can_name} (${vote.candidate.Position}): ${count} vote(s)`);
      });
    }

    // 3. Complete the election
    console.log(`\n🔄 Changing election status to "Completed"...`);
    await prisma.eLECTION.update({
      where: { Election_id: ongoingElection.Election_id },
      data: { Status: 'Completed' }
    });
    console.log("✅ Election status updated!");

    // 4. Manually declare results (simulating scheduler)
    if (votes.length > 0) {
      console.log(`\n🎯 Declaring results...`);

      // Count votes by candidate
      const voteCounts = new Map();
      votes.forEach(vote => {
        const candidateId = vote.Can_id.toString();
        voteCounts.set(candidateId, (voteCounts.get(candidateId) || 0) + 1);
      });

      // Get unique candidates
      const candidateIds = [...new Set(votes.map(v => v.Can_id))];

      // Get admin
      const admin = await prisma.aDMIN.findFirst();
      const adminId = admin?.Admin_id || 1;

      // Create results
      for (const candidateId of candidateIds) {
        const voteCount = voteCounts.get(candidateId.toString()) || 0;

        await prisma.rESULT.upsert({
          where: {
            Election_id_Can_id: {
              Election_id: ongoingElection.Election_id,
              Can_id: candidateId
            }
          },
          update: {
            Vote_count: voteCount
          },
          create: {
            Can_id: candidateId,
            Election_id: ongoingElection.Election_id,
            Vote_count: voteCount,
            Admin_id: adminId
          }
        });

        const candidate = votes.find(v => v.Can_id === candidateId)?.candidate;
        console.log(`   ✅ Result saved: ${candidate?.Can_name} - ${voteCount} vote(s)`);
      }

      console.log("✅ All results declared!");
    }

    // 5. Verify results
    console.log(`\n📈 Fetching declared results...`);
    const results = await prisma.rESULT.findMany({
      where: { Election_id: ongoingElection.Election_id },
      include: {
        candidate: {
          select: {
            Can_name: true,
            Position: true,
            Branch: true,
            Year: true,
            Can_email: true
          }
        }
      },
      orderBy: { Vote_count: 'desc' }
    });

    if (results.length === 0) {
      console.log("⚠️  No results found!");
    } else {
      // Group by position
      const byPosition = {};
      results.forEach(r => {
        if (!byPosition[r.candidate.Position]) {
          byPosition[r.candidate.Position] = [];
        }
        byPosition[r.candidate.Position].push({
          name: r.candidate.Can_name,
          email: r.candidate.Can_email,
          branch: r.candidate.Branch,
          year: r.candidate.Year,
          votes: r.Vote_count
        });
      });

      Object.entries(byPosition).forEach(([position, candidates]) => {
        console.log(`\n   ${position}:`);
        candidates.forEach((c, idx) => {
          const rank = idx + 1;
          const medal = rank === 1 ? '🏆' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  ';
          console.log(`   ${medal} #${rank} ${c.name}`);
          console.log(`        Email: ${c.email}`);
          console.log(`        ${c.branch} - Year ${c.year}`);
          console.log(`        Votes: ${c.votes}`);
        });
      });
    }

    // 6. Test API response
    console.log(`\n🌐 Simulating API call to GET /api/election/results...`);
    const apiResponse = await prisma.eLECTION.findMany({
      where: { Status: 'Completed' },
      select: {
        Election_id: true,
        Title: true,
        Start_date: true,
        End_date: true
      }
    });

    if (apiResponse.length === 0) {
      console.log("❌ API would return no completed elections!");
    } else {
      console.log(`✅ API would return ${apiResponse.length} completed election(s):`);
      apiResponse.forEach(e => {
        console.log(`   - "${e.Title}" (ID: ${e.Election_id})`);
      });
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ TEST COMPLETE!");
    console.log("=".repeat(70));
    console.log("\n💡 Next steps:");
    console.log("   1. Open frontend Results page");
    console.log("   2. Results should now be visible");
    console.log("   3. Winner will show with profile picture and vote count");

  } catch (error) {
    console.error("\n❌ ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ask for confirmation
console.log("\n⚠️  WARNING: This will complete the ongoing election and declare results!");
console.log("Press Ctrl+C to cancel, or wait 3 seconds to proceed...\n");

setTimeout(() => {
  manuallyCompleteElectionForTesting();
}, 3000);
