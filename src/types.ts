export interface Order {
  id: string;
  dateTime: string;
  platform: string;
  productSummary: string;
  quantity: number;
  customerName: string;
  status: string;
  platformOrderId: string;
  hasReturnOrExchange?: boolean; // 반품/교환 여부
  returnStatus?: ReturnRequestStatus; // 간략한 반품/교환 상태
  shippingInfo?: { // 배송 정보 필드 추가
    carrier?: string;
    trackingNumber?: string;
    shippingDate?: string;
  };
}
export interface OrderProduct {
  id: string; // 상품의 BOH 내부 ID (Product.id와 연결)
  productCode?: string; // 상품의 고유 코드 (Product.productCode와 연결)
  name: string;
  option: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderFulfillment {
  threePLStatus: string;
  trackingNumber: string;
  shippingCarrier: string;
  shippingCarriersAvailable: string[];
}

export interface OrderHistoryEvent {
  timestamp: string;
  event: string;
}

export interface OrderDetail {
  id: string;
  platformOrderId: string;
  platform: string;
  dateTime: string;
  status: string;
  customer: {
    name: string;
    contact: string;
    address: string;
    zipCode: string;
  };
  products: OrderProduct[];
  totalAmount: number;
  fulfillment: OrderFulfillment;
  history: OrderHistoryEvent[];
  returnInfo?: { // 반품/교환 상세 정보
    type: '반품' | '교환';
    reason: string;
    requestedDate: string;
    status: ReturnRequestStatus; // 상세 상태 (예: '수거대기', '수거완료', '검수중', '환불완료')
    items: Array<{ productId: string; productName: string; quantity: number }>;
    returnTrackingNumber?: string;
    refundAmount?: number;
    notes?: string;
  };
}

export interface PlatformConfigField {
  id: string;
  label: string;
  type: 'text' | 'password' | 'email';
  value: string;
}

export interface PlatformConfig {
  id: string;
  name: string;
  logoPlaceholder: string;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'not_configured';
  isActive: boolean;
  lastSync: string;
  fields: PlatformConfigField[];
}

export interface ThreePLConfig {
  apiUrl: string;
  apiKey: string;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'not_configured';
  lastTest: string;
}

export type ErrorLogLevel = 'critical' | 'warning' | 'info';

export interface ErrorLogEntry {
    id: string;
    timestamp: string;
    service: string;
    level: ErrorLogLevel;
    message: string;
    status: '미해결' | '해결됨' | '재시도 중';
}

// 사용자 계정 타입
export interface User {
  id: string;
  username: string; // 이메일 주소로 사용
  password?: string; // 생성/수정 시에만 사용, 실제 저장 시 해싱 필요
  role: 'master' | 'user';
  name: string; 
  isActive: boolean; // 계정 활성 상태
  createdAt: string; // 계정 생성일 (ISO 날짜 문자열 권장)
}

// 반품/교환 요청 상태 타입
export type ReturnRequestStatus = 
  | '요청접수' // Customer requested
  | '수거지시' // Seller instructed logistics for pickup
  | '수거중'   // Logistics is picking up
  | '수거완료' // Logistics completed pickup
  | '검수중'   // Seller inspecting returned item
  | '처리중'   // For exchange: new item being prepared/shipped. For return: refund processing.
  | '완료'     // Exchange completed, or Refund completed
  | '반려'     // Request rejected
  | '철회';    // Customer cancelled request

// 반품/교환 요청 타입
export interface ReturnRequest {
  id: string;
  orderId: string; 
  platform: string;
  platformOrderId: string; 
  customerName: string;
  productSummary: string; 
  type: '반품' | '교환';
  reason: string; 
  status: ReturnRequestStatus;
  requestedDate: string; 
  completedDate?: string; 
  returnShippingInfo?: { 
    carrier?: string;
    trackingNumber?: string;
    cost?: number; // 반품/교환에 따른 추가 배송비 (판매자 부담 또는 고객 부담 명시 필요)
  };
  items: Array<{ 
    productId: string;
    productName: string;
    option: string;
    quantity: number;
  }>;
  notes?: string; 
}

// 상품 상태 타입
export type ProductStatus = '판매중' | '품절' | '숨김' | '판매중지';

// 상품 타입
export interface Product {
  id: string; // 내부 관리 ID
  productCode: string; // 상품 고유 코드 (SKU)
  name: string;
  description?: string;
  category?: string; // 카테고리
  supplier?: string; // 공급처
  purchasePrice?: number; // 매입가
  sellingPrice: number; // 판매가
  stockQuantity: number; // 재고 수량
  safeStockQuantity?: number; // 안전 재고 수량
  imageUrl?: string;
  status: ProductStatus; // 판매 상태 (판매중, 품절, 숨김 등)
  options?: Array<{ // 상품 옵션 (있는 경우)
    name: string; // 예: 색상
    values: Array<{ 
        value: string; // 예: 레드, 블루
        stockAdjustment?: number; // 옵션별 재고 조정량 (기본 재고에서 가감)
        priceAdjustment?: number; // 옵션별 가격 조정량
    }>;
  }>;
  createdAt: string;
  updatedAt?: string;
  // stockHistory?: StockMovement[]; // 상품별 재고 변동 내역을 직접 가질 수도 있음 (선택적)
}

// 재고 변동 유형 타입
export type StockMovementType = '입고' | '출고' | '조정';

// 재고 변동 기록 타입
export interface StockMovement {
  id: string; // 변동 기록 ID
  productId: string; // 관련 상품 ID
  productCode: string; // 관련 상품 코드
  productName: string; // 관련 상품명 (조회 편의성)
  type: StockMovementType; // 변동 유형
  quantityChanged: number; // 변경된 수량 (입고: 양수, 출고/조정(감소): 음수)
  reason: string; // 변동 사유 (예: "신규 입고", "판매 출고", "재고 실사 반영")
  movementDate: string; // 변동 발생일 (ISO 날짜 문자열 권장)
  memo?: string; // 추가 메모
  currentStockAfterMovement?: number; // 이 변동 후 상품의 총 재고 (선택적, 계산 편의성)
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}