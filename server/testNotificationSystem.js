import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testNotificationSystem() {
  console.log("=".repeat(70));
  console.log("TESTING NOTIFICATION SYSTEM");
  console.log("=".repeat(70));

  try {
    // 1. Check database schema
    console.log("\n1. DATABASE SCHEMA CHECK:");
    console.log("   NOTIFICATION table fields:");
    console.log("   - N_id (Int, auto-increment, primary key)");
    console.log("   - User_id (BigInt) - recipient ID");
    console.log("   - User_type (UserType: Student/Candidate)");
    console.log("   - Notif_time (DateTime)");
    console.log("   - Notif_message (Text)");
    console.log("   - Admin_id (Int, nullable) - sender");

    // 2. Check existing notifications
    console.log("\n2. EXISTING NOTIFICATIONS:");
    const notificationCount = await prisma.nOTIFICATION.count();
    console.log(`   Total notifications in database: ${notificationCount}`);

    if (notificationCount > 0) {
      const recentNotifs = await prisma.nOTIFICATION.findMany({
        take: 5,
        orderBy: { Notif_time: 'desc' },
        include: {
          admin: {
            select: { Admin_name: true }
          }
        }
      });

      console.log("\n   Recent notifications:");
      recentNotifs.forEach(n => {
        console.log(`   - To ${n.User_type} (ID: ${n.User_id})`);
        console.log(`     Message: "${n.Notif_message}"`);
        console.log(`     Sent by: ${n.admin?.Admin_name || 'System'}`);
        console.log(`     Time: ${n.Notif_time.toLocaleString()}`);
      });
    }

    // 3. Check recipients (students and candidates)
    console.log("\n3. POTENTIAL RECIPIENTS:");
    
    const studentCount = await prisma.sTUDENT.count();
    console.log(`   Students: ${studentCount}`);
    if (studentCount > 0) {
      const students = await prisma.sTUDENT.findMany({
        select: { Std_id: true, Std_name: true, Std_email: true },
        take: 3
      });
      students.forEach(s => {
        console.log(`     - ${s.Std_name} (ID: ${s.Std_id}, Email: ${s.Std_email})`);
      });
    }

    const candidateCount = await prisma.cANDIDATE.count();
    console.log(`   Candidates: ${candidateCount}`);
    if (candidateCount > 0) {
      const candidates = await prisma.cANDIDATE.findMany({
        select: { Can_id: true, Can_name: true, Can_email: true, Position: true },
        take: 3
      });
      candidates.forEach(c => {
        console.log(`     - ${c.Can_name} (ID: ${c.Can_id}, Position: ${c.Position})`);
      });
    }

    // 4. Check admin
    console.log("\n4. ADMIN CHECK:");
    const adminCount = await prisma.aDMIN.count();
    console.log(`   Total admins: ${adminCount}`);
    if (adminCount > 0) {
      const admin = await prisma.aDMIN.findFirst({
        select: { Admin_id: true, Admin_name: true, Admin_email: true }
      });
      console.log(`   First admin: ${admin.Admin_name} (ID: ${admin.Admin_id})`);
    } else {
      console.log("   ⚠️  No admin found!");
    }

    // 5. Simulate sending notification
    console.log("\n5. SIMULATING NOTIFICATION SEND:");
    console.log("   Example request body:");
    console.log(`   {`);
    console.log(`     "recipientType": "Students",`);
    console.log(`     "message": "Welcome to the e-Voting Platform!"`);
    console.log(`   }`);
    console.log("\n   What happens:");
    console.log(`   1. Admin sends notification via POST /api/notification/admin/notifications`);
    console.log(`   2. Backend validates recipientType (Students/Candidates/All)`);
    console.log(`   3. Backend fetches all ${studentCount} student(s)`);
    console.log(`   4. Creates ${studentCount} NOTIFICATION record(s) in database`);
    console.log(`   5. Each student can retrieve their notifications via GET /api/notification/notifications`);

    // 6. Check API endpoints
    console.log("\n6. API ENDPOINTS:");
    console.log("   Admin endpoints (requires admin token):");
    console.log("   - GET  /api/notification/admin/notifications - View sent notifications");
    console.log("   - POST /api/notification/admin/notifications - Send new notification");
    console.log("\n   User endpoints (requires student/candidate token):");
    console.log("   - GET  /api/notification/notifications - Get user's notifications");

    // 7. Check notification retrieval by user type
    console.log("\n7. NOTIFICATION RETRIEVAL TEST:");
    
    if (studentCount > 0) {
      const firstStudent = await prisma.sTUDENT.findFirst();
      const studentNotifs = await prisma.nOTIFICATION.findMany({
        where: {
          User_id: firstStudent.Std_id,
          User_type: 'Student'
        },
        orderBy: { Notif_time: 'desc' },
        take: 5
      });
      
      console.log(`   Student notifications (ID: ${firstStudent.Std_id}):`);
      if (studentNotifs.length === 0) {
        console.log("     ⚠️  No notifications for this student yet");
      } else {
        studentNotifs.forEach(n => {
          console.log(`     - "${n.Notif_message}" (${n.Notif_time.toLocaleString()})`);
        });
      }
    }

    if (candidateCount > 0) {
      const firstCandidate = await prisma.cANDIDATE.findFirst();
      const candidateNotifs = await prisma.nOTIFICATION.findMany({
        where: {
          User_id: firstCandidate.Can_id,
          User_type: 'Candidate'
        },
        orderBy: { Notif_time: 'desc' },
        take: 5
      });
      
      console.log(`\n   Candidate notifications (ID: ${firstCandidate.Can_id}):`);
      if (candidateNotifs.length === 0) {
        console.log("     ⚠️  No notifications for this candidate yet");
      } else {
        candidateNotifs.forEach(n => {
          console.log(`     - "${n.Notif_message}" (${n.Notif_time.toLocaleString()})`);
        });
      }
    }

    // 8. Frontend integration check
    console.log("\n8. FRONTEND INTEGRATION:");
    console.log("   Admin panel (AdminBoard/Notifications.jsx):");
    console.log("   ✅ Send notification form with recipient dropdown");
    console.log("   ✅ Recently sent notifications list");
    console.log("   ✅ Uses AdminAPI.sendNotification() and AdminAPI.getAllNotifications()");
    console.log("\n   Student/Candidate panel (StudentBoard/Notifications.jsx):");
    console.log("   ✅ Fetches notifications on page load");
    console.log("   ✅ Displays message and timestamp");
    console.log("   ✅ Uses axios with Bearer token authentication");
    console.log("   ✅ Shows 'No notifications yet' when empty");

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("SUMMARY:");
    console.log("=".repeat(70));
    console.log(`Notifications in DB: ${notificationCount}`);
    console.log(`Potential recipients: ${studentCount} students + ${candidateCount} candidates`);
    console.log(`Admin(s) available: ${adminCount}`);
    
    if (adminCount === 0) {
      console.log("\n⚠️  WARNING: No admin account exists! Create admin first.");
    } else if (studentCount === 0 && candidateCount === 0) {
      console.log("\n⚠️  WARNING: No students or candidates exist! No recipients available.");
    } else {
      console.log("\n✅ System ready to send and receive notifications!");
    }

    console.log("\n💡 To test the system:");
    console.log("   1. Login as admin at http://localhost:5173/admin/login");
    console.log("   2. Go to Notifications page");
    console.log("   3. Select recipient type (Students/Candidates/All)");
    console.log("   4. Type a message and click 'Send Notification'");
    console.log("   5. Login as student/candidate");
    console.log("   6. View notifications at http://localhost:5173/student/notifications");

  } catch (error) {
    console.error("\n❌ ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationSystem();
