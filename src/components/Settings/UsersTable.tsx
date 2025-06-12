import React from 'react';
import { User } from '../../types';
import { ToggleOnIcon, ToggleOffIcon } from '../../assets/icons';

interface UsersTableProps {
  users: User[];
  onEditUser: (id: string) => void;
  onToggleActive: (id: string) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, onEditUser, onToggleActive }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateString; // parsing 실패 시 원본 반환
    }
  };

  return (
    <div className="orders-table-container"> {/* Reusing styling from orders table */}
      <table className="users-table orders-table" aria-label="User Accounts">
        <thead>
          <tr>
            <th>이름</th>
            <th>이메일 (로그인 ID)</th>
            <th>역할</th>
            <th>상태</th>
            <th>생성일</th>
            <th>조치</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center' }}>등록된 사용자가 없습니다.</td>
            </tr>
          ) : Array.isArray(users) ? (
            users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.role === 'master' ? '관리자' : '일반사용자'}</td>
                <td>
                  <span className={user.isActive ? 'status-connected' : 'status-disconnected'} style={{padding: '3px 8px', borderRadius: '4px', fontSize: '0.85em'}}>
                    {user.isActive ? '활성' : '비활성'}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <button
                    onClick={() => onEditUser(user.id)}
                    className="action-button"
                    style={{ marginRight: '5px' }}
                    aria-label={`Edit user ${user.name}`}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onToggleActive(user.id)}
                    className={`action-button ${user.isActive ? 'secondary' : ''}`}
                    aria-label={`${user.isActive ? 'Deactivate' : 'Activate'} user ${user.name}`}
                    title={user.isActive ? '계정 비활성화' : '계정 활성화'}
                  >
                    {user.isActive ? <ToggleOffIcon /> : <ToggleOnIcon />}
                     {user.isActive ? '비활성' : '활성'}
                  </button>
                </td>
              </tr>
            ))
          ) : null}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;