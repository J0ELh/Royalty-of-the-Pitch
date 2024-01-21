"use client"
import React, { useState, useEffect, useRef } from 'react';
import SoccerCard, { SoccerCardProps } from './components/SoccerCard';
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
  const [playerData, setPlayerData] = useState<SoccerCardProps | undefined>(undefined);

  const [userName, setUserName] = useState('');
  const [id, setId] = useState(-1);
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [playButtonText, setPlayButtonText] = useState("▶ Play");
  const [isPlayButtonDisabled, setIsPlayButtonDisabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // New state for settings popup
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  const [cardStackCountSelf, setCardStackCountSelf] = useState(0);
  const [cardStackCountOpp, setCardStackCountOpp] = useState(0);
  

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
        try {

        const data = JSON.parse(event.data);
        console.log('Message from server:', data); //ERROR ON LINE 53
        if (typeof data === 'object' && data !== null) {
          // console.log('in object condition', data)
          
          if (data.id == 0 || data.id == 1) {
            // console.log('set id')
            setId(data.id as number);
          }
          if (data.data) {
            const playerInfo = JSON.parse(data.data)[0]; // Adjust as per your data structure
            setPlayerData({
              playerName: playerInfo.short_name,
              playerImage: playerInfo.url,
              nationality: playerInfo.nationality,
              clubLogo: playerInfo.club,
              ratings: {
                age: playerInfo.age,
                height_cm: playerInfo.height_cm,
                overall: playerInfo.overall,
                potential: playerInfo.potential,
                pace: playerInfo.pace,
                shooting: playerInfo.shooting,
                dribbling: playerInfo.dribbling,
              },
              isDisabled: JSON.parse(data.your_turn)
            });
          }
          // Handle game state updates
          if (data.state) {
            switch (data.state) {
              case "both_ready":
                setShowCards(true);
                setCardStackCountSelf(data.num_cards); 
                setCardStackCountOpp(data.num_cards);
                break;
                case "round_won":
                  setCardStackCountOpp(cardStackCountOpp - 1);
                  setCardStackCountSelf(cardStackCountSelf + 2);
                  setPlayerData({
                    playerName: data.short_name,
                    playerImage: data.url,
                    nationality: data.nationality,
                    clubLogo: data.club,
                    ratings: {
                      age: data.age,
                      height_cm: data.height_cm,
                      overall: data.overall,
                      potential: data.potential,
                      pace: data.pace,
                      shooting: data.shooting,
                      dribbling: data.dribbling,
                    },
                    isDisabled: JSON.parse(data.your_turn)
                  });
                  break;
              case "round_lost":
                setCardStackCountOpp(cardStackCountOpp + 2);
                setCardStackCountSelf(cardStackCountSelf - 1);
                setPlayerData({
                  playerName: data.short_name,
                  playerImage: data.url,
                  nationality: data.nationality,
                  clubLogo: data.club,
                  ratings: {
                    age: data.age,
                    height_cm: data.height_cm,
                    overall: data.overall,
                    potential: data.potential,
                    pace: data.pace,
                    shooting: data.shooting,
                    dribbling: data.dribbling,
                  },
                  isDisabled: JSON.parse(data.your_turn)
                });
              break;
              default:
                console.log('Unhandled state:', data.state);
              }    
            }
          }
        } catch (error) {
          console.error('Error processing message from server:', error);
        }
      };
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error); // Reject the promise on error
      };
        
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setWebSocket(null); // Set WebSocket to null when disconnected
      };
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

  const sendStatistic = (stat: string) => {
    console.log(stat)
    console.log('clicked')
    console.log(JSON.stringify({ choice: stat }))
    webSocket!.send(JSON.stringify({ choice: stat }));
  };

  const handlePlayClick = () => {
    try {
      webSocket!.send(JSON.stringify({ id: id, ready_to_play: true }));
      setPlayButtonText("Waiting for opponent to play...");
      setIsPlayButtonDisabled(true);
    } catch (error) {
      console.error("Failed to send ready to play", error);
    }
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
            <div className="username-display">
              User: {userName}
            </div>
          </div>
          {!showCards && (
            <div className="play-button-container">
              <button 
                className="play-button" 
                onClick={handlePlayClick} 
                disabled={isPlayButtonDisabled}
              >
                {playButtonText}
              </button>
            </div>
          )}


          {showCards && playerData && (
            <div className="card-layout">
              <div className="card-and-stack-left">
                <SoccerCard 
                  sendStatistic={sendStatistic}
                  {...playerData} />
                <CardStack count={cardStackCountSelf} />
              </div>
              <div className="card-and-stack-right">
                <CardStack count={cardStackCountOpp} />
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