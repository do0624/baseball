import React, { useEffect, useState } from "react";
import api from "../api/api";

const Scoreboard = ({ gameState, homeTeam = "홈 팀", awayTeam = "원정 팀" }) => {
  const [homePitcher, setHomePitcher] = useState("");
  const [homeBatter, setHomeBatter] = useState("");
  const [awayPitcher, setAwayPitcher] = useState("");
  const [awayBatter, setAwayBatter] = useState("");

  const inningCount = gameState?.score?.my?.length || 9;

  // ---------------- 선수 이름 가져오기 ----------------
  useEffect(() => {
    if (!gameState?.gameId) return;

    const fetchNames = async () => {
      try {
        const res = await api.get(`/game/${gameState.gameId}/names`);
        setHomePitcher(res.data.homePitcher || "");
        setHomeBatter(res.data.homeBatter || "");
        setAwayPitcher(res.data.awayPitcher || "");
        setAwayBatter(res.data.awayBatter || "");
      } catch (err) {
        console.error("선수 이름 불러오기 실패:", err);
      }
    };

    fetchNames();
  }, [gameState?.gameId]);

  // ---------------- 점수 배열 초기화 ----------------
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
            <td>{homeTeam}</td>
            {homeScore.map((s, i) => <td key={i}>{s}</td>)}
            <td>{homeScore.reduce((a, b) => a + b, 0)}</td>
          </tr>
          <tr>
            <td>{awayTeam}</td>
            {awayScore.map((s, i) => <td key={i}>{s}</td>)}
            <td>{awayScore.reduce((a, b) => a + b, 0)}</td>
          </tr>
          <tr>
            <td colSpan={inningCount + 2}>
              홈팀 {isTop ? `투수: ${homePitcher || "-"}` : `타자: ${homeBatter || "-"}`}
            </td>
          </tr>
          <tr>
            <td colSpan={inningCount + 2}>
              원정팀 {isTop ? `타자: ${awayBatter || "-"}` : `투수: ${awayPitcher || "-"}`}
            </td>
          </tr>
          <tr>
            <td colSpan={inningCount + 2}>
              이닝: {inning}회 {isTop ? "초" : "말"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Scoreboard;
