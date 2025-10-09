import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/evoting.png";
import AuthAPI from "../../utils/authAPI";
// import { toast } from 'react-hot-toast';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scholarNo, setScholarNo] = useState('');

  const collegeEmailRegex = /^(\d+)@stu\.manit\.ac\.in$/;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
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

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (Object.values(formData).some((value) => !value.trim())) {
        setError("Please fill in all fields");
        return;
      }

      // Validate email format
      const match = formData.email.match(collegeEmailRegex);
      if (!match) {
        setError("Please enter a valid college email (e.g. 123456@stu.manit.ac.in)");
        return;
      }

      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      // Prepare data for API (backend extracts scholarNo from email)
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        dob: formData.dob,
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      const { response, data } = await AuthAPI.studentRegister(registrationData);

      if (response.ok && data.success) {
        navigate('/');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check your connection and try again.');
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

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                College Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your college email (e.g. 123456@stu.manit.ac.in)"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              />
            </div>

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
                to="/"
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
