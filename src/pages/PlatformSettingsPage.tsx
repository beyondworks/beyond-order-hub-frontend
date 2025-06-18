import React, { useState, useEffect } from 'react';
import { PlatformConfig, ThreePLConfig, User } from '../types';
import { getPlatformStatusInfo } from '../utils';
import { SaveIcon, LinkIcon, ToggleOnIcon, ToggleOffIcon, UserIcon, UsersIcon } from '../assets/icons';
import UserManagementTab from '../components/Settings/UserManagementTab';
import { ChannelIntegrationService } from '../modules/channels/services/ChannelIntegrationService';
import { ChannelConfig, NaverChannelConfig, CoupangChannelConfig } from '../modules/channels/types/channel.types';

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
  const [channels, setChannels] = useState<ChannelConfig[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChannelConfig | null>(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const channelService = new ChannelIntegrationService();

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

  const safePlatformConfigs = Array.isArray(platformConfigs) ? platformConfigs : [];
  const safeThreePLConfig = threePLConfig && typeof threePLConfig === 'object' ? threePLConfig : { apiUrl: '', apiKey: '', connectionStatus: 'not_configured', lastTest: '' };

  // 채널 설정 초기화
  useEffect(() => {
    const savedChannels = localStorage.getItem('channelConfigs');
    if (savedChannels) {
      setChannels(JSON.parse(savedChannels));
    } else {
      // 기본 채널 설정
      const defaultChannels: ChannelConfig[] = [
        {
          id: 'naver',
          name: '네이버 스마트스토어',
          type: 'oauth',
          status: 'disconnected',
          logoUrl: '/assets/logos/naver.png',
          description: '네이버 스마트스토어 연동으로 상품 및 주문 관리',
          clientId: '',
          clientSecret: '',
        } as NaverChannelConfig,
        {
          id: 'coupang',
          name: '쿠팡',
          type: 'api',
          status: 'disconnected',
          logoUrl: '/assets/logos/coupang.png',
          description: '쿠팡 파트너스 연동으로 판매 관리',
          vendorId: '',
          accessKey: '',
          secretKey: '',
        } as CoupangChannelConfig,
        {
          id: '29cm',
          name: '29CM',
          type: 'webhook',
          status: 'disconnected',
          logoUrl: '/assets/logos/29cm.png',
          description: '29CM 연동으로 패션 상품 판매',
        },
        {
          id: 'ohouse',
          name: '오늘의집',
          type: 'webhook',
          status: 'disconnected',
          logoUrl: '/assets/logos/ohouse.png',
          description: '오늘의집 연동으로 홈 인테리어 상품 판매',
        },
        {
          id: 'cjonstyle',
          name: 'CJ온스타일',
          type: 'api',
          status: 'disconnected',
          logoUrl: '/assets/logos/cjonstyle.png',
          description: 'CJ온스타일 TV 쇼핑 연동',
        },
        {
          id: 'kakao',
          name: '카카오톡 스토어',
          type: 'oauth',
          status: 'disconnected',
          logoUrl: '/assets/logos/kakao.png',
          description: '카카오톡 스토어 연동으로 소셜 커머스',
        },
        {
          id: 'imweb',
          name: '아임웹',
          type: 'api',
          status: 'disconnected',
          logoUrl: '/assets/logos/imweb.png',
          description: '아임웹 쇼핑몰 연동',
        },
        {
          id: 'toss',
          name: '토스쇼핑',
          type: 'api',
          status: 'disconnected',
          logoUrl: '/assets/logos/toss.png',
          description: '토스쇼핑 연동으로 간편 결제',
        },
      ];
      setChannels(defaultChannels);
    }
  }, []);

  const handleChannelSave = (config: ChannelConfig) => {
    const updatedChannels = channels.map(ch => 
      ch.id === config.id ? config : ch
    );
    setChannels(updatedChannels);
    localStorage.setItem('channelConfigs', JSON.stringify(updatedChannels));
    setShowChannelModal(false);
    setSelectedChannel(null);
  };

  const handleChannelTest = async (channelId: string) => {
    const loadingKey = `test-channel-${channelId}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      // 실제 API 테스트 로직
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedChannels = channels.map(ch => 
        ch.id === channelId ? { ...ch, status: 'connected' as const, lastSync: new Date().toLocaleString() } : ch
      );
      setChannels(updatedChannels);
      localStorage.setItem('channelConfigs', JSON.stringify(updatedChannels));
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  return (
    <>
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
          
          {/* 기존 플랫폼 설정 */}
          <div className="platform-cards-container">
            {safePlatformConfigs.map((config) => {
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
                    {Array.isArray(config.fields) ? config.fields.map((field) => (
                      <div className="form-group" key={field.id}>
                        <label htmlFor={`${config.id}-${field.id}`}>{field.label}:</label>
                        <input type={field.type} id={`${config.id}-${field.id}`} value={field.value}
                          onChange={(e) => onUpdatePlatformConfig(config.id, field.id, e.target.value)}
                          placeholder={`${field.label} 입력`} disabled={isBusy} />
                      </div>
                    )) : null}
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
          
          {/* 판매채널 섹션 추가 */}
          <h3 className="section-subtitle">판매채널 연동</h3>
          <p className="settings-description">다양한 이커머스 플랫폼과 연동하여 통합 관리하세요.</p>
          <div className="platform-cards-container">
            {channels.map((channel) => {
              const statusInfo = {
                connected: { text: '연결됨', className: 'status-connected' },
                disconnected: { text: '연결 안됨', className: 'status-disconnected' },
                pending: { text: '대기중', className: 'status-pending' },
                error: { text: '오류', className: 'status-error' },
              }[channel.status];
              
              const isTestingChannel = loadingStates[`test-channel-${channel.id}`];
              
              return (
                <section key={channel.id} className="platform-config-card" aria-labelledby={`channel-title-${channel.id}`}>
                  <header className="platform-card-header">
                    <div className="platform-logo-placeholder">
                      {channel.type === 'oauth' && '🔐'}
                      {channel.type === 'api' && '🔑'}
                      {channel.type === 'webhook' && '🔗'}
                    </div>
                    <h3 id={`channel-title-${channel.id}`}>{channel.name}</h3>
                    <span className={`connection-status-badge ${statusInfo.className}`}>{statusInfo.text}</span>
                  </header>
                  <div className="platform-card-body">
                    <p className="platform-description">{channel.description}</p>
                    <p className="channel-type-info">연동 방식: {channel.type.toUpperCase()}</p>
                    {channel.lastSync && (
                      <p className="last-sync-info">최근 동기화: {channel.lastSync}</p>
                    )}
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="action-button primary" 
                        onClick={() => {
                          setSelectedChannel(channel);
                          setShowChannelModal(true);
                        }}
                      >
                        <SaveIcon /> 설정
                      </button>
                      <button 
                        type="button" 
                        className="action-button" 
                        onClick={() => handleChannelTest(channel.id)}
                        disabled={isTestingChannel}
                      >
                        <LinkIcon /> {isTestingChannel ? '테스트 중...' : '연결 테스트'}
                      </button>
                    </div>
                  </div>
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
                        <input type="text" id="3pl-api-url" value={safeThreePLConfig.apiUrl}
                          onChange={(e) => onUpdateThreePLConfig('apiUrl', e.target.value)}
                          placeholder="예: https://api.my3pl.com/v1" disabled={loadingStates['save-3pl'] || loadingStates['test-3pl']} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="3pl-api-key">3PL API Key (또는 인증정보):</label>
                        <input type="password" id="3pl-api-key" value={safeThreePLConfig.apiKey}
                          onChange={(e) => onUpdateThreePLConfig('apiKey', e.target.value)}
                          placeholder="API Key 입력" disabled={loadingStates['save-3pl'] || loadingStates['test-3pl']} />
                    </div>
                    <p className="last-sync-info">최근 테스트: {safeThreePLConfig.lastTest}</p>
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
    
    {/* 채널 설정 모달 */}
    {showChannelModal && selectedChannel && (
      <div className="modal-overlay" onClick={() => setShowChannelModal(false)}>
        <div className="modal-content channel-config-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{selectedChannel.name} 설정</h2>
            <button className="modal-close" onClick={() => setShowChannelModal(false)}>×</button>
          </div>
          <div className="modal-body">
            {selectedChannel.type === 'oauth' && (
              <>
                <div className="form-group">
                  <label>Client ID</label>
                  <input
                    type="text"
                    value={(selectedChannel as NaverChannelConfig).clientId || ''}
                    onChange={(e) => setSelectedChannel({
                      ...selectedChannel,
                      clientId: e.target.value,
                    } as NaverChannelConfig)}
                    placeholder="Client ID 입력"
                  />
                </div>
                <div className="form-group">
                  <label>Client Secret</label>
                  <input
                    type="password"
                    value={(selectedChannel as NaverChannelConfig).clientSecret || ''}
                    onChange={(e) => setSelectedChannel({
                      ...selectedChannel,
                      clientSecret: e.target.value,
                    } as NaverChannelConfig)}
                    placeholder="Client Secret 입력"
                  />
                </div>
              </>
            )}
            {selectedChannel.type === 'api' && selectedChannel.id === 'coupang' && (
              <>
                <div className="form-group">
                  <label>Vendor ID</label>
                  <input
                    type="text"
                    value={(selectedChannel as CoupangChannelConfig).vendorId || ''}
                    onChange={(e) => setSelectedChannel({
                      ...selectedChannel,
                      vendorId: e.target.value,
                    } as CoupangChannelConfig)}
                    placeholder="Vendor ID 입력"
                  />
                </div>
                <div className="form-group">
                  <label>Access Key</label>
                  <input
                    type="text"
                    value={(selectedChannel as CoupangChannelConfig).accessKey || ''}
                    onChange={(e) => setSelectedChannel({
                      ...selectedChannel,
                      accessKey: e.target.value,
                    } as CoupangChannelConfig)}
                    placeholder="Access Key 입력"
                  />
                </div>
                <div className="form-group">
                  <label>Secret Key</label>
                  <input
                    type="password"
                    value={(selectedChannel as CoupangChannelConfig).secretKey || ''}
                    onChange={(e) => setSelectedChannel({
                      ...selectedChannel,
                      secretKey: e.target.value,
                    } as CoupangChannelConfig)}
                    placeholder="Secret Key 입력"
                  />
                </div>
              </>
            )}
            {selectedChannel.type === 'webhook' && (
              <div className="notice-box">
                <p>Webhook 연동은 현재 준비 중입니다.</p>
                <p>곧 서비스될 예정이니 조금만 기다려주세요.</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button 
              className="action-button" 
              onClick={() => setShowChannelModal(false)}
            >
              취소
            </button>
            <button 
              className="action-button primary" 
              onClick={() => handleChannelSave(selectedChannel)}
            >
              저장
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default PlatformSettingsPage;
