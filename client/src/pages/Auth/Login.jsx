
import React from 'react';
import { useNavigate } from 'react-router-dom';   
import logo from "../../assets/evoting.png"
// import { toast } from 'react-hot-toast';

function Login() {
    const Navigate = useNavigate();
    const submitHndler = (e) => {
        e.preventDefault();
        if(e.target.userId.value === "" || e.target.password.value === "" || e.target.userType.value === "") {
            // toast.error("Please fill all the fields")
        }
        else{
            // toast.success("Login Successful")
            // You can access the form values like this:
            // const userId = e.target.userId.value;
            // const password = e.target.password.value;
            // const userType = e.target.userType.value;
        }
    }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      {/* Login Card */}
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-full shadow-2xl border-2 border-white/30">
              <div className="bg-white rounded-full p-0.5">
                <img src={logo} alt="e-Voting theme" className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover object-center" />
              </div>
            </div>
          </div>
          <h1 className="mt-4 text-2xl md:text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your e-Voting account</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl border border-white/20">
          <form className="space-y-6" onSubmit={submitHndler}>
            {/* User ID Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Scholar No./User ID
              </label>
              <input
                name='userId'
                type="text"
                placeholder="Enter your Scholar Number"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name='password'
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline transition-colors duration-200">
                Forgot your password?
              </a>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-300 ease-out"
            >
              Sign In
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? 
              <a href="#" className="ml-1 text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors duration-200">
                Contact Support
              </a>
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

export default Login;
