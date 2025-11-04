import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthAPI from "../../utils/authAPI";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";

const CandidateRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasFetched = useRef(false); 
  const [scholarNo, setScholarNo] = useState(""); // Will be set from fetched data
  const [studentFetched, setStudentFetched] = useState(false);
  const [fetchingStudent, setFetchingStudent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    position: "",
    manifesto: "",
    branch: "",
    year: "",
    cgpa: "",
    electionId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [elections, setElections] = useState([]);

  const branches = [
    "MCA",
    "Computer Science Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electronics & Communication Engineering",
    "Chemical Engineering",
    "Information Technology",
    "Biotechnology",
  ];

  const positions = ["President", "Vice President", "Secretary", "Treasurer"];

  const years = [1, 2, 3, 4];

  // Fetch authenticated student details from token
  const handleFetchStudent = async () => {
    setFetchingStudent(true);
    setError("");

    try {
      // Get student token from localStorage
      const token = localStorage.getItem('studentToken');
      
      if (!token) {
        const errorMsg = "You must be logged in as a student to register as a candidate";
        setError(errorMsg);
        toast.error(errorMsg);
        // Redirect to student login
        setTimeout(() => navigate('/student/login'), 2000);
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/student/details', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const student = data.data;
        setScholarNo(student.scholarNo); // Set the scholar number from response
        setFormData((prev) => ({
          ...prev,
          name: student.name,
          email: student.email,
          phone: student.phone,
        }));
        setStudentFetched(true);
        toast.success("✅ Student details fetched successfully!");
      } else {
        const errorMsg = data?.message || "Failed to fetch student details";
        setError(errorMsg);
        toast.error(errorMsg);
        setStudentFetched(false);
        
        // If unauthorized, redirect to login
        if (response.status === 401 || response.status === 403) {
          setTimeout(() => navigate('/student/login'), 2000);
        }
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      const errorMsg = "Network error. Please check your connection and try again.";
      setError(errorMsg);
      toast.error(errorMsg);
      setStudentFetched(false);
    } finally {
      setFetchingStudent(false);
    }
  };

  // Fetch available elections and student details on component mount
  useEffect(() => {
    // Prevent duplicate fetches in React StrictMode
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchElections = async () => {
      try {
        const response = await AuthAPI.getPublicElections();
        
        if (response && response.success) {
          const electionsList = response.data?.elections || [];
          setElections(electionsList);
          
          if (electionsList.length === 0) {
            toast("No upcoming elections available at the moment", { icon: 'ℹ️' });
          }
        } else {
          const errorMsg = response?.message || "Failed to load elections";
          console.error("API returned error:", errorMsg);
          toast.error(errorMsg);
        }
      } catch (error) {
        console.error("Error fetching elections:", error);
        toast.error(`Failed to load elections: ${error.message}`);
      }
    };
    
    // Auto-fetch student details on mount
    handleFetchStudent();
    fetchElections();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Check for whitespace in email and password fields
    if ((name === 'email' || name === 'password' || name === 'confirmPassword') && /\s/.test(value)) {
      const fieldName = name === 'email' ? 'Email' : name === 'confirmPassword' ? 'Confirm Password' : 'Password';
      const errorMsg = `${fieldName} cannot contain whitespace`;
      setError(errorMsg);
      toast.error(errorMsg);
      // Don't update state - reject the input
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (error) setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        const errorMsg = "File size should not exceed 5MB";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        const errorMsg = "Only PDF, DOC, DOCX, JPEG, JPG, and PNG files are allowed";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      setSelectedFile(file);
      toast.success("📄 Document uploaded successfully");
      if (error) setError("");
    }
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (2MB limit for images)
      if (file.size > 2 * 1024 * 1024) {
        const errorMsg = "Profile picture size should not exceed 2MB";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Validate file type (only images)
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

      if (!allowedTypes.includes(file.type)) {
        const errorMsg = "Only JPEG, JPG, and PNG images are allowed for profile picture";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      setSelectedProfile(file);
      toast.success("📷 Profile picture uploaded successfully");
      if (error) setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Check if student details are fetched
      if (!studentFetched) {
        const errorMsg = "Please fetch your student details first";
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      // Validate required fields
      const requiredFields = [
        "name",
        "email",
        "phone",
        "password",
        "confirmPassword",
        "position",
        "branch",
        "year",
        "electionId",
      ];
      const missingFields = requiredFields.filter(
        (field) => !formData[field].trim()
      );

      if (missingFields.length > 0) {
        const errorMsg = "Please fill in all required fields";
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      // Validate election selection specifically
      if (!formData.electionId) {
        const errorMsg = "Please select an election to contest";
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      // Validate file upload
      if (!selectedFile) {
        const errorMsg = "Please upload a document file (marksheet)";
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        const errorMsg = "Passwords do not match";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });
      formDataToSend.append("document", selectedFile);
      
      // Add profile picture if selected (optional)
      if (selectedProfile) {
        formDataToSend.append("profile", selectedProfile);
      }

      const { response, data } = await AuthAPI.candidateRegister(
        formDataToSend
      );

      if (response.ok && data.success) {
        toast.success("🎉 Registration successful! Please login.");
        // Navigate to candidate login
        navigate("/candidate/login");
      } else {
        const errorMsg = data?.message || "Registration failed. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMsg = "Network error. Please check your connection and try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-8"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800">
            Candidate Registration
          </h1>
          <p className="mt-2 text-gray-600">
            Register as a candidate for student elections
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Student Verification Status */}
            {fetchingStudent && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Verifying your student account...
                  </span>
                </div>
              </div>
            )}
            
            {!fetchingStudent && studentFetched && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-xl">✓</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Student Account Verified
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Scholar Number: {scholarNo} • Your details have been loaded from student records
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {!fetchingStudent && !studentFetched && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 text-xl">⚠</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Student Verification Required
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      You must be logged in as a student to register as a candidate.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/student/login')}
                      className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                    >
                      Go to Student Login →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information (Read-only after fetch) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={studentFetched ? "Fetched from student records" : "Enter your full name"}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    studentFetched ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                  }`}
                  required
                  disabled={studentFetched || loading}
                  readOnly={studentFetched}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={studentFetched ? "Fetched from student records" : "Enter your email"}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    studentFetched ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                  }`}
                  required
                  disabled={studentFetched || loading}
                  readOnly={studentFetched}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={studentFetched ? "Fetched from student records" : "Enter phone number"}
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    studentFetched ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                  }`}
                  required
                  disabled={studentFetched || loading}
                  readOnly={studentFetched}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CGPA
                </label>
                <input
                  name="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={handleInputChange}
                  placeholder="Enter CGPA"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Branch *
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                  disabled={loading}
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Year *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                  disabled={loading}
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Election Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Election *
                </label>
                <select
                  name="electionId"
                  value={formData.electionId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white border ${!formData.electionId && error ? 'border-red-300' : 'border-gray-200'} rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                  required
                  disabled={loading}
                >
                  <option value="">Select Election (Required)</option>
                  {elections.length === 0 ? (
                    <option value="" disabled>No elections available</option>
                  ) : (
                    elections.map((election) => (
                      <option key={election.Election_id} value={election.Election_id}>
                        {election.Title} - {election.Status}
                      </option>
                    ))
                  )}
                </select>
                {elections.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">
                    No upcoming elections available. Please contact admin.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Position *
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                  disabled={loading}
                >
                  <option value="">Select Position</option>
                  {positions.map((position) => (
                    <option key={position} value={position}>
                      {position}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Manifesto */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Manifesto
              </label>
              <textarea
                name="manifesto"
                value={formData.manifesto}
                onChange={handleInputChange}
                placeholder="Describe your vision and plans..."
                rows={4}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                disabled={loading}
              />
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Year Marksheet *
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  required
                  disabled={loading}
                />
                {selectedFile && (
                  <div className="mt-2 text-sm text-green-600">
                    Selected: {selectedFile.name} (
                    {Math.round(selectedFile.size / 1024)} KB)
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Upload PDF, DOC, DOCX, JPG, JPEG, or PNG files (Max: 5MB)
              </p>
            </div>

            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Profile Picture (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleProfileChange}
                  accept=".jpg,.jpeg,.png"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  disabled={loading}
                />
                {selectedProfile && (
                  <div className="mt-2 text-sm text-green-600">
                    Selected: {selectedProfile.name} (
                    {Math.round(selectedProfile.size / 1024)} KB)
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Upload JPG, JPEG, or PNG image (Max: 2MB)
              </p>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !studentFetched || !formData.electionId || elections.length === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Registering...
                </div>
              ) : !studentFetched ? (
                "Fetch Student Details First"
              ) : !formData.electionId ? (
                "Select an Election to Continue"
              ) : (
                "Register as Candidate"
              )}
            </motion.button>
            {!studentFetched && !loading && (
              <p className="mt-2 text-sm text-center text-orange-500">
                ⚠️ Please fetch your student details before registering
              </p>
            )}
            {studentFetched && !formData.electionId && !loading && (
              <p className="mt-2 text-sm text-center text-red-500">
                ⚠️ Please select an election before registering
              </p>
            )}
          </form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-600">
              Already have an account?
              <motion.button
                onClick={() => navigate("/candidate/login")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="ml-1 text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors duration-200"
              >
                Sign In
              </motion.button>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CandidateRegister;
