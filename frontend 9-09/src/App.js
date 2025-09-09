import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import KboPage from './pages/KboPage';
import KboBoard from './pages/KboBoard';
import LoginPage from './pages/loginpage';
import ProfilePage from './pages/ProfilePage';
import PostForm2 from './pages/PostForm2';
import KboBoardDetail from './pages/KboBoardDetail';
// import BaseballGamePage from './pages/BaseballGamePage';
import TeamSetup from './pages/TeamSetup';
import TeamSetupPage from './pages/TeamSetupPage';
import MainPage from './pages/MainPage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import HelpPage from './pages/HelpPage';

import './App.css';

function App() {
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [backendStatus, setBackendStatus] = useState(null);

  const handleBackendStatusChange = (status) => {
    setBackendStatus(status);
    console.log('백엔드 상태 변경:', status);
  };

  return (
    <Router>
      <Header userId={userId} setUserId={setUserId} />
  
      <div className="App">
        <Routes>
          {/* 메인 페이지 */}
          <Route path="/" element={<HomePage />} />
          
          {/* 인증 */}
          <Route path="/login" element={<LoginPage setUserId={setUserId} />} />
         
          
          {/* KBO 관련 */}
          <Route path="/kbo" element={<KboPage />} />
          <Route path="/kboBoard" element={<KboBoard />} />
          <Route path="/kboBoard/:id" element={<KboBoardDetail />} />w
          
          {/* 게시글 */}
          <Route path="/PostForm2/new" element={<PostForm2 />} />
          <Route path="/PostForm2/edit/:id" element={<PostForm2 />} />
          
          {/* 게임 흐름 */}
          
          <Route path="/game/setup" element={<TeamSetupPage />} />
          <Route path="/game/game" element={<MainPage />} />
          <Route path="/game/TeamSetup" element={<TeamSetup />} />
          <Route path="/game/play" element={<GamePage />} />
          <Route path="/game/result" element={<ResultPage />} />
          
          {/* 기타 */}
          <Route path="/ProfilePage" element={<ProfilePage />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
