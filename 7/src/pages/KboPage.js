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
        return <p>
        순위	선수명	팀명	AVG	G	PA	AB	R	H	2B	3B	HR	TB	RBI	SAC	SF
        1	레이예스	롯데	0.339	98	434	392	55	133	31	1	10	196	77	0	6
        2	김성윤	삼성	0.326	78	316	267	58	87	18	3	2	117	31	8	1
        3	최형우	KIA	0.324	90	375	318	52	103	25	1	15	175	57	0	3
        4	문현빈	한화	0.319	94	391	351	42	112	20	1	9	161	49	4	6
        5	박민우	NC	0.316	86	351	307	48	97	21	7	3	141	56	3	2
        6	케이브	두산	0.315	88	384	352	45	111	22	3	10	169	53	0	6
        7	신민재	LG	0.310	88	323	274	48	85	7	2	1	99	34	5	2
        8	구자욱	삼성	0.310	94	404	352	71	109	29	0	13	177	57	1	6
      
      </p>;
      case '투수':
        return <p>
        순위	선수명	팀명	ERA	G	W	L	SV	HLD	WPCT	IP	H	HR	BB	HBP	SO	R	ER	WHIP
        1	폰세	한화	1.76	20	12	0	0	0	1.000	127 2/3	78	7	27	4	176	28	25	0.82
        2	앤더슨	SSG	2.35	20	6	6	0	0	0.500	114 2/3	87	8	32	6	166	38	30	1.04
        3	네일	KIA	2.50	20	5	2	0	0	0.714	122 1/3	99	5	28	12	114	37	34	1.04
        4	후라도	삼성	2.62	20	9	7	0	0	0.563	130 1/3	121	13	25	3	96	45	38	1.12
        5	소형준	KT	2.72	18	7	3	0	0	0.700	109 1/3	103	3	23	3	97	36	33	1.15
        6	임찬규	LG	2.90	19	8	3	0	0	0.727	114 2/3	109	6	32	4	77	40	37	1.23
        7	고영표	KT	2.98	18	9	4	0	0	0.692	108 2/3	114	5	22	7	110	43	36	1.25
        8	원태인	삼성	3.03	17	6	3	0	0	0.667	104	101	10	10	4	70	38	35	1.07
        9	올러	KIA	3.03	16	8	3	0	0	0.727	95	78	3	22	6	107	35	32	1.05
        10	와이스	한화	3.19	20	11	3	0	0	0.786	118 1/3	94	10	30	6	141	45	42	1.05
        11	송승기	LG	3.27	18	8	5	0	0	0.615	99	86	9	40	1	82	37	36	1.27
    </p>;
    
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
  <div className="team-info">
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
