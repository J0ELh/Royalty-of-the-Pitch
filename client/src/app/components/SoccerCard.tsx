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
    isDisabled: boolean;
    sendStatistic?: (stat: string) => void; // Optional prop
}


const SoccerCard: React.FC<SoccerCardProps> = ({
    playerName,
    playerImage,
    nationality,
    clubLogo,
    ratings,
    isDisabled,
    sendStatistic
  }) => {

    const handleStatisticClick = (stat: string) => {
        if (sendStatistic) {
            sendStatistic(stat);
        }
    };

    const buttonClass = isDisabled ? "rating-btn disabledButton" : "rating-btn";
    const cardBodyClass = isDisabled ? "card-body disabled" : "card-body";

    console.log(sendStatistic, isDisabled, sendStatistic ? isDisabled : true)
    
    return (
        <div className="soccer-card">
            <div className="card-header">
                <img src={playerImage} alt={playerName} className="player-image small-image" />
                <div className="player-info">
                    {/* <img src={nationality} alt="Country flag" className="country-flag small-image" />
                    <img src={clubLogo} alt="Club logo" className="club-logo small-image" /> */}
                    <div className="player-name">{playerName}</div>
                </div>
            </div>
            <div className={cardBodyClass}>
                <button className={buttonClass} disabled={!sendStatistic || isDisabled} onClick={() => handleStatisticClick('age')}>Age: {ratings.age}</button>
                <button className={buttonClass} disabled={!sendStatistic || isDisabled} onClick={() => handleStatisticClick('height_cm')}>Height (cm): {ratings.height_cm}</button>
                <button className={buttonClass} disabled={!sendStatistic || isDisabled} onClick={() => handleStatisticClick('overall')}>Overall: {ratings.overall}</button>
                <button className={buttonClass} disabled={!sendStatistic || isDisabled} onClick={() => handleStatisticClick('potential')}>Potential: {ratings.potential}</button>
                <button className={buttonClass} disabled={!sendStatistic || isDisabled} onClick={() => handleStatisticClick('pace')}>Pace: {ratings.pace}</button>
                <button className={buttonClass} disabled={!sendStatistic || isDisabled} onClick={() => handleStatisticClick('shooting')}>Shooting: {ratings.shooting}</button>
                <button className={buttonClass} disabled={!sendStatistic || isDisabled} onClick={() => handleStatisticClick('dribbling')}>Dribbling: {ratings.dribbling}</button>
            </div>
        </div>
    );
};

export default SoccerCard;  