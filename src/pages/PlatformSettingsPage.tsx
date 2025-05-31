import React, { useState } from 'react';
import { PlatformConfig, ThreePLConfig, User } from '../types';
import { getPlatformStatusInfo } from '../utils';
import { SaveIcon, LinkIcon, ToggleOnIcon, ToggleOffIcon, UserIcon, UsersIcon } from '../assets/icons';
import UserManagementTab from '../components/Settings/UserManagementTab';

interface PlatformSettingsPageProps {
  currentUser: User | null;
  platformConfigs: PlatformConfig[];
  threePLConfig: ThreePLConfig; // 이제 non-null로 가정 (App.tsx에서 초기 로드 보장)
  users: User[];
  onUpdatePlatformConfig: (platformId: string, fieldId: string, value: string) => Promise<void>;
  onTogglePlatformActive: (platformId: string) => Promise<void>;
  onSavePlatformConfig: (platformId: string) => Promise<void>;
  onTestPlatformConnection: (platformId: string) => Promise<void>;
  onUpdateThreePLConfig: (field: keyof Omit<ThreePLConfig, 'connectionStatus'|'lastTest'>, value: string) => Promise<void>;
  onSaveThreePLConfig: () => Promise<void>;
  onTestThreePLConnection: () => Promise<void>;
  onOpenUserModal: (user?: User) => void;
  onToggleUserActive: (userId: string) => void;
}

type SettingsTab = 'platforms' | '3pl' | 'users';

const PlatformSettingsPage: React.FC<PlatformSettingsPageProps> = ({
  currentUser, platformConfigs, threePLConfig, users,
  onUpdatePlatformConfig, onTogglePlatformActive, onSavePlatformConfig, onTestPlatformConnection,
  onUpdateThreePLConfig, onSaveThreePLConfig, onTestThreePLConnection,
  onOpenUserModal, onToggleUserActive,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('platforms');
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const handleAction = async (action: () => Promise<void>, key?: string) => {
    const loadingKey = key || `action-${Date.now()}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    try {
      await action();
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };
  
  const threePLStatusInfo = getPlatformStatusInfo(threePLConfig.connectionStatus);
  const isMasterUser = currentUser?.role === 'master';

  return (
    <main className="main-content settings-page" role="main" aria-labelledby="settings-title-h2">
      <h2 id="settings-title-h2">연동 및 계정 설정</h2>
      <div className="tabs-container">
        <button className={`tab-button ${activeTab === 'platforms' ? 'active' : ''}`} onClick={() => setActiveTab('platforms')} role="tab" aria-selected={activeTab === 'platforms'} aria-controls="platform-settings-panel" id="platform-tab"> 쇼핑몰 플랫폼 </button>
        <button className={`tab-button ${activeTab === '3pl' ? 'active' : ''}`} onClick={() => setActiveTab('3pl')} role="tab" aria-selected={activeTab === '3pl'} aria-controls="3pl-settings-panel" id="3pl-tab"> 3PL </button>
        {isMasterUser && (
          <button className={`tab-button ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')} role="tab" aria-selected={activeTab === 'users'} aria-controls="user-management-panel" id="users-tab">
            <UsersIcon /> 사용자 관리
          </button>
        )}
      </div>

      {activeTab === 'platforms' && (
        <div id="platform-settings-panel" role="tabpanel" aria-labelledby="platform-tab">
          <p className="settings-description">각 쇼핑몰 플랫폼과의 연동을 설정합니다. API 키를 입력하고, 자동 주문 수집을 활성화하세요.</p>
          <div className="platform-cards-container">
            {platformConfigs.map((config) => {
              const statusInfo = getPlatformStatusInfo(config.connectionStatus);
              const isSaving = loadingStates[`save-${config.id}`];
              const isTesting = loadingStates[`test-${config.id}`];
              const isToggling = loadingStates[`toggle-${config.id}`];
              const isBusy = isSaving || isTesting || isToggling;

              return (
                <section key={config.id} className="platform-config-card" aria-labelledby={`platform-title-${config.id}`}>
                  <header className="platform-card-header">
                    <div className="platform-logo-placeholder">{config.logoPlaceholder}</div>
                    <h3 id={`platform-title-${config.id}`}>{config.name}</h3>
                    <span className={`connection-status-badge ${statusInfo.className}`}> {statusInfo.text} </span>
                  </header>
                  <form className="api-settings-form" onSubmit={(e) => {e.preventDefault(); handleAction(() => onSavePlatformConfig(config.id), `save-${config.id}`);}}>
                    {config.fields.map((field) => (
                      <div className="form-group" key={field.id}>
                        <label htmlFor={`${config.id}-${field.id}`}>{field.label}:</label>
                        <input type={field.type} id={`${config.id}-${field.id}`} value={field.value}
                          onChange={(e) => onUpdatePlatformConfig(config.id, field.id, e.target.value)}
                          placeholder={`${field.label} 입력`} disabled={isBusy} />
                      </div>
                    ))}
                    <div className="form-group toggle-group">
                      <label htmlFor={`${config.id}-enable-sync`}>자동 주문 수집:</label>
                      <button type="button" id={`${config.id}-enable-sync`} onClick={() => handleAction(() => onTogglePlatformActive(config.id), `toggle-${config.id}`)}
                        className={`toggle-button ${config.isActive ? 'active' : ''}`} aria-pressed={config.isActive} disabled={isBusy}>
                        {config.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
                        <span>{isToggling ? '변경중...' : (config.isActive ? '활성화됨' : '비활성화됨')}</span>
                      </button>
                    </div>
                    <p className="last-sync-info">최근 동기화: {config.lastSync}</p>
                    <div className="form-actions">
                      <button type="submit" className="action-button primary" disabled={isBusy}>
                        <SaveIcon /> {isSaving ? '저장 중...' : '저장'}
                      </button>
                      <button type="button" className="action-button" onClick={() => handleAction(() => onTestPlatformConnection(config.id), `test-${config.id}`)} disabled={isBusy}>
                        <LinkIcon /> {isTesting ? '테스트 중...' : '연결 테스트'}
                      </button>
                    </div>
                  </form>
                </section>
              );
            })}
          </div>
        </div>
      )}
      {activeTab === '3pl' && (
         <div id="3pl-settings-panel" className="threepl-settings-form-container" role="tabpanel" aria-labelledby="3pl-tab">
            <p className="settings-description">3자 물류(3PL) 시스템과의 연동을 설정합니다. API 정보를 입력하고 연결을 테스트하세요.</p>
            <section className="platform-config-card" aria-labelledby="3pl-settings-heading">
                <header className="platform-card-header">
                    <div className="platform-logo-placeholder">🚚</div>
                    <h3 id="3pl-settings-heading">3PL 연동 정보</h3>
                    <span className={`connection-status-badge ${threePLStatusInfo.className}`}> {threePLStatusInfo.text} </span>
                </header>
                <form className="api-settings-form" onSubmit={(e) => {e.preventDefault(); handleAction(onSaveThreePLConfig, 'save-3pl');}}>
                    <div className="form-group">
                        <label htmlFor="3pl-api-url">3PL API URL:</label>
                        <input type="text" id="3pl-api-url" value={threePLConfig.apiUrl}
                          onChange={(e) => onUpdateThreePLConfig('apiUrl', e.target.value)}
                          placeholder="예: https://api.my3pl.com/v1" disabled={loadingStates['save-3pl'] || loadingStates['test-3pl']} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="3pl-api-key">3PL API Key (또는 인증정보):</label>
                        <input type="password" id="3pl-api-key" value={threePLConfig.apiKey}
                          onChange={(e) => onUpdateThreePLConfig('apiKey', e.target.value)}
                          placeholder="API Key 입력" disabled={loadingStates['save-3pl'] || loadingStates['test-3pl']} />
                    </div>
                    <p className="last-sync-info">최근 테스트: {threePLConfig.lastTest}</p>
                    <div className="form-actions">
                        <button type="submit" className="action-button primary" disabled={loadingStates['save-3pl'] || loadingStates['test-3pl']}>
                            <SaveIcon /> {loadingStates['save-3pl'] ? '저장 중...' : '저장'}
                        </button>
                        <button type="button" className="action-button" onClick={() => handleAction(onTestThreePLConnection, 'test-3pl')} disabled={loadingStates['save-3pl'] || loadingStates['test-3pl']}>
                            <LinkIcon /> {loadingStates['test-3pl'] ? '테스트 중...' : '연결 테스트'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
      )}
      {activeTab === 'users' && isMasterUser && (
        <div id="user-management-panel" role="tabpanel" aria-labelledby="users-tab">
           <UserManagementTab users={users} onOpenUserModal={onOpenUserModal} onToggleUserActive={onToggleUserActive} />
        </div>
      )}
    </main>
  );
};

export default PlatformSettingsPage;
