import React from 'react';
import './SoccerCard.css';

export interface SoccerCardProps {
    playerName: string;
    playerImage: string; // URL to the player's image
    nationality: string;
    clubLogo: string; // URL to the club's logo
    ratings: {
        age: string;
        height_cm: string;
        overall: string;
        potential: string;
        pace: string;
        shooting: string;
        dribbling: string;
    };
}

const SoccerCard: React.FC<SoccerCardProps & { sendStatistic: (stat: string) => void }> = ({
    playerName,
    playerImage,
    nationality,
    clubLogo,
    ratings,
    sendStatistic
  }) => {
    return (
        <div className="soccer-card">
            <div className="card-header">
                <img src={playerImage} alt={playerName} className="player-image small-image" />
                <div className="player-info">
                    <img src={nationality} alt="Country flag" className="country-flag small-image" />
                    <img src={clubLogo} alt="Club logo" className="club-logo small-image" />
                    <div className="player-name">{playerName}</div>
                </div>
            </div>
            <div className="card-body">
                <button className="rating-btn" onClick={() => sendStatistic('age')}>Age: {ratings.age}</button>
                <button className="rating-btn" onClick={() => sendStatistic('height_cm')}>Height (cm): {ratings.height_cm}</button>
                <button className="rating-btn" onClick={() => sendStatistic('overall')}>Overall: {ratings.overall}</button>
                <button className="rating-btn" onClick={() => sendStatistic('potential')}>Potential: {ratings.potential}</button>
                <button className="rating-btn" onClick={() => sendStatistic('pace')}>Pace: {ratings.pace}</button>
                <button className="rating-btn" onClick={() => sendStatistic('shooting')}>Shooting: {ratings.shooting}</button>
                <button className="rating-btn" onClick={() => sendStatistic('dribbling')}>Dribbling: {ratings.dribbling}</button>
            </div>
        </div>
    );
};

export default SoccerCard;  