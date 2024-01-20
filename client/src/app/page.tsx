"use client"
import React, { useState } from 'react';
import Header from "./components/Header"
import SoccerCard from './components/SoccerCard';

function App() {
  const playerData = {
    playerName: 'Messi',
    playerImage: 'face.png', // Replace with actual path
    nationality: 'flag.png', // Replace with actual path
    clubLogo: 'club.jpg', // Replace with actual path
    position: 'RW',
    ratings: {
      pac: 81,
      sho: 89,
      pas: 90,
      dri: 94,
      def: 34,
      phy: 64
    }
  };

  return (
    <div className="App">
      <SoccerCard {...playerData} />
    </div>
  );
}

export default App;