import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Scoreboard from "./Scoreboard";
import Bases from "./Bases";
import { PitchGauge, SwingGauge } from "./PitchGauge";
import MessageBox from "./MessageBox";
import Scoreboard22 from "./Scoreboard22";
import StrikeZoneContainer from "./StrikeZoneContainer";

const GamePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState({
    inning: 1,
    isTop: true,
    balls: 0,
    strikes: 0,
    outs: 0,
    score: {
      my: Array(state?.inningCount || 9).fill(0),
      opponent: Array(state?.inningCount || 9).fill(0),
    },
    bases: [false, false, false],
  });

  const [message, setMessage] = useState("");
  const [pitchGauge, setPitchGauge] = useState(0);
  const [swingGauge, setSwingGauge] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const gaugeInterval = useRef(null);

  // 자동 액션 처리 (투구와 타격 번갈아가며)
  const handleAutoAction = () => {
    if (animating) return; // 이미 게이지가 진행 중이면 무시
    
    // 투구와 타격을 번갈아가며 진행
    const nextType = currentType === "pitch" ? "swing" : "pitch";
    
    if (nextType === "pitch") {
      setMessage("자동 투구 진행 중...");
    } else {
      setMessage("자동 타격 진행 중...");
    }
    
    // 자동으로 게이지 시작
    startGauge(nextType);
    
    // 1초 후 자동으로 게이지 정지
    setTimeout(() => {
      if (animating && currentType === nextType) {
        stopGauge();
      }
    }, 1000);
  };

  // 게이지 시작
  const startGauge = (type) => {
    if (!animating) {
      setCurrentType(type);
      setAnimating(true);
      let val = 0;
      gaugeInterval.current = setInterval(() => {
        val = Math.min(val + Math.floor(Math.random() * 6 + 1), 100);
        if (type === "pitch") setPitchGauge(val);
        else setSwingGauge(val);
        if (val >= 100) stopGauge();
      }, 20);
    } else if (currentType === type) stopGauge();
  };

  // 게이지 멈춤
  const stopGauge = async () => {
    if (!animating) return;
    clearInterval(gaugeInterval.current);
    setAnimating(false);
    const gaugeVal = currentType === "pitch" ? pitchGauge : swingGauge;
    setMessage(`${currentType === "pitch" ? "투구" : "타격"} 완료! 게이지: ${gaugeVal.toFixed(0)}`);
    setCurrentType(null);
  };

  // 게임 상태 주기적 갱신
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get("/game/state");
        const { score, bases, inning, isTop, strikes, balls, outs } = res.data;
        setGameState(prev => ({ ...prev, score, bases, inning, isTop, strikes, balls, outs }));
      } catch (err) {
        console.error("게임 상태 불러오기 실패:", err);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <MessageBox message={message} />

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* 좌측 점수판 */}
        <div>
          <Scoreboard gameState={gameState} />
          <MessageBox 
            message={message} 
            style={{
              position: "fixed",
              bottom: 20,
              left: 20,
              width: 300,
              padding: 10,
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: 8,
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              zIndex: 100
            }}
          />
        </div>

        {/* 가운데 Bases */}
        <div style={{ margin: 180, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ transform: "scale(1.8)" }}>
            <Bases bases={gameState.bases} />
          </div>
        </div>

        {/* 우측: StrikeZone + 게이지 + 버튼 + Scoreboard22 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <StrikeZoneContainer
            gameState={gameState}
            setGameState={setGameState}
            currentType={currentType}
            gaugeValue={currentType === "pitch" ? pitchGauge : swingGauge}
            setMessage={setMessage}
            onAutoAction={handleAutoAction}
          />

          <PitchGauge value={pitchGauge} />
          <SwingGauge value={swingGauge} />

          <div style={{ marginTop: 10 }}>
            <button onClick={() => startGauge("pitch")}>
              {animating && currentType === "pitch" ? "던지기 클릭!" : "투구 시작"}
            </button>
            <button onClick={() => startGauge("swing")} style={{ marginLeft: 10 }}>
              {animating && currentType === "swing" ? "치기 클릭!" : "타격 시작"}
            </button>
          </div>

          <div>
            <Scoreboard22 />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => navigate("/game/result", { state: { gameState } })}>
                결과 확인
              </button>
              <button onClick={() => navigate("/game/setup")} style={{ marginLeft: 10 }}>
                다시하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
