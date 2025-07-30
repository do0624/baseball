import React, { useState, useEffect } from 'react';
import '../styles/App.css';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import'../styles/Custom.css';
import { buildStyles } from 'react-circular-progressbar';
import hitterData from '../data/2024_useGame_hitter_clean.json';
import Scoreboard from '../pages/Scoreboard';
const BaseballGamePage = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gaugeValue, setGaugeValue] = useState(0);
  const [isGaugeRunning, setIsGaugeRunning] = useState(false);
  const [myBatter, setMyBatter] = useState(null);
  const [opponentBatter, setOpponentBatter] = useState("");

  useEffect(() => {
    if (!gameStarted || !isGaugeRunning) return;
    const interval = setInterval(() => {
      setGaugeValue(prev => (prev >= 100 ? 0 : prev + 1));
    }, 3);
    return () => clearInterval(interval);
  }, [gameStarted, isGaugeRunning]);

  useEffect(() => {
    if (gameStarted) {
      setMyBatter(hitterData[0]);
      setOpponentBatter(hitterData[15]);
    }
  }, [gameStarted]);
  


  return (
    <div>
    <div className="game-container" style={{ position: 'relative' }}>
      {/* 왼쪽 위에 고정된 팀/상대팀 */}
      <h1 className="game-title">⚾ Baseball Game</h1>
      <div className="game-info">
        
        {!gameStarted && (
          <button className="game-button" onClick={() => { setGameStarted(true); setIsGaugeRunning(true); }}>
            게임 시작
          </button>
        )}
        {gameStarted && (
          <div>
            <div className='Scoreboard'>
    < Scoreboard />
          </div>

          <div style={{ position: 'absolute', top: 120, left: 10, zIndex: 10, textAlign: 'center' }}>
      </div>
        <div className="game-info1"style={{ position: 'absolute', top: 140, left: 1, zIndex: 10, textAlign: 'center' }}>
      </div>
      <div style={{ position: 'absolute', top: 140, left: 200, zIndex: 1, textAlign: 'center' }}>
       <label className='progress-bowler-label1'>
        <div>이름
        </div>
        <div>스택
        </div>
      </label>
     </div>

     
          
        <div className="game-info2"style={{ position: 'absolute', top: 550, left: 1, zIndex: 10, textAlign: 'center' }}>
      </div>
      <div style={{ position: 'absolute', top: 550, left: 200, zIndex: 1, textAlign: 'center' }}>
       <label className='progress-bowler-label2'>
       <div>이름
        </div>
        <div>스택
        </div>
      </label>
     </div>


      <CircularProgressbarWithChildren className='progress-bowler' minValue={0} maxValue={Math.floor(Math.random() * 1)+50} value={gaugeValue} styles={buildStyles({
          pathColor: '#0066ff',           // 진행 색
          trailColor: '#eee',             // 배경 트레일 색
          strokeLinecap: 'round',   
            })}>
  <div className='progress-bowler-button'>
    <button className='progress-bowler-button-text' onClick={() => setIsGaugeRunning(prev => !prev)}>던지기</button>
  </div>
</CircularProgressbarWithChildren>
          
            <CircularProgressbarWithChildren className='progress-batter' minValue={0} maxValue={Math.floor(Math.random() * 1)+99} value={gaugeValue} styles={buildStyles({
          pathColor: '#d63737',           // 진행 색
          trailColor: '#eee',             // 배경 트레일 색
          strokeLinecap: 'round',   
            })}>
  
    <button  className='progress-batter-button1' onClick={() => setIsGaugeRunning(prev => !prev)}>치기</button>
</CircularProgressbarWithChildren>
<div style={{ position: 'absolute', top:600, left: 1210, zIndex: 10, textAlign: 'center' }}>
        
        <label className='progress-bowler-label'>
        <div>해설
         
          </div>
       </label>
        
          </div>
          <div className='ba1 blink1' style={{ position: 'absolute', top: 345, left: 840, zIndex: 10, textAlign: 'center' }}>⚫</div>
<div className='ba2 blink2' style={{ position: 'absolute', top: 535, left: 640, zIndex: 10, textAlign: 'center' }}>⚫</div>
<div className='ba3 blink3' style={{ position: 'absolute', top: 535, left: 1035, zIndex: 10, textAlign: 'center' }}>⚫</div>

          </div>
        )}
        
       
      
      </div>
    </div>
    </div>
  );
};

export default BaseballGamePage;