<<<<<<< HEAD
import React from 'react'

const Notifications = () => {
  return (
    <div>Notifications</div>
  )
}

export default Notifications
=======
import React, { useState } from "react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Presidential Election Results",
      message: "The results of the Presidential Election have been announced. Check the winner in the results section!",
      date: "2025-09-17",
    },
    {
      id: 2,
      title: "Upcoming Cultural Secretary Election",
      message: "The Cultural Secretary election will start from 25th September. Cast your votes on time!",
      date: "2025-09-15",
    },
    {
      id: 3,
      title: "Sports Secretary Election Open",
      message: "The Sports Secretary election nominations are now open for students. Submit your candidature before 20th September.",
      date: "2025-09-14",
    },
    {
      id: 4,
      title: "Vice Presidential Election Results",
      message: "The Vice Presidential election results are now live. Congratulations to the winners!",
      date: "2025-09-13",
    },
    {
      id: 5,
      title: "Literary Secretary Election Announcement",
      message: "Literary Secretary elections will begin next week. Prepare to cast your votes!",
      date: "2025-09-12",
    },
    {
      id: 6,
      title: "Maintenance Notice",
      message: "The e-voting platform will be under maintenance on 20th September from 12 AM to 4 AM. Plan your voting accordingly.",
      date: "2025-09-11",
    },
    {
      id: 7,
      title: "Candidate Profile Update",
      message: "Candidate Aarav Mehta has updated his manifesto. Check out the latest version before voting.",
      date: "2025-09-10",
    },
    {
      id: 8,
      title: "Voting Guidelines",
      message: "Remember to read the voting guidelines carefully. Only registered students can cast votes.",
      date: "2025-09-09",
    },
    {
      id: 9,
      title: "Election Awareness Campaign",
      message: "Join the election awareness webinar on 22nd September to understand the voting process and candidate details.",
      date: "2025-09-08",
    },
    {
      id: 10,
      title: "System Upgrade Completed",
      message: "The e-voting platform upgrade is completed successfully. Enjoy a faster and more secure voting experience!",
      date: "2025-09-07",
    },
  ]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 mt-20">
      <h1 className="text-3xl font-bold text-black-700 mb-6 text-center">
        Notifications
      </h1>

      {/* Notification List */}
      <div className="space-y-4">
        {notifications.length === 0 && (
          <p className="text-gray-500 text-center">No notifications yet.</p>
        )}
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="bg-indigo-50 border-l-4 border-indigo-500 rounded-md p-4 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-indigo-700">{notif.title}</h3>
              <span className="text-sm text-gray-500">{notif.date}</span>
            </div>
            <p className="text-gray-700 mt-2">{notif.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
>>>>>>> anjali/main
