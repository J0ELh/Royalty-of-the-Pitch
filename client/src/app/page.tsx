"use client"
import React, { useState, useEffect, useRef } from 'react';
import SoccerCard from './components/SoccerCard';
import CardStack from './components/CardStack';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // New state for settings popup

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

  const handlePlayClick = () => {
    setShowCards(true);
  };

  const handleQuit = () => {
    setShowCards(false); // Hide the cards and show the play button again
    setMenuOpen(false); // Optionally close the menu
  };

  const handleSettings = () => {
    setShowSettings(true); // Show settings popup
    setMenuOpen(false); // Optionally close the menu
  };

  const settingsRef = useRef(null); // Ref for the settings popup

  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsRef]);

  return (
    <div className="App">
      <div className='header'>
        <h1>Royalty of the Pitch</h1>
      </div>
      <div className="menu-container">
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
          &#9776; Menu
        </button>
        {menuOpen && (
          <div className="menu-options">
            <button onClick={handleQuit}>Quit</button>
            <button onClick={handleSettings}>Settings</button>
          </div>
        )}
      </div>
      {!showCards && (
        <div className="play-button-container">
          <button className="play-button" onClick={handlePlayClick}>▶ Play</button>
        </div>
      )}

      {showCards && (
        <div className="card-layout">
          <div className="card-and-stack">
            <SoccerCard {...playerData} />
            <CardStack count={5} />
          </div>
          <div className="card-and-stack">
            <SoccerCard {...playerData} />
            <CardStack count={5} />
          </div>
        </div>
      )}
      {showSettings && (
        <div className="settings-popup" ref={settingsRef}>
          {/* Settings Popup Content */}
          <button onClick={() => setShowSettings(false)}>Close Settings</button>
        </div>
      )}
    </div>
  );
}

export default App;