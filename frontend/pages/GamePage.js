import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gameAPI } from "../api/api";
import Scoreboard from "./Scoreboard";
import Bases from "./Bases";
import { PitchGauge, SwingGauge } from "./PitchGauge";
import MessageBox from "./MessageBox";
import StrikeZoneContainer from "./StrikeZoneContainer";

const GamePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const gameId = state?.gameId;
  const userTeam = state?.userTeam; // TeamSetupPage에서 전달받은 팀
  const homeTeam = state?.homeTeam || "홈 팀";
  const awayTeam = state?.awayTeam || "원정 팀";
  const inningCount = state?.inningCount || 9;

  const [gameState, setGameState] = useState({
    inning: 1,
    isTop: true,
    balls: 0,
    strikes: 0,
    outs: 0,
    score: { my: Array(inningCount).fill(0), opponent: Array(inningCount).fill(0) },
    bases: [false, false, false],
    gameId: gameId || null,
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
      const res = await gameAPI.getGame(gameId);
      const data = res.data.data;
      setGameState(prev => ({
        ...prev,
        inning: data.inning,
        isTop: data.isTop,
        balls: data.ball,
        strikes: data.strike,
        outs: data.out,
        bases: data.bases.map(b => !!b),
        score: {
          my: data.homeByInning || prev.score.my,
          opponent: data.awayByInning || prev.score.opponent,
        },
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
      await gameAPI.pitch({ gameId, team: userTeam });
      await fetchGameState();
      setMessage("투구 완료!");
    } catch (err) {
      console.error("투구 실패:", err);
      setMessage("투구 실패");
    }

    setAnimating(false);
    setCurrentType(null);
  };

  // ---------------- 스윙 게이지 ----------------
  const startSwingGauge = () => {
    if (animating) return;
    setCurrentType("swing");
    setAnimating(true);
    setMessage("타격 준비...");

    let val = 0;
    gaugeInterval.current = setInterval(() => {
      val = val + 2;
      if (val > 100) val = 0;
      setSwingGauge(val);
    }, 20);
  };

  const handleSwing = async () => {
    if (!animating || currentType !== "swing") return;
    clearInterval(gaugeInterval.current);
    setAnimating(false);

    const gaugeVal = swingGauge;

    try {
      await gameAPI.swing({ gameId, team: userTeam, power: gaugeVal });
      await fetchGameState();

      if (gaugeVal >= 40 && gaugeVal <= 80) {
        setMessage("안타!");
      } else {
        setMessage("헛스윙! 아웃!");
        setGameState(prev => ({ ...prev, outs: prev.outs + 1 }));
      }
    } catch (err) {
      console.error("스윙 실패:", err);
      setMessage("스윙 실패");
    }

    setSwingGauge(0);
    setCurrentType(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <MessageBox message={message} />
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* 홈팀/원정팀 이름 전달 */}
        <Scoreboard gameState={gameState} homeTeam={homeTeam} awayTeam={awayTeam} />

        <div style={{ margin: 180, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ transform: "scale(1.8)" }}>
            <Bases bases={gameState.bases} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <StrikeZoneContainer
            gameState={gameState}
            setGameState={setGameState}
            currentType={currentType}
            gaugeValue={currentType === "pitch" ? pitchGauge : swingGauge}
            setMessage={setMessage}
            onAutoAction={handlePitch}
          />
          <PitchGauge value={pitchGauge} />
          <SwingGauge value={swingGauge} />

          <div style={{ marginTop: 10 }}>
            <button onClick={handlePitch} disabled={animating}>투구</button>
            <button onClick={startSwingGauge} disabled={animating} style={{ marginLeft: 10}}>타격 준비</button>
            <button onClick={handleSwing} disabled={!animating || currentType !== "swing"} style={{ marginLeft: 10}}>타이밍 스윙</button>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
            <button onClick={() => navigate("/game/result", { state: { gameState, homeTeam, awayTeam } })}>
              결과 확인
            </button>
            <button onClick={() => navigate("/game/setup")} style={{ marginLeft: 10 }}>
              다시하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
