// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background.jpg';
import logo from "../assets/logo.jpg"
import { useNavigate } from 'react-router-dom';

function Home() {
    const Navigate = useNavigate();
  return (
    <div className="relative min-h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="absolute inset-0 bg-grey-900 opacity-60"></div>

      <div className="relative text-center text-white space-y-6 flex flex-col items-center justify-center">
        <img src={logo} alt="College Logo" className="mx-auto w-24 h-24" />
        <h1 className="text-3xl md:text-5xl font-bold">E-Voting Platform for MANIT</h1>
      
        <Link to="/login">
          <button onClick={()=> Navigate("/login")} className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-2 rounded-lg font-semibold hover:opacity-90 hover:scale-110 transition duration-300 ease-in">
            Login
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
