import React from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/evoting.png";
// import { toast } from 'react-hot-toast';

function Signup() {
  const Navigate = useNavigate();
  const submitHndler = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      dob: formData.get("dob"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const collegeEmailRegex = /^(\d+)@maint\.ac\.in$/;

    const match = email.match(collegeEmailRegex);

    if (!match) {
      setError("Please enter a valid college email (e.g. 123456@maint.ac.in)");
      setStudentId(null);
      return;
    }

    // Basic validation
    if (Object.values(data).some((value) => !value)) {
      // toast.error("Please fill all the fields")
      return;
    }

    if (data.password !== data.confirmPassword) {
      // toast.error("Passwords do not match")
      return;
    }

    // toast.success("Account created successfully")
    console.log("Signup data:", data);
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
          <form className="space-y-5" onSubmit={submitHndler}>
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
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
                placeholder="Enter your college email"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
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
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="12345 67899"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  required
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
                placeholder="Create a strong password"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
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
                placeholder="Confirm your password"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-300 ease-out"
            >
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?
              <Link
                to="/login"
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
