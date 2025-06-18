import { apiClient } from './api';
import { ChannelConfig } from '../modules/channels/types/channel.types';

export interface ChannelResponse {
  id: string;
  channelId: string;
  name: string;
  type: 'oauth' | 'api' | 'webhook';
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  description?: string;
  lastSync?: string;
}

export interface ChannelConfigRequest {
  channelId: string;
  name: string;
  type: 'oauth' | 'api' | 'webhook';
  description?: string;
  clientId?: string;
  clientSecret?: string;
  accessKey?: string;
  secretKey?: string;
  vendorId?: string;
  webhookUrl?: string;
}

export interface ConnectionTestResponse {
  success: boolean;
  message: string;
}

export interface SyncResponse {
  success: boolean;
  count: number;
  message: string;
}

export const channelApi = {
  // 모든 채널 목록 조회
  getAllChannels: async (): Promise<ChannelResponse[]> => {
    const response = await apiClient.get('/channels');
    return response.data;
  },

  // 특정 채널 조회
  getChannel: async (channelId: string): Promise<ChannelResponse> => {
    const response = await apiClient.get(`/channels/${channelId}`);
    return response.data;
  },

  // 채널 설정 업데이트
  updateChannelConfig: async (channelId: string, config: ChannelConfigRequest): Promise<ChannelResponse> => {
    const response = await apiClient.put(`/channels/${channelId}/config`, config);
    return response.data;
  },

  // 채널 연결 테스트
  testConnection: async (channelId: string): Promise<ConnectionTestResponse> => {
    const response = await apiClient.post(`/channels/${channelId}/test`);
    return response.data;
  },

  // 단일 채널 주문 동기화
  syncOrders: async (channelId: string): Promise<SyncResponse> => {
    const response = await apiClient.post(`/channels/${channelId}/sync`);
    return response.data;
  },

  // 모든 채널 주문 동기화
  syncAllChannels: async (): Promise<{ results: (SyncResponse & { channelId: string })[] }> => {
    const response = await apiClient.post('/channels/sync-all');
    return response.data;
  },
};