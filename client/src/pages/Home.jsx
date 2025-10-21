// src/pages/Home.jsx

import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpg';
import logo from '../assets/logo.jpg';

function Home() {
  const navigate = useNavigate();

  return (
    <div 
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative text-center text-white space-y-8 flex flex-col items-center justify-center px-4">
        <img src={logo} alt="College Logo" className="w-28 h-28 mb-4" />
        
        <h1 className="text-4xl md:text-5xl font-bold">
          E-Voting Platform for MANIT
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={() => navigate('/student/login')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200"
          >
            Student Login
          </button>

          <button
            onClick={() => navigate('/admin/login')}
            className="bg-gradient-to-r from-slate-700 to-slate-900 text-white px-10 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200"
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
