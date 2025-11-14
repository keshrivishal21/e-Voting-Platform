import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, XCircleIcon, LockClosedIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import VoteAPI from "../../utils/voteAPI";
import toast from "react-hot-toast";

const CastVote = () => {
  const [step, setStep] = useState("elections");
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [ballot, setBallot] = useState(null);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [publicKey, setPublicKey] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [voteReceipts, setVoteReceipts] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    fetchOngoingElections();
  }, []);

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const fetchOngoingElections = async () => {
    try {
      setLoading(true);
      const { response, data } = await VoteAPI.getOngoingElections();
      
      if (response.ok) {
        setElections(data.elections || []);
      } else {
        toast.error(data.message || "Failed to fetch elections");
      }
    } catch (error) {
      console.error("Error fetching elections:", error);
      toast.error("Failed to load elections");
    } finally {
      setLoading(false);
    }
  };

  const handleElectionSelect = (election) => {
    if (election.hasVoted) {
      toast.error("You have already voted in this election");
      return;
    }
    setSelectedElection(election);
    setStep("otp-request");
  };

  const requestOTP = async () => {
    try {
      setOtpLoading(true);
      const { response, data } = await VoteAPI.requestVotingOTP(selectedElection.Election_id);
      
      if (response.ok) {
        toast.success(data.message);
        setOtpTimer(data.expiresIn || 600);
        setStep("otp-verify");
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
      toast.error("Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setOtpLoading(true);
      const { response, data } = await VoteAPI.verifyOTP(selectedElection.Election_id, otp);
      
      if (response.ok) {
        toast.success("OTP verified successfully");
        await loadBallotAndPublicKey();
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("OTP verification failed");
    } finally {
      setOtpLoading(false);
    }
  };

  const loadBallotAndPublicKey = async () => {
    try {
      setLoading(true);
      
      const [ballotResult, keyResult] = await Promise.all([
        VoteAPI.getBallot(selectedElection.Election_id),
        VoteAPI.getElectionPublicKey(selectedElection.Election_id)
      ]);

      if (ballotResult.response.ok && keyResult.response.ok) {
        setBallot(ballotResult.data);
        setPublicKey(keyResult.data.publicKey);
        setStep("ballot");
      } else {
        toast.error("Failed to load ballot");
      }
    } catch (error) {
      console.error("Error loading ballot:", error);
      toast.error("Failed to load ballot");
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSelection = (position, candidateId) => {
    setSelectedVotes({
      ...selectedVotes,
      [position]: candidateId
    });
  };

  const submitVote = async () => {
    const positions = Object.keys(ballot.positions);
    const votedPositions = Object.keys(selectedVotes);

    if (votedPositions.length !== positions.length) {
      toast.error("Please vote for all positions");
      return;
    }

    const hasInvalidVotes = Object.values(selectedVotes).some(
      candidateId => !candidateId || candidateId === null || candidateId === undefined
    );

    if (hasInvalidVotes) {
      toast.error("Please select a valid candidate for each position");
      return;
    }

    if (Object.keys(selectedVotes).length === 0) {
      toast.error("Please select at least one candidate");
      return;
    }

    try {
      setSubmitting(true);
      
      const encryptedVotes = {};
      for (const [position, candidateId] of Object.entries(selectedVotes)) {
        const encryptedVote = await VoteAPI.encryptVote(candidateId, publicKey);
        encryptedVotes[position] = {
          candidateId,
          encryptedVote
        };
      }

      // Submit encrypted votes
      const { response, data } = await VoteAPI.castVote(selectedElection.Election_id, encryptedVotes);

      if (response.ok) {
        toast.success("Vote cast successfully!");
        setVoteReceipts(data.receipts);
        setStep("confirmation");
      } else {
        toast.error(data.message || "Failed to cast vote");
      }
    } catch (error) {
      console.error("Error casting vote:", error);
      toast.error("Failed to cast vote");
    } finally {
      setSubmitting(false);
    }
  };

  const resetVoting = () => {
    setStep("elections");
    setSelectedElection(null);
    setOtp("");
    setBallot(null);
    setSelectedVotes({});
    setPublicKey(null);
    setVoteReceipts(null);
    fetchOngoingElections();
  };

  const downloadReceipts = () => {
    if (!voteReceipts || voteReceipts.length === 0) return;

    // Create receipt content
    const content = `
═══════════════════════════════════════════════════════
                  VOTE RECEIPT
═══════════════════════════════════════════════════════

Election: ${selectedElection?.Title || 'N/A'}
Date: ${new Date().toLocaleString()}

${voteReceipts.map((receipt, index) => `
───────────────────────────────────────────────────────
Position ${index + 1}: ${receipt.position}
───────────────────────────────────────────────────────
Vote ID: ${receipt.voteId}
Receipt ID: ${receipt.receiptId}
Timestamp: ${new Date(receipt.timestamp).toLocaleString()}

Receipt Hash (Verification Token):
${receipt.receiptHash}

`).join('')}
═══════════════════════════════════════════════════════
                IMPORTANT NOTICE
═══════════════════════════════════════════════════════

Please save this receipt securely. The receipt hashes can
be used to verify that your vote was counted after the
election results are published.

This is an official vote receipt from the e-Voting Platform.

═══════════════════════════════════════════════════════
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vote-receipt-${selectedElection?.Election_id}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Receipt downloaded successfully!');
  };

  const copyReceiptsToClipboard = () => {
    if (!voteReceipts || voteReceipts.length === 0) return;

    const content = voteReceipts.map(receipt => 
      `${receipt.position}: ${receipt.receiptHash}`
    ).join('\n');

    navigator.clipboard.writeText(content).then(() => {
      toast.success('Receipt hashes copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const renderElectionsList = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-indigo-600 mb-2">Cast Your Vote</h1>
        <p className="text-gray-600">Select an election to participate in</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : elections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No ongoing elections available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {elections.map((election, index) => (
            <motion.div
              key={election.Election_id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow ${
                election.hasVoted ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
              }`}
              onClick={() => !election.hasVoted && handleElectionSelect(election)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{election.Title}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>📅 Ends: {new Date(election.End_date).toLocaleString()}</p>
                    <p>👥 {election.candidateCount} candidates across {election.positions.length} positions</p>
                    <p>📋 Positions: {election.positions.join(", ")}</p>
                  </div>
                </div>
                <div>
                  {election.hasVoted ? (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="font-medium">Voted</span>
                    </div>
                  ) : (
                    <div className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition">
                      Vote Now
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderOTPRequest = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Identity</h2>
          <p className="text-gray-600">
            We'll send a One-Time Password (OTP) to your registered email address
          </p>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-indigo-900 mb-2">{selectedElection?.Title}</h3>
          <p className="text-sm text-indigo-700">
            {selectedElection?.positions.length} positions • {selectedElection?.candidateCount} candidates
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={requestOTP}
            disabled={otpLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {otpLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending OTP...
              </span>
            ) : (
              "Send OTP"
            )}
          </button>

          <button
            onClick={() => setStep("elections")}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition"
          >
            Back to Elections
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderOTPVerification = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter OTP</h2>
          <p className="text-gray-600">
            We've sent a 6-digit code to your email
          </p>
          {otpTimer > 0 && (
            <p className="text-sm text-indigo-600 mt-2">
              Code expires in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
            </p>
          )}
        </div>

        <div className="mb-6">
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit OTP"
            className="w-full text-center text-3xl font-bold tracking-widest border-2 border-gray-300 rounded-xl px-4 py-4 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="space-y-4">
          <button
            onClick={verifyOTP}
            disabled={otpLoading || otp.length !== 6}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {otpLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Verifying...
              </span>
            ) : (
              "Verify & Continue"
            )}
          </button>

          <button
            onClick={requestOTP}
            disabled={otpLoading || otpTimer > 540}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Resend OTP
          </button>

          <button
            onClick={() => {
              setStep("elections");
              setOtp("");
            }}
            className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderBallot = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto"
    >
      <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{ballot?.election.Title}</h2>
            <p className="text-gray-600">Select one candidate for each position</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-green-600">
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Verified</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">End-to-end encrypted</p>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4">
          <p className="text-sm text-indigo-800">
            <strong>Privacy Notice:</strong> Your votes are encrypted on your device before being sent. 
            Only you know who you voted for until results are decrypted by election administrators.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(ballot?.positions || {}).map(([position, candidates]) => (
            <div key={position} className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-indigo-200">
                {position}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {candidates.map((candidate) => (
                  <motion.div
                    key={candidate.Can_id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition ${
                      selectedVotes[position] === candidate.Can_id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-300 hover:border-indigo-400"
                    }`}
                    onClick={() => handleVoteSelection(position, candidate.Can_id)}
                  >
                    {selectedVotes[position] === candidate.Can_id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircleIcon className="w-6 h-6 text-indigo-600" />
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      {candidate.profileImage ? (
                        <img
                          src={candidate.profileImage}
                          alt={candidate.Can_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-500">
                            {candidate.Can_name.charAt(0)}
                          </span>
                        </div>
                      )}

                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{candidate.Can_name}</h4>
                        <p className="text-sm text-gray-600">{candidate.Branch} • Year {candidate.Year}</p>
                      </div>
                    </div>

                    {candidate.Manifesto && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-700 line-clamp-2">{candidate.Manifesto}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          <div className="sticky bottom-0 bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">
                  Selected {Object.keys(selectedVotes).length} of {Object.keys(ballot?.positions || {}).length} positions
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setStep("elections");
                    setSelectedVotes({});
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitVote}
                  disabled={submitting || Object.keys(selectedVotes).length !== Object.keys(ballot?.positions || {}).length}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Vote"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderConfirmation = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="w-14 h-14 text-green-600" />
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">Vote Cast Successfully!</h2>
        <p className="text-gray-600 mb-8">
          Your vote has been encrypted and recorded. Here are your vote receipts:
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Vote Receipts</h3>
          <div className="space-y-4">
            {voteReceipts?.map((receipt, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-700">{receipt.position}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(receipt.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="bg-gray-100 rounded p-2 mt-2">
                  <p className="text-xs font-mono text-gray-600 break-all">
                    {receipt.receiptHash}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-indigo-800">
            <strong>Important:</strong> Save these receipt hashes. They can be used to verify that your vote 
            was counted after the election results are published.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={downloadReceipts}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Receipt
          </button>

          <button
            onClick={copyReceiptsToClipboard}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Hashes
          </button>
        </div>

        <button
          onClick={resetVoting}
          className="w-full px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
        >
          Back to Elections
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="mt-20 mb-18">
        <AnimatePresence mode="wait">
          {step === "elections" && renderElectionsList()}
          {step === "otp-request" && renderOTPRequest()}
          {step === "otp-verify" && renderOTPVerification()}
          {step === "ballot" && renderBallot()}
          {step === "confirmation" && renderConfirmation()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CastVote;
