// BlankSoccerCard.tsx
import React from 'react';
import './BlankSoccerCard.css';

interface BlankSoccerCardProps {
  style?: React.CSSProperties; // Optional style prop
}

const BlankSoccerCard: React.FC<BlankSoccerCardProps> = ({ style }) => {
  return (
    <div className="blank-soccer-card" style={style}>
      {/* You can add a generic design or logo here if you want */}
    </div>
  );
};

export default BlankSoccerCard;
