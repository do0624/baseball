import React, { useState } from 'react';
import '../styles/kboPage.css';

const KboPage = () => {
  const [selectedTab, setSelectedTab] = useState('');
  const [selectedteam, setSelectedteam] = useState('');
  const [selectedHitter, setSelectedHitter] = useState('');

  const renderTeamInfo = () => {
    return (
      <div className="team-info">
        <p>1위 - LG 트윈스 (승 65 / 패 35)</p>
        <p>2위 - 두산 베어스 (승 60 / 패 40)</p>
        <p>3위 - SSG 랜더스 (승 58 / 패 42)</p>
      </div>
    );
  };
  const hitters = ['타자', '투수'];


  const renderHitterInfo = (hitter) => {
    switch (hitter) {
      case '타자':
        return (
          <table className="record-table">
            <thead>
              <tr>
                <th>순위</th><th>선수명</th><th>팀명</th><th>AVG</th><th>G</th><th>PA</th><th>AB</th><th>R</th><th>H</th><th>2B</th><th>3B</th><th>HR</th><th>TB</th><th>RBI</th><th>SAC</th><th>SF</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>레이예스</td><td>롯데</td><td>0.339</td><td>98</td><td>434</td><td>392</td><td>55</td><td>133</td><td>31</td><td>1</td><td>10</td><td>196</td><td>77</td><td>0</td><td>6</td></tr>
              <tr><td>2</td><td>김성윤</td><td>삼성</td><td>0.326</td><td>78</td><td>316</td><td>267</td><td>58</td><td>87</td><td>18</td><td>3</td><td>2</td><td>117</td><td>31</td><td>8</td><td>1</td></tr>
              <tr><td>3</td><td>최형우</td><td>KIA</td><td>0.324</td><td>90</td><td>375</td><td>318</td><td>52</td><td>103</td><td>25</td><td>1</td><td>15</td><td>175</td><td>57</td><td>0</td><td>3</td></tr>
              {/* 생략: 필요 시 계속 추가 */}
            </tbody>
          </table>
        );
      case '투수':
        return (
          <table className="record-table">
            <thead>
              <tr>
                <th>순위</th><th>선수명</th><th>팀명</th><th>ERA</th><th>G</th><th>W</th><th>L</th><th>SV</th><th>HLD</th><th>WPCT</th><th>IP</th><th>H</th><th>HR</th><th>BB</th><th>HBP</th><th>SO</th><th>R</th><th>ER</th><th>WHIP</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>폰세</td><td>한화</td><td>1.76</td><td>20</td><td>12</td><td>0</td><td>0</td><td>0</td><td>1.000</td><td>127 2/3</td><td>78</td><td>7</td><td>27</td><td>4</td><td>176</td><td>28</td><td>25</td><td>0.82</td></tr>
              <tr><td>2</td><td>앤더슨</td><td>SSG</td><td>2.35</td><td>20</td><td>6</td><td>6</td><td>0</td><td>0</td><td>0.500</td><td>114 2/3</td><td>87</td><td>8</td><td>32</td><td>6</td><td>166</td><td>38</td><td>30</td><td>1.04</td></tr>
              {/* 생략: 필요 시 계속 추가 */}
            </tbody>
          </table>
        );
      default:
        return null;
    }
  };
  

  return (
    <div className="about-container">
      <h1>KBO</h1>
      <div className="player-record-container">
        <div className="record-buttons">
          <button className="team-record" onClick={() => setSelectedTab('team')}>
            팀 순위
          </button>
          <button className="team-record" onClick={() => setSelectedTab('hitter')}>
            선수 기록
          </button>
        </div>

        {selectedTab === 'team' && (
  <div className="team-">
    {renderTeamInfo()}
  </div>
)}
     
        {/* 타자 버튼 목록 */}
        {selectedTab === 'hitter' && (
          <div className="hitter-buttons">
            {hitters.map((hitter) => (
              <button
                key={hitter}
                className="hitter-btn"
                onClick={() => setSelectedHitter(hitter)}
              >
                {hitter}
              </button>
            ))}
          </div>
        )}

        {/* 타자 정보 출력 */}
        {selectedTab === 'hitter' && selectedHitter && (
          <div className="hitter-info">
            {renderHitterInfo(selectedHitter)}
          </div>
        )}

       
        
      
      </div>
    </div>
  );
};

export default KboPage;
