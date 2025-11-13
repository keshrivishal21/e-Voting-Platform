
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.jpg';
import logo from '../assets/logo.jpg';
import { motion } from 'framer-motion';

function Home() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div 
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-black"
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative text-center text-white space-y-8 flex flex-col items-center justify-center px-4"
      >
        <motion.img 
          variants={itemVariants}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          src={logo} 
          alt="College Logo" 
          className="w-28 h-28 mb-4" 
        />
        
        <motion.h1 
          variants={itemVariants}
          className="text-4xl md:text-5xl font-bold"
        >
          E-Voting Platform for MANIT
        </motion.h1>

        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 mt-8"
        >
          <motion.button
            onClick={() => navigate('/student/login')}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(99, 102, 241, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all duration-200"
          >
            Student Login
          </motion.button>

          <motion.button
            onClick={() => navigate('/admin/login')}
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(51, 65, 85, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-slate-700 to-slate-900 text-white px-10 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all duration-200"
          >
            Admin Login
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Home;
