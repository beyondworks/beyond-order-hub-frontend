import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../contexts/ToastContext';

interface LoginPageProps {
  onLogin: (username: string, passwordAttempt: string) => Promise<boolean>; // Promise 반환 타입으로 변경
  isLoggingIn: boolean; // 로그인 진행 상태 prop 추가
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, isLoggingIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const toastContext = useContext(ToastContext);

  useEffect(() => {
    if (window.location.hash !== '#login') {
      window.location.hash = 'login';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toastContext?.addToast('사용자 이름과 비밀번호를 모두 입력해주세요.', 'error');
      return;
    }
    // onLogin이 Promise를 반환하므로 await 사용 가능 (App.tsx에서 핸들링)
    await onLogin(username, password);
    // 로그인 성공/실패 토스트는 onLogin 함수(App.tsx)에서 처리
  };

  return (
    <div className="login-page-container">
      <div className="login-form-container">
        <h1 className="login-title">비욘드 오더 허브</h1>
        <p className="login-subtitle">통합 주문 관리를 시작하세요.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">사용자 이름 (이메일):</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="이메일 주소 입력"
              autoFocus
              disabled={isLoggingIn}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">비밀번호:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              disabled={isLoggingIn}
            />
          </div>
          <button type="submit" className="login-button action-button primary" disabled={isLoggingIn}>
            {isLoggingIn ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p className="login-footer-text">
          © 비욘드 오더 허브. 모든 권리 보유.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
