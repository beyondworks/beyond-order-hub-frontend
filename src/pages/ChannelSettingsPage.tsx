import React, { useState, useEffect } from 'react';
import { User, ChannelConfig } from '../types';
import { ChannelIntegrationService } from '../modules/channels/services/ChannelIntegrationService';
import '../styles/ChannelSettings.css';

interface ChannelSettingsPageProps {
  currentUser: User;
}

const ChannelSettingsPage: React.FC<ChannelSettingsPageProps> = ({ currentUser }) => {
  const [channelService] = useState(() => new ChannelIntegrationService());
  const [channels, setChannels] = useState<ChannelConfig[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChannelConfig | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // 기본 채널 목록
  const defaultChannels: ChannelConfig[] = [
    {
      id: 'naver',
      name: '네이버 스마트스토어',
      type: 'oauth',
      status: 'disconnected',
      description: '네이버 스마트스토어 연동으로 상품 및 주문 관리',
    },
    {
      id: 'coupang',
      name: '쿠팡',
      type: 'api',
      status: 'disconnected',
      description: '쿠팡 파트너스 연동으로 판매 관리',
    },
    {
      id: '29cm',
      name: '29CM',
      type: 'webhook',
      status: 'disconnected',
      description: '29CM 연동으로 패션 상품 판매',
    },
    {
      id: 'ohouse',
      name: '오늘의집',
      type: 'webhook',
      status: 'disconnected',
      description: '오늘의집 연동으로 홈 인테리어 상품 판매',
    },
    {
      id: 'cjonstyle',
      name: 'CJ온스타일',
      type: 'api',
      status: 'disconnected',
      description: 'CJ온스타일 TV 쇼핑 연동',
    },
    {
      id: 'kakao',
      name: '카카오톡 스토어',
      type: 'oauth',
      status: 'disconnected',
      description: '카카오톡 스토어 연동으로 소셜 커머스',
    },
    {
      id: 'imweb',
      name: '아임웹',
      type: 'api',
      status: 'disconnected',
      description: '아임웹 쇼핑몰 연동',
    },
    {
      id: 'toss',
      name: '토스쇼핑',
      type: 'api',
      status: 'disconnected',
      description: '토스쇼핑 연동으로 간편 결제',
    },
  ];

  useEffect(() => {
    // 저장된 채널 설정 로드 (localStorage에서)
    const savedChannels = localStorage.getItem('channelConfigs');
    if (savedChannels) {
      try {
        const parsed = JSON.parse(savedChannels);
        setChannels(parsed);
      } catch (error) {
        console.error('Failed to parse saved channels:', error);
        setChannels(defaultChannels);
      }
    } else {
      setChannels(defaultChannels);
    }
  }, []);

  // 채널 설정 저장
  const saveChannelConfig = (config: ChannelConfig) => {
    const updatedChannels = channels.map(ch => 
      ch.id === config.id ? config : ch
    );
    setChannels(updatedChannels);
    localStorage.setItem('channelConfigs', JSON.stringify(updatedChannels));
  };

  // 연결 테스트
  const testConnection = async (channelId: string) => {
    setIsTestingConnection(channelId);
    try {
      const channel = channels.find(ch => ch.id === channelId);
      if (!channel) return;

      // 채널 서비스 등록 및 테스트
      const success = channelService.registerChannel(channel);
      if (success) {
        const service = channelService.getChannelService(channelId);
        if (service) {
          const isConnected = await service.testConnection();
          
          // 연결 상태 업데이트
          const updatedChannel = {
            ...channel,
            status: isConnected ? 'connected' as const : 'error' as const,
            lastSync: isConnected ? new Date().toISOString() : undefined,
          };
          
          saveChannelConfig(updatedChannel);
        }
      }
    } catch (error) {
      console.error(`Connection test failed for ${channelId}:`, error);
      // 에러 상태 업데이트
      const channel = channels.find(ch => ch.id === channelId);
      if (channel) {
        saveChannelConfig({ ...channel, status: 'error' });
      }
    } finally {
      setIsTestingConnection(null);
    }
  };

  // 전체 동기화
  const syncAllChannels = async () => {
    setIsSyncing(true);
    try {
      // 연결된 모든 채널에 대해 동기화 실행
      const connectedChannels = channels.filter(ch => ch.status === 'connected');
      
      for (const channel of connectedChannels) {
        channelService.registerChannel(channel);
      }

      const productResults = await channelService.syncAllProducts();
      const orderResults = await channelService.syncAllOrders();

      console.log('Sync completed:', { productResults, orderResults });
      
      // 동기화 성공 시 lastSync 업데이트
      const updatedChannels = channels.map(ch => {
        if (ch.status === 'connected') {
          return { ...ch, lastSync: new Date().toISOString() };
        }
        return ch;
      });
      
      setChannels(updatedChannels);
      localStorage.setItem('channelConfigs', JSON.stringify(updatedChannels));
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // 채널 설정 모달 열기
  const openConfigModal = (channel: ChannelConfig) => {
    setSelectedChannel(channel);
    setIsConfigModalOpen(true);
  };

  // 채널 설정 모달 닫기
  const closeConfigModal = () => {
    setSelectedChannel(null);
    setIsConfigModalOpen(false);
  };

  // 상태별 배지 색상
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'connected': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'error': return 'badge-error';
      default: return 'badge-secondary';
    }
  };

  // 상태별 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return '연결됨';
      case 'pending': return '연결 중';
      case 'error': return '오류';
      default: return '연결 안됨';
    }
  };

  return (
    <div className="main-content channel-settings-page">
      <div className="page-header">
        <h1>채널 연동 설정</h1>
        <p>다양한 이커머스 플랫폼과 연동하여 통합 관리하세요</p>
      </div>

      {/* 요약 통계 */}
      <div className="channel-summary">
        <div className="summary-cards">
          <div className="summary-card">
            <h3>전체 채널</h3>
            <span className="count">{channels.length}</span>
          </div>
          <div className="summary-card">
            <h3>연결된 채널</h3>
            <span className="count connected">{channels.filter(ch => ch.status === 'connected').length}</span>
          </div>
          <div className="summary-card">
            <h3>오류 채널</h3>
            <span className="count error">{channels.filter(ch => ch.status === 'error').length}</span>
          </div>
        </div>
        
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={syncAllChannels}
            disabled={isSyncing || channels.filter(ch => ch.status === 'connected').length === 0}
          >
            {isSyncing ? '동기화 중...' : '전체 동기화'}
          </button>
        </div>
      </div>

      {/* 채널 목록 */}
      <div className="channels-grid">
        {channels.map(channel => (
          <div key={channel.id} className="channel-card">
            <div className="channel-header">
              <div className="channel-info">
                <h3>{channel.name}</h3>
                <span className={`status-badge ${getStatusBadgeClass(channel.status)}`}>
                  {getStatusText(channel.status)}
                </span>
              </div>
              <div className="channel-type">
                {channel.type === 'oauth' && '🔐 OAuth'}
                {channel.type === 'api' && '🔑 API'}
                {channel.type === 'webhook' && '🪝 Webhook'}
              </div>
            </div>
            
            <div className="channel-body">
              <p className="channel-description">{channel.description}</p>
              
              {channel.lastSync && (
                <p className="last-sync">
                  마지막 동기화: {new Date(channel.lastSync).toLocaleString()}
                </p>
              )}
            </div>
            
            <div className="channel-actions">
              <button 
                className="btn btn-outline"
                onClick={() => openConfigModal(channel)}
              >
                설정
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={() => testConnection(channel.id)}
                disabled={isTestingConnection === channel.id}
              >
                {isTestingConnection === channel.id ? '테스트 중...' : '연결 테스트'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 채널 설정 모달 */}
      {isConfigModalOpen && selectedChannel && (
        <ChannelConfigModal
          channel={selectedChannel}
          onSave={saveChannelConfig}
          onClose={closeConfigModal}
        />
      )}
    </div>
  );
};

// 채널 설정 모달 컴포넌트
interface ChannelConfigModalProps {
  channel: ChannelConfig;
  onSave: (config: ChannelConfig) => void;
  onClose: () => void;
}

const ChannelConfigModal: React.FC<ChannelConfigModalProps> = ({ channel, onSave, onClose }) => {
  const [config, setConfig] = useState(channel);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
    onClose();
  };

  const updateConfig = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content channel-config-modal">
        <div className="modal-header">
          <h2>{channel.name} 설정</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          {/* OAuth 채널 설정 */}
          {channel.type === 'oauth' && (
            <>
              <div className="form-group">
                <label>Client ID</label>
                <input
                  type="text"
                  value={(config as any).clientId || ''}
                  onChange={(e) => updateConfig('clientId', e.target.value)}
                  placeholder="Client ID를 입력하세요"
                  required
                />
              </div>
              <div className="form-group">
                <label>Client Secret</label>
                <input
                  type="password"
                  value={(config as any).clientSecret || ''}
                  onChange={(e) => updateConfig('clientSecret', e.target.value)}
                  placeholder="Client Secret을 입력하세요"
                  required
                />
              </div>
            </>
          )}

          {/* API 채널 설정 */}
          {channel.type === 'api' && channel.id === 'coupang' && (
            <>
              <div className="form-group">
                <label>Vendor ID</label>
                <input
                  type="text"
                  value={(config as any).vendorId || ''}
                  onChange={(e) => updateConfig('vendorId', e.target.value)}
                  placeholder="Vendor ID를 입력하세요"
                  required
                />
              </div>
              <div className="form-group">
                <label>Access Key</label>
                <input
                  type="text"
                  value={(config as any).accessKey || ''}
                  onChange={(e) => updateConfig('accessKey', e.target.value)}
                  placeholder="Access Key를 입력하세요"
                  required
                />
              </div>
              <div className="form-group">
                <label>Secret Key</label>
                <input
                  type="password"
                  value={(config as any).secretKey || ''}
                  onChange={(e) => updateConfig('secretKey', e.target.value)}
                  placeholder="Secret Key를 입력하세요"
                  required
                />
              </div>
            </>
          )}

          {/* Webhook 채널 설정 */}
          {channel.type === 'webhook' && (
            <>
              <div className="form-group">
                <label>Webhook URL</label>
                <input
                  type="url"
                  value={(config as any).webhookUrl || ''}
                  onChange={(e) => updateConfig('webhookUrl', e.target.value)}
                  placeholder="Webhook URL을 입력하세요"
                  required
                />
              </div>
              <div className="form-group">
                <label>Secret Key (선택사항)</label>
                <input
                  type="password"
                  value={(config as any).secretKey || ''}
                  onChange={(e) => updateConfig('secretKey', e.target.value)}
                  placeholder="Secret Key를 입력하세요"
                />
              </div>
            </>
          )}

          {/* 미구현 채널 안내 */}
          {!['naver', 'coupang'].includes(channel.id) && (
            <div className="notice-box">
              <p>⚠️ 이 채널은 현재 개발 중입니다.</p>
              <p>곧 연동 기능이 추가될 예정입니다.</p>
            </div>
          )}
        </form>
        
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            취소
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!['naver', 'coupang'].includes(channel.id)}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelSettingsPage;