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
  const {
    gameId,
    userTeam,
    homeTeam,
    awayTeam,
    inningCount,
    userLineup,
    cpuLineup,
    isUserOffense,
  } = state || savedGameInfo || {};

  useEffect(() => {
    if (state) localStorage.setItem("gameInfo", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!gameId) navigate("/game/setup");
  }, [gameId, navigate]);

  const [gameState, setGameState] = useState({
    inning: 1,
    isTop: true,
    balls: 0,
    strikes: 0,
    outs: 0,
    score: {
      my: Array(inningCount || 9).fill(0),
      opponent: Array(inningCount || 9).fill(0),
    },
    bases: [false, false, false],
    homeBatterIndex: 0,
    awayBatterIndex: 0,
    currentHomeBatterName: undefined,
    currentAwayBatterName: undefined,
    currentBatterName: undefined,
  });

  const [message, setMessage] = useState("");
  const [pitchGauge, setPitchGauge] = useState(0);
  const [swingGauge, setSwingGauge] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const gaugeInterval = useRef(null);
  const lastAdvanceRef = useRef(null);
  const [backendLineups, setBackendLineups] = useState({ home: null, away: null });

  const fetchGameState = async () => {
    if (!gameId) return;
    try {
      const res = await gameAPI.getGameView(gameId);
      const data = res.data.data;

      // 라인업 이름/순서 정규화
      const normalizeLineup = (lineup) =>
        (lineup || [])
          .slice()
          .sort((a, b) => (a.Player_Order ?? a.order ?? 0) - (b.Player_Order ?? b.order ?? 0))
          .map(p => p.Player_Name || p.name || p);

      const homeLineupNames = normalizeLineup(data.homeLineup);
      const awayLineupNames = normalizeLineup(data.awayLineup);

      setBackendLineups({
        home: {
          battingOrder: homeLineupNames,
          pitcher: data.homePitcherName || data.homePitcher || null,
        },
        away: {
          battingOrder: awayLineupNames,
          pitcher: data.awayPitcherName || data.awayPitcher || null,
        },
      });

      // 인덱스/이름 키 유연 매핑
      const resolvedHomeIdx = (data.homeBatterIndex ?? data.homeBatterOrder ?? data.currentHomeBatterIndex);
      const resolvedAwayIdx = (data.awayBatterIndex ?? data.awayBatterOrder ?? data.currentAwayBatterIndex);
      const resolvedHomeName = (data.currentHomeBatterName ?? data.homeBatterName ?? data.homeCurrentBatterName);
      const resolvedAwayName = (data.currentAwayBatterName ?? data.awayBatterName ?? data.awayCurrentBatterName);

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
        homeBatterIndex: (typeof resolvedHomeIdx === 'number' ? resolvedHomeIdx : prev.homeBatterIndex),
        awayBatterIndex: (typeof resolvedAwayIdx === 'number' ? resolvedAwayIdx : prev.awayBatterIndex),
        currentHomeBatterName: resolvedHomeName ?? prev.currentHomeBatterName,
        currentAwayBatterName: resolvedAwayName ?? prev.currentAwayBatterName,
        currentBatterName: data.currentBatterName ?? prev.currentBatterName,
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

  const handlePitch = async () => {
    // StrikeZone 클릭으로 strike/ball을 결정하도록 pitch 모드로 전환만 수행
    if (animating) return;
    setAnimating(true);
    setCurrentType("pitch");
    setMessage("투구 위치를 선택하세요 (파란색=스트라이크, 초록/빨강=볼)");
  };

  const startSwingGauge = () => {
    if (animating) return;
    setCurrentType("swing");
    setAnimating(true);
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

  // 타격 건너뛰기 (스윙하지 않음)
  const handleNoSwing = async () => {
    try {
      if (gaugeInterval.current) clearInterval(gaugeInterval.current);
      setAnimating(false);
      setCurrentType(null);
      setSwingGauge(0);
      const res = await gameAPI.swing(gameId, { swing: false, timing: false });
      setMessage(res.data.message || "타격 건너뛰기!");
      await fetchGameState();
    } catch (err) {
      console.error("타격 건너뛰기 실패:", err);
    }
  };

  // isTop 정규화
  const rawIsTop = gameState?.isTop;
  let isTopNow = true;
  if (typeof rawIsTop === 'boolean') isTopNow = rawIsTop;
  else if (typeof rawIsTop === 'number') isTopNow = rawIsTop === 0;
  else if (typeof rawIsTop === 'string') isTopNow = rawIsTop.toUpperCase() === 'TOP';

  const lineups = (state?.lineups || savedGameInfo?.lineups)
    ? (state?.lineups || savedGameInfo?.lineups)
    : (backendLineups?.home || backendLineups?.away)
      ? backendLineups
      : {
          home: homeTeam === userTeam
            ? { battingOrder: userLineup?.battingOrder || [], pitcher: userLineup?.pitcher || "-" }
            : { battingOrder: cpuLineup?.battingOrder || [], pitcher: cpuLineup?.pitcher || "-" },
          away: awayTeam === userTeam
            ? { battingOrder: userLineup?.battingOrder || [], pitcher: userLineup?.pitcher || "-" }
            : { battingOrder: cpuLineup?.battingOrder || [], pitcher: cpuLineup?.pitcher || "-" }
        };

  const inferredUserTeam = userTeam
    || ((lineups?.home?.teamName === homeTeam || lineups?.home?.teamName === awayTeam) ? lineups?.home?.teamName : undefined)
    || ((lineups?.away?.teamName === homeTeam || lineups?.away?.teamName === awayTeam) ? lineups?.away?.teamName : undefined)
    || userTeam;

  // 이닝 1회에서 TeamSetup의 isUserOffense 기대치와 불일치 시 isTop 해석을 보정
  const expectedUserOffenseAtStart = typeof isUserOffense === 'boolean' ? isUserOffense : undefined;
  const offenseWithCurrentTop = isTopNow
    ? inferredUserTeam === awayTeam
    : inferredUserTeam === homeTeam;
  const effectiveIsTop = (gameState?.inning === 1 && expectedUserOffenseAtStart !== undefined && offenseWithCurrentTop !== expectedUserOffenseAtStart)
    ? !isTopNow
    : isTopNow;

  const isUserOffenseNow = effectiveIsTop
    ? inferredUserTeam === awayTeam
    : inferredUserTeam === homeTeam;

  // 3아웃 시 공수 교대 및 이닝 진행 (백엔드 반영 지연 보완)
  useEffect(() => {
    if (!gameId) return;
    const halfKey = `${gameState.inning}-${effectiveIsTop ? 'T' : 'B'}`;
    if (gameState.outs >= 3 && lastAdvanceRef.current !== halfKey) {
      lastAdvanceRef.current = halfKey;
      setGameState(prev => {
        const wasTop = effectiveIsTop;
        const nextIsTop = wasTop ? false : true;
        const nextInning = wasTop ? prev.inning : prev.inning + 1;

        return {
          ...prev,
          balls: 0,
          strikes: 0,
          outs: 0,
          isTop: nextIsTop,
          inning: nextInning,
          bases: [false, false, false],
        };
      });

      // 모든 이닝 종료 시 결과 페이지로 이동
      const maxInning = inningCount || 9;
      const isGameOver = !effectiveIsTop && (gameState.inning + 1 > maxInning);
      if (isGameOver) {
        navigate("/game/result", { state: { gameState, homeTeam, awayTeam } });
      }
    }
  }, [gameId, gameState.outs, gameState.inning, effectiveIsTop, inningCount, navigate, homeTeam, awayTeam, setGameState]);

  if (!gameId) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>게임 정보를 불러오는 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </div>
    );
  }

  // (삭제됨) 중복 3아웃 처리 훅 제거

  return (
    <div style={{ padding: 20 }}>
      <MessageBox message={message} />

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <Scoreboard
          gameState={gameState}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          lineups={lineups}
          userTeam={userTeam}
          isUserOffense={isUserOffenseNow}
        />

        <div style={{ margin: 180, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ transform: "scale(1.8)" }}>
            <Bases bases={gameState.bases} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <PitchGauge value={pitchGauge} />
          <SwingGauge value={swingGauge} />

          {/* 공격/수비 버튼 UI */}
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ marginBottom: 8, fontWeight: "bold" }}>
              {isUserOffenseNow ? "현재 공격 중" : "현재 수비 중"}
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={startSwingGauge}
                disabled={!isUserOffenseNow || animating}
                style={{
                  backgroundColor: isUserOffenseNow && !animating ? "#4A90E2" : "#ccc",
                  color: "white",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 4,
                  cursor: isUserOffenseNow && !animating ? "pointer" : "not-allowed",
                }}
              >
                타격 준비
              </button>

              <button
                onClick={handleSwing}
                disabled={!isUserOffenseNow || !animating || currentType !== "swing"}
                style={{
                  backgroundColor: isUserOffenseNow && animating && currentType === "swing" ? "#4A90E2" : "#ccc",
                  color: "white",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 4,
                  cursor: isUserOffenseNow && animating && currentType === "swing" ? "pointer" : "not-allowed",
                }}
              >
                스윙
              </button>

              <button
                onClick={handleNoSwing}
                disabled={!isUserOffenseNow}
                style={{
                  backgroundColor: isUserOffenseNow ? "#6C757D" : "#ccc",
                  color: "white",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 4,
                  cursor: isUserOffenseNow ? "pointer" : "not-allowed",
                }}
              >
                노스윙
  </button>

              <button
                onClick={handlePitch}
                disabled={isUserOffenseNow || animating}
                style={{
                  backgroundColor: !isUserOffenseNow && !animating ? "#E94E77" : "#ccc",
                  color: "white",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 4,
                  cursor: !isUserOffenseNow && !animating ? "pointer" : "not-allowed",
                }}
                >
                투구
              </button>
            </div>
                <StrikeZoneContainer
                  gameId={gameId}
                  gameState={gameState}
                  setGameState={setGameState}
                  currentType={currentType}
                  gaugeValue={currentType === "swing" ? swingGauge : pitchGauge}
                  setMessage={setMessage}
                  onServerUpdate={fetchGameState}
                  onActionComplete={() => {
                    setAnimating(false);
                    setCurrentType(null);
                  }}
                />
            <Scoreboard22
              strike={gameState.strikes}
              ball={gameState.balls}
              out={gameState.outs}
              innings={gameState.score}
              bases={gameState.bases}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
            <button
              onClick={() =>
                navigate("/game/result", {
                  state: { gameState, homeTeam, awayTeam },
                })
              }
            >
              결과 확인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;

