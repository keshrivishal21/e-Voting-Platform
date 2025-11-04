import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AdminAPI from "../../utils/adminAPI";

const CandidateManagement = () => {
  const [pendingCandidates, setPendingCandidates] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewPending, setViewPending] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch pending candidates from server
  const fetchPendingCandidates = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getPendingCandidates();
      if (response.success) {
        setPendingCandidates(response.data.candidates);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load pending candidates");
      console.error("Error fetching pending candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch approved candidates from server
  const fetchApprovedCandidates = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getAllCandidates("Approved");
      if (response.success) {
        setCandidates(response.data.candidates);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load approved candidates");
      console.error("Error fetching approved candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPendingCandidates();
    fetchApprovedCandidates();
  }, []);

  // Approve a pending candidate
  const approveCandidate = async (candidate) => {
    try {
      console.log("Approving candidate with ID:", candidate.Can_id);
      const response = await AdminAPI.approveCandidate(candidate.Can_id);
      console.log("Approval response:", response);
      
      if (response.success) {
        toast.success("Candidate approved successfully!");
        // Refresh both lists
        fetchPendingCandidates();
        fetchApprovedCandidates();
      } else {
        toast.error(response.message || "Failed to approve candidate");
      }
    } catch (error) {
      console.error("Error approving candidate:", error);
      toast.error(error.message || "Failed to approve candidate");
    }
  };

  // Open view modal
  const viewCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  // Close view modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedCandidate(null);
  };

  // Open reject modal
  const openRejectModal = (candidate) => {
    setSelectedCandidate(candidate);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  // Close reject modal
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedCandidate(null);
    setRejectionReason("");
  };

  // Reject/Remove a candidate
  const removeCandidate = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    
    try {
      const response = await AdminAPI.rejectCandidate(selectedCandidate.Can_id, rejectionReason);
      if (response.success) {
        toast.success("Candidate rejected successfully");
        closeRejectModal();
        // Refresh both lists based on current status
        if (selectedCandidate.Status === "Pending") {
          fetchPendingCandidates();
        } else {
          fetchApprovedCandidates();
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to reject candidate");
      console.error("Error rejecting candidate:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 ">
      <div className="mt-20 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">
        Candidate Management
      </h1>

      {/* Toggle Buttons */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setViewPending(true)}
          className={`px-6 py-2 rounded-2xl font-semibold shadow transition ${
            viewPending
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600 border border-indigo-300"
          }`}
        >
          Pending Requests
        </button>
        <button
          onClick={() => setViewPending(false)}
          className={`px-6 py-2 rounded-2xl font-semibold shadow transition ${
            !viewPending
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600 border border-indigo-300"
          }`}
        >
          Current Candidates
        </button>
      </div>

      {/* Conditional Rendering based on toggle */}
      {viewPending ? (
        // Pending Requests Table
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
            Pending Candidate Requests
          </h2>
          <div className="bg-white shadow rounded-2xl p-4 overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-indigo-100 text-left">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Position</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : pendingCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-center text-gray-500">
                      No pending requests
                    </td>
                  </tr>
                ) : (
                  pendingCandidates.map((candidate, index) => (
                    <tr key={candidate.Can_id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">
                        <div>
                          <div className="font-medium">{candidate.Can_name}</div>
                          <div className="text-sm text-gray-500">{candidate.Can_email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div>
                          <div>{candidate.Position}</div>
                          {candidate.election && (
                            <div className="text-sm text-gray-500">{candidate.election.Title}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewCandidateDetails(candidate)}
                            className="bg-blue-500 text-white px-3 py-2 rounded-2xl shadow hover:bg-blue-600 transition text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => approveCandidate(candidate)}
                            disabled={loading}
                            className="bg-green-600 text-white px-3 py-2 rounded-2xl shadow hover:bg-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(candidate)}
                            disabled={loading}
                            className="bg-red-400 text-white px-3 py-2 rounded-2xl shadow hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Current Candidates Table
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-indigo-600">
            Current Candidates
          </h2>
          <div className="bg-white shadow rounded-2xl p-4 overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-indigo-100 text-left">
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Position</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : candidates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-center text-gray-500">
                      No candidates available
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate, index) => (
                    <tr key={candidate.Can_id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">
                        <div>
                          <div className="font-medium">{candidate.Can_name}</div>
                          <div className="text-sm text-gray-500">{candidate.Can_email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div>
                          <div>{candidate.Position}</div>
                          {candidate.election && (
                            <div className="text-sm text-gray-500">{candidate.election.Title}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewCandidateDetails(candidate)}
                            className="bg-blue-500 text-white px-3 py-2 rounded-2xl shadow hover:bg-blue-600 transition text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openRejectModal(candidate)}
                            disabled={loading}
                            className="bg-red-400 text-white px-3 py-2 rounded-2xl shadow hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Candidate Details Modal */}
      {showModal && selectedCandidate && (
        <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Candidate Details</h2>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Personal Information */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-indigo-700 mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{selectedCandidate.Can_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedCandidate.Can_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{selectedCandidate.Can_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Position</p>
                    <p className="font-medium">{selectedCandidate.Position}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-indigo-700 mb-3">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Branch</p>
                    <p className="font-medium">{selectedCandidate.Branch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Year</p>
                    <p className="font-medium">{selectedCandidate.Year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CGPA</p>
                    <p className="font-medium">{selectedCandidate.Cgpa}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`font-medium ${
                      selectedCandidate.Status === "Approved" 
                        ? "text-green-600" 
                        : selectedCandidate.Status === "Rejected" 
                        ? "text-red-600" 
                        : "text-yellow-600"
                    }`}>
                      {selectedCandidate.Status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Election Information */}
              {selectedCandidate.election && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="text-lg font-semibold text-indigo-700 mb-3">Election Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Election Title</p>
                      <p className="font-medium">{selectedCandidate.election.Title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Election Status</p>
                      <p className="font-medium">{selectedCandidate.election.Status}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Manifesto */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-indigo-700 mb-3">Manifesto</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedCandidate.Manifesto || "No manifesto provided"}</p>
              </div>

              {/* Marksheet/Document */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-indigo-700 mb-3">Uploaded Marksheet</h3>
                <div className="flex items-center space-x-3">
                  <a
                    href={AdminAPI.getCandidateDocumentUrl(selectedCandidate.Can_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-xl shadow hover:bg-indigo-700 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Marksheet
                  </a>
                  <a
                    href={AdminAPI.getCandidateDocumentUrl(selectedCandidate.Can_id)}
                    download={`marksheet_${selectedCandidate.Can_name.replace(/\s+/g, "_")}.pdf`}
                    className="inline-flex items-center bg-gray-600 text-white px-4 py-2 rounded-xl shadow hover:bg-gray-700 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-2">Click to view or download the uploaded marksheet document</p>
              </div>

              {/* Rejection Reason (if rejected) */}
              {selectedCandidate.Status === "Rejected" && selectedCandidate.Rejection_reason && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Rejection Reason</h3>
                  <p className="text-red-800">{selectedCandidate.Rejection_reason}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl flex justify-end space-x-3">
              {selectedCandidate.Status === "Pending" && (
                <>
                  <button
                    onClick={() => {
                      closeModal();
                      approveCandidate(selectedCandidate);
                    }}
                    className="bg-green-600 text-white px-6 py-2 rounded-xl shadow hover:bg-green-500 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      closeModal();
                      openRejectModal(selectedCandidate);
                    }}
                    className="bg-red-400 text-white px-6 py-2 rounded-xl shadow hover:bg-red-500 transition"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-xl shadow hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedCandidate && (
        <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Reject Candidate</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-700 mb-2">
                  You are about to reject <span className="font-semibold">{selectedCandidate.Can_name}</span> for the position of <span className="font-semibold">{selectedCandidate.Position}</span>.
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Please provide a reason for rejection. This will be visible to the candidate.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows="4"
                  required
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                onClick={closeRejectModal}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-xl shadow hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={removeCandidate}
                disabled={!rejectionReason.trim()}
                className="bg-red-500 text-white px-6 py-2 rounded-xl shadow hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CandidateManagement;
