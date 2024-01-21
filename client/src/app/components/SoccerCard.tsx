import React from 'react';
import './SoccerCard.css';

interface SoccerCardProps {
    playerName: string;
    playerImage: string; // URL to the player's image
    nationality: string;
    clubLogo: string; // URL to the club's logo
    position: string;
    ratings: {
        pac: number; // Pace
        sho: number; // Shooting
        pas: number; // Passing
        dri: number; // Dribbling
        def: number; // Defense
        phy: number; // Physical
    };
}

const SoccerCard: React.FC<SoccerCardProps & { sendStatistic: (stat: string) => void }> = ({
    playerName,
    playerImage,
    nationality,
    clubLogo,
    position,
    ratings = { pac: 0, sho: 0, pas: 0, dri: 0, def: 0, phy: 0 }, // Default values
    sendStatistic
  }) => {
    return (
        <div className="soccer-card">
            <div className="card-header">
                <img src={playerImage} alt={playerName} className="player-image" />
                <div className="player-info">
                <img src={nationality} alt="Country flag" className="country-flag" />
                <img src={clubLogo} alt="Club logo" className="club-logo" />
                <div className="player-name">{playerName}</div>
                <div className="player-position">{position}</div>
                </div>
            </div>
            <div className="card-body">
                <button className="rating-btn" onClick={() => sendStatistic('pac')}>{ratings.pac} PAC</button>
                <button className="rating-btn" onClick={() => sendStatistic('sho')}>{ratings.sho} SHO</button>
                <button className="rating-btn" onClick={() => sendStatistic('pas')}>{ratings.pas} PAS</button>
                <button className="rating-btn" onClick={() => sendStatistic('dri')}>{ratings.dri} DRI</button>
                <button className="rating-btn" onClick={() => sendStatistic('def')}>{ratings.def} DEF</button>
                <button className="rating-btn" onClick={() => sendStatistic('phy')}>{ratings.phy} PHY</button>
            </div>
        </div>
    );
};

export default SoccerCard;  