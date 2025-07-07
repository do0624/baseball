// src/pages/GamePage.js
import React from 'react';
import Scoreboard from '../components/Scoreboard';
import Pitcher from '../components/Pitcher';
import Batter from '../components/Batter';

function GamePage() {
  return (
    <div>
      <h1>Game Page</h1>
      <Scoreboard />
      <Pitcher />
      <Batter />
      {/* Game specific content */}
    </div>
  );
}

export default GamePage;
