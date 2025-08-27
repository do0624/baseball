import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const TeamSetupPage = () => {
  const navigate = useNavigate();
  const [inningCount, setInningCount] = useState(9);
  const [userTeam, setUserTeam] = useState('');

  const handleStart = async () => {
    try {
      const res = await api.post('/game/setup', { inningCount, userTeam });
      console.log('게임 초기화:', res.data);
      navigate('/game/play', { state: { userTeam, opponentTeam: res.data.opponentTeam, inningCount } });
    } catch (err) {
      console.error('게임 초기화 실패', err);
    }
  };

  const teams = ['TeamA', 'TeamB', 'TeamC', 'TeamD'];

  return (
    <div style={{ padding: 20 }}>
      <h2>팀 선택 & 이닝 설정</h2>
      <label>
        총 이닝 수:
        <select value={inningCount} onChange={(e) => setInningCount(Number(e.target.value))}>
          {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>{num} 이닝</option>
          ))}
        </select>
      </label>
      <div style={{ marginTop: 10 }}>
        <label>
          팀 선택:
          <select value={userTeam} onChange={(e) => setUserTeam(e.target.value)}>
            <option value="">선택</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <button onClick={handleStart} style={{ marginTop: 20 }}>게임 시작</button>
    </div>
  );
};

export default TeamSetupPage;
