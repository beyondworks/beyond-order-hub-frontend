import React from 'react';
import { User } from '../../types';
import UsersTable from './UsersTable';
import { UserPlusIcon } from '../../assets/icons';

interface UserManagementTabProps {
  users: User[];
  onOpenUserModal: (user?: User) => void;
  onToggleUserActive: (userId: string) => void;
}

const UserManagementTab: React.FC<UserManagementTabProps> = ({ users, onOpenUserModal, onToggleUserActive }) => {
  return (
    <div>
      <p className="settings-description">
        시스템 사용자 계정을 관리합니다. 새 사용자를 추가하거나 기존 사용자의 정보를 수정하고 활성 상태를 변경할 수 있습니다.
      </p>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="action-button primary" 
          onClick={() => onOpenUserModal()}
          aria-label="Add new user"
        >
          <UserPlusIcon /> 새 사용자 추가
        </button>
      </div>
      <UsersTable 
        users={users} 
        onEditUser={onOpenUserModal} 
        onToggleActive={onToggleUserActive} 
      />
    </div>
  );
};

export default UserManagementTab;