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
  const [otherPlayerData, setOtherPlayerData] = useState<SoccerCardProps | undefined>(undefined);


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
  
  const [gameOutcome, setGameOutcome] = useState('');
  const [revealCards, setRevealCards] = useState(false);
  const [tempOtherPlayerData, setTempOtherPlayerData] = useState<SoccerCardProps | undefined>(undefined); // Temporary state for incoming opponent data
  const [tempThisPlayerData, setTempThisPlayerData] = useState<SoccerCardProps | undefined>(undefined)
  const [isInitialThis, setIsInitialThis] = useState(false)
  const [isInitialOther, setIsInitialOther] = useState(false)

  // const [latestRoundData, setLatestRoundData] = ({})

  

  useEffect(() => {
    if (revealCards) {
      console.log('starting timer to display')
      
      // Set a timer to hide the card after 3 seconds
      const timer = setTimeout(() => {
        console.log('ending display')
        setRevealCards(false); 
  
      }, 3000); // 3000 ms = 3 seconds
  
      return () => clearTimeout(timer); // Cleanup the timer on component unmount or if the effect runs again.
    }
  }, [revealCards])

  useEffect (() => {
    if (isInitialOther) {
      // setOtherPlayerData(tempOtherPlayerData)
      setIsInitialOther(false)
    }
  }, [tempOtherPlayerData])

  useEffect (() => {
    if (isInitialThis) {
      // setPlayerData(tempThisPlayerData)
      setIsInitialThis(false)
    }
  }, [tempThisPlayerData])


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

        let data = JSON.parse(event.data);
        console.log('Message from server:', data); //ERROR ON LINE 53
        
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
          data =  JSON.parse(data) ; // Wrap the data in an object
        }
        if (typeof data === 'object' && data !== null) {
          console.log(data)
          if (id == -1 && (data.id == 0 || data.id == 1)) {
            console.log('set id', data.id)
            setId(data.id as number);
            setIsInitialOther(true)
            setIsInitialThis(true)
            setRevealCards(false)
          }
          if (data.state === "round_won" || data.state === "round_lost") {
            // Save current player and opponent data before updating with new round data
            setRevealCards(true);
          }
          if (data.old_card && data.old_card_opponent) {
            const temp_old_card_data = JSON.parse(data.old_card)[0]
            setTempThisPlayerData({
              playerName: temp_old_card_data.short_name,
              playerImage: temp_old_card_data.url,
              nationality: temp_old_card_data.nationality,
              clubLogo: temp_old_card_data.club,
              ratings: {
                age: temp_old_card_data.age,
                height_cm: temp_old_card_data.height_cm,
                overall: temp_old_card_data.overall,
                potential: temp_old_card_data.potential,
                pace: temp_old_card_data.pace,
                shooting: temp_old_card_data.shooting,
                dribbling: temp_old_card_data.dribbling,
              },
              isDisabled: true
            })
            
            const temp_old_card_data_opp = JSON.parse(data.old_card_opponent)[0]
            setTempOtherPlayerData({
              playerName: temp_old_card_data_opp.short_name,
              playerImage: temp_old_card_data_opp.url,
              nationality: temp_old_card_data_opp.nationality,
              clubLogo: temp_old_card_data_opp.club,
              ratings: {
                age: temp_old_card_data_opp.age,
                height_cm: temp_old_card_data_opp.height_cm,
                overall: temp_old_card_data_opp.overall,
                potential: temp_old_card_data_opp.potential,
                pace: temp_old_card_data_opp.pace,
                shooting: temp_old_card_data_opp.shooting,
                dribbling: temp_old_card_data_opp.dribbling,
              },
              isDisabled: true
            })
          }
          if (data.current_card && data.current_card_opponent) {
            const this_playerInfo = JSON.parse(data.current_card)[0]; // Adjust as per your data structure
            setPlayerData({
              playerName: this_playerInfo.short_name,
              playerImage: this_playerInfo.url,
              nationality: this_playerInfo.nationality,
              clubLogo: this_playerInfo.club,
              ratings: {
                age: this_playerInfo.age,
                height_cm: this_playerInfo.height_cm,
                overall: this_playerInfo.overall,
                potential: this_playerInfo.potential,
                pace: this_playerInfo.pace,
                shooting: this_playerInfo.shooting,
                dribbling: this_playerInfo.dribbling,
              },
              isDisabled: !(JSON.parse(data.your_turn))
            });
            // console.log("ABC", playerData)
          
            // Now, parse and set the new opponent data as usual
            const other_playerInfo = JSON.parse(data.current_card_opponent)[0]; // Adjust as per your data structure
            setOtherPlayerData({
              playerName: other_playerInfo.short_name,
              playerImage: other_playerInfo.url,
              nationality: other_playerInfo.nationality,
              clubLogo: other_playerInfo.club,
              ratings: {
                age: other_playerInfo.age,
                height_cm: other_playerInfo.height_cm,
                overall: other_playerInfo.overall,
                potential: other_playerInfo.potential,
                pace: other_playerInfo.pace,
                shooting: other_playerInfo.shooting,
                dribbling: other_playerInfo.dribbling,
              },
              isDisabled: true
            });

          }
          // Handle game state updates
          if (data.state) {
            console.log('in switch checking state', data.state)
            switch (data.state) {
              case "both_ready":
                setShowCards(true);
                setCardStackCountSelf(data.num_cards -1); // minus one because we are displaying the first card differently
                setCardStackCountOpp(data.num_cards -1);// minus one because we are displaying the first card differently
                break;
              case "round_won":
                console.log('in round won')
                setCardStackCountOpp(prevCardCount => prevCardCount - 1);
                setCardStackCountSelf(prevCardCount => prevCardCount + 1);
                // const playerInfo = JSON.parse(data.data)[0];
                break;
              case "round_lost":
                console.log('in round lost')
                setCardStackCountOpp(prevCardCount => prevCardCount + 1);
                setCardStackCountSelf(prevCardCount => prevCardCount - 1);
                // const playerInfo2 = JSON.parse(data.data)[0];
                break;
              case "game_won":
                setGameOutcome('won');
                break;
              case "game_lost":
                setGameOutcome('lost');
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
        setIsInitialThis(false)
        setIsInitialOther(false)
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
    const timer = setTimeout(() => {
      webSocket!.send(JSON.stringify({id: id, choice: stat }));
    }, 2000); // 3000 ms = 3 seconds
    
    
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
      {gameOutcome && (
        <div className="game-outcome-message">
          {gameOutcome === 'won' ? 'You Won!' : 'You Lost!'}
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
                {
                  revealCards ?
                  (tempThisPlayerData && <SoccerCard 
                  sendStatistic={sendStatistic}
                  {...tempThisPlayerData} />)
                  :
                  <SoccerCard 
                  sendStatistic={sendStatistic}
                  {...playerData} />
                }
                <CardStack count={cardStackCountSelf} />
              </div>
              <div className="card-and-stack-right">
              {
                revealCards ?
                tempOtherPlayerData && <SoccerCard {...tempOtherPlayerData} />
                :
                <></>
              }
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