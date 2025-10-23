import React from 'react'
import { motion } from 'framer-motion'
import Hero from '../../components/Hero'
import HomeCandidate from '../../components/HomeCandidate'
import HomeFeatures from '../../components/HomeFeatures'
import Testimonials from '../../components/Testimonials'

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Hero electionLive={true}/>
      </motion.div>
      <motion.div variants={itemVariants}>
        <HomeCandidate/>
      </motion.div>
      <motion.div variants={itemVariants}>
        <HomeFeatures/>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Testimonials/>
      </motion.div>
    </motion.div>
  )
}

export default Home