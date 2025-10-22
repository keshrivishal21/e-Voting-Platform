import React, { useState, useEffect, useRef } from "react";
import { getApprovedCandidates } from "../../utils/candidateAPI";
import toast from "react-hot-toast";

const CandidateList = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showManifestoModal, setShowManifestoModal] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await getApprovedCandidates();
        
        console.log("API Response:", response); // Debug log
        
        if (response.success) {
          console.log("Elections data:", response.data.elections); // Debug log
          setElections(response.data.elections);
          if (response.data.elections.length > 0) {
            toast.success(`Loaded ${response.data.elections.length} election(s) with candidates`);
          } else {
            toast.error("No approved candidates found");
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
                        <button
                          onClick={() => {
                            setSelectedCandidate(candidate);
                            setShowManifestoModal(true);
                          }}
                          className="border text-sm text-gray-600 border-gray-400 w-28 h-8 rounded-full mt-4 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition"
                        >
                          View Details
                        </button>
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

      {/* Manifesto Modal */}
      {showManifestoModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="text-2xl font-bold text-gray-900">Candidate Details</h2>
              <button
                onClick={() => {
                  setShowManifestoModal(false);
                  setSelectedCandidate(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Candidate Info */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    className="w-24 h-24 rounded-full object-cover object-top border-4 border-indigo-100"
                    src={selectedCandidate.photo || "https://via.placeholder.com/96"}
                    alt={selectedCandidate.name}
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedCandidate.name}</h3>
                    <p className="text-indigo-600 font-semibold">{selectedCandidate.position}</p>
                    <p className="text-gray-600 text-sm">Scholar ID: {selectedCandidate.scholarId}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Branch</p>
                    <p className="font-semibold text-gray-900">{selectedCandidate.branch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Year</p>
                    <p className="font-semibold text-gray-900">{selectedCandidate.year}</p>
                  </div>
                  {selectedCandidate.cgpa && (
                    <div>
                      <p className="text-sm text-gray-600">CGPA</p>
                      <p className="font-semibold text-gray-900">{selectedCandidate.cgpa}/10</p>
                    </div>
                  )}
                  {selectedCandidate.email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900 text-sm">{selectedCandidate.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Manifesto */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">Manifesto</h4>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedCandidate.manifesto || "No manifesto available."}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowManifestoModal(false);
                  setSelectedCandidate(null);
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateList;
