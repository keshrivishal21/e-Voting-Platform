
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';   
import toast from 'react-hot-toast';
import logo from "../../assets/evoting.png"
import AuthAPI from '../../utils/authAPI';
import { useAuth } from '../../contexts/AuthContext';
import { KeyIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';


function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const collegeEmailRegex = /^(\d+)@stu\.manit\.ac\.in$/;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if ((name === 'email' || name === 'password') && /\s/.test(value)) {
            const errorMsg = `${name === 'email' ? 'Email' : 'Password'} cannot contain whitespace`;
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (error) setError('');
        if (name === 'email' && value) {
            const match = value.match(collegeEmailRegex);
            if (!match) {
                setError("Please enter a valid college email (e.g. 123456@stu.manit.ac.in)");
            }
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { response, data } = await AuthAPI.studentLogin(formData.email, formData.password);

            if (response.ok && data.success) {
                // Use auth context to login - just token and type
                login(data.data.token, 'Student');
                
                // Remove candidate token only after student login is successful
                localStorage.removeItem("candidateToken");
                
                toast.success('Welcome back! 🎓');

                // Navigate to intended page or student dashboard
                const from = location.state?.from?.pathname || '/student';
                navigate(from);
            } else {
                const errorMsg = data.message || 'Login failed. Please try again.';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMsg = 'Network error. Please check your connection and try again.';
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
      {/* Login Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo Section */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-full shadow-2xl border-2 border-white/30"
            >
              <div className="bg-white rounded-full p-0.5">
                <img src={logo} alt="e-Voting theme" className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover object-center" />
              </div>
            </motion.div>
          </div>
          <motion.h1 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-4 text-2xl md:text-3xl font-bold text-gray-800"
          >
            Welcome Back
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-2 text-sm text-gray-600"
          >
            Sign in to your e-Voting account
          </motion.p>
        </motion.div>

        {/* Form Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl border border-white/20"
        >
          <form className="space-y-6" onSubmit={submitHandler}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email ID
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your college email ID"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              />
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
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                required
                disabled={loading}
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline transition-colors duration-200">
                Forgot your password?
              </a>
            </div>

            {/* Submit Button */}
            <motion.button 
              type="submit" 
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Dont't have an account? 
              <a href="/student/signup" className="ml-1 text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors duration-200">
                Sign Up
              </a>
            </p>
          </div>
          <div className="mt-3 text-center">
            <Link
              to={`/`}
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to Home page
            </Link>
          </div>
        </motion.div>

        {/* Footer Text */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-gray-500">
            Secure • Transparent • Reliable
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Login;
