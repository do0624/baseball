import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI } from '../api/api';

const teams = ['두산', 'LG', 'SSG', '키움', '한화', '롯데', '삼성', 'KT', 'KIA', 'NC'];

const TeamSetupPage = () => {
  const navigate = useNavigate();
  const [inningCount, setInningCount] = useState(9);
  const [userTeam, setUserTeam] = useState('');
  const [cpuTeam, setCpuTeam] = useState('');

  const handleStart = async () => {
    if (!userTeam || !cpuTeam) return alert('사용자 팀과 상대 팀을 모두 선택하세요.');
    if (userTeam === cpuTeam) return alert('사용자 팀과 상대 팀은 달라야 합니다.');

    try {
      const payload = {
        homeTeam: userTeam,
        awayTeam: cpuTeam,
        maxInning: inningCount,
        isUserOffense: true,
        userId: localStorage.getItem("userId") || "guest"
      };

      const res = await gameAPI.createGame(payload);
      const gameId = res.data.data.gameId;

      navigate('/game/play', { 
        state: { 
          gameId, 
          userTeam,       // 홈 팀
          cpuTeam,        // 원정 팀
          inningCount
        } 
      });

    } catch (err) {
      console.error('게임 생성 실패', err);
      alert('게임 생성 실패: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>팀 설정 & 이닝 선택</h2>
      <div>
        <label>
          총 이닝:
          <select value={inningCount} onChange={(e) => setInningCount(Number(e.target.value))}>
            {Array.from({ length: 7 }, (_, i) => i + 3).map(num => (
              <option key={num} value={num}>{num} 이닝</option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          사용자 팀:
          <select value={userTeam} onChange={(e) => setUserTeam(e.target.value)}>
            <option value="">선택</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <div>
        <label>
          상대 팀:
          <select value={cpuTeam} onChange={(e) => setCpuTeam(e.target.value)}>
            <option value="">선택</option>
            {teams.filter(t => t !== userTeam).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <button onClick={handleStart}>게임 시작</button>
    </div>
  );
};

export default TeamSetupPage;
