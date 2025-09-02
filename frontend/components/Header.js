import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from "../api/api";
import './Header.css';

const Header = ({ userId, setUserId }) => {
  const navigate = useNavigate();
  const [userid, setUserid] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('userId'); // ✅ 키 이름 수정
    if (id) setUserid(id);
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('userId'); // ✅ 키 이름 수정
    setUserId(null);
    navigate('/login');
  };

  return (
    <header className="header-container">
      <nav className="header-nav">
        {/* 왼쪽 로고 */}
        <Link to="/" className="header-logo">⚾</Link>

        {/* 가운데 메뉴 */}
        <div className="header-nav-links">
          <Link to="/kboboard" className="header-nav-link">게시판</Link>
          <Link to="/kbo" className="header-nav-link">KBO</Link>
          <Link to="/game/setup" className="header-nav-link">게임</Link>
        </div>

  {/* 오른쪽 유저 영역 */}
  <div className="header-right">
    {userId ? (
      <>
        <span className="header-user">안녕하세요, {userid}님</span>
        <button onClick={handleLogout} className="logout-button">
          로그아웃
        </button>
      </>
    ) : (
      <Link to="/login" className="header-nav-link">로그인</Link>
    )}
  </div>
</nav>
    </header>
  );
};

export default Header;
