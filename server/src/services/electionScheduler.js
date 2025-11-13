import { PrismaClient } from "@prisma/client";
import { notifyElectionStarted, notifyElectionEnded, notifyResultsDeclared } from "../utils/notificationHelper.js";

const prisma = new PrismaClient();

let timeoutId = null;
let isRunning = false;
let cleanupTimeouts = new Map(); // Track cleanup timeouts by election ID

// Automatically declare results for a completed election
async function declareElectionResults(electionId, electionTitle) {
  try {
    console.log(`Auto-declaring results for election ${electionId} ("${electionTitle}")...`);

    // Get all votes for this election
    const votes = await prisma.vOTE.findMany({
      where: { Election_id: electionId },
      select: {
        Can_id: true,
        candidate: {
          select: {
            Can_id: true,
            Can_name: true,
            Position: true,
            Status: true
          }
        }
      }
    });

    if (votes.length === 0) {
      console.log(`No votes found for election ${electionId}. Skipping result declaration.`);
      return { success: false, reason: 'no_votes' };
    }

    // Count votes by candidate and group by position
    const voteCounts = new Map();
    const candidatesByPosition = new Map();
    
    votes.forEach(vote => {
      const candidateId = vote.Can_id.toString();
      const position = vote.candidate.Position;
      
      // Count total votes
      voteCounts.set(candidateId, (voteCounts.get(candidateId) || 0) + 1);
      
      // Group by position for tie detection
      if (!candidatesByPosition.has(position)) {
        candidatesByPosition.set(position, new Map());
      }
      const positionCandidates = candidatesByPosition.get(position);
      positionCandidates.set(candidateId, {
        name: vote.candidate.Can_name,
        votes: (positionCandidates.get(candidateId)?.votes || 0) + 1
      });
    });

    // TIE DETECTION: Check if there are ties for any position
    let hasTie = false;
    const tieDetails = [];
    
    candidatesByPosition.forEach((candidates, position) => {
      const candidateArray = Array.from(candidates.entries()).map(([id, data]) => ({
        id,
        name: data.name,
        votes: data.votes
      }));
      
      // Sort by votes descending
      candidateArray.sort((a, b) => b.votes - a.votes);
      
      // Check if top 2 candidates have same votes (tie for winner)
      if (candidateArray.length >= 2 && candidateArray[0].votes === candidateArray[1].votes && candidateArray[0].votes > 0) {
        hasTie = true;
        const tiedCandidates = candidateArray.filter(c => c.votes === candidateArray[0].votes);
        tieDetails.push({
          position,
          votes: candidateArray[0].votes,
          candidates: tiedCandidates.map(c => c.name)
        });
        console.log(`TIE DETECTED for ${position}: ${tiedCandidates.map(c => c.name).join(', ')} (${candidateArray[0].votes} votes each)`);
      }
    });

    // If there's a tie, DO NOT auto-declare results
    if (hasTie) {
      console.log(`AUTO-DECLARATION STOPPED due to ties in ${tieDetails.length} position(s)`);
      console.log(`   Admin must manually review and declare results`);
      
      // Store tie information for admin to see
      // Note: We could create a notification or store this in a separate table
      // For now, we'll just return and let admin manually declare
      
      return { 
        success: false, 
        reason: 'tie_detected',
        ties: tieDetails
      };
    }

    // Get unique candidates from votes
    const candidateIds = [...new Set(votes.map(v => v.Can_id))];
    
    // Get admin ID (use first admin or default to 1)
    const admin = await prisma.aDMIN.findFirst({
      select: { Admin_id: true }
    });
    const adminId = admin?.Admin_id || 1;

    // Create or update results in transaction
    const results = [];
    for (const candidateId of candidateIds) {
      const voteCount = voteCounts.get(candidateId.toString()) || 0;
      
      // Check if result already exists
      const existingResult = await prisma.rESULT.findUnique({
        where: {
          Election_id_Can_id: {
            Election_id: electionId,
            Can_id: candidateId
          }
        }
      });

      if (existingResult) {
        // Update existing result
        const updated = await prisma.rESULT.update({
          where: {
            Election_id_Can_id: {
              Election_id: electionId,
              Can_id: candidateId
            }
          },
          data: {
            Vote_count: voteCount
          }
        });
        results.push(updated);
      } else {
        // Create new result
        const created = await prisma.rESULT.create({
          data: {
            Can_id: candidateId,
            Election_id: electionId,
            Vote_count: voteCount,
            Admin_id: adminId
          }
        });
        results.push(created);
      }
    }

    console.log(`Results auto-declared successfully for election ${electionId}:`);
    console.log(`   - Total votes cast: ${votes.length}`);
    console.log(`   - Results recorded for ${results.length} candidates`);
    
    // Log top candidates by position
    candidatesByPosition.forEach((candidates, position) => {
      const sortedCandidates = Array.from(candidates.values())
        .sort((a, b) => b.votes - a.votes);
      const winner = sortedCandidates[0];
      console.log(`   - ${position}: ${winner.name} (${winner.votes} votes)`);
    });

    // Send notification about results declaration (don't wait for it)
    notifyResultsDeclared(electionTitle, votes.length).catch(err => 
      console.error("Failed to send results declared notification:", err)
    );

    return { success: true, results };
  } catch (error) {
    console.error(`Error declaring results for election ${electionId}:`, error);
    throw error;
  }
}

// Schedule cleanup for a specific election after retention period
// DISABLED: Cleanup functionality disabled to preserve all election data
function scheduleCleanupForElection(electionId, title, endDate) {
  
  return; // Early return - no cleanup scheduled
  
  /* CLEANUP DISABLED - Code preserved for future implementation
  const retentionDays = parseInt(process.env.CANDIDATE_RETENTION_DAYS) || 2;
  const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
  
  const cleanupTime = new Date(endDate.getTime() + retentionMs);
  const now = new Date();
  const delayMs = Math.max(0, cleanupTime.getTime() - now.getTime());
  
  // Cancel any existing cleanup timeout for this election
  if (cleanupTimeouts.has(electionId)) {
    clearTimeout(cleanupTimeouts.get(electionId));
  }
  
  console.log(`Scheduled cleanup for election ${electionId} ("${title}") at ${cleanupTime.toLocaleString()} (in ${Math.round(delayMs / 3600000)} hours)`);
  
  const timeoutRef = setTimeout(async () => {
    console.log(`Running scheduled cleanup for election ${electionId}...`);
    await cleanupSpecificElection(electionId);
    cleanupTimeouts.delete(electionId);
  }, delayMs);
  
  cleanupTimeouts.set(electionId, timeoutRef);
  */
}

// Cleanup candidates from a specific completed election
// DISABLED: Cleanup functionality disabled to preserve all election data
async function cleanupSpecificElection(electionId) {
  
  return;
  
  /* CLEANUP DISABLED - Code preserved for future implementation
  try {
    const election = await prisma.eLECTION.findUnique({
      where: { Election_id: electionId },
      select: {
        Election_id: true,
        Title: true,
        End_date: true,
        Status: true,
        candidates: {
          select: {
            Can_id: true,
            Can_name: true,
            Status: true
          }
        }
      }
    });

    if (!election || election.Status !== "Completed") {
      console.log(`Election ${electionId} is not completed, skipping cleanup`);
      return;
    }

    if (election.candidates.length === 0) {
      console.log(`No candidates to cleanup for election ${electionId}`);
      return;
    }

    console.log(`Cleaning up ${election.candidates.length} candidates from election ${electionId} ("${election.Title}")`);
    
    const candidateIds = election.candidates.map(c => c.Can_id);
    
    await prisma.$transaction(async (tx) => {
      // IMPORTANT: There are foreign key constraints from VOTE -> CANDIDATE
      // and VOTE_RECEIPT -> VOTE. To safely remove candidate records we must
      // delete dependent records in the correct order. Policy chosen here:
      //  - remove vote receipts for votes cast for these candidates
      //  - remove votes for these candidates
      //  - remove results for these candidates
      //  - remove the candidate entries
      //  - remove the user records for these candidates

      // 0. Delete vote receipts for votes belonging to these candidates
      await tx.vOTE_RECEIPT.deleteMany({
        where: {
          vote: {
            Can_id: { in: candidateIds }
          }
        }
      });

      // 1. Delete votes for these candidates
      await tx.vOTE.deleteMany({
        where: {
          Can_id: { in: candidateIds },
          Election_id: electionId
        }
      });

      // 2. Delete results for these candidates
      await tx.rESULT.deleteMany({
        where: {
          Can_id: { in: candidateIds },
          Election_id: electionId
        }
      });

      // 3. Delete candidates
      const deletedCandidates = await tx.cANDIDATE.deleteMany({
        where: {
          Can_id: { in: candidateIds },
          Election_id: electionId
        }
      });

      // 4. Delete USER records for these candidates
      // Remove related user-scoped data that reference USERS (to avoid FK violations)
      await tx.fEEDBACK.deleteMany({
        where: {
          User_id: { in: candidateIds },
          User_type: "Candidate"
        }
      });
      await tx.nOTIFICATION.deleteMany({
        where: {
          User_id: { in: candidateIds },
          User_type: "Candidate"
        }
      });
      await tx.sYSTEM_LOGS.deleteMany({
        where: {
          User_id: { in: candidateIds },
          User_type: "Candidate"
        }
      });

      await tx.uSERS.deleteMany({
        where: {
          User_id: { in: candidateIds },
          User_type: "Candidate"
        }
      });

      console.log(`Deleted ${deletedCandidates.count} candidates from election ${electionId}`);
    });
  } catch (error) {
    console.error(`Failed to cleanup election ${electionId}:`, error);
  }
  */
}

// Cleanup candidates from completed elections after retention period (batch cleanup for existing elections)
// DISABLED: Cleanup functionality disabled to preserve all election data
async function cleanupCompletedElectionCandidates() {
  console.log(`Cleanup disabled - all election data will be preserved`);
  return { electionsProcessed: 0, candidatesDeleted: 0 };
  
  /* CLEANUP DISABLED - Code preserved for future implementation
  try {
    const now = new Date();
    
    // Get retention period from env (default 2 days)
    const retentionDays = parseInt(process.env.CANDIDATE_RETENTION_DAYS) || 2;
    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
    
    // Find completed elections that are past retention period
    const completedElections = await prisma.eLECTION.findMany({
      where: {
        Status: "Completed",
        End_date: {
          lte: new Date(now.getTime() - retentionMs)
        }
      },
      select: {
        Election_id: true,
        Title: true,
        End_date: true,
        candidates: {
          select: {
            Can_id: true,
            Can_name: true,
            Status: true
          }
        }
      }
    });

    let totalDeleted = 0;

    for (const election of completedElections) {
      if (election.candidates.length === 0) continue;

      console.log(`Processing cleanup for election ${election.Election_id} ("${election.Title}") ended on ${election.End_date.toLocaleDateString()}`);
      
      const candidateIds = election.candidates.map(c => c.Can_id);
      
      try {
        // Delete in transaction to maintain referential integrity
        await prisma.$transaction(async (tx) => {
          // NOTE: We must delete dependent records in order to satisfy FK constraints.
          // This removes vote receipts and votes for the candidates, then results,
          // then deletes candidate records and their user accounts.

          // 0. Delete vote receipts for votes belonging to these candidates
          await tx.vOTE_RECEIPT.deleteMany({
            where: {
              vote: {
                Can_id: { in: candidateIds }
              }
            }
          });

          // 1. Delete votes for these candidates
          await tx.vOTE.deleteMany({
            where: {
              Can_id: { in: candidateIds },
              Election_id: election.Election_id
            }
          });

          // 2. Delete results for these candidates
          await tx.rESULT.deleteMany({
            where: {
              Can_id: { in: candidateIds },
              Election_id: election.Election_id
            }
          });

          // 4. Remove related user-scoped data (feedback, notifications, logs) to avoid FK violations
          await tx.fEEDBACK.deleteMany({
            where: {
              User_id: { in: candidateIds },
              User_type: "Candidate"
            }
          });
          await tx.nOTIFICATION.deleteMany({
            where: {
              User_id: { in: candidateIds },
              User_type: "Candidate"
            }
          });
          await tx.sYSTEM_LOGS.deleteMany({
            where: {
              User_id: { in: candidateIds },
              User_type: "Candidate"
            }
          });

          // 5. Delete USER records for these candidates
          await tx.uSERS.deleteMany({
            where: {
              User_id: { in: candidateIds },
              User_type: "Candidate"
            }
          });

          // 4. Delete USER records for these candidates
          await tx.uSERS.deleteMany({
            where: {
              User_id: { in: candidateIds },
              User_type: "Candidate"
            }
          });

          totalDeleted += deletedCandidates.count;

          console.log(`   Deleted ${deletedCandidates.count} candidates from election ${election.Election_id}`);
        });
      } catch (error) {
        console.error(`   Failed to cleanup candidates for election ${election.Election_id}:`, error);
      }
    }

    if (totalDeleted > 0) {
      console.log(`Total candidates cleaned up: ${totalDeleted} from ${completedElections.length} completed elections`);
    } else if (completedElections.length > 0) {
      console.log(`No candidates to cleanup (${completedElections.length} elections checked)`);
    }

    return { electionsProcessed: completedElections.length, candidatesDeleted: totalDeleted };
  } catch (error) {
    console.error("Candidate cleanup error:", error);
    return { electionsProcessed: 0, candidatesDeleted: 0 };
  }
  */
}

// Process elections that need status transitions
async function processElectionTransitions() {
  try {
    const now = new Date();

    // 1) Start elections where Start_date <= now and Status = 'Upcoming'
    const toStart = await prisma.eLECTION.findMany({
      where: {
        Status: "Upcoming",
        Start_date: { lte: now },
      },
    });

    for (const e of toStart) {
      try {
        await prisma.eLECTION.update({
          where: { Election_id: e.Election_id },
          data: { Status: "Ongoing" },
        });
        console.log(`Election ${e.Election_id} ("${e.Title}") started automatically`);
        
        // Send notification about election start (don't wait for it)
        notifyElectionStarted(e.Title, e.End_date).catch(err => 
          console.error("Failed to send election started notification:", err)
        );
      } catch (err) {
        console.error(`Failed to start election ${e.Election_id}:`, err);
      }
    }

    // 2) End elections where End_date <= now and Status = 'Ongoing'
    const toEnd = await prisma.eLECTION.findMany({
      where: {
        Status: "Ongoing",
        End_date: { lte: now },
      },
      select: {
        Election_id: true,
        Title: true,
        End_date: true,
        Auto_declare_results: true
      }
    });

    for (const e of toEnd) {
      try {
        await prisma.eLECTION.update({
          where: { Election_id: e.Election_id },
          data: { Status: "Completed" },
        });
        console.log(`Election ${e.Election_id} ("${e.Title}") ended automatically`);
        
        // Send notification about election end (don't wait for it)
        notifyElectionEnded(e.Title).catch(err => 
          console.error("Failed to send election ended notification:", err)
        );
        
        // Check if auto-declare is enabled for this election
        if (e.Auto_declare_results === true) {
          console.log(`Auto-declare enabled for election ${e.Election_id}, attempting to declare results...`);
          
          // Automatically declare results
          try {
            const result = await declareElectionResults(e.Election_id, e.Title);
            
            if (result && result.success === false) {
              if (result.reason === 'tie_detected') {
                console.log(`Results NOT auto-declared due to tie(s) - Admin must manually declare`);
                console.log(`   Tied positions: ${result.ties.map(t => t.position).join(', ')}`);
              } else if (result.reason === 'no_votes') {
                console.log(`Results NOT declared - No votes cast`);
              }
            } else {
              console.log(`Results auto-declared successfully for election ${e.Election_id}`);
            }
          } catch (resultError) {
            console.error(`Failed to declare results for election ${e.Election_id}, but election still marked as completed:`, resultError);
          }
        } else {
          console.log(`Auto-declare DISABLED for election ${e.Election_id} - Admin must manually declare results`);
        }
        
        // Schedule cleanup for this election after retention period
        scheduleCleanupForElection(e.Election_id, e.Title, e.End_date);
      } catch (err) {
        console.error(`Failed to end election ${e.Election_id}:`, err);
      }
    }

    return { started: toStart.length, ended: toEnd.length };
  } catch (error) {
    console.error("Election scheduler error:", error);
    return { started: 0, ended: 0 };
  }
}

// Calculate the next time the scheduler needs to run
async function calculateNextRunTime() {
  try {
    const now = new Date();

    // Find the earliest upcoming start date
    const nextToStart = await prisma.eLECTION.findFirst({
      where: {
        Status: "Upcoming",
        Start_date: { gt: now },
      },
      orderBy: { Start_date: "asc" },
      select: { Start_date: true, Election_id: true, Title: true },
    });

    // Find the earliest ongoing end date
    const nextToEnd = await prisma.eLECTION.findFirst({
      where: {
        Status: "Ongoing",
        End_date: { gt: now },
      },
      orderBy: { End_date: "asc" },
      select: { End_date: true, Election_id: true, Title: true },
    });

    // Determine which comes first
    let nextRunTime = null;
    let reason = null;

    if (nextToStart && nextToEnd) {
      if (nextToStart.Start_date <= nextToEnd.End_date) {
        nextRunTime = nextToStart.Start_date;
        reason = `start election ${nextToStart.Election_id} ("${nextToStart.Title}")`;
      } else {
        nextRunTime = nextToEnd.End_date;
        reason = `end election ${nextToEnd.Election_id} ("${nextToEnd.Title}")`;
      }
    } else if (nextToStart) {
      nextRunTime = nextToStart.Start_date;
      reason = `start election ${nextToStart.Election_id} ("${nextToStart.Title}")`;
    } else if (nextToEnd) {
      nextRunTime = nextToEnd.End_date;
      reason = `end election ${nextToEnd.Election_id} ("${nextToEnd.Title}")`;
    }

    return { nextRunTime, reason };
  } catch (error) {
    console.error("Error calculating next run time:", error);
    return { nextRunTime: null, reason: null };
  }
}

// Smart scheduler main loop
async function scheduleNextRun() {
  if (!isRunning) return;

  // First, process any pending transitions
  await processElectionTransitions();

  // Calculate when to run next
  const { nextRunTime, reason } = await calculateNextRunTime();

  if (!nextRunTime) {
    // No upcoming elections, check again in fallback interval
    const fallbackMs = parseInt(process.env.SCHEDULER_FALLBACK_MS) || 300000; // default 5 minutes
    console.log(`No scheduled elections. Checking again in ${fallbackMs / 1000}s`);
    
    timeoutId = setTimeout(() => scheduleNextRun(), fallbackMs);
    return;
  }

  const now = new Date();
  const delayMs = Math.max(0, nextRunTime.getTime() - now.getTime());

  // Add small buffer (1 second) to ensure we don't miss the transition
  const bufferMs = 1000;
  const totalDelayMs = delayMs + bufferMs;

  // Cap maximum delay to prevent issues with very distant dates
  const maxDelayMs = parseInt(process.env.SCHEDULER_MAX_DELAY_MS) || 86400000; // default 24 hours
  const actualDelayMs = Math.min(totalDelayMs, maxDelayMs);

  const nextRunDate = new Date(now.getTime() + actualDelayMs);
  console.log(`Next scheduler run: ${nextRunDate.toLocaleString()} (in ${Math.round(actualDelayMs / 1000)}s) to ${reason}`);

  timeoutId = setTimeout(() => scheduleNextRun(), actualDelayMs);
}

export function startElectionScheduler(options = {}) {
  if (isRunning) {
    console.warn("Election scheduler already running");
    return;
  }

  isRunning = true;
  console.log("Starting smart election scheduler...");
  
  // Start election transitions
  scheduleNextRun();
  
  // Schedule cleanups for any existing completed elections that haven't been cleaned up yet
  scheduleExistingCompletedElections();
}

// Schedule cleanups for existing completed elections on startup
// DISABLED: Cleanup functionality disabled to preserve all election data
async function scheduleExistingCompletedElections() {
  console.log(`Cleanup disabled - no election data will be cleaned up`);
  return;
  
  /* CLEANUP DISABLED - Code preserved for future implementation
  try {
    const now = new Date();
    const retentionDays = parseInt(process.env.CANDIDATE_RETENTION_DAYS) || 2;
    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
    
    // Find completed elections that still have candidates
    const completedElections = await prisma.eLECTION.findMany({
      where: {
        Status: "Completed",
        candidates: {
          some: {} // Has at least one candidate
        }
      },
      select: {
        Election_id: true,
        Title: true,
        End_date: true
      }
    });
    
    for (const election of completedElections) {
      const cleanupTime = new Date(election.End_date.getTime() + retentionMs);
      
      if (cleanupTime <= now) {
        // Retention period already passed, cleanup immediately
        console.log(`Retention period passed for election ${election.Election_id}, cleaning up now...`);
        await cleanupSpecificElection(election.Election_id);
      } else {
        // Schedule future cleanup
        scheduleCleanupForElection(election.Election_id, election.Title, election.End_date);
      }
    }
    
    if (completedElections.length > 0) {
      console.log(`Scheduled cleanup for ${completedElections.length} existing completed elections`);
    }
  } catch (error) {
    console.error("Error scheduling existing completed elections:", error);
  }
  */
}

export function stopElectionScheduler() {
  if (!isRunning) return;
  
  isRunning = false;
  
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  // Clear all scheduled cleanup timeouts
  for (const [electionId, timeoutRef] of cleanupTimeouts.entries()) {
    clearTimeout(timeoutRef);
  }
  cleanupTimeouts.clear();
  
  console.log("Election scheduler stopped");
}

// Export for manual trigger (useful for testing or after admin creates election)
export async function triggerSchedulerCheck() {
  console.log("Manual scheduler check triggered");
  await processElectionTransitions();
  
  // Reschedule if running
  if (isRunning) {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    await scheduleNextRun();
  }
}
