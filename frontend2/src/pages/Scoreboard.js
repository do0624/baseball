import React, { useState, useEffect } from 'react';
import { playerAPI } from '../api/api';

const Scoreboard = ({ gameState, homeTeam, awayTeam }) => {
  const [homePitcher, setHomePitcher] = useState('');
  const [homeBatter, setHomeBatter] = useState('');
  const [awayPitcher, setAwayPitcher] = useState('');
  const [awayBatter, setAwayBatter] = useState('');

  const [inningCount] = useState(gameState?.score?.my?.length || 9);

  useEffect(() => {
    if (!gameState?.gameId) return;

    async function fetchPlayers() {
      try {
        // 홈팀 선수 정보
        const homeRes = await playerAPI.getTeamPlayers(homeTeam);
        const homePitch = homeRes.data.find(p => p.position === '투수');
        const homeBat = homeRes.data.find(p => p.position === '타자');
        setHomePitcher(homePitch?.name || '-');
        setHomeBatter(homeBat?.name || '-');

        // 원정팀 선수 정보
        const awayRes = await playerAPI.getTeamPlayers(awayTeam);
        const awayPitch = awayRes.data.find(p => p.position === '투수');
        const awayBat = awayRes.data.find(p => p.position === '타자');
        setAwayPitcher(awayPitch?.name || '-');
        setAwayBatter(awayBat?.name || '-');
      } catch (err) {
        console.error('선수 정보 불러오기 실패', err);
      }
    }

    fetchPlayers();
  }, [gameState?.gameId, homeTeam, awayTeam]);

  const homeScore = gameState?.score?.my ? [...gameState.score.my] : Array(inningCount).fill(0);
  const awayScore = gameState?.score?.opponent ? [...gameState.score.opponent] : Array(inningCount).fill(0);

  while (homeScore.length < inningCount) homeScore.push(0);
  while (awayScore.length < inningCount) awayScore.push(0);

  const inning = gameState?.inning || 1;
  const isTop = gameState?.isTop ?? true;

  return (
    <div>
      <table border="1" cellPadding="10" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>이닝</th>
            {Array.from({ length: inningCount }).map((_, i) => <th key={i}>{i + 1}</th>)}
            <th>합계</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{homeTeam || "홈 팀"}</td>
            {homeScore.map((s,i) => <td key={i}>{s}</td>)}
            <td>{homeScore.reduce((a,b)=>a+b,0)}</td>
          </tr>
          <tr>
            <td>{awayTeam || "원정 팀"}</td>
            {awayScore.map((s,i) => <td key={i}>{s}</td>)}
            <td>{awayScore.reduce((a,b)=>a+b,0)}</td>
          </tr>
          <tr>
            <td colSpan={inningCount+2}>
              {homeTeam || "홈 팀"} = {isTop ? `투수: ${homePitcher}` : `타자: ${homeBatter}`}
            </td>
          </tr>
          <tr>
            <td colSpan={inningCount+2}>
              {awayTeam || "원정 팀"} = {isTop ? `타자: ${awayBatter}` : `투수: ${awayPitcher}`}
            </td>
          </tr>
          <tr>
            <td colSpan={inningCount+2}>
              이닝: {inning}회 {isTop ? "초" : "말"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Scoreboard;
