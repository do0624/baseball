import React, { useRef, useState } from "react";
import StrikeZone from "./StrikeZone";
import api, { gameAPI } from "../api/api";

const CM_IN_PX = 38;
const STRIKE_ZONE_SIZE = 220;

const StrikeZoneContainer = ({ gameId, gameState, setGameState, currentType, gaugeValue, setMessage, onServerUpdate, onActionComplete }) => {
  const [shots, setShots] = useState([]);
  const wrapperRef = useRef(null);

  const handleClick = async (e) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const exX = e.clientX - rect.left;
    const exY = e.clientY - rect.top;

    const relX = exX - CM_IN_PX;
    const relY = exY - CM_IN_PX;

    const insideCore = relX >= 0 && relY >= 0 && relX <= STRIKE_ZONE_SIZE && relY <= STRIKE_ZONE_SIZE;
    const insideExtended = exX >= 0 && exY >= 0 && exX <= STRIKE_ZONE_SIZE + CM_IN_PX * 2 && exY <= STRIKE_ZONE_SIZE + CM_IN_PX * 2;

    const color = insideCore ? "blue" : insideExtended ? "green" : "red";
    const newShot = { relX: exX, relY: exY, color, insideCore, insideExtended, fading: false };

    // 이전 클릭 제거, 새 클릭만 표시
    setShots([newShot]);

    // 0.05초 후 점점 사라지도록
   

    // 0.55초 후 완전히 제거
   

    // 개발용 로그 전송 제거 (404 발생 원인)

    if (!currentType) return;

    // 로컬 카운트/점수는 변경하지 않고 백엔드 응답만 반영

    try {
      // 백엔드에 결과 전달: blue=strike, green/red=ball
      if (currentType === "pitch" && gameId) {
        const type = color === "blue" ? "strike" : "ball";
        await gameAPI.pitch(gameId, { type, pitchType: type, zoneColor: color });
        setMessage(`서버 반영 완료: ${type}`);
        if (onServerUpdate) await onServerUpdate();
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      console.error("게임 상태 전송 실패:", err);
    }
  };

  return (
    <div ref={wrapperRef}>
      <StrikeZone
        shots={shots}
        CM_IN_PX={CM_IN_PX}
        STRIKE_ZONE_SIZE={STRIKE_ZONE_SIZE}
        onClick={handleClick}
      />
    </div>
  );
};

export default StrikeZoneContainer;
