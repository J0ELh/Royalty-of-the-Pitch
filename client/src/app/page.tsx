"use client"
import React, { useState } from 'react';
import Header from "./components/Header"

const Home: React.FC = () => {

  const [number, setNumber] = useState(0);

  // Correcting the function declaration
  const updateNumber = () => {
    setNumber(number + 1);
  };

  return (
    <div>
      <Header />
      <h1 className='number hover:text-blue-900'>{number}</h1>
      <button onClick={updateNumber}>Change Number</button>
    </div>
  );
};

export default Home;
