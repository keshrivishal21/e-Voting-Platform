import React from "react";

const CandidateList = () => {
  const elections = [
    {
      id: 1,
      title: "Presidential Election",
      candidates: [
        {
          id: 1,
          name: "Aarav Mehta",
          scholarId: "20210123",
          branch: "CSE",
          year: "3rd Year",
          photo: "https://randomuser.me/api/portraits/men/32.jpg",
          manifesto: "/sample-manifesto.pdf",
        },
        {
          id: 2,
          name: "Priya Sharma",
          scholarId: "20210456",
          branch: "ECE",
          year: "2nd Year",
          photo: "https://randomuser.me/api/portraits/women/45.jpg",
          manifesto: "/sample-manifesto.pdf",
        },
        {
          id: 9,
          name: "Anshika Reddy",
          scholarId: "20210912",
          branch: "CSE",
          year: "2nd Year",
          photo: "https://randomuser.me/api/portraits/women/30.jpg",
          manifesto: "/sample-manifesto.pdf",
        },
        {
          id: 10,
          name: "Varun Joshi",
          scholarId: "20211045",
          branch: "ME",
          year: "3rd Year",
          photo: "https://randomuser.me/api/portraits/men/77.jpg",
          manifesto: "/sample-manifesto.pdf",
        },
      ],
    },
    {
      id: 2,
      title: "Vice Presidential Election",
      candidates: [
        {
          id: 3,
          name: "Rohan Kapoor",
          scholarId: "20210234",
          branch: "ME",
          year: "3rd Year",
          photo: "https://randomuser.me/api/portraits/men/44.jpg",
          manifesto: "/sample-manifesto.pdf",
        },
        {
          id: 4,
          name: "Simran Kaur",
          scholarId: "20210567",
          branch: "CSE",
          year: "2nd Year",
          photo: "https://randomuser.me/api/portraits/women/32.jpg",
          manifesto: "/sample-manifesto.pdf",
        },
      ],
    },
    {
      id: 3,
      title: "Cultural Secretary Election",
      candidates: [
        {
          id: 5,
          name: "Kabir Singh",
          scholarId: "20210321",
          branch: "ECE",
          year: "3rd Year",
          photo: "https://randomuser.me/api/portraits/men/55.jpg",
          manifesto: "/sample-manifesto.pdf",
        },
        {
          id: 6,
          name: "Anika Verma",
          scholarId: "20210678",
          branch: "CSE",
          year: "1st Year",
          photo: "https://randomuser.me/api/portraits/women/22.jpg",
          manifesto: "/sample-manifesto.pdf",
        },
      ],
    },
    {
      id: 4,
      title: "Sports Secretary Election",
      candidates: [
        {
          id: 7,
          name: "Aditya Rao",
          scholarId: "20210789",
          branch: "ME",
          year: "2nd Year",
          photo: "https://randomuser.me/api/portraits/men/66.jpg",
          manifesto: "/sample-manifesto.pdf",
        },
        {
          id: 8,
          name: "Isha Gupta",
          scholarId: "20210890",
          branch: "ECE",
          year: "3rd Year",
          photo: "https://randomuser.me/api/portraits/women/54.jpg",
          manifesto: "/sample-manifesto.pdf",
        },
      ],
    },
    {
      id: 6,
      title: "Literary Secretary Election",
      candidates: [
        {
          id: 11,
          name: "Ritika Malhotra",
          scholarId: "20211123",
          branch: "ECE",
          year: "1st Year",
          photo: "https://randomuser.me/api/portraits/women/65.jpg",
          manifesto: "/sample-manifesto.pdf",
        },
        {
          id: 12,
          name: "Karan Mehra",
          scholarId: "20211234",
          branch: "CSE",
          year: "3rd Year",
          photo: "https://randomuser.me/api/portraits/men/88.jpg",
          manifesto: "/sample-manifesto.pdf",
        },
      ],
    },
  ];

  return (
    <div className="px-10 md:px-20 max-w-7xl mt-28 items-center mx-auto mb-20">
      <h1 className="text-4xl font-bold text-black-600 text-center">
        Candidates List
      </h1>
      {/* Tagline */}
      <p className="text-center text-gray-600 mt-2 px-5">
       Discover the brilliant candidates running for the elections this year! They are ready to lead, inspire, and make a difference in our college community. <br />
  Choose wisely and cast your vote!
      </p>

      {elections.map((election) => (
        <div key={election.id} className="space-y-6 mt-12">
          <h2 className="text-2xl font-semibold text-indigo-800 text-start">
            {election.title}
          </h2>

          {/* Flex container: left-aligned with wrap */}
          <div className="flex flex-wrap items-start justify-start gap-6">
            {election.candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white rounded-2xl pb-5 overflow-hidden border border-gray-300 shadow-sm hover:shadow-md transition-shadow w-64"
              >
                <img
                  className="w-64 h-52 object-cover object-top"
                  src={candidate.photo}
                  alt={candidate.name}
                />

                <div className="flex flex-col items-center px-3">
                  <p className="font-semibold mt-3 text-gray-800">
                    {candidate.name}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Scholar ID: {candidate.scholarId}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {candidate.branch} • {candidate.year}
                  </p>

                  <a
                    href={candidate.manifesto}
                    download
                    className="border text-sm text-gray-600 border-gray-400 w-28 h-8 rounded-full mt-4 flex items-center justify-center hover:bg-gray-100 transition"
                  >
                    Manifesto
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CandidateList;
