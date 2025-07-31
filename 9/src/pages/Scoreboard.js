// Scoreboard.js
import React, { useState } from 'react';
import '../styles/Scoreboard.css'; // 필요 시 스타일 연결

const Scoreboard = () => {
  // ⚾ S / B / O 상태
  const [strike, setStrike] = useState(0);
  const [ball, setBall] = useState(0);
  const [out, setOut] = useState(0);

  // ⚾ 이닝 점수 상태 (1~9회)
  const [innings, setInnings] = useState(
    Array.from({ length: 9 }, () => ({ my: 0, opponent: 0 }))
  );

  // 점수 업데이트 함수
  const updateScore = (inningIndex, team, score) => {
    setInnings(prev => {
      const updated = [...prev];
      updated[inningIndex][team] += score;
      return updated;
    });
  };

  // 점을 원으로 표시하는 함수
  const renderDots = (count, maxCount) => {
    return Array.from({ length: maxCount }).map((_, i) => (
      <span key={i} className={`dot ${i < count ? 'on' : ''}`}></span>
    ));
  };

  const resetCounts = () => {
    setStrike(0);
    setBall(0);
    setOut(0);
  };

  return (
    <div className="scoreboard">

      <div className="line">
        <span>S</span> {renderDots(strike, 3)}
      </div>
      <div className="line">
        <span>B</span> {renderDots(ball, 3)}
      </div>
      <div className="line">
        <span>O</span> {renderDots(out, 3)}
      </div>

      {/* <div className="buttons">
        <button onClick={() => setStrike(s => Math.min(s + 1, 3))}>Strike +</button>
        <button onClick={() => setBall(b => Math.min(b + 1, 3))}>Ball +</button>
        <button onClick={() => setOut(o => Math.min(o + 1, 3))}>Out +</button>
        <button onClick={resetCounts}>Reset</button>
      </div> */}

      {/* 📝 이닝별 점수 표시 */}
      <div className="inning-scoreboard">
      
        <table>
          <thead>
            <tr>
              <th>이닝</th>
              {innings.map((_, i) => (
                <th key={i}>{i + 1}</th>
              ))}
              <th>합계</th>
            </tr>
          </thead>
          <tbody>
  <tr>
    <td>홈 팀</td>
    {innings.map((inning, i) => (
      <td key={i} className="my-team">{inning.my}</td>
    ))}
    <td className="my-team">{innings.reduce((sum, i) => sum + i.my, 0)}</td>
  </tr>
  <tr>
    <td>원정 팀</td>
    {innings.map((inning, i) => (
      <td key={i} className="opponent-team">{inning.opponent}</td>
    ))}
    <td className="opponent-team">{innings.reduce((sum, i) => sum + i.opponent, 0)}</td>
  </tr>
</tbody>
        </table>
      </div>
    </div>
  );
};

export default Scoreboard;
