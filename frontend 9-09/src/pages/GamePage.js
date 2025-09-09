// GamePage.js
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gameAPI } from "../api/api";
import Scoreboard from "./Scoreboard";
import Scoreboard22 from "./Scoreboard22";
import StrikeZoneContainer from "./StrikeZoneContainer";
import Bases from "./Bases";
import { PitchGauge, SwingGauge } from "./PitchGauge";
import MessageBox from "./MessageBox";

const GamePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const savedGameInfo = JSON.parse(localStorage.getItem("gameInfo") || "{}");
  const { gameId, userTeam, homeTeam, awayTeam, inningCount } = state || savedGameInfo || {};

  useEffect(() => { if (state) localStorage.setItem("gameInfo", JSON.stringify(state)); }, [state]);
  useEffect(() => { if (!gameId) navigate("/game/setup"); }, [gameId, navigate]);

  const [gameState, setGameState] = useState({
    inning: 1,
    isTop: true,
    balls: 0,
    strikes: 0,
    outs: 0,
    bases: [false, false, false],
    basePlayers: [null, null, null],
    currentBatter: null,
    currentPitcher: null,
    offenseTeam: awayTeam || "원정팀",
    defenseTeam: homeTeam || "홈팀",
    homeScore: 0,
    awayScore: 0,
    homeHit: 0,
    awayHit: 0,
    homeWalks: 0,
    awayWalks: 0,
    inningCount: inningCount || 9,
  });

  const [message, setMessage] = useState("");
  const [pitchGauge, setPitchGauge] = useState(0);
  const [swingGauge, setSwingGauge] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const gaugeInterval = useRef(null);

  const fetchGameState = async () => {
    if (!gameId) return;
    try {
      const res = await gameAPI.getGameView(gameId);
      const data = res.data.data;
      const basesArray = data.bases ? data.bases.map(b => b !== null) : [false, false, false];
      setGameState(prev => ({
        ...prev,
        inning: data.inning,
        isTop: data.offenseSide === "TOP",
        balls: data.ball,
        strikes: data.strike,
        outs: data.out,
        bases: basesArray,
        basePlayers: data.bases || [null, null, null],
        currentBatter: data.currentBatter,
        currentPitcher: data.currentPitcher,
        offenseTeam: data.offenseTeam,
        defenseTeam: data.defenseTeam,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        homeHit: data.homeHit,
        awayHit: data.awayHit,
        homeWalks: data.homeWalks,
        awayWalks: data.awayWalks,
      }));
    } catch (err) {
      console.error("게임 상태 로딩 실패:", err);
    }
  };

  useEffect(() => {
    if (!gameId) return;
    fetchGameState();
    const interval = setInterval(fetchGameState, 5000);
    return () => clearInterval(interval);
  }, [gameId]);

  // 버튼 클릭 시 바로 백엔드 호출
  const handlePitch = async () => {
    setAnimating(true);
    setCurrentType("pitch");
    setMessage("투구 중...");
    try {
      const res = await gameAPI.pitch(gameId, { /* 필요한 데이터 */ });
      setMessage(res.data.message || "투구 완료!");
      await fetchGameState();
    } catch (err) {
      console.error(err);
      setMessage("투구 실패");
    }
  };

  const startSwingGauge = () => {
    setAnimating(true);
    setCurrentType("swing");
    let val = 0;
    gaugeInterval.current = setInterval(() => {
      val += 2;
      if (val > 100) val = 0;
      setSwingGauge(val);
    }, 20);
  };

  const handleSwing = async () => {
    clearInterval(gaugeInterval.current);
    setAnimating(false);
    setCurrentType(null);
    setSwingGauge(0);
    try {
      const res = await gameAPI.swing(gameId, { swing: true, timing: true });
      setMessage(res.data.message || "스윙 완료!");
      await fetchGameState();
    } catch (err) {
      console.error(err);
      setMessage("스윙 실패");
    }
  };

  const handleNoSwing = async () => {
    clearInterval(gaugeInterval.current);
    setAnimating(false);
    setCurrentType(null);
    setSwingGauge(0);
    try {
      const res = await gameAPI.swing(gameId, { swing: false, timing: false });
      setMessage(res.data.message || "타격 건너뛰기!");
      await fetchGameState();
    } catch (err) {
      console.error(err);
      setMessage("노스윙 실패");
    }
  };

  if (!gameId) return <div style={{ padding: 20, textAlign: "center" }}><h2>게임 정보를 불러오는 중...</h2></div>;

  return (
    <div style={{ padding: 20 }}>
      <MessageBox message={message} />
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <Scoreboard gameState={gameState} homeTeam={homeTeam} awayTeam={awayTeam} lineups={{}} userTeam={userTeam} isUserOffense={true} inningCount={gameState.inningCount} />
        <div style={{ margin: 180, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ transform: "scale(1.8)" }}>
            <Bases bases={gameState.bases} basePlayers={gameState.basePlayers} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <PitchGauge value={pitchGauge} />
          <SwingGauge value={swingGauge} />
          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={startSwingGauge} style={{ padding: "8px 16px", backgroundColor: "#4A90E2", color: "white", borderRadius: 6 }}>⚾ 타격 준비</button>
            <button onClick={handleSwing} style={{ padding: "8px 16px", backgroundColor: "#4A90E2", color: "white", borderRadius: 6 }}>🏏 스윙</button>
            <button onClick={handleNoSwing} style={{ padding: "8px 16px", backgroundColor: "#6C757D", color: "white", borderRadius: 6 }}>❌ 노스윙</button>
            <button onClick={handlePitch} style={{ padding: "8px 16px", backgroundColor: "#E94E77", color: "white", borderRadius: 6 }}>🥎 투구</button>
          </div>

          <StrikeZoneContainer gameId={gameId} gameState={gameState} setGameState={setGameState} currentType={currentType} gaugeValue={currentType === "swing" ? swingGauge : pitchGauge} setMessage={setMessage} onServerUpdate={fetchGameState} onActionComplete={() => { setAnimating(false); setCurrentType(null); }} />
          <Scoreboard22 strike={gameState.strikes} ball={gameState.balls} out={gameState.outs} innings={{ my: [], opponent: [] }} bases={gameState.bases} />
        </div>
      </div>
    </div>
  );
};

export default GamePage;
