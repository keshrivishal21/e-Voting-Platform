import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';   
import toast from 'react-hot-toast';
import logo from "../../assets/evoting.png"
import AuthAPI from '../../utils/authAPI';
import { useAuth } from '../../contexts/AuthContext';

function AdminLogin() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Check for whitespace in email and password fields
        if ((name === 'email' || name === 'password') && /\s/.test(value)) {
            const errorMsg = `${name === 'email' ? 'Email' : 'Password'} cannot contain whitespace`;
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
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { response, data } = await AuthAPI.adminLogin(formData.userId, formData.password);

            if (response.ok && data.success) {
                // Use auth context to login - just token and type
                login(data.data.token, 'Admin');
                toast.success('Welcome back, Admin!');

                // Navigate to admin dashboard
                const from = location.state?.from?.pathname || '/admin';
                navigate(from);
            } else {
                const errorMsg = data.message || 'Login failed. Please try again.';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (error) {
            console.error('Admin login error:', error);
            const errorMsg = 'Network error. Please check your connection and try again.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8">
            {/* Login Card */}
            <div className="w-full max-w-md">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-1.5 rounded-full shadow-2xl border-2 border-white/30">
                            <div className="bg-white rounded-full p-0.5">
                                <img src={logo} alt="e-Voting theme" className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover object-center" />
                            </div>
                        </div>
                    </div>
                    <h1 className="mt-4 text-2xl md:text-3xl font-bold text-gray-800">Admin Portal</h1>
                    <p className="mt-2 text-sm text-gray-600">Sign in to manage the e-Voting platform</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl border border-white/20">
                    <form className="space-y-6" onSubmit={submitHandler}>
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {/* User ID Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Admin Email
                            </label>
                            <input
                                name="userId"
                                type="email"
                                value={formData.userId}
                                onChange={handleInputChange}
                                placeholder="Enter your admin email"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 transform hover:scale-[1.02] transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Signing In...
                                </div>
                            ) : (
                                'Sign In as Admin'
                            )}
                        </button>
                    </form>

                    {/* Additional Links */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Not an admin? 
                            <a href="/" className="ml-1 text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200">
                                Go to Home
                            </a>
                        </p>
                    </div>
                </div>

                {/* Footer Text */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                        🔒 Secure Admin Access
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
