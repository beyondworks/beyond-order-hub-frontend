import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { CloseIcon, SaveIcon } from '../../assets/icons';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit: User | null;
  onAddUser: (newUser: Omit<User, 'id' | 'createdAt' | 'isActive'>, password?: string) => Promise<boolean>; // Promise 반환
  onUpdateUser: (updatedUser: User) => Promise<boolean>; // Promise 반환
}

const UserEditModal: React.FC<UserEditModalProps> = ({ 
  isOpen, 
  onClose, 
  userToEdit, 
  onAddUser, 
  onUpdateUser 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); // Email
  const [role, setRole] = useState<'master' | 'user'>('user');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{[key:string]: string}>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setUsername(userToEdit.username);
      setRole(userToEdit.role);
      setPassword(''); 
      setConfirmPassword('');
    } else {
      setName('');
      setUsername('');
      setRole('user');
      setPassword('');
      setConfirmPassword('');
    }
    setErrors({});
    setIsSaving(false);
  }, [isOpen, userToEdit]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      modalRef.current?.focus();
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, isSaving]);

  const validateForm = () => {
    const newErrors: {[key:string]: string} = {};
    if (!name.trim()) newErrors.name = '이름을 입력해주세요.';
    if (!username.trim()) {
        newErrors.username = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(username)) {
        newErrors.username = '올바른 이메일 형식이 아닙니다.';
    }

    if (!userToEdit || password) {
        if (!password) newErrors.password = '비밀번호를 입력해주세요.';
        else if (password.length < 6) newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
        if (password !== confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    const userData = { name, username, role };
    let success = false;

    if (userToEdit) {
      const updatedUserData: User = {
        ...userToEdit,
        ...userData,
        ...(password && { password: password }), 
      };
      success = await onUpdateUser(updatedUserData);
    } else {
      success = await onAddUser(userData, password);
    }
    setIsSaving(false);
    // 모달 닫기는 onAddUser/onUpdateUser 성공 시 App.tsx에서 처리 (이미 그렇게 되어 있음)
  };

  if (!isOpen) return null;
  
  const modalTitleId = userToEdit ? `user-edit-title-${userToEdit.id}` : 'user-add-title';

  return (
    <div className="modal-overlay" onClick={isSaving ? undefined : onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
      >
        <div className="modal-header">
          <h3 id={modalTitleId}>{userToEdit ? '사용자 정보 수정' : '새 사용자 추가'}</h3>
          <button onClick={isSaving ? undefined : onClose} className="modal-close-button" aria-label="Close modal" disabled={isSaving}>
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="user-name">이름:</label>
              <input type="text" id="user-name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
              {errors.name && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.name}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="user-username">이메일 (로그인 ID):</label>
              <input type="email" id="user-username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isSaving} />
              {errors.username && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.username}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="user-role">역할:</label>
              <select id="user-role" value={role} onChange={(e) => setRole(e.target.value as 'master' | 'user')} disabled={isSaving}>
                <option value="user">일반사용자</option>
                <option value="master">관리자</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="user-password">비밀번호 {userToEdit ? '(변경 시에만 입력)' : ''}:</label>
              <input type="password" id="user-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={userToEdit ? "변경할 경우 새 비밀번호 입력" : "비밀번호 입력"} disabled={isSaving}/>
              {errors.password && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.password}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="user-confirm-password">비밀번호 확인:</label>
              <input type="password" id="user-confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={userToEdit && !password ? "변경 시 위에 먼저 입력" : "비밀번호 다시 입력"} disabled={(!password && !!userToEdit) || isSaving} />
              {errors.confirmPassword && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.confirmPassword}</p>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="action-button primary" disabled={isSaving}>
              <SaveIcon /> {isSaving ? (userToEdit ? '저장 중...' : '추가 중...') : (userToEdit ? '저장' : '추가')}
            </button>
            <button type="button" onClick={isSaving ? undefined : onClose} className="action-button" disabled={isSaving}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
