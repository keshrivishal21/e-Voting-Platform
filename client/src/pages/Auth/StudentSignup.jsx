import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/evoting.png";
import AuthAPI from "../../utils/authAPI";
import { apiFetch } from "../../utils/apiClient";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scholarNo, setScholarNo] = useState('');
  
  // OTP verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const collegeEmailRegex = /^(\d+)@stu\.manit\.ac\.in$/;

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
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing valid input
    if (error) setError('');

    // Extract scholar number from email for display purposes
    if (name === 'email' && value) {
      const match = value.match(collegeEmailRegex);
      if (match) {
        setScholarNo(match[1]); // Show extracted scholar number
        setError(''); // Clear error if email format is valid
      } else if (value) {
        setError("Please enter a valid college email (e.g. 123456@stu.manit.ac.in)");
        setScholarNo('');
      }
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        const errorMsg = "Only JPEG, JPG, and PNG files are allowed for profile picture";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        const errorMsg = "Profile picture must be less than 5MB";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      setProfilePicture(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePreview(null);
  };

  // Send OTP to email
  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    const match = formData.email.match(collegeEmailRegex);
    if (!match) {
      toast.error('Please enter a valid college email (e.g. 123456@stu.manit.ac.in)');
      return;
    }

    setOtpLoading(true);
    try {
      const { response, data } = await apiFetch('/auth/student/send-otp', {
        method: 'POST',
        body: { email: formData.email.trim() },
        auth: false
      });

      if (response && response.ok && data && data.success) {
        setOtpSent(true);
        setOtpVerified(false);
        toast.success(data.message || 'OTP sent to your email');
      } else {
        toast.error(data?.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifyLoading(true);
    try {
      const { response, data } = await apiFetch('/auth/student/verify-otp', {
        method: 'POST',
        body: { email: formData.email.trim(), otp },
        auth: false
      });

      if (response && response.ok && data && data.success) {
        setOtpVerified(true);
        toast.success('Email verified successfully!');
      } else {
        toast.error(data?.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (Object.values(formData).some((value) => !value.trim())) {
        const errorMsg = "Please fill in all fields";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Validate email format
      const match = formData.email.match(collegeEmailRegex);
      if (!match) {
        const errorMsg = "Please enter a valid college email (e.g. 123456@stu.manit.ac.in)";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Check if email is verified
      if (!otpVerified) {
        const errorMsg = "Please verify your email before registering";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        const errorMsg = "Passwords do not match";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Prepare data for API (backend extracts scholarNo from email)
      const registrationData = new FormData();
      registrationData.append('name', formData.name.trim());
      registrationData.append('email', formData.email.trim());
      registrationData.append('dob', formData.dob);
      registrationData.append('phone', formData.phone.trim());
      registrationData.append('password', formData.password);
      registrationData.append('confirmPassword', formData.confirmPassword);
      
      // Add profile picture if selected
      if (profilePicture) {
        registrationData.append('profile', profilePicture);
      }

      const { response, data } = await AuthAPI.studentRegister(registrationData);

      if (response.ok && data.success) {
        toast.success("Registration successful! You can now log in.");
        // Redirect to login page
        setTimeout(() => navigate('/student/login'), 1500);
      } else {
        const errorMsg = data.message || 'Registration failed. Please try again.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = 'Network error. Please check your connection and try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      {/* Signup Card */}
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-full shadow-2xl border-2 border-white/30">
              <div className="bg-white rounded-full p-1">
                <img
                  src={logo}
                  alt="e-Voting theme"
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover object-center"
                />
              </div>
            </div>
          </div>
          <h1 className="mt-4 text-2xl md:text-3xl font-bold text-gray-800">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Join the e-Voting platform
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl border border-white/20">
          <form className="space-y-5" onSubmit={submitHandler}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Scholar Number Display */}
            {scholarNo && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                Scholar Number: {scholarNo}
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              />
            </div>

            {/* Profile Picture Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Profile Picture <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              {profilePreview ? (
                <div className="flex items-center space-x-4">
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">{profilePicture?.name}</p>
                    <button
                      type="button"
                      onClick={removeProfilePicture}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                      disabled={loading}
                    >
                      Remove Picture
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="mb-1 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG or JPEG (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleProfilePictureChange}
                      disabled={loading}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                College Email
              </label>
              <div className="flex gap-2">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="123456@stu.manit.ac.in"
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                  disabled={loading || otpVerified}
                />
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={otpLoading || otpVerified || !formData.email}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    otpVerified
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap`}
                >
                  {otpLoading ? '...' : otpVerified ? '✓ Verified' : otpSent ? 'Resend' : 'Send OTP'}
                </button>
              </div>
            </div>

            {/* OTP Verification Field - Shows after OTP is sent */}
            {otpSent && !otpVerified && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter OTP
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  We've sent a 6-digit code to your email
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                    }}
                    placeholder="000000"
                    maxLength={6}
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-center text-xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={verifyLoading}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={verifyLoading || otp.length !== 6}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {verifyLoading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            )}

            {/* Success Message after verification */}
            {otpVerified && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Email verified! You can now complete your registration.</span>
              </div>
            )}

            {/* DOB and Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="12345 67899"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a strong password"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?
              <Link
                to="/student/login"
                className="ml-1 text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors duration-200"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Secure • Transparent • Reliable
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
