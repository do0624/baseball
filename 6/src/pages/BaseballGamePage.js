import React, { useState, useEffect } from 'react';
import '../styles/App.css';
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import'../styles/Custom.css';
import { buildStyles } from 'react-circular-progressbar';
import hitterData from '../data/2024_useGame_hitter_clean.json';

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
      {/* <div style={{ position: 'absolute', top: 120, left: 20, zIndex: 10, textAlign: 'center' }}>
        <h2 style={{ margin: 0 }}>내 팀</h2>
        <label className='progress-bowler-label'>
        
          <span>점수</span>
          <span>스트라이크</span>
          <span>볼</span>
          <span>아웃</span>
          <span>타석</span>
          <span>타자</span>
          <span>타자</span>
       </label>
        
      </div>
      <div style={{ position: 'absolute', top: 120, left: 1230, zIndex: 10, textAlign: 'center' }}>
        <h2 style={{ margin: 0 }}>상대팀</h2>
        <label className='progress-bowler-label'>
          <span>점수</span>
          <span>스트라이크</span>
          <span>볼</span>
          <span>아웃</span>
          <span>타석</span>
          <span>타자</span>
          <span>타자</span>
       </label> */}
        <div>
      </div>
      <h1 className="game-title">⚾ Baseball Game</h1>
      <div className="game-info">
        
        {!gameStarted && (
          <button className="game-button" onClick={() => { setGameStarted(true); setIsGaugeRunning(true); }}>
            게임 시작
          </button>
        )}
        {gameStarted && (
          <div>
          카드
          
        
    
          
      
          
          
       
       
       <div style={{ position: 'absolute', top: 120, left: 1230, zIndex: 10, textAlign: 'center' }}>
        <h2 style={{ margin: 0 }}>상대팀</h2>
        <label className='progress-bowler-label1'>
          
          <h1>점수</h1>   
          <h2 style={{color: '#d63737'}}>
  {opponentBatter ? `${opponentBatter.Player_Team} - ${(opponentBatter.Player_Name || opponentBatter["﻿Player_Name"] || "")}` : ""}
</h2>
   
          
       </label>
      
      </div>
      <CircularProgressbarWithChildren className='progress-bowler' minValue={0} maxValue={Math.floor(Math.random() * 1)+50} value={gaugeValue} styles={buildStyles({
          pathColor: '#0066ff',           // 진행 색
          trailColor: '#eee',             // 배경 트레일 색
          strokeLinecap: 'round',   
            })}>
  <div className='progress-bowler-button'>
    <button className='progress-bowler-button-text' onClick={() => setIsGaugeRunning(false)}>던지기</button>
  </div>
</CircularProgressbarWithChildren>
          
            <CircularProgressbarWithChildren className='progress-batter' minValue={0} maxValue={Math.floor(Math.random() * 1)+99} value={gaugeValue} styles={buildStyles({
          pathColor: '#d63737',           // 진행 색
          trailColor: '#eee',             // 배경 트레일 색
          strokeLinecap: 'round',   
            })}>
  
    <button  className='progress-batter-button1' onClick={() => setIsGaugeRunning(false)}>치기</button>
</CircularProgressbarWithChildren>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default BaseballGamePage;