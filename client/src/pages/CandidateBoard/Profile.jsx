import React, { useState, useEffect } from "react";
import { UserIcon, EnvelopeIcon, PhoneIcon, AcademicCapIcon, KeyIcon, DocumentTextIcon, TrophyIcon } from "@heroicons/react/24/outline";
import AuthAPI from "../../utils/authAPI";

const CandidateProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // TODO: Get candidate data from auth context - for now using hardcoded ID
  const currentCandidateId = 202151001;
  
  const [candidateData, setCandidateData] = useState({
    Can_id: currentCandidateId,
    Can_name: "",
    Can_email: "",
    Can_phone: "",
    Position: "",
    Branch: "",
    Year: 0,
    Cgpa: 0.0,
    Manifesto: "",
    Election_id: 0,
  });

  const [formData, setFormData] = useState(candidateData);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Load candidate profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call when backend is ready
        // const { response, data } = await AuthAPI.getCandidateProfile(currentCandidateId);
        
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockProfile = {
          Can_id: currentCandidateId,
          Can_name: "John Doe",
          Can_email: "202151001@stu.manit.ac.in",
          Can_phone: "+91 9876543210",
          Position: "President",
          Branch: "Computer Science Engineering",
          Year: 3,
          Cgpa: 8.75,
          Manifesto: "Working towards a better student experience with improved facilities and academic excellence.",
          Election_id: 1,
        };
        
        setCandidateData(mockProfile);
        setFormData(mockProfile);
        
        // if (response.ok && data.success) {
        //   const profile = data.data.profile;
        //   setCandidateData(profile);
        //   setFormData(profile);
        // } else {
        //   setMessage({ type: 'error', text: data.message || 'Failed to load profile' });
        // }
      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentCandidateId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Year' ? parseInt(value) || 0 : 
              name === 'Cgpa' ? parseFloat(value) || 0.0 : 
              value
    }));
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // TODO: Replace with actual API call
      // const profileData = {
      //   name: formData.Can_name,
      //   phone: formData.Can_phone,
      //   position: formData.Position,
      //   branch: formData.Branch,
      //   year: formData.Year,
      //   cgpa: formData.Cgpa,
      //   manifesto: formData.Manifesto
      // };
      // const { response, data } = await AuthAPI.updateCandidateProfile(currentCandidateId, profileData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCandidateData(formData);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      // if (response.ok && data.success) {
      //   setCandidateData(data.data.profile);
      //   setFormData(data.data.profile);
      //   setIsEditing(false);
      //   setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // } else {
      //   setMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
      // }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // TODO: Replace with actual API call
      // const passwordUpdateData = {
      //   currentPassword: passwordData.currentPassword,
      //   newPassword: passwordData.newPassword
      // };
      // const { response, data } = await AuthAPI.changeCandidatePassword(currentCandidateId, passwordUpdateData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      setMessage({ type: 'success', text: 'Password changed successfully!' });

      // if (response.ok && data.success) {
      //   setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      //   setShowPasswordForm(false);
      //   setMessage({ type: 'success', text: 'Password changed successfully!' });
      // } else {
      //   setMessage({ type: 'error', text: data.message || 'Failed to change password.' });
      // }
    } catch (error) {
      console.error('Password change error:', error);
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setFormData(candidateData);
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="px-10 md:px-20 max-w-7xl mt-28 items-center mx-auto mb-20">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-black-600">Candidate Profile</h1>
        <p className="text-center text-gray-600 mt-2 px-5">
          Manage your candidacy information and campaign details.<br />
          Keep your profile updated to engage effectively with voters.
        </p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-8 p-4 rounded-2xl border ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-300 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <TrophyIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-purple-800">Candidate Information</h2>
                <p className="text-gray-600">Manage your candidacy and campaign details</p>
              </div>
            </div>
            {!isEditing && !loading && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && !isEditing && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading profile...</span>
          </div>
        )}

        {/* Profile Content */}
        <div className="p-8">
          {loading && !isEditing ? null : isEditing ? (
            /* Edit Form */
            <form onSubmit={handleProfileUpdate} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Candidate ID (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Candidate ID
                  </label>
                  <div className="relative">
                    <UserIcon className="h-5 w-5 text-purple-400 absolute left-4 top-4" />
                    <input
                      type="text"
                      value={formData.Can_id}
                      disabled
                      className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 font-medium"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="h-5 w-5 text-purple-400 absolute left-4 top-4" />
                    <input
                      type="text"
                      name="Can_name"
                      value={formData.Can_name}
                      onChange={handleInputChange}
                      required
                      className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="h-5 w-5 text-purple-400 absolute left-4 top-4" />
                    <input
                      type="email"
                      value={formData.Can_email}
                      disabled
                      className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 font-medium"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="h-5 w-5 text-purple-400 absolute left-4 top-4" />
                    <input
                      type="tel"
                      name="Can_phone"
                      value={formData.Can_phone}
                      onChange={handleInputChange}
                      required
                      className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Position *
                  </label>
                  <div className="relative">
                    <TrophyIcon className="h-5 w-5 text-purple-400 absolute left-4 top-4" />
                    <select
                      name="Position"
                      value={formData.Position}
                      onChange={handleInputChange}
                      required
                      className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                      <option value="">Select Position</option>
                      <option value="President">President</option>
                      <option value="Vice President">Vice President</option>
                      <option value="Secretary">Secretary</option>
                      <option value="Treasurer">Treasurer</option>
                      <option value="Cultural Secretary">Cultural Secretary</option>
                      <option value="Sports Secretary">Sports Secretary</option>
                      <option value="Literary Secretary">Literary Secretary</option>
                    </select>
                  </div>
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Branch *
                  </label>
                  <div className="relative">
                    <AcademicCapIcon className="h-5 w-5 text-purple-400 absolute left-4 top-4" />
                    <select
                      name="Branch"
                      value={formData.Branch}
                      onChange={handleInputChange}
                      required
                      className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                      <option value="">Select Branch</option>
                      <option value="Computer Science Engineering">Computer Science Engineering</option>
                      <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                    </select>
                  </div>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Year *
                  </label>
                  <div className="relative">
                    <AcademicCapIcon className="h-5 w-5 text-purple-400 absolute left-4 top-4" />
                    <select
                      name="Year"
                      value={formData.Year}
                      onChange={handleInputChange}
                      required
                      className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                      <option value="">Select Year</option>
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                </div>

                {/* CGPA */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    CGPA *
                  </label>
                  <div className="relative">
                    <TrophyIcon className="h-5 w-5 text-purple-400 absolute left-4 top-4" />
                    <input
                      type="number"
                      name="Cgpa"
                      value={formData.Cgpa}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max="10"
                      step="0.01"
                      className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      placeholder="Enter your CGPA"
                    />
                  </div>
                </div>
              </div>

              {/* Manifesto */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Manifesto *
                </label>
                <div className="relative">
                  <DocumentTextIcon className="h-5 w-5 text-purple-400 absolute left-4 top-4" />
                  <textarea
                    name="Manifesto"
                    value={formData.Manifesto}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                    placeholder="Describe your vision, goals, and plans for the position..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition duration-200 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 disabled:opacity-50 transition duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <UserIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-600 mb-1">Candidate ID</p>
                      <p className="text-lg font-bold text-purple-800">{candidateData.Can_id}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-200 p-3 rounded-full">
                      <UserIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Full Name</p>
                      <p className="text-lg font-semibold text-gray-800">{candidateData.Can_name}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-200 p-3 rounded-full">
                      <EnvelopeIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Email Address</p>
                      <p className="text-lg font-semibold text-gray-800">{candidateData.Can_email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-200 p-3 rounded-full">
                      <PhoneIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-800">{candidateData.Can_phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <TrophyIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">Position</p>
                      <p className="text-lg font-bold text-blue-800">{candidateData.Position}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-200 p-3 rounded-full">
                      <AcademicCapIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Branch</p>
                      <p className="text-lg font-semibold text-gray-800">{candidateData.Branch}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-200 p-3 rounded-full">
                      <AcademicCapIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Year & CGPA</p>
                      <p className="text-lg font-semibold text-gray-800">{candidateData.Year ? `${candidateData.Year}${candidateData.Year === 1 ? 'st' : candidateData.Year === 2 ? 'nd' : candidateData.Year === 3 ? 'rd' : 'th'} Year` : 'N/A'} • {candidateData.Cgpa}/10</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-1">Candidacy Status</p>
                      <p className="text-lg font-semibold text-green-800">Active Candidate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manifesto Section */}
              <div className="lg:col-span-2 mt-8">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-600 mb-2">Manifesto</p>
                      <p className="text-gray-700 leading-relaxed">{candidateData.Manifesto || 'No manifesto available.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-2xl border border-gray-300 shadow-sm hover:shadow-md transition-shadow overflow-hidden mt-8">
        {/* Security Header */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 p-3 rounded-full">
                <KeyIcon className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-red-800">Account Security</h3>
                <p className="text-gray-600">Manage your password and security settings</p>
              </div>
            </div>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition duration-200 flex items-center space-x-2"
              >
                <KeyIcon className="w-4 h-4" />
                <span>Change Password</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          {showPasswordForm ? (
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Current Password *
                  </label>
                  <div className="relative">
                    <KeyIcon className="h-5 w-5 text-red-400 absolute left-4 top-4" />
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholder="Enter your current password"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    New Password *
                  </label>
                  <div className="relative">
                    <KeyIcon className="h-5 w-5 text-red-400 absolute left-4 top-4" />
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholder="Enter new password (min 6 chars)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <KeyIcon className="h-5 w-5 text-red-400 absolute left-4 top-4" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="pl-12 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholder="Confirm your new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setMessage({ type: '', text: '' });
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition duration-200 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 disabled:opacity-50 transition duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Changing...
                    </>
                  ) : (
                    <>
                      <KeyIcon className="w-4 h-4 mr-2" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-200 p-3 rounded-full">
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Password Security</p>
                    <p className="text-gray-500 text-sm">Your password is protected and secure</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Last changed</p>
                  <p className="text-sm font-medium text-gray-700">Not available</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;