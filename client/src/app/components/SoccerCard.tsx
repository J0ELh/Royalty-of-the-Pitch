import React from 'react';

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

const SoccerCard: React.FC<SoccerCardProps> = ({ playerName, playerImage, nationality, clubLogo, position, ratings }) => {
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
            <div className="rating">{ratings.pac} PAC</div>
            <div className="rating">{ratings.sho} SHO</div>
            <div className="rating">{ratings.pas} PAS</div>
            <div className="rating">{ratings.dri} DRI</div>
            <div className="rating">{ratings.def} DEF</div>
            <div className="rating">{ratings.phy} PHY</div>
        </div>
        </div>
    );
};

export default SoccerCard;  