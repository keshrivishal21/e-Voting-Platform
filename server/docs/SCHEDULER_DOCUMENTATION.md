# Election Scheduler Documentation

## Overview

The Election Scheduler is a **smart, automated system** that manages the entire election lifecycle without manual intervention. It automatically starts elections, ends them, declares results (if configured), and calculates optimal check times.

---

## 🎯 Purpose

**Problem it solves:**
- Admin shouldn't need to manually start/end elections at exact times
- Results should be calculated automatically when elections end
- System should be efficient and not waste resources checking continuously

**What it does:**
- ✅ Automatically starts elections at scheduled start time
- ✅ Automatically ends elections at scheduled end time
- ✅ Auto-declares results (if enabled) when election ends
- ✅ Sends notifications to users about election events
- ✅ Intelligently schedules next check (not wasteful polling)

---

## 🏗️ Architecture

### Core Concept: **Event-Driven Scheduling**

Instead of checking every minute (wasteful), the scheduler:
1. Looks at all upcoming/ongoing elections
2. Calculates when the **next** event will happen
3. Sets a timer to wake up exactly at that time
4. Processes the event
5. Repeats

**Example:**
```
Current Time: 10:00 AM
Elections:
  - Election A: Starts at 2:00 PM (4 hours away)
  - Election B: Ends at 3:00 PM (5 hours away)

Scheduler Action:
  ✅ Sets timer for 2:00 PM (4 hours)
  ❌ Does NOT check every minute
  
At 2:00 PM:
  ✅ Starts Election A
  ✅ Calculates next event (Election B at 3:00 PM)
  ✅ Sets timer for 3:00 PM
```

---

## 📋 Key Components

### 1. State Variables

```javascript
let timeoutId = null;              // Stores the current setTimeout ID
let isRunning = false;             // Whether scheduler is active
let cleanupTimeouts = new Map();   // Tracks cleanup timers (currently disabled)
```

**Why these matter:**
- `timeoutId`: Allows us to cancel scheduled checks if needed
- `isRunning`: Prevents starting multiple scheduler instances
- `cleanupTimeouts`: Would track data cleanup (feature currently disabled)

---

### 2. Main Functions

#### **`startElectionScheduler()`**
**Purpose:** Starts the entire scheduler system

**What it does:**
1. Checks if already running (prevents duplicates)
2. Sets `isRunning = true`
3. Calls `scheduleNextRun()` to begin the cycle
4. Logs "Starting smart election scheduler..."

**When it's called:**
- On server startup (`server/src/index.js`)
- Never needs to be called again

**MySQL Equivalent:**
```sql
-- No direct MySQL equivalent
-- This is a Node.js process control function
-- Similar to: CREATE EVENT start_scheduler ...
```

---

#### **`scheduleNextRun()`**
**Purpose:** The main loop - processes elections and schedules next check

**Algorithm:**
```
1. IF not running → EXIT
2. Process any pending election transitions
3. Calculate when next event occurs
4. IF no events:
   - Schedule check in 5 minutes (fallback)
5. ELSE:
   - Calculate delay until next event
   - Add 1 second buffer
   - Cap at 24 hours max
   - Set timeout for that duration
```

**Code Flow:**
```javascript
async function scheduleNextRun() {
  if (!isRunning) return;  // Safety check

  // Step 1: Process any elections that need status change NOW
  await processElectionTransitions();

  // Step 2: Find next event
  const { nextRunTime, reason } = await calculateNextRunTime();

  // Step 3: No events? Check again in 5 minutes
  if (!nextRunTime) {
    const fallbackMs = 300000; // 5 minutes
    timeoutId = setTimeout(() => scheduleNextRun(), fallbackMs);
    return;
  }

  // Step 4: Calculate delay until next event
  const now = new Date();
  const delayMs = Math.max(0, nextRunTime.getTime() - now.getTime());
  
  // Step 5: Add 1 second buffer + cap at 24 hours
  const totalDelayMs = delayMs + 1000;
  const actualDelayMs = Math.min(totalDelayMs, 86400000);

  // Step 6: Schedule next run
  timeoutId = setTimeout(() => scheduleNextRun(), actualDelayMs);
}
```

**MySQL Equivalent:**
```sql
-- No direct equivalent
-- Similar to MySQL Event Scheduler logic:
CREATE EVENT check_elections
ON SCHEDULE EVERY 1 MINUTE
DO
  CALL process_election_transitions();
```

---

#### **`processElectionTransitions()`**
**Purpose:** Handles starting and ending elections that are due

**Algorithm:**
```
1. Get current timestamp
2. Find all Upcoming elections where Start_date <= now
3. For each:
   - Update Status to "Ongoing"
   - Send notification
4. Find all Ongoing elections where End_date <= now
5. For each:
   - Update Status to "Completed"
   - Send notification
   - IF auto_declare_results = true:
     - Attempt to declare results
   - Schedule cleanup (currently disabled)
6. Return counts
```

**Prisma Code:**
```javascript
// Find elections to start
const toStart = await prisma.eLECTION.findMany({
  where: {
    Status: "Upcoming",
    Start_date: { lte: now },
  },
});

// Update each to Ongoing
for (const e of toStart) {
  await prisma.eLECTION.update({
    where: { Election_id: e.Election_id },
    data: { Status: "Ongoing" },
  });
  notifyElectionStarted(e.Title, e.End_date);
}

// Find elections to end
const toEnd = await prisma.eLECTION.findMany({
  where: {
    Status: "Ongoing",
    End_date: { lte: now },
  },
});

// Update each to Completed
for (const e of toEnd) {
  await prisma.eLECTION.update({
    where: { Election_id: e.Election_id },
    data: { Status: "Completed" },
  });
  
  // Auto-declare if enabled
  if (e.Auto_declare_results === true) {
    await declareElectionResults(e.Election_id, e.Title);
  }
}
```

**MySQL Equivalent:**
```sql
-- Start elections
UPDATE ELECTION
SET Status = 'Ongoing'
WHERE Status = 'Upcoming'
  AND Start_date <= NOW();

-- End elections
UPDATE ELECTION
SET Status = 'Completed'
WHERE Status = 'Ongoing'
  AND End_date <= NOW();

-- Would need separate logic for auto-declare
-- MySQL doesn't have built-in auto-declare in UPDATE
```

---

#### **`calculateNextRunTime()`**
**Purpose:** Finds the next event that will occur

**Algorithm:**
```
1. Find earliest Upcoming election (Start_date > now)
2. Find earliest Ongoing election (End_date > now)
3. Compare:
   - IF both exist → return whichever is sooner
   - IF only one exists → return that one
   - IF neither exists → return null
4. Return { nextRunTime, reason }
```

**Prisma Code:**
```javascript
const now = new Date();

// Earliest start
const nextToStart = await prisma.eLECTION.findFirst({
  where: {
    Status: "Upcoming",
    Start_date: { gt: now },
  },
  orderBy: { Start_date: "asc" },
  select: { Start_date: true, Election_id: true, Title: true },
});

// Earliest end
const nextToEnd = await prisma.eLECTION.findFirst({
  where: {
    Status: "Ongoing",
    End_date: { gt: now },
  },
  orderBy: { End_date: "asc" },
  select: { End_date: true, Election_id: true, Title: true },
});

// Determine which comes first
if (nextToStart && nextToEnd) {
  if (nextToStart.Start_date <= nextToEnd.End_date) {
    return { 
      nextRunTime: nextToStart.Start_date, 
      reason: `start election ${nextToStart.Election_id}` 
    };
  } else {
    return { 
      nextRunTime: nextToEnd.End_date, 
      reason: `end election ${nextToEnd.Election_id}` 
    };
  }
}
```

**MySQL Equivalent:**
```sql
-- Find next start
SELECT Election_id, Title, Start_date
FROM ELECTION
WHERE Status = 'Upcoming' 
  AND Start_date > NOW()
ORDER BY Start_date ASC
LIMIT 1;

-- Find next end
SELECT Election_id, Title, End_date
FROM ELECTION
WHERE Status = 'Ongoing' 
  AND End_date > NOW()
ORDER BY End_date ASC
LIMIT 1;

-- Application logic compares the two
```

---

#### **`declareElectionResults()`**
**Purpose:** Automatically calculates and declares election results

**Algorithm:**
```
1. Fetch all votes for the election
2. IF no votes → return (skip declaration)
3. Count votes per candidate
4. Group candidates by position
5. Check for ties:
   - IF top 2 candidates have same votes → TIE
   - Return error, admin must manually decide
6. IF no ties:
   - Create/update RESULT records
   - Send notification
   - Return success
```

**Prisma Code:**
```javascript
// Get all votes
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

// Count votes per candidate
const voteCounts = new Map();
votes.forEach(vote => {
  const candidateId = vote.Can_id.toString();
  voteCounts.set(candidateId, (voteCounts.get(candidateId) || 0) + 1);
});

// Check for ties
// ... tie detection logic ...

// Create/update results
for (const candidateId of candidateIds) {
  const voteCount = voteCounts.get(candidateId.toString()) || 0;
  
  await prisma.rESULT.upsert({
    where: {
      Election_id_Can_id: {
        Election_id: electionId,
        Can_id: candidateId
      }
    },
    update: {
      Vote_count: voteCount
    },
    create: {
      Can_id: candidateId,
      Election_id: electionId,
      Vote_count: voteCount,
      Admin_id: adminId
    }
  });
}
```

**MySQL Equivalent:**
```sql
-- Count votes per candidate
SELECT 
  Can_id,
  COUNT(*) as vote_count
FROM VOTE
WHERE Election_id = ?
GROUP BY Can_id;

-- Insert/Update results
INSERT INTO RESULT (Can_id, Election_id, Vote_count, Admin_id)
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
  Vote_count = VALUES(Vote_count);

-- Tie detection would need application logic
-- MySQL can't easily detect ties in UPDATE statement
```

---

#### **`stopElectionScheduler()`**
**Purpose:** Gracefully shuts down the scheduler

**What it does:**
1. Sets `isRunning = false` (stops loop)
2. Clears current timeout (`clearTimeout(timeoutId)`)
3. Clears all cleanup timeouts
4. Logs "Election scheduler stopped"

**When it's called:**
- On server shutdown
- For testing/debugging
- Never during normal operation

---

#### **`triggerSchedulerCheck()`**
**Purpose:** Manually triggers a scheduler check (for testing/admin actions)

**What it does:**
1. Processes election transitions immediately
2. IF scheduler is running:
   - Cancels current timeout
   - Reschedules next run

**When it's called:**
- After admin creates new election
- For testing
- When admin manually changes election dates

**Usage:**
```javascript
import { triggerSchedulerCheck } from './services/electionScheduler.js';

// After admin creates election
await createElection(electionData);
await triggerSchedulerCheck(); // Immediately recalculate schedule
```

---

## 🔄 Complete Workflow Example

### Scenario: Admin creates election for tomorrow

**1. Election Created**
```javascript
// Admin creates election
Election {
  Election_id: 5,
  Title: "Student Council 2025",
  Start_date: "2025-11-14 10:00:00",  // Tomorrow 10 AM
  End_date: "2025-11-14 18:00:00",    // Tomorrow 6 PM
  Status: "Upcoming",
  Auto_declare_results: true
}
```

**2. Scheduler Recalculates**
```
Current Time: Nov 13, 2025 3:00 PM

calculateNextRunTime() finds:
  - Next event: Election 5 starts at Nov 14, 10:00 AM
  - Delay: 19 hours

scheduleNextRun() sets timeout:
  - setTimeout(processTransitions, 19 hours)
```

**3. Next Day - 10:00 AM**
```
Timeout fires → scheduleNextRun() runs
  
processElectionTransitions() executes:
  - Finds Election 5 (Start_date <= now)
  - Updates Status to "Ongoing"
  - Sends notification: "Election Started"

calculateNextRunTime() finds:
  - Next event: Election 5 ends at Nov 14, 6:00 PM
  - Delay: 8 hours

Sets timeout for 6:00 PM
```

**4. Same Day - 6:00 PM**
```
Timeout fires → scheduleNextRun() runs

processElectionTransitions() executes:
  - Finds Election 5 (End_date <= now)
  - Updates Status to "Completed"
  - Sends notification: "Election Ended"
  - Checks Auto_declare_results = true
  
declareElectionResults(5) runs:
  - Counts votes
  - Checks for ties
  - Creates RESULT records
  - Sends notification: "Results Declared"

calculateNextRunTime() finds next election (if any)
```

---

## 🛡️ Safety Features

### 1. **Single Instance Protection**
```javascript
if (isRunning) {
  console.warn("Election scheduler already running");
  return;
}
```
**Why:** Prevents multiple scheduler instances that could cause duplicate updates

---

### 2. **Buffer Time**
```javascript
const bufferMs = 1000; // 1 second
const totalDelayMs = delayMs + bufferMs;
```
**Why:** Ensures we don't miss events due to millisecond timing issues

---

### 3. **Maximum Delay Cap**
```javascript
const maxDelayMs = 86400000; // 24 hours
const actualDelayMs = Math.min(totalDelayMs, maxDelayMs);
```
**Why:** 
- JavaScript setTimeout has max safe value (~24.8 days)
- Forces recheck every 24 hours
- Handles very distant elections

---

### 4. **Fallback Mechanism**
```javascript
if (!nextRunTime) {
  const fallbackMs = 300000; // 5 minutes
  timeoutId = setTimeout(() => scheduleNextRun(), fallbackMs);
  return;
}
```
**Why:** If no elections exist, check every 5 minutes for newly created ones

---

### 5. **Error Handling**
```javascript
try {
  await processElectionTransitions();
} catch (error) {
  console.error("Election scheduler error:", error);
  return { started: 0, ended: 0 };
}
```
**Why:** Prevents scheduler crash from stopping future checks

---

### 6. **Transaction Safety** (in declareResults)
```javascript
await prisma.$transaction(async (tx) => {
  // All result updates in single transaction
});
```
**Why:** Ensures all-or-nothing updates (prevents partial result declarations)

---

## 📊 Tie Detection System

**Problem:** What if two candidates have exact same votes?

**Solution:** Automatic tie detection prevents auto-declaration

**Algorithm:**
```javascript
candidatesByPosition.forEach((candidates, position) => {
  const sorted = Array.from(candidates).sort((a, b) => b.votes - a.votes);
  
  // Check if top 2 have same votes
  if (sorted[0].votes === sorted[1].votes && sorted[0].votes > 0) {
    hasTie = true;
    tieDetails.push({
      position: position,
      votes: sorted[0].votes,
      candidates: [sorted[0].name, sorted[1].name]
    });
  }
});

if (hasTie) {
  console.log("TIE DETECTED - Admin must manually declare");
  return { success: false, reason: 'tie_detected', ties: tieDetails };
}
```

**Example:**
```
Position: President
Candidates:
  - Alice: 50 votes
  - Bob: 50 votes   ← TIE!
  - Charlie: 45 votes

Action: Skip auto-declaration, notify admin
Admin must manually decide winner or declare tie
```

---

## ⚙️ Configuration (Environment Variables)

```bash
# How long to wait if no elections exist
SCHEDULER_FALLBACK_MS=300000        # 5 minutes (default)

# Maximum delay between checks
SCHEDULER_MAX_DELAY_MS=86400000     # 24 hours (default)

# Data retention (currently disabled)
CANDIDATE_RETENTION_DAYS=2          # 2 days (default, not used)
```

---

## 🧪 Testing the Scheduler

### Manual Testing Steps:

**1. Create Test Election (Starts in 2 minutes)**
```javascript
POST /api/elections/create
{
  "title": "Test Election",
  "startDate": "2025-11-13T15:02:00",  // 2 min from now
  "endDate": "2025-11-13T15:05:00",    // 5 min from now
  "positions": ["President"],
  "autoDeclareResults": true
}
```

**2. Watch Server Logs**
```
[15:00:00] Starting smart election scheduler...
[15:00:00] Next scheduler run: 2025-11-13 15:02:00 (in 120s) to start election 1
[15:02:00] Election 1 ("Test Election") started automatically
[15:02:00] Next scheduler run: 2025-11-13 15:05:00 (in 180s) to end election 1
[15:05:00] Election 1 ("Test Election") ended automatically
[15:05:00] Auto-declare enabled for election 1, attempting to declare results...
[15:05:00] Results auto-declared successfully for election 1
```

**3. Verify Database**
```sql
-- Check election status
SELECT Election_id, Title, Status, Start_date, End_date
FROM ELECTION
WHERE Election_id = 1;

-- Check if results exist
SELECT * FROM RESULT WHERE Election_id = 1;
```

---

## 🐛 Debugging the Scheduler

### Check if Running
```javascript
// In Node.js console or debug endpoint
console.log('Scheduler running:', isRunning);
console.log('Next timeout ID:', timeoutId);
```

### Force Manual Check
```javascript
import { triggerSchedulerCheck } from './services/electionScheduler.js';
await triggerSchedulerCheck();
```

### View Next Scheduled Time
```sql
-- Find next event manually
SELECT 
  Election_id, 
  Title, 
  Status,
  CASE 
    WHEN Status = 'Upcoming' THEN Start_date
    WHEN Status = 'Ongoing' THEN End_date
  END as next_event
FROM ELECTION
WHERE 
  (Status = 'Upcoming' AND Start_date > NOW())
  OR (Status = 'Ongoing' AND End_date > NOW())
ORDER BY next_event ASC
LIMIT 1;
```

### Common Issues

**Problem: Elections not starting automatically**
```
Possible causes:
1. Scheduler not started (check server startup logs)
2. System time incorrect
3. Database time zone mismatch
4. Start_date in past (scheduler only checks future)

Solution:
- Verify startElectionScheduler() called on server start
- Check console logs for "Starting smart election scheduler..."
- Manually trigger: triggerSchedulerCheck()
```

**Problem: Results not auto-declaring**
```
Possible causes:
1. Auto_declare_results = false
2. Tie detected (check logs for "TIE DETECTED")
3. No votes cast
4. Scheduler error

Solution:
- Check Auto_declare_results field in ELECTION table
- Look for tie detection logs
- Verify votes exist in VOTE table
- Check error logs
```

---

## 🔧 Advanced: How setTimeout Works

**JavaScript Event Loop:**
```
1. Code executes normally
2. setTimeout schedules callback for future
3. Event loop continues other tasks
4. When time expires, callback added to queue
5. Event loop runs callback when stack is clear
```

**Why we use setTimeout (not setInterval):**
```javascript
// ❌ BAD: setInterval (fixed intervals)
setInterval(() => check(), 60000); // Every minute, even if no events

// ✅ GOOD: setTimeout (dynamic intervals)
setTimeout(() => {
  check();
  calculateNext(); // Decides when to check again
  setTimeout(...);  // Schedules next check
}, dynamicDelay);
```

**Benefits:**
- Efficient (only checks when needed)
- Adapts to election schedule
- Prevents overlapping checks
- Saves server resources

---

## 📈 Performance Considerations

### Memory Usage
```javascript
// Minimal memory footprint
let timeoutId = null;              // Single number
let isRunning = false;             // Single boolean
let cleanupTimeouts = new Map();   // Empty map (cleanup disabled)
```

### Database Queries
```javascript
// Only 3 queries per check cycle:
1. findMany (elections to start)
2. findMany (elections to end)  
3. findFirst (next start)
4. findFirst (next end)

// Plus result declaration queries (only when election ends)
```

### CPU Usage
```
- Idle most of time (setTimeout waits)
- Active only during:
  1. Election start (UPDATE + notification)
  2. Election end (UPDATE + notification + results)
  3. Next time calculation (2 queries)
- Total active time: < 1 second per event
```

---

## 🔮 Future Enhancements (Disabled Code)

### Data Cleanup System (Currently Commented Out)

**Purpose:** Delete candidate data after retention period

**Why Disabled:**
- Data preservation for auditing
- Historical records important
- Can be enabled later if needed

**How it would work:**
```javascript
// After election ends:
scheduleCleanupForElection(electionId, title, endDate);

// After 2 days (configurable):
cleanupSpecificElection(electionId);
  → Delete candidates
  → Delete votes
  → Delete results
  → Delete user records
```

**To Enable:**
1. Remove `return;` statements in cleanup functions
2. Uncomment code blocks
3. Set `CANDIDATE_RETENTION_DAYS` in .env
4. Test thoroughly (deletes are permanent!)

---

## 🎓 Key Takeaways

### What Makes This Scheduler "Smart"

1. **Event-Driven**: Only checks when something will happen
2. **Self-Adjusting**: Recalculates schedule after each event
3. **Efficient**: Minimal database queries
4. **Reliable**: Buffer times prevent missed events
5. **Safe**: Single instance, error handling, transaction safety
6. **Automated**: Zero manual intervention needed

### Scheduler vs Cron Jobs

| Feature | Our Scheduler | Cron Job |
|---------|--------------|----------|
| Check Frequency | Dynamic (only when needed) | Fixed interval |
| Resource Usage | Minimal | Higher (constant checks) |
| Precision | Exact (setTimeout) | Minute-level |
| Flexibility | Adapts to changes | Rigid schedule |
| Setup | Built-in | External configuration |

### Real-World Analogy

**Bad approach (Cron):**
``` 
"Wake me up every minute to check if it's 3 PM yet"
→ Wastes energy, annoying
```

**Our approach (Smart Scheduler):**
```
"Wake me up at exactly 3 PM"
→ Efficient, precise
```

---

## 📚 Additional Resources

### Related Files
- `server/src/services/electionScheduler.js` - Main scheduler code
- `server/src/index.js` - Scheduler startup
- `server/src/utils/notificationHelper.js` - Notification functions
- `server/src/controllers/electionController.js` - Manual election control

### Database Tables Used
- `ELECTION` - Election data and status
- `VOTE` - Vote records
- `RESULT` - Calculated results
- `NOTIFICATION` - System notifications

### Key Prisma Methods
- `findMany()` - Find multiple records
- `findFirst()` - Find first matching record
- `update()` - Update single record
- `upsert()` - Insert or update
- `$transaction()` - Atomic operations

---

## ❓ FAQ

**Q: What happens if server restarts during an election?**
A: Scheduler immediately checks all elections on startup and processes any that should have transitioned. No events are missed.

**Q: Can admin manually start/end elections?**
A: Yes! Admin can manually trigger transitions. Scheduler will adapt and recalculate next event.

**Q: How accurate is the timing?**
A: Within 1-2 seconds of scheduled time (due to 1 second buffer + event loop timing).

**Q: What if two elections end at same time?**
A: Both are processed in the same scheduler run. Order doesn't matter as they're independent.

**Q: Does this work across time zones?**
A: Yes! All times stored as UTC in database. JavaScript Date handles conversions.

**Q: Can I disable auto-declaration for specific elections?**
A: Yes! Set `Auto_declare_results: false` when creating election. Scheduler will skip result declaration.

---

## 🎬 Conclusion

The Election Scheduler is the **brain** of the e-voting platform. It:
- Runs silently in the background
- Manages the entire election lifecycle
- Saves admin time and effort
- Ensures precise timing
- Handles edge cases (ties, no votes)
- Scales efficiently

**Without it:** Admin must manually start/end every election at exact times (impossible for 24/7 availability)

**With it:** Elections run automatically, on time, every time. Admin can sleep well! 😴

---

**Remember:** The scheduler is always running as long as the server is running. It's self-maintaining and requires zero manual intervention for normal operation.
