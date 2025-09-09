// Scoreboard.js
import React, { useEffect, useRef, useState } from "react";

const Scoreboard = ({ gameState, homeTeam, awayTeam, lineups, inningCount }) => {
  const totalInnings = inningCount || 9;

  // ===== eventLog 기반 이닝별 점수 계산 (점수만 적용) =====
  const homeScore = Array(totalInnings).fill(0);
  const awayScore = Array(totalInnings).fill(0);

  (gameState.eventLog || []).forEach(event => {
    const idx = event.inning - 1;
    if (idx >= totalInnings) return;

    if (event.top) {
      awayScore[idx] = Math.max(awayScore[idx], event.awayScore ?? 0);
    } else {
      homeScore[idx] = Math.max(homeScore[idx], event.homeScore ?? 0);
    }
  });

  // 현재 진행 중인 이닝 점수 반영
  const idx = gameState.inning - 1;
  if (gameState.top) {
    awayScore[idx] = Math.max(awayScore[idx], gameState.awayScore ?? 0);
  } else {
    homeScore[idx] = Math.max(homeScore[idx], gameState.homeScore ?? 0);
  }

  // ==========================================

  const isTop = (() => {
    const val = gameState?.isTop ?? gameState?.top ?? gameState?.offenseSide;
    if (typeof val === "boolean") return val;
    if (typeof val === "number") return val === 0;
    return String(val).toUpperCase() === "TOP";
  })();

  const homeTeamName = lineups?.home?.teamName || homeTeam || gameState?.homeTeam || "홈 팀";
  const awayTeamName = lineups?.away?.teamName || awayTeam || gameState?.awayTeam || "원정 팀";

  const toNameArray = (arr = []) => arr.map((p) => (typeof p === "object" ? p.Player_Name || p.name || String(p) : String(p)));
  const homeBattingOrder = lineups?.home?.battingOrder?.length ? toNameArray(lineups.home.battingOrder) : toNameArray(gameState?.homeLineup);
  const awayBattingOrder = lineups?.away?.battingOrder?.length ? toNameArray(lineups.away.battingOrder) : toNameArray(gameState?.awayLineup);

  const pickName = (order = [], idx = 0, overrideName) => {
    if (overrideName) return overrideName;
    const candidates = [idx, idx - 1, idx + 1, 0];
    return candidates.find((c) => c >= 0 && c < order.length && order[c]) || "-";
  };

  const getPlayer = (current, teamName, order, idx) => {
    if (current?.team === teamName || current?.team?.includes(teamName.split(" ")[0])) return current.name;
    return pickName(order, idx);
  };

  const homeBatterIndex = gameState?.homeBatterIndex ?? 0;
  const awayBatterIndex = gameState?.awayBatterIndex ?? 0;
  const currentPitcher = gameState?.currentPitcher;
  const currentBatter = gameState?.currentBatter;

  const homePitcher = getPlayer(currentPitcher, homeTeamName, [], 0) || lineups?.home?.pitcher || "-";
  const awayPitcher = getPlayer(currentPitcher, awayTeamName, [], 0) || lineups?.away?.pitcher || "-";

  const homeBatter = getPlayer(currentBatter, homeTeamName, homeBattingOrder, homeBatterIndex);
  const awayBatter = getPlayer(currentBatter, awayTeamName, awayBattingOrder, awayBatterIndex);

  const [initialTopIsAway, setInitialTopIsAway] = useState(null);
  useEffect(() => { setInitialTopIsAway(isTop); }, []);

  const topTeam = initialTopIsAway ? awayTeamName : homeTeamName;
  const bottomTeam = initialTopIsAway ? homeTeamName : awayTeamName;

  const topScore = initialTopIsAway ? awayScore : homeScore;
  const bottomScore = initialTopIsAway ? homeScore : awayScore;

  const topBatterIndex = initialTopIsAway ? awayBatterIndex : homeBatterIndex;
  const bottomBatterIndex = initialTopIsAway ? homeBatterIndex : awayBatterIndex;

  const topPitcher = initialTopIsAway ? awayPitcher : homePitcher;
  const bottomPitcher = initialTopIsAway ? homePitcher : awayPitcher;

  const topBatter = initialTopIsAway ? awayBatter : homeBatter;
  const bottomBatter = initialTopIsAway ? homeBatter : awayBatter;

  const topRole = "공격";
  const bottomRole = "수비";

  const prevState = useRef({ inning: null, topPitcher: null, bottomPitcher: null, topBatter: null, bottomBatter: null });
  const [changeMsg, setChangeMsg] = useState("");
  useEffect(() => {
    let msg = "";
    if (prevState.current.inning !== null && prevState.current.inning !== gameState.inning)
      msg += ` (이닝 변경: ${prevState.current.inning}회 → ${gameState.inning}회 ${isTop ? "초" : "말"})`;
    if (prevState.current.topPitcher && prevState.current.topPitcher !== topPitcher)
      msg += ` (투수 교체: ${prevState.current.topPitcher} → ${topPitcher})`;
    if (prevState.current.bottomPitcher && prevState.current.bottomPitcher !== bottomPitcher)
      msg += ` (투수 교체: ${prevState.current.bottomPitcher} → ${bottomPitcher})`;
    if (prevState.current.topBatter && prevState.current.topBatter !== topBatter)
      msg += ` (타자 교체: ${prevState.current.topBatter} → ${topBatter})`;
    if (prevState.current.bottomBatter && prevState.current.bottomBatter !== bottomBatter)
      msg += ` (타자 교체: ${prevState.current.bottomBatter} → ${bottomBatter})`;
    if (msg) setChangeMsg(msg);
    prevState.current = { inning: gameState.inning, topPitcher, bottomPitcher, topBatter, bottomBatter };
  }, [gameState.inning, topPitcher, bottomPitcher, topBatter, bottomBatter, isTop]);

  return (
    <div style={{ overflowX: "auto" }}>
      <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "center", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Team</th>
            {Array.from({ length: totalInnings }).map((_, i) => <th key={i}>{i + 1}</th>)}
            <th>R</th><th>H</th><th>E</th><th>B</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{topTeam}</td>
            {topScore.map((s, i) => (
              <td key={i} style={{ fontWeight: topBatterIndex === i ? "bold" : "normal", backgroundColor: topBatterIndex === i ? "#f7d1d1" : "transparent" }}>{s}</td>
            ))}
            <td style={{ fontWeight: "bold" }}>{topScore.reduce((a, b) => a + b, 0)}</td>
            <td style={{ fontWeight: "bold" }}>{initialTopIsAway ? gameState?.awayHit ?? 0 : gameState?.homeHit ?? 0}</td>
            <td style={{ fontWeight: "bold" }}>{initialTopIsAway ? gameState?.awayStrikeOut ?? 0 : gameState?.homeStrikeOut ?? 0}</td>
            <td style={{ fontWeight: "bold" }}>{initialTopIsAway ? gameState?.awayWalks ?? 0 : gameState?.homeWalks ?? 0}</td>
          </tr>
          <tr>
            <td>{bottomTeam}</td>
            {bottomScore.map((s, i) => (
              <td key={i} style={{ fontWeight: bottomBatterIndex === i ? "bold" : "normal", backgroundColor: bottomBatterIndex === i ? "#d1f7c4" : "transparent" }}>{s}</td>
            ))}
            <td style={{ fontWeight: "bold" }}>{bottomScore.reduce((a, b) => a + b, 0)}</td>
            <td style={{ fontWeight: "bold" }}>{initialTopIsAway ? gameState?.homeHit ?? 0 : gameState?.awayHit ?? 0}</td>
            <td style={{ fontWeight: "bold" }}>{initialTopIsAway ? gameState?.homeStrikeOut ?? 0 : gameState?.awayStrikeOut ?? 0}</td>
            <td style={{ fontWeight: "bold" }}>{initialTopIsAway ? gameState?.homeWalks ?? 0 : gameState?.awayWalks ?? 0}</td>
          </tr>

          {/* 현재 투수/타자 */}
          <tr>
            <td colSpan={totalInnings + 5} style={{ backgroundColor: "#e0f0ff" }}>
              {`${topTeam} (${topRole}) - ${isTop ? `타자: ${topBatter}`:`투수: ${topPitcher}`}`}
            </td>
          </tr>
          <tr>
            <td colSpan={totalInnings + 5} style={{ backgroundColor: "#fff0e0" }}>
              {`${bottomTeam} (${bottomRole}) - ${isTop ? `투수: ${bottomPitcher}`:`타자: ${bottomBatter}`}`}
            </td>
          </tr>

          {/* 이닝 */}
          <tr>
            <td colSpan={totalInnings + 5} style={{ fontWeight: "bold" }}>
              {gameState.inning}회 {isTop ? "초" : "말"} 
            </td>
          </tr>
        </tbody>
      </table>
     
    </div>
  );
};

export default Scoreboard;
