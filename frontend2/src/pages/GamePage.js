import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gameAPI } from "../api/api";
import Scoreboard from "./Scoreboard";
import Bases from "./Bases";
import { PitchGauge, SwingGauge } from "./PitchGauge";
import MessageBox from "./MessageBox";

const GamePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const gameId = state?.gameId;
  const userTeam = state?.userTeam;
  const homeTeam = state?.homeTeam || "홈 팀";
  const awayTeam = state?.awayTeam || "원정 팀";
  const inningCount = state?.inningCount || 9;
  const isUserOffenseStart = state?.isUserOffense;

  const [gameState, setGameState] = useState({
    inning: 1,
    isTop: true,
    balls: 0,
    strikes: 0,
    outs: 0,
    score: { my: Array(inningCount).fill(0), opponent: Array(inningCount).fill(0) },
    bases: [false, false, false],
    homeLineup: [],
    awayLineup: [],
  });

  const [message, setMessage] = useState("");
  const [pitchGauge, setPitchGauge] = useState(0);
  const [swingGauge, setSwingGauge] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const gaugeInterval = useRef(null);

  // ---------------- 서버 상태 갱신 ----------------
  const fetchGameState = async () => {
    if (!gameId) return;
    try {
      const res = await gameAPI.getGameView(gameId);
      const data = res.data.data;

      setGameState(prev => ({
        ...prev,
        inning: data.inning,
        isTop: data.isTop,
        balls: data.ball,
        strikes: data.strike,
        outs: data.out,
        bases: data.bases || [false, false, false],
        score: {
          my: data.homeByInning || prev.score.my,
          opponent: data.awayByInning || prev.score.opponent,
        },
        homeLineup: data.homeLineup || [],
        awayLineup: data.awayLineup || [],
      }));
    } catch (err) {
      console.error("게임 상태 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchGameState, 1000);
    return () => clearInterval(interval);
  }, [gameId]);

  // ---------------- 투구 ----------------
  const handlePitch = async () => {
    if (animating) return;
    setAnimating(true);
    setCurrentType("pitch");
    setMessage("투구 중...");

    try {
      const res = await gameAPI.pitch(gameId, { pitchType: "FASTBALL" });
      setMessage(res.data.message || "투구 완료!");
      await fetchGameState();
    } catch (err) {
      console.error("투구 실패:", err);
      setMessage("투구 실패");
    }

    setAnimating(false);
    setCurrentType(null);
  };

  // ---------------- 스윙 ----------------
  const startSwingGauge = () => {
    if (animating) return;
    setCurrentType("swing");
    setAnimating(true);
    setMessage("타격 준비 중...");

    let val = 0;
    gaugeInterval.current = setInterval(() => {
      val += 2;
      if (val > 100) val = 0;
      setSwingGauge(val);
    }, 20);
  };

  const handleSwing = async () => {
    if (!animating || currentType !== "swing") return;
    clearInterval(gaugeInterval.current);
    setAnimating(false);

    try {
      const res = await gameAPI.swing(gameId, { swing: true, timing: true });
      setMessage(res.data.message || "스윙 완료!");
      await fetchGameState();
    } catch (err) {
      console.error("스윙 실패:", err);
      setMessage("스윙 실패");
    }

    setSwingGauge(0);
    setCurrentType(null);
  };

  // ---------------- 공격/수비 판단 ----------------
  const isUserOffenseNow = gameState.isTop
    ? userTeam === awayTeam
    : userTeam === homeTeam;

  // ---------------- 타격 건너뛰기 ----------------
  const skipSwing = async () => {
    if (!isUserOffenseNow || animating) return;
    try {
      const res = await gameAPI.swing(gameId, { swing: false, timing: false });
      setMessage(res.data.message || "타격 건너뛰기 완료!");
      await fetchGameState();
    } catch (err) {
      console.error("타격 건너뛰기 실패:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <MessageBox message={message} />
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <Scoreboard
          gameState={gameState}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
        />
        <div style={{ margin: 180, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ transform: "scale(1.8)" }}>
          <Bases bases={gameState.bases.map(b => !!b)} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <PitchGauge value={pitchGauge} />
          <SwingGauge value={swingGauge} />

          <div style={{ marginTop: 10 }}>
            {isUserOffenseNow ? (
              <>
                <button onClick={startSwingGauge} disabled={animating}>타격 준비</button>
                <button onClick={handleSwing} disabled={!animating || currentType !== "swing"} style={{ marginLeft: 10 }}>스윙</button>
                <button onClick={skipSwing} style={{ marginLeft: 10 }}>타격 건너뛰기</button>
              </>
            ) : (
              <button onClick={handlePitch} disabled={animating}>투구</button>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
            <button onClick={() => navigate("/game/result", { state: { gameState, homeTeam, awayTeam } })}>결과 확인</button>
            <button onClick={() => navigate("/game/setup")} style={{ marginLeft: 10 }}>다시하기</button>
          </div>

          {/* 오른쪽 아래 라인업 표시 */}
          <div style={{ marginTop: 40, border: "1px solid #ccc", padding: 10, maxHeight: 300, overflowY: "auto" }}>
            <h4>라인업</h4>
            <strong>{homeTeam}</strong>
            <ul>
              {gameState.homeLineup.map((p, idx) => <li key={idx}>{p}</li>)}
            </ul>
            <strong>{awayTeam}</strong>
            <ul>
              {gameState.awayLineup.map((p, idx) => <li key={idx}>{p}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
