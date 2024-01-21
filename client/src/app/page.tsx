"use client"
import React, { useState, useEffect, useRef } from 'react';
import SoccerCard from './components/SoccerCard';
import CardStack from './components/CardStack';

function App() {
  async function get_id(): Promise<any> {
    const url = 'http://localhost:8000/ws/';

    try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);

      return data;
    } catch (error) {
        console.error('Error fetching data: ', error);
        throw error;
    }
  }
  
  const [userName, setUserName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // New state for settings popup
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  
  // Function to establish WebSocket connection
  const connectWebSocket = () => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket('ws://localhost:8000/ws');
  
      ws.onopen = () => {
        console.log('WebSocket connected');
        setWebSocket(ws);
        resolve(ws); // Resolve the promise when the connection is open
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Message from server:', data);
        // Handle incoming messages
      };
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error); // Reject the promise on error
      };
      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };
      setWebSocket(ws);
    });
  };

  const handleNameSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (userName.trim() !== '') {
      setNameSubmitted(true);
      try {
        const ws = await connectWebSocket() as WebSocket; // Wait for the WebSocket connection
        ws.send(JSON.stringify({ name: userName, request: "get_data" })); // Send message after connection is established
      } catch (error) {
        console.error("Failed to connect WebSocket", error);
      }
    }
  };
  

  const handleQuit = () => {
    setShowCards(false);
    setMenuOpen(false);
    if (webSocket) {
      webSocket.close(); // Close WebSocket connection when quitting
      setWebSocket(null);
    }
  };

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
    get_id()
    setShowCards(true);
  };


  const handleSettings = () => {
    setShowSettings(true); // Show settings popup
    setMenuOpen(false); // Optionally close the menu
  };

  const settingsRef = useRef<HTMLDivElement>(null); // Specify the type of element the ref will be attached to

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsRef]);

  return (
    <div className="App">
      {!nameSubmitted && (
        <div className="name-entry">
          <form onSubmit={handleNameSubmit}>
            <label htmlFor="name">Enter Your Name:</label>
            <input
              type="text"
              id="name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
      {nameSubmitted && (
        <>
          <div className="top-bar">
            <h1 className="title">Royalty of the Pitch</h1>
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
            </>
          )}
    </div>
  );
}

export default App;