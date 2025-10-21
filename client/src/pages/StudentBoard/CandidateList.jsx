import React, { useState, useEffect, useRef } from "react";
import { getApprovedCandidates } from "../../utils/candidateAPI";
import toast from "react-hot-toast";

const CandidateList = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await getApprovedCandidates();
        
        if (response.success) {
          setElections(response.data.elections);
          if (response.data.elections.length > 0) {
            toast.success("Candidates loaded successfully");
          } else {
            toast.info("No approved candidates found");
          }
        }
      } catch (error) {
        console.error("Error fetching candidates:", error);
        toast.error(error.message || "Failed to load candidates");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  if (loading) {
    return (
      <div className="px-10 md:px-20 max-w-7xl mt-28 items-center mx-auto mb-20 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-10 md:px-20 max-w-7xl mt-28 items-center mx-auto mb-20 min-h-[calc(100vh-200px)]">
      <h1 className="text-4xl font-bold text-black-600 text-center">
        Candidates List
      </h1>
      {/* Tagline */}
      <p className="text-center text-gray-600 mt-2 px-5">
       Discover the brilliant candidates running for the elections this year! They are ready to lead, inspire, and make a difference in our college community. <br />
  Choose wisely and cast your vote!
      </p>

      {elections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No approved candidates found</p>
        </div>
      ) : (
        elections.map((election) => (
          <div key={election.id} className="space-y-6 mt-12">
            <h2 className="text-2xl font-semibold text-indigo-800 text-start">
              {election.title}
            </h2>

            {/* Flex container: left-aligned with wrap */}
            {election.candidates && election.candidates.length > 0 ? (
              <div className="flex flex-wrap items-start justify-start gap-6">
                {election.candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="bg-white rounded-2xl pb-5 overflow-hidden border border-gray-300 shadow-sm hover:shadow-md transition-shadow w-64"
                  >
                    <img
                      className="w-64 h-52 object-cover object-top"
                      src={candidate.photo || "https://via.placeholder.com/256x208"}
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

                      {candidate.manifesto && (
                        <a
                          href={candidate.manifesto}
                          download
                          className="border text-sm text-gray-600 border-gray-400 w-28 h-8 rounded-full mt-4 flex items-center justify-center hover:bg-gray-100 transition"
                        >
                          Manifesto
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">
                No approved candidates for this election yet
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default CandidateList;
