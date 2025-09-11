import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ setUserId }) => {
  const [formData, setFormData] = useState({ id: '', pw: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.id) newErrors.id = '아이디를 입력해주세요';
    else if (formData.id.length < 3) newErrors.id = '아이디는 최소 3자 이상입니다';
    if (!formData.pw) newErrors.pw = '비밀번호를 입력해주세요';
    else if (formData.pw.length < 6) newErrors.pw = '비밀번호는 최소 6자 이상입니다';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/login/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('서버 응답이 정상적이지 않습니다.');

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('Id', formData.id);
        setUserId(formData.id);
        alert('로그인 성공!');
        navigate('/');
      } else {
        setErrors({ form: data.message || '아이디 또는 비밀번호가 틀렸습니다.' });
      }
    } catch (error) {
      console.error(error);
      setErrors({ form: '서버 오류가 발생했습니다.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>로그인</h1>
        <form onSubmit={handleSubmit} className="login-form">
          {errors.form && <div className="error-message">{errors.form}</div>}
          <input
            type="text"
            name="id"
            placeholder="아이디"
            value={formData.id}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.id && <div className="error-message">{errors.id}</div>}
          <input
            type="password"
            name="pw"
            placeholder="비밀번호"
            value={formData.pw}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.pw && <div className="error-message">{errors.pw}</div>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
          <button type="button" onClick={() => navigate('/profilepage')} disabled={isLoading}>
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
