import React from 'react';
import '../styles/HomePage.css';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css';
import hitterData from '../data/2025_useBoard_pitcher.json';
import teamData from '../data/2025_useBoard_team.json';
    const HomePage = () => {
      var settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        fade: true

        
      };
  


  return (
    <div className="home-container">

      <section className="hero-section">
       
        <Slider {...settings}>
      <div>
        <h1>KBO 타자 TOP5 랭킹</h1>
        <div className="image-container">
        <h2>타율
        {hitterData
    .sort((a, b) => b.Home_Run - a.Home_Run)  // 내림차순 정렬
    .slice(0, 5)                               // 상위 5명
    .map((player, index) => (
      <h4 key={index}>{index+1}.{player["﻿Player_Name"]} .({player.Home_Run}).({player.Player_Team})</h4>
    ))}
          
        </h2>
        <h2>타점
        {hitterData
    .sort((a, b) => b.Home_Run - a.Home_Run)  // 내림차순 정렬
    .slice(0, 5)                               // 상위 5명
    .map((player, index) => (
      <h4 key={index}>{player["﻿Player_Name"]} .({player.Home_Run}).({player.Player_Team})</h4>
    ))}
        </h2>
        <h2>홈런
        {hitterData
    .sort((a, b) => b.Home_Run - a.Home_Run)  // 내림차순 정렬
    .slice(0, 5)                               // 상위 5명
    .map((player, index) => (
      <h4 key={index}>{player["﻿Player_Name"]} .({player.Home_Run}).({player.Player_Team})</h4>
    ))}
        </h2>
        </div>
      </div>
    
        
      <div>
        <h2>KBO 투수 TOP5 랭킹</h2>
        <div className="image-container">
        <h4>ERA
          <h5>~~~(~~~)</h5>
          <h5>~~~(~~~)</h5>
          <h5>~~~(~~~)</h5>
          <h5>~~~(~~~)</h5>
          <h5>~~~(~~~)</h5>
        </h4>
        <h4>승리
        {hitterData
    .sort((a, b) => b.Win	 - a.Win	)  // 내림차순 정렬
    .slice(0, 5)                               // 상위 5명
    .map((player, index) => (
      <h5 key={index}>{player["﻿Player_Name"]} .({player.Win}).({player.Player_Team})</h5>
    ))}
        </h4>
        <h4>탈삼진
          <h5>~~~(~~~)</h5>
          <h5>~~~(~~~)</h5>
          <h5>~~~(~~~)</h5>
          <h5>~~~(~~~)</h5>
          <h5>~~~(~~~)</h5>
        </h4>
        </div>
      </div>
    </Slider>  
      </section>
      <section className="team-ranking-row">
        <div className="team-ranking">
          <h1 className="team-ranking-title">KBO팀순위</h1>
          <div className="team-ranking-container">
            <div className="team-ranking-item">
            {teamData
    .sort((a, b) => b.키움 - a.키움)  // 내림차순 정렬
    .slice(0, 10)                               // 상위 5명
    .map((player, index) => (
      <h2 key={index}>{index+1},{player.키움}</h2>
    ))}
            </div>
          </div>
        </div>
      
  
      </section>
  
    </div>
  );
};

export default HomePage; 