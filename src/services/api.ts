import {
  Order, OrderDetail, PlatformConfig, ThreePLConfig, User, ReturnRequest, Product, StockMovement, ErrorLogEntry
} from '../types';

const API_BASE_URL = 'https://beyond-order-hub-backend.onrender.com';

// Helper to get the auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// Helper to construct Authorization headers
function getAuthHeaders(isJsonContent: boolean = true): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (isJsonContent) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Generic API request helper
async function makeApiRequest<T>(path: string, method: string = 'GET', body?: any, isJsonContent: boolean = true): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: getAuthHeaders(isJsonContent),
    body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    credentials: 'include',
  });

  if (response.status === 401) {
    localStorage.removeItem('authToken'); // Clear token on 401
    // Throw a specific error to be caught by App.tsx for logout handling
    throw new Error('AUTH_ERROR: Session expired or invalid. Please login again.');
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON or empty
      errorData = { message: response.statusText || `API request failed with status ${response.status}` };
    }
    console.error(`API Error (${response.status}) for ${method} ${path}:`, errorData);
    throw new Error(errorData.message || `API request failed: ${response.status}`);
  }

  if (response.status === 204) { // No Content
    return undefined as T; // Or specific success indicator if needed
  }
  return response.json() as Promise<T>;
}


// --- Authentication ---
export const login = async (username: string, passwordAttempt: string): Promise<User> => {
  // Backend is expected to return { token: string, user: User }
  const data = await makeApiRequest<{ token: string, user: User }>('/auth/login', 'POST', { username, password: passwordAttempt });
  if (data.token && data.user) {
    localStorage.setItem('authToken', data.token);
    return data.user;
  }
  throw new Error('Login failed: Invalid response from server.');
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  // Potentially notify backend about logout if needed, but not specified.
};


// --- Data Fetching ---
export const fetchUsers = (): Promise<User[]> => makeApiRequest<User[]>('/users');
export const fetchOrders = (): Promise<Order[]> => makeApiRequest<Order[]>('/orders');
export const fetchOrderDetails = (orderId: string): Promise<OrderDetail | null> => makeApiRequest<OrderDetail | null>(`/orders/${orderId}`);
export const fetchProducts = (): Promise<Product[]> => makeApiRequest<Product[]>('/products');
export const fetchStockMovements = (): Promise<StockMovement[]> => makeApiRequest<StockMovement[]>('/stock-movements');
export const fetchReturnRequests = (): Promise<ReturnRequest[]> => makeApiRequest<ReturnRequest[]>('/returns');
export const fetchPlatformConfigs = (): Promise<PlatformConfig[]> => makeApiRequest<PlatformConfig[]>('/settings/platform-configs');
export const fetchThreePLConfig = (): Promise<ThreePLConfig | null> => makeApiRequest<ThreePLConfig | null>('/settings/3pl-config');
export const fetchErrorLogs = (): Promise<ErrorLogEntry[]> => makeApiRequest<ErrorLogEntry[]>('/errors');

// --- User Management ---
export const addUser = (newUserPayload: Omit<User, 'id' | 'createdAt' | 'isActive'>, password?: string): Promise<User> =>
  makeApiRequest<User>('/users/register', 'POST', { ...newUserPayload, password }); // Adjusted to /users/register as per backend example

export const updateUser = (updatedUser: User): Promise<User> => {
  const { id, ...payload } = updatedUser;
  const safePayload = { ...payload };
  if (!safePayload.password) { // Only send password if it's being changed
    delete safePayload.password;
  }
  return makeApiRequest<User>(`/users/${id}`, 'PUT', safePayload);
};

export const toggleUserActive = (userId: string): Promise<{ userId: string; isActive: boolean }> =>
  makeApiRequest<{ userId: string; isActive: boolean }>(`/users/${userId}/toggle-active`, 'PATCH');

// --- Product Management ---
export const addProduct = (newProductData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> =>
  makeApiRequest<Product>('/products', 'POST', newProductData);

export const updateProduct = (updatedProductData: Product): Promise<Product> => {
  const { id, ...payload } = updatedProductData;
  return makeApiRequest<Product>(`/products/${id}`, 'PUT', payload);
};

export const toggleProductStatus = (productId: string, newStatus: Product['status']): Promise<Product | null> =>
  makeApiRequest<Product | null>(`/products/${productId}/status`, 'PATCH', { status: newStatus });


// --- Stock Movement ---
export const addStockMovement = (newMovementData: Omit<StockMovement, 'id' | 'currentStockAfterMovement' | 'productCode' | 'productName'>): Promise<StockMovement> =>
  makeApiRequest<StockMovement>('/stock-movements', 'POST', newMovementData);

// --- Shipping Management ---
export const processShipment = (orderId: string, carrier: string, trackingNumber: string): Promise<{ order: Order; newMovements: StockMovement[] }> =>
  makeApiRequest<{ order: Order; newMovements: StockMovement[] }>(`/shipping/process/${orderId}`, 'POST', { carrier, trackingNumber });

// --- Return Management ---
export const saveReturnRequest = (updatedReturnRequest: ReturnRequest): Promise<ReturnRequest> => {
  const { id, ...payload } = updatedReturnRequest;
  return makeApiRequest<ReturnRequest>(`/returns/${id}`, 'PUT', payload);
};

export const requestReturnPickup = (returnRequestId: string): Promise<ReturnRequest | null> =>
  makeApiRequest<ReturnRequest | null>(`/returns/${returnRequestId}/request-pickup`, 'POST');

// --- Order Fulfillment (tracking update in modal) ---
export const saveOrderFulfillment = (orderId: string, shippingCarrier: string, trackingNumber: string): Promise<OrderDetail | null> =>
  makeApiRequest<OrderDetail | null>(`/orders/${orderId}/fulfillment`, 'PATCH', { shippingCarrier, trackingNumber });

// --- Settings ---
export const savePlatformConfig = (config: PlatformConfig): Promise<PlatformConfig> =>
  makeApiRequest<PlatformConfig>(`/settings/platform-configs/${config.id}`, 'PUT', config);

export const testPlatformConnection = (platformId: string): Promise<PlatformConfig> =>
  makeApiRequest<PlatformConfig>(`/settings/platform-configs/${platformId}/test`, 'POST');

export const togglePlatformActive = async (platformId: string, currentConfig: PlatformConfig): Promise<PlatformConfig> => {
  // The backend PUT /settings/platform-configs/{id} expects the whole config.
  // So, construct the payload with the toggled isActive state.
  const payload = { ...currentConfig, isActive: !currentConfig.isActive };
  return makeApiRequest<PlatformConfig>(`/settings/platform-configs/${platformId}`, 'PUT', payload);
}

export const saveThreePLConfig = (config: ThreePLConfig): Promise<ThreePLConfig> =>
  makeApiRequest<ThreePLConfig>('/settings/3pl-config', 'PUT', config);

export const testThreePLConnection = (): Promise<ThreePLConfig> =>
  makeApiRequest<ThreePLConfig>('/settings/3pl-config/test', 'POST');

// This function is a bit redundant as saveThreePLConfig does the same PUT with the whole object.
// App.tsx will manage constructing the full object for saveThreePLConfig.
export const updateThreePLConfigValue = (config: ThreePLConfig) : Promise<ThreePLConfig> =>
    makeApiRequest<ThreePLConfig>('/settings/3pl-config', 'PUT', config);


// --- Error Log ---
export const resolveErrorLog = (errorId: string): Promise<ErrorLogEntry | null> =>
  makeApiRequest<ErrorLogEntry | null>(`/errors/${errorId}/resolve`, 'PATCH');

// --- Gemini API via Backend ---
// Path is /api/gemini/analyze-error as per detailed spec. API_BASE_URL doesn't contain /api
export const analyzeErrorViaBackend = (errorMessage: string, service: string, level: string): Promise<{ analysisText: string }> =>
  makeApiRequest<{ analysisText: string }>('/api/gemini/analyze-error', 'POST', { errorMessage, service, level });


// No resetDb or window.resetApiDb function needed as data is backend-driven
declare global {
    interface Window {
      // No longer exposing resetApiDb
    }
}
