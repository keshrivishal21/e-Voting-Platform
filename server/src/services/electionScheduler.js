import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let timeoutId = null;
let isRunning = false;

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
        console.log(`✅ Election ${e.Election_id} ("${e.Title}") started automatically`);
      } catch (err) {
        console.error(`❌ Failed to start election ${e.Election_id}:`, err);
      }
    }

    // 2) End elections where End_date <= now and Status = 'Ongoing'
    const toEnd = await prisma.eLECTION.findMany({
      where: {
        Status: "Ongoing",
        End_date: { lte: now },
      },
    });

    for (const e of toEnd) {
      try {
        await prisma.eLECTION.update({
          where: { Election_id: e.Election_id },
          data: { Status: "Completed" },
        });
        console.log(`✅ Election ${e.Election_id} ("${e.Title}") ended automatically`);
        // TODO: trigger result aggregation here if desired
      } catch (err) {
        console.error(`❌ Failed to end election ${e.Election_id}:`, err);
      }
    }

    return { started: toStart.length, ended: toEnd.length };
  } catch (error) {
    console.error("❌ Election scheduler error:", error);
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
    console.error("❌ Error calculating next run time:", error);
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
    console.log(`📅 No scheduled elections. Checking again in ${fallbackMs / 1000}s`);
    
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
  console.log(`⏰ Next scheduler run: ${nextRunDate.toLocaleString()} (in ${Math.round(actualDelayMs / 1000)}s) to ${reason}`);

  timeoutId = setTimeout(() => scheduleNextRun(), actualDelayMs);
}

export function startElectionScheduler(options = {}) {
  if (isRunning) {
    console.warn("⚠️  Election scheduler already running");
    return;
  }

  isRunning = true;
  console.log("🚀 Starting smart election scheduler...");
  
  // Start the scheduler loop
  scheduleNextRun();
}

export function stopElectionScheduler() {
  if (!isRunning) return;
  
  isRunning = false;
  
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  
  console.log("🛑 Election scheduler stopped");
}

// Export for manual trigger (useful for testing or after admin creates election)
export async function triggerSchedulerCheck() {
  console.log("🔄 Manual scheduler check triggered");
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
