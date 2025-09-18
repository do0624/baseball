// GamePage.js
import React, { useState, useEffect, useRef, useMemo } from "react";
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

  // 로컬스토리지 또는 state에서 게임 정보 가져오기
  const savedGameInfo = JSON.parse(localStorage.getItem("gameInfo") || "{}");
  const { gameId, userTeam, homeTeam, awayTeam, inningCount } =
    state || savedGameInfo || {};

  useEffect(() => {
    if (state) localStorage.setItem("gameInfo", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!gameId) navigate("/game/setup");
  }, [gameId, navigate]);

  // ===== 게임 상태 =====
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
    eventLog: [],
  });

  const gaugeInterval = useRef(null);

  // ===== 사용자 공격 여부 판단 =====
  const userIsHome = homeTeam === userTeam;
  const offenseIsTop =
    String(gameState.isTop ? "TOP" : "BOTTOM").toUpperCase() === "TOP";
  const isUserOffenseNow = offenseIsTop ? !userIsHome : userIsHome;

  // ===== 메시지 & 게이지 상태 =====
  const [message, setMessage] = useState("");
  const [pitchGauge, setPitchGauge] = useState(0);
  const [swingGauge, setSwingGauge] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const [selectedShot, setSelectedShot] = useState(null);

  // ----- 서버 메시지 파싱 -----
  const parseServerMessage = (rawMsg = "") => {
    let msg = rawMsg || "";
    msg = msg.replace("스윙/노스윙 처리 완료:", "").trim();
    const [leftRaw, rightRaw] = msg
      .split("|")
      .map((s) => (s || "").trim());
    const leftPitch = (leftRaw || "").replace("투구 처리 완료:", "").trim();
    const rightAction = rightRaw || "";
    const isNoSwing = /스윙\s*안\s*함/u.test(msg);

    if (isNoSwing) return leftPitch || "볼";
    if (msg.includes("타격")) {
      let onlyHit = rightAction || msg;
      onlyHit = onlyHit.replace(/^컴퓨터\s*타격:\s*/u, "").trim();
      return onlyHit || "타석 결과";
    }
    if (leftPitch) return leftPitch;
    return msg || "타석 결과";
  };

  // ----- 볼넷/삼진 판정용 이전 카운트 저장 -----
  const countsBeforeActionRef = useRef({
    balls: 0,
    strikes: 0,
    homeWalks: 0,
    awayWalks: 0,
  });

  const snapshotCounts = () => {
    countsBeforeActionRef.current = {
      balls: gameState.balls ?? 0,
      strikes: gameState.strikes ?? 0,
      homeWalks: gameState.homeWalks ?? 0,
      awayWalks: gameState.awayWalks ?? 0,
    };
  };

  // ----- 메시지 결정 -----
  const inferAndSetMessage = (rawMsg = "", resData = null) => {
    const prev = countsBeforeActionRef.current;
    const parsed = parseServerMessage(rawMsg);

    // --- 볼넷 처리 ---
    if (/볼넷|4구/u.test(rawMsg)) return setMessage("볼넷");
    if (parsed === "볼") {
      const newBall = (prev.balls ?? 0) + 1;
      if (newBall >= 4) return setMessage("볼넷");
      return setMessage(`${newBall}볼`);
    }

    // --- 삼진 처리 ---
    if (parsed === "스트라이크") {
      const newStrike = (prev.strikes ?? 0) + 1;
      if (newStrike >= 3) return setMessage("삼진 아웃");
      return setMessage(`${newStrike}스트라이크`);
    }

    // --- 그 외 결과 (안타, 홈런 등) ---
    setMessage(parsed || "타석 결과");
  };

  // ===== 게임 상태 fetch =====
  const fetchGameState = async () => {
    if (!gameId) return;
    try {
      const res = await gameAPI.getGameView(gameId);
      const data = res.data.data;
      const basesArray = data.bases
        ? data.bases.map((b) => b !== null)
        : [false, false, false];

      setGameState((prev) => ({
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
        eventLog: data.eventLog || [],
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

  // ===== 이닝별 점수 계산 =====
  const inningScores = useMemo(() => {
    const myScores = Array(gameState.inningCount).fill(0);
    const opponentScores = Array(gameState.inningCount).fill(0);

    gameState.eventLog.forEach((event) => {
      const idx = event.inning - 1;
      if (event.team === homeTeam) myScores[idx] += event.run || 0;
      else if (event.team === awayTeam) opponentScores[idx] += event.run || 0;
    });

    return { my: myScores, opponent: opponentScores };
  }, [gameState.eventLog, gameState.inningCount, homeTeam, awayTeam]);

  // ===== GAME_END 이벤트 감지 =====
  useEffect(() => {
    if (!gameState.eventLog || gameState.eventLog.length === 0) return;

    const gameEndEvent = gameState.eventLog.find((e) => e.type === "GAME_END");
    if (gameEndEvent) {
      navigate("/game/result", {
        state: {
          homeTeam: gameState.homeTeam || homeTeam,
          awayTeam: gameState.awayTeam || awayTeam,
          gameState: { ...gameState, score: inningScores },
        },
      });
    }
  }, [gameState.eventLog, navigate, gameState, inningScores, homeTeam, awayTeam]);

  // ===== 타격/투구 관련 =====
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
      snapshotCounts(); // 이전 카운트 저장
      const res = await gameAPI.swing(gameId, { swing: true, timing: true });
      inferAndSetMessage(res.data.message, res.data.data);
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
      snapshotCounts(); // 이전 카운트 저장
      const res = await gameAPI.swing(gameId, { swing: false, timing: false });
      inferAndSetMessage(res.data.message, res.data.data);
      await fetchGameState();
    } catch (err) {
      console.error(err);
      setMessage("노스윙 실패");
    }
  };

  if (!gameId)
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>게임 정보를 불러오는 중...</h2>
      </div>
    );

  return (
    <div style={{ padding: 20 }}>
      <MessageBox message={message} />
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <Scoreboard
          gameState={{ ...gameState, score: inningScores }}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          lineups={{}}
          inningCount={gameState.inningCount}
        />
        <div
          style={{
            margin: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ transform: "scale(1.8)" }}>
            <Bases
              bases={gameState.bases}
              basePlayers={gameState.basePlayers}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* 공격일 때 */}
          {isUserOffenseNow && (
            <>
              <SwingGauge value={swingGauge} />
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={startSwingGauge}
                  disabled={animating}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4A90E2",
                    color: "white",
                    borderRadius: 6,
                  }}
                >
                  ⚾ 타격 준비
                </button>
                <button
                  onClick={handleSwing}
                  disabled={!animating || currentType !== "swing"}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4A90E2",
                    color: "white",
                    borderRadius: 6,
                  }}
                >
                  🏏 스윙
                </button>
                <button
                  onClick={handleNoSwing}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#6C757D",
                    color: "white",
                    borderRadius: 6,
                  }}
                >
                  ❌ 노스윙
                </button>
              </div>
            </>
          )}

          {/* 수비일 때 */}
          {!isUserOffenseNow && (
            <>
              <StrikeZoneContainer
                selectedShot={selectedShot}
                setSelectedShot={setSelectedShot}
              />
              <PitchGauge value={pitchGauge} />
              <button
                onClick={async () => {
                  if (!selectedShot) {
                    setMessage("스트라이크존을 선택하세요!");
                    return;
                  }
                  snapshotCounts(); // 이전 카운트 저장
                  const type = selectedShot.color === "blue" ? "strike" : "ball";
                  const res = await gameAPI.pitch(gameId, {
                    type,
                    pitchType: type,
                    zoneColor: selectedShot.color,
                  });
                  inferAndSetMessage(res.data.message, res.data.data);
                  setSelectedShot(null);
                  await fetchGameState();
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28A745",
                  color: "white",
                  borderRadius: 6,
                }}
              >
                🥎 투구
              </button>
            </>
          )}

          <Scoreboard22
            strike={gameState.strikes}
            ball={gameState.balls}
            out={gameState.outs}
            innings={inningScores}
            bases={gameState.bases}
          />
        </div>
      </div>
    </div>
  );
};

export default GamePage;
