import React from 'react';
import { UserIcon, BellIcon } from '../../assets/icons';
import { User } from '../../types'; // User 타입 임포트

interface HeaderProps {
  appName: string;
  currentUser: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ appName, currentUser, onLogout }) => {
  return (
    <header className="header" role="banner">
      <h1>{appName}</h1>
      <div className="header-icons">
        {currentUser && (
          <>
            <span style={{ marginRight: '15px', fontSize: '0.9em' }}>
              안녕하세요, {currentUser.name}님 ({currentUser.role === 'master' ? '관리자' : '사용자'})
            </span>
            <button 
              onClick={onLogout} 
              aria-label="Logout" 
              title="로그아웃" 
              style={{background: 'none', border: 'none', color: 'inherit', padding: '0', cursor: 'pointer', marginRight: '10px', fontSize: '0.9em', textDecoration: 'underline' }}
            >
              로그아웃
            </button>
          </>
        )}
        <button aria-label="Notifications" title="알림" style={{background: 'none', border: 'none', color: 'inherit', padding: '0'}}>
          <BellIcon />
        </button>
        <button aria-label="User profile" title="사용자 프로필" style={{background: 'none', border: 'none', color: 'inherit', padding: '0'}}>
          <UserIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;
