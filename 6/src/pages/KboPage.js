import React from 'react';
import '../styles/kboPage.css';
import Slider from "react-slick"; 

const KboPage = () => {

  return (
    <div className="about-container">
      <h1>KBO</h1>
      <div className="player-record-container">
      <button className='team-record'>팀 순위</button>
      <button className='team-record'>타자 기록</button>
      <button className='team-record'>투수 기록</button>
     </div>
     </div>

  );
};

export default KboPage; 