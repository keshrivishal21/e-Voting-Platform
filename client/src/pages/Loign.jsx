
import React from 'react';
import { useNavigate } from 'react-router-dom';   
import backgroundImage from '../assets/background.jpg';
import logo from "../assets/logo.jpg"
import { toast } from 'react-hot-toast';

function Login() {
    const Navigate = useNavigate();
    const submitHndler = (e) => {
        e.preventDefault();
        if(e.target.userId.value === "" || e.target.password.value === "" || e.target.userType.value === "") {
            toast.error("Please fill all the fields")
        }
        else{
            toast.success("Login Successful")
            // You can access the form values like this:
            // const userId = e.target.userId.value;
            // const password = e.target.password.value;
            // const userType = e.target.userType.value;
        }
    }
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="absolute inset-0 bg-gray-900/30"></div>

      <div className="relative bg-blue-900/20 backdrop-blur-lg rounded-lg p-8 w-96 text-center text-white space-y-6 shadow-lg">
        <img src={logo} alt="College Logo" className="mx-auto w-20 h-20" />
        <h1 className="text-2xl font-bold">E-Voting Platform for MANIT</h1>

        <form className="space-y-4" onSubmit={submitHndler}>
          <div className="text-left">
            <label className="block mb-1 text-sm font-semibold">Scholar No./User Id</label>
            <input
              name='userId'
              type="text"
              placeholder="Enter the Scholar Number"
              className="w-full px-4 py-2 bg-white rounded-md text-black outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="text-left">
            <label className="block mb-1 text-sm font-semibold">Password</label>
            <input
              type="password"
              name='password'
              placeholder="Enter the Password"
              className="w-full px-4 py-2 rounded-md bg-white text-black outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="text-left">
            <label className="block mb-1 text-sm font-semibold">User Type</label>
            <select
              name='userType'
              className="w-full px-4 py-2 rounded-md bg-white text-black outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select User Type</option>
              <option value="student">Student</option>
              <option value="candidate">Candidate</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="text-right text-sm text-blue-300 hover:underline cursor-pointer">
            Forgot Password
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-blue-400 to-blue-600 py-2 rounded-lg font-semibold hover:opacity-90 hover:scale-105 transition-all duration-300 ease-in-out">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
