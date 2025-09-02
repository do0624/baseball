import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [winner, setWinner] = useState(null);

  const gameState = state?.gameState;
  const homeTeam = state?.homeTeam || "홈 팀";
  const awayTeam = state?.awayTeam || "원정 팀";

  useEffect(() => {
    if (!gameState) {
      navigate("/");
      return;
    }

    const homeTotal = gameState.score.my.reduce((a, b) => a + b, 0);
    const awayTotal = gameState.score.opponent.reduce((a, b) => a + b, 0);

    if (homeTotal > awayTotal) setWinner(`${homeTeam} 승리!`);
    else if (homeTotal < awayTotal) setWinner(`${awayTeam} 승리!`);
    else setWinner("무승부");

    if (Math.abs(homeTotal - awayTotal) >= 10) {
      setWinner(prev => prev + " ⚡ 콜드게임 종료!");
    }
  }, [gameState, navigate, homeTeam, awayTeam]);

  if (!gameState) return null;

  const totalRuns = arr => arr.reduce((a, b) => a + b, 0);

  return (
    <div style={{ padding: 20 }}>
      <h2>🏆 경기 결과</h2>
      <p>{winner}</p>
      <table border="1" cellPadding="5" style={{ width: '100%', marginBottom: 20 }}>
        <thead>
          <tr>
            <th>팀</th>
            {gameState.score.my.map((_, i) => <th key={i}>{i + 1}이닝</th>)}
            <th>합계</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{homeTeam}</td>
            {gameState.score.my.map((s, i) => <td key={i}>{s}</td>)}
            <td>{totalRuns(gameState.score.my)}</td>
          </tr>
          <tr>
            <td>{awayTeam}</td>
            {gameState.score.opponent.map((s, i) => <td key={i}>{s}</td>)}
            <td>{totalRuns(gameState.score.opponent)}</td>
          </tr>
        </tbody>
      </table>
      <button onClick={() => navigate("/")}>메인 화면</button>
      <button onClick={() => navigate("/game/setup")} style={{ marginLeft: 10 }}>다시하기</button>
    </div>
  );
};

export default ResultPage;
