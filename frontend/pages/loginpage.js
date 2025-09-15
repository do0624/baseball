import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // 서버 없을 때 임시 로그인 처리 (mock)
    const mockUser = {
      Id: username,
      name: username
    };
    login(mockUser);
    setLoginMessage('로그인 성공!');
    navigate('/');
  };

  return (
    <div>
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <input placeholder="아이디" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">로그인</button>
      </form>
      {loginMessage && <p>{loginMessage}</p>}
    </div>
  );
};

export default LoginPage;
