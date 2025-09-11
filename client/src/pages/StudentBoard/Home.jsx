import React from 'react'
import Hero from '../../components/Hero'
import HomeCandidate from '../../components/HomeCandidate'
import HomeFeatures from '../../components/HomeFeatures'
import Testimonials from '../../components/Testimonials'

const Home = () => {
  return (
    <div>
      <Hero electionLive={true}/>
      <HomeCandidate/>
      <HomeFeatures/>
      <Testimonials/>
    </div>
  )
}

export default Home