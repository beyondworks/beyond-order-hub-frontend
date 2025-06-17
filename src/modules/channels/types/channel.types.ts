// 채널 통합을 위한 타입 정의

export interface BaseChannelConfig {
  id: string;
  name: string;
  type: 'oauth' | 'webhook' | 'api';
  status: 'connected' | 'pending' | 'disconnected' | 'error';
  logoUrl?: string;
  description?: string;
  lastSync?: string;
  connectionStatus?: string;
}

export interface NaverChannelConfig extends BaseChannelConfig {
  type: 'oauth';
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface CoupangChannelConfig extends BaseChannelConfig {
  type: 'api';
  vendorId: string;
  accessKey: string;
  secretKey: string;
}

export interface KakaoChannelConfig extends BaseChannelConfig {
  type: 'oauth';
  appKey: string;
  adminKey: string;
  accessToken?: string;
}

export interface WebhookChannelConfig extends BaseChannelConfig {
  type: 'webhook';
  webhookUrl: string;
  secretKey?: string;
}

export type ChannelConfig = 
  | NaverChannelConfig 
  | CoupangChannelConfig 
  | KakaoChannelConfig 
  | WebhookChannelConfig;

export interface ChannelProduct {
  channelId: string;
  channelProductId: string;
  title: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryPath?: string;
  status: 'active' | 'inactive' | 'soldout';
}

export interface ChannelOrder {
  channelId: string;
  channelOrderId: string;
  orderDate: string;
  customerInfo: {
    name: string;
    phone?: string;
    email?: string;
  };
  products: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  shippingInfo: {
    address: string;
    zipCode?: string;
    memo?: string;
  };
  paymentInfo: {
    method: string;
    amount: number;
    status: 'paid' | 'pending' | 'cancelled';
  };
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}

export interface ChannelSyncResult {
  channelId: string;
  syncType: 'products' | 'orders' | 'inventory';
  success: boolean;
  processedCount: number;
  errorCount: number;
  errors?: string[];
  lastSyncTime: string;
}

export interface ChannelStats {
  channelId: string;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  todayOrders: number;
  revenue: {
    today: number;
    thisMonth: number;
    total: number;
  };
}