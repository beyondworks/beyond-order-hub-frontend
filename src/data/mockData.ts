import { Order, OrderDetail, PlatformConfig, ThreePLConfig, ErrorLogEntry, User, ReturnRequest, Product, StockMovement } from '../types';

export const mockSummaryData = {
  newOrders: 12,
  processingOrders: 5,
  shippedToday: 8,
  errors: 1,
};

// BOH011을 '출고대기' 상태로 변경
// BOH016 신규 '출고대기' 주문 추가
export const mockAllOrdersData: Order[] = [
  { id: 'BOH001', dateTime: '2023-10-27 10:30', platform: '스마트스토어', productSummary: '상품 A 외 2건', quantity: 3, customerName: '김철수', status: '신규', platformOrderId: 'S20231027001', hasReturnOrExchange: false },
  { id: 'BOH002', dateTime: '2023-10-27 09:15', platform: '쿠팡', productSummary: '상품 B', quantity: 1, customerName: '이영희', status: '처리중', platformOrderId: 'C20231027002', hasReturnOrExchange: false },
  { id: 'BOH003', dateTime: '2023-10-26 17:45', platform: '오늘의집', productSummary: '상품 C', quantity: 2, customerName: '박민준', status: '발송완료', platformOrderId: 'H20231026003', hasReturnOrExchange: true, returnStatus: '요청접수' },
  { id: 'BOH004', dateTime: '2023-10-26 15:00', platform: '스마트스토어', productSummary: '상품 D', quantity: 1, customerName: '최지아', status: '신규', platformOrderId: 'S20231026004', hasReturnOrExchange: false },
  { id: 'BOH005', dateTime: '2023-10-25 11:20', platform: '29CM', productSummary: '상품 E 외 1건', quantity: 2, customerName: '정서윤', status: '취소', platformOrderId: '29M20231025005', hasReturnOrExchange: false},
  { id: 'BOH006', dateTime: '2023-10-25 10:00', platform: '아임웹', productSummary: '맞춤 제작 상품', quantity: 1, customerName: '홍길동', status: '처리중', platformOrderId: 'IW20231025006', hasReturnOrExchange: false },
  { id: 'BOH007', dateTime: '2023-10-24 14:30', platform: '카카오톡스토어', productSummary: '선물 세트 G', quantity: 5, customerName: '유재석', status: '발송완료', platformOrderId: 'KTS20231024007', hasReturnOrExchange: false },
  { id: 'BOH008', dateTime: '2023-10-24 11:11', platform: '토스쇼핑', productSummary: '간편식 H', quantity: 2, customerName: '강호동', status: '발송완료', platformOrderId: 'TS20231024008', hasReturnOrExchange: true, returnStatus: '수거지시' },
  { id: 'BOH009', dateTime: '2023-10-23 16:00', platform: '쿠팡', productSummary: '생활용품 I 외 5건', quantity: 6, customerName: '신동엽', status: '처리중', platformOrderId: 'C20231023009', hasReturnOrExchange: false },
  { id: 'BOH010', dateTime: '2023-10-23 09:05', platform: '스마트스토어', productSummary: '패션의류 J', quantity: 1, customerName: '이효리', status: '발송완료', platformOrderId: 'S20231023010', hasReturnOrExchange: false },
  { id: 'BOH011', dateTime: '2023-10-22 12:00', platform: '쿠팡', productSummary: '전자제품 K', quantity: 1, customerName: '김민아', status: '출고대기', platformOrderId: 'C20231022011', hasReturnOrExchange: false }, // 상태 변경
  { id: 'BOH012', dateTime: '2023-10-22 13:00', platform: '스마트스토어', productSummary: '뷰티 상품 L', quantity: 3, customerName: '박서준', status: '처리중', platformOrderId: 'S20231022012', hasReturnOrExchange: false },
  { id: 'BOH013', dateTime: '2023-10-21 14:00', platform: '오늘의집', productSummary: '가구 M', quantity: 1, customerName: '이하나', status: '발송완료', platformOrderId: 'H20231021013', hasReturnOrExchange: false },
  { id: 'BOH014', dateTime: '2023-10-21 15:00', platform: '29CM', productSummary: '디자이너 의류 N', quantity: 1, customerName: '최우식', status: '취소', platformOrderId: '29M20231021014', hasReturnOrExchange: false },
  { id: 'BOH015', dateTime: '2023-10-20 16:00', platform: '아임웹', productSummary: '수공예품 O', quantity: 2, customerName: '정유미', status: '신규', platformOrderId: 'IW20231020015', hasReturnOrExchange: false },
  { id: 'BOH016', dateTime: '2023-10-28 11:00', platform: '스마트스토어', productSummary: '프리미엄 면 티셔츠 (화이트/L) 외 1건', quantity: 2, customerName: '유아인', status: '출고대기', platformOrderId: 'S20231028016', hasReturnOrExchange: false },
];

export const mockErrorLogData: ErrorLogEntry[] = [
    { id: 'ERR001', timestamp: '2023-10-27 11:05:32', service: 'Coupang Collector', level: 'critical', message: 'API Key Invaild or Expired. (HTTP 401)', status: '미해결' },
    { id: 'ERR002', timestamp: '2023-10-27 09:30:15', service: '3PL Connector', level: 'warning', message: 'Connection timeout to 3PL API endpoint.', status: '재시도 중' },
    { id: 'ERR003', timestamp: '2023-10-26 18:00:00', service: 'SmartStore Updater', level: 'info', message: 'Order S20231026004: Tracking update skipped, already shipped.', status: '해결됨' },
    { id: 'ERR004', timestamp: '2023-10-26 15:10:05', service: 'Order Core Service', level: 'warning', message: 'Duplicate order detected: IW20231025006, skipped.', status: '해결됨' },
];


export const mockOrderDetailsData: {[key: string]: OrderDetail} = {
  'BOH001': {
    id: 'BOH001',
    platformOrderId: 'S20231027001',
    platform: '스마트스토어',
    dateTime: '2023-10-27 10:30',
    status: '신규',
    customer: {
      name: '김철수',
      contact: '010-1234-5678',
      address: '서울시 강남구 테헤란로 123, 4층 501호 (역삼동, ABC빌딩)',
      zipCode: '06123'
    },
    products: [
      { id: 'PROD001', productCode: 'TS001-WH-L', name: '프리미엄 면 티셔츠 (화이트/L)', option: '화이트 / L', quantity: 1, unitPrice: 25000, subtotal: 25000 },
      { id: 'PROD002', productCode: 'JN005-BL-30', name: '슬림핏 청바지 (블루/30)', option: '블루 / 30', quantity: 1, unitPrice: 55000, subtotal: 55000 },
      { id: 'PROD003', productCode: 'SK010-MC-5P', name: '코튼 양말 세트 (5팩)', option: '멀티컬러 (5팩)', quantity: 1, unitPrice: 12000, subtotal: 12000 },
    ],
    totalAmount: 92000,
    fulfillment: {
      threePLStatus: '전송대기',
      trackingNumber: '',
      shippingCarrier: '',
      shippingCarriersAvailable: ['CJ대한통운', '롯데택배', '한진택배', '우체국택배', '로젠택배'],
    },
    history: [
      { timestamp: '2023-10-27 10:30:05', event: '주문 수집 완료 (스마트스토어)' },
      { timestamp: '2023-10-27 10:30:00', event: '신규 주문 발생 (스마트스토어)' },
    ]
  },
  'BOH003': { 
    id: 'BOH003',
    platformOrderId: 'H20231026003',
    platform: '오늘의집',
    dateTime: '2023-10-26 17:45',
    status: '발송완료', 
    customer: { name: '박민준', contact: '010-0000-0003', address: '경기도 성남시 분당구', zipCode: '12345' },
    products: [{ id: 'PROD004', productCode: 'FUR002-BR', name: '모던 스타일 책상', option: '단일옵션', quantity: 2, unitPrice: 30000, subtotal: 60000 }],
    totalAmount: 60000,
    fulfillment: { threePLStatus: '3PL완료', trackingNumber: '1234567890', shippingCarrier: 'CJ대한통운', shippingCarriersAvailable: ['CJ대한통운', '롯데택배'] },
    history: [
      { timestamp: '2023-10-26 17:45:00', event: '신규 주문 발생 (오늘의집)' },
      { timestamp: '2023-10-26 18:00:00', event: '3PL 전송 완료' },
      { timestamp: '2023-10-27 09:00:00', event: '발송 완료 (송장번호: 1234567890)' },
      { timestamp: '2023-10-28 10:00:00', event: '반품 요청 접수' },
    ],
    returnInfo: {
      type: '반품',
      reason: '단순 변심',
      requestedDate: '2023-10-28 10:00:00',
      status: '요청접수',
      items: [{ productId: 'PROD004', productName: '모던 스타일 책상', quantity: 1 }],
      notes: '고객과 통화 완료, 반품 수거 예정',
    }
  },
  'BOH011': { // '출고대기' 상태 주문의 상세 정보
    id: 'BOH011',
    platformOrderId: 'C20231022011',
    platform: '쿠팡',
    dateTime: '2023-10-22 12:00',
    status: '출고대기',
    customer: { name: '김민아', contact: '010-1111-2222', address: '서울시 마포구', zipCode: '03921' },
    products: [{ id: 'PROD005', productCode: 'ELE012-BK', name: '무선 블루투스 이어폰', option: '블랙', quantity: 1, unitPrice: 79000, subtotal: 79000 }],
    totalAmount: 79000,
    fulfillment: { threePLStatus: '전송완료', trackingNumber: '', shippingCarrier: '', shippingCarriersAvailable: ['쿠팡 자체배송', 'CJ대한통운'] },
    history: [
      { timestamp: '2023-10-22 12:00:00', event: '주문 수집 완료 (쿠팡)' },
      { timestamp: '2023-10-22 12:05:00', event: '3PL 전송 완료' },
      { timestamp: '2023-10-22 12:10:00', event: '상태 변경: 출고대기' },
    ]
  },
  'BOH016': { // 신규 '출고대기' 주문 상세 정보
    id: 'BOH016',
    platformOrderId: 'S20231028016',
    platform: '스마트스토어',
    dateTime: '2023-10-28 11:00',
    status: '출고대기',
    customer: { name: '유아인', contact: '010-3333-4444', address: '부산시 해운대구', zipCode: '48090' },
    products: [
      { id: 'PROD001', productCode: 'TS001-WH-L', name: '프리미엄 면 티셔츠 (화이트/L)', option: '화이트/L', quantity: 1, unitPrice: 25000, subtotal: 25000 },
      { id: 'PROD003', productCode: 'SK010-MC-5P', name: '코튼 양말 세트 (5팩)', option: '멀티컬러', quantity: 1, unitPrice: 12000, subtotal: 12000 },
    ],
    totalAmount: 37000,
    fulfillment: { threePLStatus: '전송완료', trackingNumber: '', shippingCarrier: '', shippingCarriersAvailable: ['CJ대한통운', '롯데택배', '한진택배', '우체국택배', '로젠택배'] },
    history: [
      { timestamp: '2023-10-28 11:00:00', event: '주문 수집 완료 (스마트스토어)' },
      { timestamp: '2023-10-28 11:05:00', event: '3PL 전송 완료' },
      { timestamp: '2023-10-28 11:10:00', event: '상태 변경: 출고대기' },
    ]
  }
};

export const mockPlatformConfigs: PlatformConfig[] = [
  {
    id: 'coupang',
    name: '쿠팡 (Coupang)',
    logoPlaceholder: 'C',
    connectionStatus: 'disconnected',
    isActive: false,
    lastSync: 'N/A',
    fields: [
      { id: 'accessKey', label: 'Access Key', type: 'password', value: '' },
      { id: 'secretKey', label: 'Secret Key', type: 'password', value: '' },
      { id: 'vendorId', label: '판매자 ID (Vendor ID)', type: 'text', value: '' },
    ],
  },
  {
    id: 'smartstore',
    name: '스마트스토어 (Naver)',
    logoPlaceholder: 'S',
    connectionStatus: 'connected',
    isActive: true,
    lastSync: '2023-10-27 08:00:00',
    fields: [
      { id: 'clientId', label: 'Client ID', type: 'text', value: 'testClientId' },
      { id: 'clientSecret', label: 'Client Secret', type: 'password', value: 'testSecret' },
    ],
  },
  {
    id: 'todayhouse',
    name: '오늘의집',
    logoPlaceholder: 'O',
    connectionStatus: 'not_configured',
    isActive: false,
    lastSync: 'N/A',
    fields: [
      { id: 'apiKey', label: 'API Key', type: 'password', value: '' },
    ],
  },
  {
    id: '29cm',
    name: '29CM',
    logoPlaceholder: '29',
    connectionStatus: 'not_configured',
    isActive: false,
    lastSync: 'N/A',
    fields: [
      { id: 'apiKey', label: 'API Key', type: 'password', value: '' },
      { id: 'vendorId', label: 'Vendor ID', type: 'text', value: '' },
    ],
  },
  {
    id: 'imweb',
    name: '아임웹 (I\'mweb)',
    logoPlaceholder: 'IW',
    connectionStatus: 'not_configured',
    isActive: false,
    lastSync: 'N/A',
    fields: [
      { id: 'apiKey', label: 'API Key', type: 'password', value: '' },
      { id: 'apiSecret', label: 'API Secret', type: 'password', value: '' },
    ],
  },
  {
    id: 'kakaostore',
    name: '카카오톡스토어',
    logoPlaceholder: 'K',
    connectionStatus: 'not_configured',
    isActive: false,
    lastSync: 'N/A',
    fields: [
      { id: 'apiKey', label: 'API Key', type: 'password', value: '' },
      { id: 'storeId', label: '스토어 ID', type: 'text', value: '' },
    ],
  },
  {
    id: 'tossshopping',
    name: '토스쇼핑',
    logoPlaceholder: 'T',
    connectionStatus: 'not_configured',
    isActive: false,
    lastSync: 'N/A',
    fields: [
      { id: 'sellerApiKey', label: '판매자 API Key', type: 'password', value: '' },
    ],
  },
];

export const mockThreePLConfig: ThreePLConfig = {
  apiUrl: '',
  apiKey: '',
  connectionStatus: 'not_configured',
  lastTest: 'N/A',
};

export const mockUsers: User[] = [
  { 
    id: 'user001', 
    username: 'master@example.com', 
    password: 'password123', 
    role: 'master', 
    name: '김관리', 
    isActive: true, 
    createdAt: '2023-01-15T10:00:00Z' 
  },
  { 
    id: 'user002', 
    username: 'user@example.com', 
    password: 'password123', 
    role: 'user', 
    name: '이담당', 
    isActive: true, 
    createdAt: '2023-02-20T14:30:00Z' 
  },
  { 
    id: 'user003', 
    username: 'inactive@example.com', 
    password: 'password123', 
    role: 'user', 
    name: '박비활', 
    isActive: false, 
    createdAt: '2023-03-10T09:15:00Z'
  },
];

export const mockReturnRequests: ReturnRequest[] = [
    {
        id: 'RTN001',
        orderId: 'BOH003', // Linked to an order in mockAllOrdersData
        platform: '오늘의집',
        platformOrderId: 'H20231026003',
        customerName: '박민준',
        productSummary: '상품 C (1개)',
        type: '반품',
        reason: '단순 변심',
        status: '요청접수',
        requestedDate: '2023-10-28 10:00:00',
        items: [{ productId: 'PROD004', productName: '모던 스타일 책상', option: '단일옵션', quantity: 1 }],
        notes: '고객과 통화 완료, 반품 수거 예정'
    },
    {
        id: 'RTN002',
        orderId: 'BOH008', // Linked to an order in mockAllOrdersData
        platform: '토스쇼핑',
        platformOrderId: 'TS20231024008',
        customerName: '강호동',
        productSummary: '간편식 H (1개)',
        type: '교환',
        reason: '상품 불량 (포장 훼손)',
        status: '수거지시',
        requestedDate: '2023-10-29 11:30:00',
        items: [{ productId: 'PROD00X', productName: '간편식 H', option: 'A타입', quantity: 1 }],
        returnShippingInfo: { carrier: '롯데택배', trackingNumber: '9876543210', cost: 0 },
        notes: '불량 부분 사진 확인. 동일 상품으로 교환 요청. 맞교환 아님, 선 수거 후 발송.'
    },
    {
        id: 'RTN003',
        orderId: 'BOH007', // Example with a different platform
        platform: '카카오톡스토어',
        platformOrderId: 'KTS20231024007',
        customerName: '유재석',
        productSummary: '선물 세트 G (2개)',
        type: '반품',
        reason: '수량 착오 주문',
        status: '수거완료',
        requestedDate: '2023-10-30 14:00:00',
        completedDate: undefined, // Not completed yet
        items: [{ productId: 'PROD00Y', productName: '선물 세트 G', option: '기본', quantity: 2 }],
        returnShippingInfo: { carrier: 'CJ대한통운', trackingNumber: '1122334455', cost: 3000 },
        notes: '수거 완료, 검수 대기 중.'
    },
    {
        id: 'RTN004',
        orderId: 'BOH010',
        platform: '스마트스토어',
        platformOrderId: 'S20231023010',
        customerName: '이효리',
        productSummary: '패션의류 J (1개) - 사이즈 변경',
        type: '교환',
        reason: '사이즈 오선택',
        status: '완료',
        requestedDate: '2023-10-25 09:00:00',
        completedDate: '2023-10-28 18:00:00',
        items: [{ productId: 'PROD00Z', productName: '패션의류 J', option: 'M사이즈', quantity: 1 }],
        returnShippingInfo: { carrier: '우체국택배', trackingNumber: 'EXCH99887766', cost: 0 }, // 교환 재배송 송장
        notes: 'M사이즈로 교환 발송 완료.'
    },
     {
        id: 'RTN005',
        orderId: 'BOH002',
        platform: '쿠팡',
        platformOrderId: 'C20231027002',
        customerName: '이영희',
        productSummary: '상품 B',
        type: '반품',
        reason: '상품 설명과 다름',
        status: '검수중',
        requestedDate: '2023-11-01 16:20:00',
        items: [{ productId: 'PROD005', productName: '무선 블루투스 이어폰', option: '레드', quantity: 1 }], // 상품 ID PROD005로 수정
        returnShippingInfo: { carrier: '롯데택배', trackingNumber: '7778889990' },
        notes: '실제 색상 차이로 인한 클레임. 검수 후 환불 처리 예정.'
    }
];

export const mockProducts: Product[] = [
  {
    id: 'PROD001',
    productCode: 'TS001-WH-L',
    name: '프리미엄 면 티셔츠 (화이트/L)',
    category: '의류 > 상의',
    sellingPrice: 25000,
    stockQuantity: 120, 
    safeStockQuantity: 20,
    status: '판매중',
    imageUrl: 'https://via.placeholder.com/150/FFFFFF/000000?text=T-Shirt',
    createdAt: '2023-01-10T00:00:00Z',
    purchasePrice: 10000,
  },
  {
    id: 'PROD002',
    productCode: 'JN005-BL-30',
    name: '슬림핏 청바지 (블루/30)',
    category: '의류 > 하의',
    sellingPrice: 55000,
    stockQuantity: 75, 
    safeStockQuantity: 15,
    status: '판매중',
    imageUrl: 'https://via.placeholder.com/150/007BFF/FFFFFF?text=Jeans',
    createdAt: '2023-01-15T00:00:00Z',
    purchasePrice: 22000,
  },
  {
    id: 'PROD003',
    productCode: 'SK010-MC-5P',
    name: '코튼 양말 세트 (5팩)',
    category: '패션잡화 > 양말',
    sellingPrice: 12000,
    stockQuantity: 250, 
    safeStockQuantity: 50,
    status: '판매중',
    createdAt: '2023-02-01T00:00:00Z',
    purchasePrice: 4000,
  },
  {
    id: 'PROD004',
    productCode: 'FUR002-BR',
    name: '모던 스타일 책상',
    category: '가구 > 사무용',
    sellingPrice: 180000,
    stockQuantity: 15, 
    safeStockQuantity: 5,
    status: '판매중',
    imageUrl: 'https://via.placeholder.com/150/8B4513/FFFFFF?text=Desk',
    createdAt: '2023-03-05T00:00:00Z',
    purchasePrice: 75000,
  },
  {
    id: 'PROD005',
    productCode: 'ELE012-BK',
    name: '무선 블루투스 이어폰',
    category: '전자제품 > 음향기기',
    sellingPrice: 79000,
    stockQuantity: 5, // 기존 0에서 5로 수정 (BOH011 주문 재고 테스트용)
    safeStockQuantity: 10,
    status: '판매중', // '품절'에서 '판매중'으로 수정 
    imageUrl: 'https://via.placeholder.com/150/333333/FFFFFF?text=Earbuds',
    createdAt: '2023-04-10T00:00:00Z',
    purchasePrice: 30000,
  },
  {
    id: 'PROD006',
    productCode: 'COS007-RD',
    name: '데일리 레드 립스틱',
    category: '뷰티 > 색조화장',
    sellingPrice: 22000,
    stockQuantity: 80, 
    safeStockQuantity: 20,
    status: '판매중지', 
    createdAt: '2023-05-01T00:00:00Z',
    purchasePrice: 8000,
  }
];

export const mockStockMovements: StockMovement[] = [
  { 
    id: 'SM001', 
    productId: 'PROD001', 
    productCode: 'TS001-WH-L', 
    productName: '프리미엄 면 티셔츠 (화이트/L)',
    type: '입고', 
    quantityChanged: 100, 
    reason: '최초 입고', 
    movementDate: '2023-01-10T10:00:00Z',
    currentStockAfterMovement: 100
  },
  { 
    id: 'SM002', 
    productId: 'PROD001', 
    productCode: 'TS001-WH-L', 
    productName: '프리미엄 면 티셔츠 (화이트/L)',
    type: '출고', 
    quantityChanged: -2, 
    reason: '판매 출고 (주문 S20231027001)', 
    movementDate: '2023-10-27T11:00:00Z',
    currentStockAfterMovement: 98 
  },
   { 
    id: 'SM003', 
    productId: 'PROD002', 
    productCode: 'JN005-BL-30', 
    productName: '슬림핏 청바지 (블루/30)',
    type: '입고', 
    quantityChanged: 50, 
    reason: '재입고', 
    movementDate: '2023-09-15T14:00:00Z',
    currentStockAfterMovement: 50,
    memo: 'S사이즈 추가 입고'
  },
  { 
    id: 'SM004', 
    productId: 'PROD005', 
    productCode: 'ELE012-BK', 
    productName: '무선 블루투스 이어폰',
    type: '입고', // 파손 조정 대신 초기 입고로 변경
    quantityChanged: 10, // 초기 재고 10개 입고
    reason: '최초 입고', 
    movementDate: '2023-04-10T09:00:00Z',
    currentStockAfterMovement: 10, 
  },
   { 
    id: 'SM005', 
    productId: 'PROD001', 
    productCode: 'TS001-WH-L', 
    productName: '프리미엄 면 티셔츠 (화이트/L)',
    type: '입고', 
    quantityChanged: 22, 
    reason: '추가 입고', 
    movementDate: '2023-11-01T09:00:00Z',
    currentStockAfterMovement: 120
  },
  { 
    id: 'SM006', 
    productId: 'PROD002', 
    productCode: 'JN005-BL-30', 
    productName: '슬림핏 청바지 (블루/30)',
    type: '입고', 
    quantityChanged: 25, 
    reason: '추가 입고', 
    movementDate: '2023-11-01T09:30:00Z',
    currentStockAfterMovement: 75
  },
  { // PROD005 재고 조정 (BOH011 주문에 사용될 수 있도록)
    id: 'SM007', 
    productId: 'PROD005', 
    productCode: 'ELE012-BK', 
    productName: '무선 블루투스 이어폰',
    type: '출고', 
    quantityChanged: -5, // 5개 출고하여 현재고 5개로 만듦
    reason: '샘플 발송', 
    movementDate: '2023-10-20T10:00:00Z',
    currentStockAfterMovement: 5,
  },
];