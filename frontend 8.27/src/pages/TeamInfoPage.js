import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const TeamInfoPage = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [teamInfo, setTeamInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 모든 팀 정보 가져오기
    const fetchTeams = async () => {
      try {
        const res = await api.get("/team/list");
        setTeams(res.data);
      } catch (err) {
        console.error("팀 목록 불러오기 실패", err);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    if (!selectedTeam) return;
    const fetchTeamInfo = async () => {
      try {
        const res = await api.get(`/team/${selectedTeam}`);
        setTeamInfo(res.data);
      } catch (err) {
        console.error("팀 정보 불러오기 실패", err);
      }
    };
    fetchTeamInfo();
  }, [selectedTeam]);

  return (
    <div style={{ padding: 20 }}>
      <h2>팀 정보</h2>
      <select value={selectedTeam} onChange={(e)=>setSelectedTeam(e.target.value)}>
        <option value="">팀 선택</option>
        {teams.map(t=><option key={t} value={t}>{t}</option>)}
      </select>

      {teamInfo && (
        <div style={{ marginTop: 20 }}>
          <h3>{selectedTeam} 라인업</h3>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>선수</th>
                <th>타율</th>
                <th>포지션</th>
              </tr>
            </thead>
            <tbody>
              {teamInfo.lineup.map((p,i)=>(
                <tr key={i}>
                  <td>{p.name}</td>
                  <td>{p.avg}</td>
                  <td>{p.position}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ marginTop: 10 }}>투수 정보</h3>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>투수</th>
                <th>방어율</th>
                <th>승/패</th>
              </tr>
            </thead>
            <tbody>
              {teamInfo.pitchers.map((p,i)=>(
                <tr key={i}>
                  <td>{p.name}</td>
                  <td>{p.era}</td>
                  <td>{p.win}/{p.lose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={()=>navigate("/")}>메인 화면</button>
      </div>
    </div>
  );
};

export default TeamInfoPage;
