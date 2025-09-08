// Scoreboard.js
import React from "react";

const Scoreboard = ({ gameState, homeTeam, awayTeam, lineups }) => {
  const inningCount = gameState?.score?.my?.length || 9;

  const homeScore = gameState?.score?.my ? [...gameState.score.my] : Array(inningCount).fill(0);
  const awayScore = gameState?.score?.opponent ? [...gameState.score.opponent] : Array(inningCount).fill(0);

  while (homeScore.length < inningCount) homeScore.push(0);
  while (awayScore.length < inningCount) awayScore.push(0);

  const homeBatterIndex = gameState?.homeBatterIndex ?? 0;
  const awayBatterIndex = gameState?.awayBatterIndex ?? 0;

  // 라인업은 props(lineups) 우선, 없으면 gameState의 라인업 사용
  const toNameArray = (arr) => (arr || []).map(p => (typeof p === 'object' ? (p.Player_Name || p.name || String(p)) : String(p)));
  const homeBattingOrder = lineups?.home?.battingOrder?.length
    ? toNameArray(lineups.home.battingOrder)
    : toNameArray(gameState?.homeLineup || []);
  const awayBattingOrder = lineups?.away?.battingOrder?.length
    ? toNameArray(lineups.away.battingOrder)
    : toNameArray(gameState?.awayLineup || []);

  // isTop 정규화: 백엔드가 boolean, number(0=초,1=말), string('TOP'/'BOTTOM')로 줄 수 있음
  const rawIsTop = gameState?.isTop;
  let isTop = true;
  if (typeof rawIsTop === 'boolean') {
    isTop = rawIsTop;
  } else if (typeof rawIsTop === 'number') {
    isTop = rawIsTop === 0; // 0: 초, 1: 말 가정
  } else if (typeof rawIsTop === 'string') {
    isTop = rawIsTop.toUpperCase() === 'TOP';
  }

  // 백엔드가 현재 타자명을 따로 내려주는 경우 우선 사용
  // 인덱스 보정: 백엔드가 1-based를 줄 수도 있어 0/±1 후보를 시도
  const pickName = (order, idx, overrideName) => {
    if (overrideName) return overrideName;
    if (!Array.isArray(order)) return "-";
    const safeIdx = typeof idx === 'number' ? idx : 0;
    const candidates = [safeIdx, safeIdx - 1, safeIdx + 1, 0];
    for (const c of candidates) {
      if (c >= 0 && c < order.length && order[c]) return order[c];
    }
    return "-";
  };

  // 백엔드가 단일 currentBatterName을 내려줄 수 있으므로 해당 값을 공격 팀에 우선 적용
  const overrideBatterName = gameState?.currentBatterName;
  const homeBatter = isTop
    ? pickName(homeBattingOrder, homeBatterIndex, null)
    : pickName(homeBattingOrder, homeBatterIndex, overrideBatterName || gameState?.currentHomeBatterName);
  const awayBatter = isTop
    ? pickName(awayBattingOrder, awayBatterIndex, overrideBatterName || gameState?.currentAwayBatterName)
    : pickName(awayBattingOrder, awayBatterIndex, null);

  // 투수는 라인업의 pitcherName 또는 pitcher 사용
  const homePitcher = lineups?.home?.pitcherName || lineups?.home?.pitcher || "-";
  const awayPitcher = lineups?.away?.pitcherName || lineups?.away?.pitcher || "-";

  // 팀명은 라인업의 teamName 우선, 없으면 전달된 props 사용
  const homeTeamName = lineups?.home?.teamName || homeTeam || "홈 팀";
  const awayTeamName = lineups?.away?.teamName || awayTeam || "원정 팀";

  const homeRole = isTop ? "수비" : "공격";
  const awayRole = isTop ? "공격" : "수비";

  return (
    <div style={{ overflowX: "auto" }}>
      <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "center", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>이닝</th>
            {Array.from({ length: inningCount }).map((_, i) => (
              <th key={i}>{i + 1}</th>
            ))}
            <th>합계</th>
          </tr>
        </thead>
        <tbody>
          {/* 홈팀 점수 */}
          <tr>
            <td>{homeTeamName}</td>
            {homeScore.map((s, i) => (
              <td
                key={i}
                style={{
                  fontWeight: homeBatterIndex === i && !isTop ? "bold" : "normal",
                  backgroundColor: homeBatterIndex === i && !isTop ? "#d1f7c4" : "transparent"
                }}
              >
                {s}
              </td>
            ))}
            <td style={{ fontWeight: "bold" }}>{homeScore.reduce((a, b) => a + b, 0)}</td>
          </tr>

          {/* 어웨이팀 점수 */}
          <tr>
            <td>{awayTeamName}</td>
            {awayScore.map((s, i) => (
              <td
                key={i}
                style={{
                  fontWeight: awayBatterIndex === i && isTop ? "bold" : "normal",
                  backgroundColor: awayBatterIndex === i && isTop ? "#f7d1d1" : "transparent"
                }}
              >
                {s}
              </td>
            ))}
            <td style={{ fontWeight: "bold" }}>{awayScore.reduce((a, b) => a + b, 0)}</td>
          </tr>

          {/* 현재 투수/타자 표시: 공격/수비는 isTop 기준 */}
          <tr>
            <td colSpan={inningCount + 2} style={{ backgroundColor: "#e0f0ff" }}>
              {homeTeamName} ({homeRole}) - {isTop ? `투수: ${homePitcher}` : `타자: ${homeBatter}`}
            </td>
          </tr>
          <tr>
            <td colSpan={inningCount + 2} style={{ backgroundColor: "#fff0e0" }}>
              {awayTeamName} ({awayRole}) - {isTop ? `타자: ${awayBatter}` : `투수: ${awayPitcher}`}
            </td>
          </tr>

          {/* 현재 이닝 */}
          <tr>
            <td colSpan={inningCount + 2} style={{ fontWeight: "bold" }}>
              이닝: {gameState.inning}회 {isTop ? "초" : "말"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Scoreboard;
