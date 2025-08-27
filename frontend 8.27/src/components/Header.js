import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ userId, setUserId }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserName(name);
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('userName');
    setUserId(null);
    navigate('/login');
  };
  

  return (
    <header className="header-container">
      <nav className="header-nav">
        <Link to="/" className="header-logo">.</Link>
        <div className="header-nav-links">
          <Link to="/kboboard" className="header-nav-link">게시판</Link>
          <Link to="/kbo" className="header-nav-link">KBO</Link>
          <Link to="/game" className="header-nav-link">게임</Link>
        </div>

        {userId? (
          <>
            <span className="header-user">안녕하세요, {userName}님</span>
            <button onClick={handleLogout} className="header-nav-link logout-button">
              로그아웃
            </button>
          </>
        ) : (
          <Link to="/login" className="header-nav-link">로그인</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
