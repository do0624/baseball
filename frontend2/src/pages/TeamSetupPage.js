import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameAPI, playerAPI } from '../api/api';

const teams = ['두산', 'LG', 'SSG', '키움', '한화', '롯데', '삼성', 'KT', 'KIA', 'NC'];

const TeamSetupPage = () => {
  const navigate = useNavigate();
  const [inningCount, setInningCount] = useState(9);
  const [userTeam, setUserTeam] = useState('');
  const [cpuTeam, setCpuTeam] = useState('');
  const [userPlayers, setUserPlayers] = useState([]);
  const [cpuPlayers, setCpuPlayers] = useState([]);
  const [isUserOffense, setIsUserOffense] = useState(true); // true = 선공, false = 후공

  // ---------------- 팀 선택 시 선수 정보 가져오기 ----------------
  useEffect(() => {
    const fetchPlayers = async (team, setPlayers) => {
      if (!team) return setPlayers([]);
      try {
        const res = await playerAPI.getTeamPlayers(team);
        setPlayers(res.data);
      } catch (err) {
        console.error('선수 정보 로딩 실패', err);
        setPlayers([]);
      }
    };

    fetchPlayers(userTeam, setUserPlayers);
    fetchPlayers(cpuTeam, setCpuPlayers);
  }, [userTeam, cpuTeam]);

  // ---------------- 게임 시작 ----------------
  const handleStart = async () => {
    if (!userTeam || !cpuTeam) return alert('사용자 팀과 상대 팀을 모두 선택하세요.');
    if (userTeam === cpuTeam) return alert('사용자 팀과 상대 팀은 달라야 합니다.');

    try {
      const payload = {
        homeTeam: userTeam,
        awayTeam: cpuTeam,
        maxInning: inningCount,
        isUserOffense, // 선공/후공 선택
        userId: localStorage.getItem("userId") || "guest"
      };

      const res = await gameAPI.createGame(payload);
      const gameId = res.data.data.gameId;

      navigate('/game/play', { 
        state: { gameId, homeTeam: userTeam, awayTeam: cpuTeam, inningCount, isUserOffense } 
      });
    } catch (err) {
      console.error('게임 생성 실패', err);
      alert('게임 생성 실패: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>팀 설정 & 이닝 선택</h2>

      {/* 이닝 선택 */}
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

      {/* 사용자 팀 선택 */}
      <div>
        <label>
          사용자 팀:
          <select value={userTeam} onChange={(e) => setUserTeam(e.target.value)}>
            <option value="">선택</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        {userPlayers.length > 0 && (
          <ul>
            {userPlayers.map(p => <li key={p.Player_Name}>{p.Player_Name} ({p.Batting_average})</li>)}
          </ul>
        )}
      </div>

      {/* CPU 팀 선택 */}
      <div>
        <label>
          상대 팀:
          <select value={cpuTeam} onChange={(e) => setCpuTeam(e.target.value)}>
            <option value="">선택</option>
            {teams.filter(t => t !== userTeam).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        {cpuPlayers.length > 0 && (
          <ul>
            {cpuPlayers.map(p => <li key={p.Player_Name}>{p.Player_Name} ({p.Batting_average})</li>)}
          </ul>
        )}
      </div>

      {/* 선공/후공 선택 */}
      <div style={{ marginTop: 10 }}>
        <label style={{ marginRight: 10 }}>선공/후공 선택:</label>
        <label style={{ marginRight: 10 }}>
          <input
            type="radio"
            name="offense"
            checked={isUserOffense === true}
            onChange={() => setIsUserOffense(true)}
          />
          {userTeam || "사용자"} 선공
        </label>
        <label>
          <input
            type="radio"
            name="offense"
            checked={isUserOffense === false}
            onChange={() => setIsUserOffense(false)}
          />
          {userTeam || "사용자"} 후공
        </label>
      </div>

      {/* 게임 시작 버튼 */}
      <button onClick={handleStart} style={{ marginTop: 20 }}>게임 시작</button>
    </div>
  );
};

export default TeamSetupPage;
