// CardStack.tsx
import React from 'react';
import BlankSoccerCard from './BlankSoccerCard';
import './CardStack.css'; // Make sure to create and import this CSS file

interface CardStackProps {
  count: number; // Number of cards to display in the stack
}

const CardStack: React.FC<CardStackProps> = ({ count }) => {
  return (
    <div className="card-stack">
      {Array.from({ length: count }, (_, index) => (
        <BlankSoccerCard 
          key={index} 
          style={{
            transform: `translate(${index * 10 + 10}px, ${index * 10}px)`,
            zIndex: count - index // Ensures the first card is on top
          }} 
        />
      ))}
    </div>
  );
};

export default CardStack;
