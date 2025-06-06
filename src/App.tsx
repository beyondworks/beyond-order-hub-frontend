
import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import * as api from './services/api'; // API service 임포트
import { Order, OrderDetail, PlatformConfig, ThreePLConfig, User, ReturnRequest, Product, StockMovement, ErrorLogEntry, PlatformConfigField } from './types';
import { ToastProvider, ToastContext } from './contexts/ToastContext';

// Import page components
import DashboardPage from './pages/DashboardPage';
import AllOrdersPage from './pages/AllOrdersPage';
import PlatformSettingsPage from './pages/PlatformSettingsPage';
import ErrorLogPage from './pages/ErrorLogPage';
import LoginPage from './pages/LoginPage';
import ReturnsManagementPage from './pages/ReturnsManagementPage';
import ProductManagementPage from './pages/ProductManagementPage';
import InventoryManagementPage from './pages/InventoryManagementPage';
import ShippingManagementPage from './pages/ShippingManagementPage';

// Import layout components
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';

// Import common components
import OrderDetailModal from './components/Orders/OrderDetailModal';
import ReturnDetailModal from './components/Returns/ReturnDetailModal';
import UserEditModal from './components/Settings/UserEditModal';
import ProductEditModal from './components/Products/ProductEditModal';
import StockMovementModal from './components/Inventory/StockMovementModal';
import ShippingProcessModal from './components/Shipping/ShippingProcessModal';
import ToastContainer from './components/Common/ToastNotifications/ToastContainer';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const toastContext = useContext(ToastContext);

  // Data states - Initialize with empty arrays or null
  const [users, setUsers] = useState<User[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfig[]>([]);
  const [threePLConfig, setThreePLConfig] = useState<ThreePLConfig | null>(null);
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>([]);

  // Modal states
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<OrderDetail | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnForModal, setSelectedReturnForModal] = useState<ReturnRequest | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [isStockMovementModalOpen, setIsStockMovementModalOpen] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<Order | null>(null);

  const [appLoading, setAppLoading] = useState(true); 
  const [isLoggingIn, setIsLoggingIn] = useState(false);


  const userRolesConfig: { [key: string]: string[] } = {
    master: ['dashboard', 'products', 'inventory', 'shipping', 'orders', 'returns', 'platform-settings', 'errors'],
    user: ['dashboard', 'products', 'inventory', 'shipping', 'orders', 'returns', 'errors'],
  };

  // Centralized Auth Error Handler
  const handleApiAuthError = useCallback((error: any): boolean => {
    if (error.message && error.message.startsWith('AUTH_ERROR:')) {
      toastContext?.addToast(error.message.replace('AUTH_ERROR: ', '') || '세션이 만료되었거나 인증 정보가 유효하지 않습니다. 다시 로그인해주세요.', 'error');
      // handleLogout will clear currentUser, token, and all data states, then redirect.
      handleLogoutRef.current(); // Use ref to call the latest version of handleLogout
      return true; // Auth error was handled
    }
    return false; // Not an auth error, or no message
  }, [toastContext]); // handleLogoutRef removed to avoid circular dependency if defined here, use ref instead

  const handleLogout = useCallback(() => {
    const userName = currentUser?.name;
    api.logout(); // Clear token from localStorage
    setCurrentUser(null);
    // Clear all data states
    setUsers([]);
    setAllOrders([]);
    setProducts([]);
    setStockMovements([]);
    setReturnRequests([]);
    setPlatformConfigs([]);
    setThreePLConfig(null);
    setErrorLogs([]);
    setCurrentPage('login'); 
    window.location.hash = 'login';
    if (userName) { 
        toastContext?.addToast(`${userName}님이 로그아웃하였습니다.`, 'info');
    }
    // Note: toast for auth error handled by handleApiAuthError or login failure
  }, [currentUser, toastContext]);

  // Use a ref for handleLogout to ensure handleApiAuthError always calls the latest version
  const handleLogoutRef = useRef(handleLogout);
  useEffect(() => {
    handleLogoutRef.current = handleLogout;
  }, [handleLogout]);


  const loadInitialData = useCallback(async () => {
    if (!currentUser) {
      setAppLoading(false);
      return;
    }
    setAppLoading(true);
    try {
      const [
        fetchedUsers, fetchedOrders, fetchedProducts,
        fetchedStockMovements, fetchedReturnRequests,
        fetchedPlatformConfigs, fetchedThreePLConfigData, fetchedErrorLogs
      ] = await Promise.all([
        api.fetchUsers(),
        api.fetchOrders(),
        api.fetchProducts(),
        api.fetchStockMovements(),
        api.fetchReturnRequests(),
        api.fetchPlatformConfigs(),
        api.fetchThreePLConfig(),
        api.fetchErrorLogs(),
      ]);
      
      setUsers(fetchedUsers || []);
      setAllOrders(fetchedOrders || []);
      setProducts(fetchedProducts || []);
      setStockMovements(fetchedStockMovements || []);
      setReturnRequests(fetchedReturnRequests || []);
      setPlatformConfigs(fetchedPlatformConfigs || []);
      setThreePLConfig(fetchedThreePLConfigData || null);
      setErrorLogs(fetchedErrorLogs || []);
      toastContext?.addToast('모든 데이터를 성공적으로 불러왔습니다.', 'success');
    } catch (error: any) { 
      console.error("Failed to load initial data:", error);
      if (!handleApiAuthError(error)) {
        toastContext?.addToast(error.message || '초기 데이터 로딩 중 오류가 발생했습니다.', 'error');
      }
    } finally {
      setAppLoading(false);
    }
  }, [currentUser, toastContext, handleApiAuthError]); 
  
  useEffect(() => {
    if (currentUser) {
        loadInitialData();
    } else {
        setAppLoading(false); 
        const hash = window.location.hash.replace('#', '');
        // If there's a token, an implicit attempt to load data will occur if currentUser was set.
        // If that fails with AUTH_ERROR, handleApiAuthError via loadInitialData will trigger logout.
        // Otherwise, if no currentUser and not on login, redirect to login.
        if (hash !== 'login' && hash !== '') {
            setCurrentPage('login'); 
            window.location.hash = 'login'; 
        }
    }
  }, [currentUser, loadInitialData]);


  const handleLogin = useCallback(async (username: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoggingIn(true);
    try {
      const userFromApi = await api.login(username, passwordAttempt); // api.login returns User object directly
      setCurrentUser(userFromApi); 
      const defaultPage = userRolesConfig[userFromApi.role]?.[0] || 'dashboard';
      handleNavigation(defaultPage); 
      toastContext?.addToast(`${userFromApi.name}님, 환영합니다!`, 'success');
      return true;
    } catch (error: any) {
      if (!handleApiAuthError(error)) {
        toastContext?.addToast(error.message || '로그인 중 오류가 발생했습니다.', 'error');
      }
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  }, [toastContext, handleApiAuthError]);


  const handleNavigation = (page: string) => {
    if (!currentUser && page !== 'login') {
      setCurrentPage('login');
      window.location.hash = 'login';
      return;
    }
    if (currentUser && userRolesConfig[currentUser.role] && !userRolesConfig[currentUser.role].includes(page)) {
      const defaultPage = userRolesConfig[currentUser.role]?.[0] || 'dashboard';
      setCurrentPage(defaultPage);
      window.location.hash = defaultPage;
      toastContext?.addToast('접근 권한이 없는 페이지입니다. 대시보드로 이동합니다.', 'warning');
      return;
    }
    setCurrentPage(page);
    window.location.hash = page;
  };

  const handleViewOrderDetails = async (orderId: string) => {
    try {
      const orderDetails = await api.fetchOrderDetails(orderId);
      if (orderDetails) {
        setSelectedOrderForModal(orderDetails);
        setIsOrderDetailModalOpen(true);
      } else {
        toastContext?.addToast(`주문 ID ${orderId}에 대한 상세 정보를 찾을 수 없습니다.`, 'error');
      }
    } catch (error: any) {
      if (!handleApiAuthError(error)) {
        toastContext?.addToast(error.message || '주문 상세 정보 로딩 중 오류 발생.', 'error');
      }
    }
  };
  
  const handleCloseOrderDetailModal = () => {
    setIsOrderDetailModalOpen(false);
    setSelectedOrderForModal(null);
  };
  
  const handleSaveOrderFulfillment = async (orderId: string, shippingCarrier: string, trackingNumber: string): Promise<boolean> => {
    try {
      const updatedDetail = await api.saveOrderFulfillment(orderId, shippingCarrier, trackingNumber);
      if (updatedDetail) {
        setSelectedOrderForModal(updatedDetail); 
        setAllOrders(prev => prev.map(o => o.id === orderId ? 
            {...o, 
             status: updatedDetail.status, 
             shippingInfo: {carrier: shippingCarrier, trackingNumber, shippingDate: new Date().toISOString()}} 
            : o));
        toastContext?.addToast('송장 정보가 저장되었습니다.', 'success');
        return true;
      }
      toastContext?.addToast('송장 정보 저장 실패 (서버 응답 없음).', 'error');
      return false; 
    } catch (error: any) {
      if (!handleApiAuthError(error)) {
        toastContext?.addToast(error.message || '송장 정보 저장 중 오류 발생.', 'error');
      }
      return false;
    }
  };

  const handleOpenReturnModal = (returnRequest: ReturnRequest) => {
    setSelectedReturnForModal(returnRequest);
    setIsReturnModalOpen(true);
  };
  const handleCloseReturnModal = () => {
    setSelectedReturnForModal(null);
    setIsReturnModalOpen(false);
  };
  
  const handleSaveReturnRequest = async (updatedReturnRequest: ReturnRequest): Promise<boolean> => {
    try {
      const savedRequest = await api.saveReturnRequest(updatedReturnRequest);
      setReturnRequests(prevRequests =>
        prevRequests.map(req => req.id === savedRequest.id ? savedRequest : req)
      );
      setAllOrders(prevOrders => 
        prevOrders.map(order =>
          order.id === savedRequest.orderId
            ? { ...order, hasReturnOrExchange: true, returnStatus: savedRequest.status }
            : order
        )
      );
      toastContext?.addToast("반품/교환 정보가 저장되었습니다.", 'success');
      handleCloseReturnModal();
      return true;
    } catch (error: any) {
      if (!handleApiAuthError(error)) {
        toastContext?.addToast(error.message || "반품/교환 정보 저장 중 오류 발생.", 'error');
      }
      return false;
    }
  };

  const handleRequestReturnPickup = async (returnRequestId: string): Promise<boolean> => {
    try {
      const updatedRequest = await api.requestReturnPickup(returnRequestId);
      if (updatedRequest) {
        setReturnRequests(prevRequests =>
          prevRequests.map(req => (req.id === updatedRequest.id ? updatedRequest : req))
        );
        if (updatedRequest.orderId) { 
            setAllOrders(prevOrders =>
              prevOrders.map(order =>
                order.id === updatedRequest.orderId
                  ? { ...order, hasReturnOrExchange: true, returnStatus: updatedRequest.status }
                  : order
              )
            );
        }
        setSelectedReturnForModal(updatedRequest); 
        toastContext?.addToast(`반품 ID ${returnRequestId} 수거 접수가 요청되었습니다.`, 'info');
        return true;
      }
      toastContext?.addToast(`수거 접수 실패: 서버에서 응답이 없습니다.`, 'error');
      return false;
    } catch (error: any)
     {
      if (!handleApiAuthError(error)) {
        toastContext?.addToast(error.message || "수거 접수 처리 중 오류 발생.", 'error');
      }
      return false;
    }
  };

  const handleOpenUserModal = (userToEdit?: User) => {
    setSelectedUserForEdit(userToEdit || null);
    setIsUserModalOpen(true);
  };
  const handleCloseUserModal = () => {
    setSelectedUserForEdit(null);
    setIsUserModalOpen(false);
  };

  const handleAddUser = async (newUserPayload: Omit<User, 'id' | 'createdAt' | 'isActive'>, password?: string): Promise<boolean> => {
    try {
      const addedUser = await api.addUser(newUserPayload, password);
      setUsers(prevUsers => [...prevUsers, addedUser]);
      toastContext?.addToast('새로운 사용자가 추가되었습니다.', 'success');
      handleCloseUserModal();
      return true;
    } catch (error: any) {
      if (!handleApiAuthError(error)) {
        toastContext?.addToast(error.message || '사용자 추가 중 오류 발생.', 'error');
      }
      return false;
    }
  };

  const handleUpdateUser = async (updatedUser: User): Promise<boolean> => {
    try {
      const savedUser = await api.updateUser(updatedUser);
      setUsers(prevUsers => prevUsers.map(u => u.id === savedUser.id ? savedUser : u));
      toastContext?.addToast('사용자 정보가 수정되었습니다.', 'success');
      handleCloseUserModal();
      return true;
    } catch (error: any) {
      if (!handleApiAuthError(error)) {
        toastContext?.addToast(error.message || '사용자 정보 수정 중 오류 발생.', 'error');
      }
      return false;
    }
  };

  const handleToggleUserActive = async (userId: string) => {
    try {
      const result = await api.toggleUserActive(userId);
      const user = users.find(u => u.id === userId);
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === userId ? { ...u, isActive: result.isActive } : u))
      );
      toastContext?.addToast(`${user?.name || userId} 사용자의 상태가 ${result.isActive ? '활성' : '비활성'}으로 변경되었습니다.`, 'info');
    } catch (error: any) {
      if (!handleApiAuthError(error)) {
        toastContext?.addToast(error.message || '사용자 상태 변경 중 오류 발생.', 'error');
      }
    }
  };

  const handleOpenProductModal = (productToEdit?: Product) => {
    setSelectedProductForEdit(productToEdit || null);
    setIsProductModalOpen(true);
  };
  const handleCloseProductModal = () => {
    setSelectedProductForEdit(null);
    setIsProductModalOpen(false);
  };

  const handleAddProduct = async (newProductData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const addedProduct = await api.addProduct(newProductData);
      setProducts(prevProducts => [...prevProducts, addedProduct]);
      if (addedProduct.stockQuantity > 0) {
          const fetchedStockMovements = await api.fetchStockMovements(); 
          setStockMovements(fetchedStockMovements);
      }
      toastContext?.addToast('새 상품이 추가되었습니다.', 'success');
      handleCloseProductModal();
      return true;
    } catch (error: any) {
      if (!handleApiAuthError(error)) {
        toastContext?.addToast(error.message || '상품 추가 중 오류 발생.', 'error');
      }
      return false;
    }
  };

  const handleUpdateProduct = async (updatedProductData: Product): Promise<boolean> => {
    try {
      const savedProduct = await api.updateProduct(updatedProductData);
      setProducts(prevProducts =>
        prevProducts.map(p => (p.id === savedProduct.id ? savedProduct : p))
      );
      toastContext?.addToast('상품 정보가 수정되었습니다.', 'success');
      handleCloseProductModal();
      return true;
    } catch (error: any) {
      if (!handleApiAuthError(error)) {
        toastContext?.addToast(error.message || '상품 정보 수정 중 오류 발생.', 'error');
      }
      return false;
    }
  };
  
  const handleToggleProductStatus = async (productId: string, newStatus: Product['status']) => {
     try {
        const updatedProduct = await api.toggleProductStatus(productId, newStatus);
        if (updatedProduct) {
            setProducts(prevProducts =>
                prevProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
            );
            toastContext?.addToast(`${updatedProduct.name} 상품의 상태가 ${newStatus}(으)로 변경되었습니다.`, 'info');
        } else {
            toastContext?.addToast('상품 상태 변경 실패: 서버 응답 없음.', 'error');
        }
    } catch (error: any) {
        if (!handleApiAuthError(error)) {
            toastContext?.addToast(error.message || '상품 상태 변경 중 오류 발생.', 'error');
        }
    }
  };

  const handleOpenStockMovementModal = () => setIsStockMovementModalOpen(true);
  const handleCloseStockMovementModal = () => setIsStockMovementModalOpen(false);

  const handleAddStockMovement = async (newMovementData: Omit<StockMovement, 'id' | 'currentStockAfterMovement'>): Promise<boolean> => {
    try {
      const addedMovement = await api.addStockMovement(newMovementData);
      setStockMovements(prevMovements => [addedMovement, ...prevMovements].sort((a,b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()));
      
      if (addedMovement.productId && addedMovement.currentStockAfterMovement !== undefined) {
        setProducts(prevProducts =>
          prevProducts.map(p =>
            p.id === addedMovement.productId ? { ...p, stockQuantity: addedMovement.currentStockAfterMovement!, updatedAt: new Date().toISOString() } : p
          )
        );
      } else { 
          const updatedProducts = await api.fetchProducts();
          setProducts(updatedProducts);
      }
      toastContext?.addToast(`재고 변동 (${addedMovement.type}: ${addedMovement.productName})이 기록되었습니다.`, 'success');
      handleCloseStockMovementModal();
      return true;
    } catch (error: any) {
      if (!handleApiAuthError(error)) {
        toastContext?.addToast(error.message || '재고 변동 기록 중 오류 발생.', 'error');
      }
      return false;
    }
  };

  const handleOpenShippingModal = (order: Order) => {
    setSelectedOrderForShipping(order);
    setIsShippingModalOpen(true);
  };
  const handleCloseShippingModal = () => {
    setSelectedOrderForShipping(null);
    setIsShippingModalOpen(false);
  };

  const handleProcessShipment = async (orderId: string, carrier: string, trackingNumber: string): Promise<boolean> => {
    try {
      const result = await api.processShipment(orderId, carrier, trackingNumber);
      if (result.order) {
        setAllOrders(prevOrders =>
          prevOrders.map(o => (o.id === result.order!.id ? result.order! : o))
        );
        
        const productUpdates = new Map<string, number>();
        result.newMovements.forEach(sm => {
            if (sm.productId && sm.currentStockAfterMovement !== undefined) {
                productUpdates.set(sm.productId, sm.currentStockAfterMovement);
            }
        });
        setProducts(prevProds => prevProds.map(p => 
            productUpdates.has(p.id) ? {...p, stockQuantity: productUpdates.get(p.id)!} : p
        ));

        setStockMovements(prevMoves => [...result.newMovements, ...prevMoves].sort((a,b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()));
        
        toastContext?.addToast(`주문 ${orderId}이(가) 발송 처리되었습니다.`, 'success');
        handleCloseShippingModal();
        return true;
      }
      toastContext?.addToast(`발송 처리 실패: 서버 응답 없음.`, 'error');
      return false;
    } catch (error: any) {
      if (!handleApiAuthError(error)) {
        toastContext?.addToast(error.message || '발송 처리 중 오류 발생.', 'error');
      }
      return false;
    }
  };
  
  const handleUpdatePlatformConfigField = async (platformId: string, fieldId: string, value: string) => {
    const currentConfig = platformConfigs.find(p => p.id === platformId);
    if (!currentConfig) return;
    
    const updatedFields = currentConfig.fields.map(f => f.id === fieldId ? {...f, value} : f);
    const configToSave: PlatformConfig = {...currentConfig, fields: updatedFields};
    
    setPlatformConfigs(prev => prev.map(p => p.id === platformId ? configToSave : p));
  };

  const handleTogglePlatformActive = async (platformId: string) => {
    const currentConfig = platformConfigs.find(p => p.id === platformId);
    if (!currentConfig) return;
    try {
        const updatedConfig = await api.togglePlatformActive(platformId, currentConfig);
        setPlatformConfigs(prev => prev.map(p => p.id === platformId ? updatedConfig : p));
        toastContext?.addToast(`${updatedConfig.name} 연동이 ${updatedConfig.isActive ? '활성화' : '비활성화'}되었습니다.`, 'info');
    } catch (e: any) {
      if (!handleApiAuthError(e)) {
        toastContext?.addToast(e.message || '플랫폼 활성 상태 변경 실패', 'error');
      }
    }
  };

  const handleSavePlatformConfig = async (platformId: string) => {
    const configToSave = platformConfigs.find(p => p.id === platformId);
    if (!configToSave) return;
    try {
        const savedConfig = await api.savePlatformConfig(configToSave);
        setPlatformConfigs(prev => prev.map(p => p.id === platformId ? savedConfig : p));
        toastContext?.addToast(`${savedConfig.name} 설정이 저장되었습니다.`, 'success');
    } catch (e: any) {
      if (!handleApiAuthError(e)) {
        toastContext?.addToast(e.message || '플랫폼 설정 저장 실패', 'error');
      }
    }
  };

  const handleTestPlatformConnection = async (platformId: string) => {
    const platform = platformConfigs.find(p => p.id === platformId);
    if (!platform) return;
    toastContext?.addToast(`${platform.name} 연결 테스트 중...`, 'info');
    try {
        const testedConfig = await api.testPlatformConnection(platformId);
        setPlatformConfigs(prev => prev.map(p => p.id === platformId ? testedConfig : p));
        toastContext?.addToast(`${testedConfig.name} 연결 테스트 ${testedConfig.connectionStatus === 'connected' ? '성공 ✅' : '실패 ❌'}`, testedConfig.connectionStatus === 'connected' ? 'success' : 'error');
    } catch (e: any) {
      if (!handleApiAuthError(e)) {
        toastContext?.addToast(e.message || '플랫폼 연결 테스트 실패', 'error');
      }
    }
  };

  const handleUpdateThreePLConfigValue = async (field: keyof Omit<ThreePLConfig, 'connectionStatus'|'lastTest'| 'id'>, value: string) => {
    if(!threePLConfig) return;
    const configToUpdate: ThreePLConfig = { ...threePLConfig, [field]: value };
    setThreePLConfig(configToUpdate);
  };

  const handleSaveThreePLConfig = async () => {
    if(!threePLConfig) return;
    try {
        const savedConfig = await api.saveThreePLConfig(threePLConfig);
        setThreePLConfig(savedConfig);
        toastContext?.addToast('3PL 설정이 저장되었습니다.', 'success');
    } catch (e: any) {
      if (!handleApiAuthError(e)) {
        toastContext?.addToast(e.message || '3PL 설정 저장 실패', 'error');
      }
    }
  };

  const handleTestThreePLConnection = async () => {
     if(!threePLConfig) return;
    toastContext?.addToast('3PL 연결 테스트 중...', 'info');
    try {
        const testedConfig = await api.testThreePLConnection();
        setThreePLConfig(testedConfig);
        toastContext?.addToast(`3PL 연결 테스트 ${testedConfig.connectionStatus === 'connected' ? '성공 ✅' : '실패 ❌'}`, testedConfig.connectionStatus === 'connected' ? 'success' : 'error');
    } catch (e: any) {
      if (!handleApiAuthError(e)) {
        toastContext?.addToast(e.message || '3PL 연결 테스트 실패', 'error');
      }
    }
  };
  
  const handleResolveErrorLog = async (errorId: string) => {
    try {
      const resolvedError = await api.resolveErrorLog(errorId);
      if (resolvedError) {
        setErrorLogs(prevLogs => prevLogs.map(log => log.id === errorId ? resolvedError : log));
        toastContext?.addToast(`오류 ID ${errorId}가 해결됨으로 처리되었습니다.`, 'success');
      } else {
         toastContext?.addToast(`오류 해결 처리 실패: 서버 응답 없음.`, 'error');
      }
    } catch (error: any) {
      if (!handleApiAuthError(error)) {
        toastContext?.addToast(error.message || '오류 해결 처리 중 문제 발생.', 'error');
      }
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!currentUser) {
        if (currentPage !== 'login') {
            setCurrentPage('login'); 
            if (hash !== 'login' && hash !== '') window.location.hash = 'login'; 
        }
        setAppLoading(false); 
        return;
      }
      
      const allowedPages = userRolesConfig[currentUser.role] || [];
      const defaultPage = allowedPages[0] || 'dashboard';

      if (hash && allowedPages.includes(hash)) {
        if (currentPage !== hash) setCurrentPage(hash);
      } else if (hash && !allowedPages.includes(hash) && hash !== 'login') { 
        if (currentPage !== defaultPage) setCurrentPage(defaultPage);
        if (window.location.hash !== `#${defaultPage}`) window.location.hash = defaultPage;
        toastContext?.addToast('접근 권한이 없거나 존재하지 않는 페이지입니다. 대시보드로 이동합니다.', 'warning');
      } else if ((!hash && currentPage !== defaultPage) || (!hash && currentPage === 'login' && currentUser)) { 
        if (currentPage !== defaultPage) setCurrentPage(defaultPage);
        if (window.location.hash !== `#${defaultPage}`) window.location.hash = defaultPage;
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); 
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser, appLoading, currentPage, toastContext]);


  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} isLoggingIn={isLoggingIn} />;
  }
  
  if (appLoading && currentPage !== 'login') { 
    return (
      <div className="global-loading-overlay">
        <div className="spinner"></div>
        <p>데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  const recentOrdersForDashboard = allOrders
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 5);

  let content;
  switch (currentPage) {
    case 'dashboard':
      content = <DashboardPage orders={recentOrdersForDashboard} products={products} onViewDetails={handleViewOrderDetails} />;
      break;
    case 'products':
      content = <ProductManagementPage initialProducts={products} onOpenProductModal={handleOpenProductModal} currentUser={currentUser} />;
      break;
    case 'inventory':
      content = <InventoryManagementPage products={products} initialStockMovements={stockMovements} onOpenStockMovementModal={handleOpenStockMovementModal} currentUser={currentUser} />;
      break;
    case 'shipping':
      content = <ShippingManagementPage orders={allOrders} onOpenShippingModal={handleOpenShippingModal} currentUser={currentUser} />;
      break;
    case 'orders':
      content = <AllOrdersPage orders={allOrders} onViewDetails={handleViewOrderDetails} />;
      break;
    case 'returns':
      content = <ReturnsManagementPage initialReturnRequests={returnRequests} onOpenReturnModal={handleOpenReturnModal} currentUser={currentUser} />;
      break;
    case 'platform-settings':
      content = (platformConfigs.length > 0 && threePLConfig) ? ( // Check if platformConfigs is populated
          <PlatformSettingsPage
            currentUser={currentUser}
            platformConfigs={platformConfigs}
            threePLConfig={threePLConfig}
            users={users}
            onUpdatePlatformConfig={handleUpdatePlatformConfigField}
            onTogglePlatformActive={handleTogglePlatformActive}
            onSavePlatformConfig={handleSavePlatformConfig}
            onTestPlatformConnection={handleTestPlatformConnection}
            onUpdateThreePLConfig={handleUpdateThreePLConfigValue}
            onSaveThreePLConfig={handleSaveThreePLConfig}
            onTestThreePLConnection={handleTestThreePLConnection}
            onOpenUserModal={handleOpenUserModal}
            onToggleUserActive={handleToggleUserActive}
          />
      ) : ( 
        <div className="main-content settings-page"><p>설정 정보를 불러오는 중입니다...</p></div>
      );
      break;
    case 'errors':
      content = <ErrorLogPage initialErrorLogs={errorLogs} onResolveError={handleResolveErrorLog} />;
      break;
    default:
      if(currentUser){
        const defaultUserPage = userRolesConfig[currentUser.role]?.[0] || 'dashboard';
        if(currentPage !== defaultUserPage) { 
            handleNavigation(defaultUserPage);
        } else { 
            content = <div className="main-content"><p>페이지를 로드할 수 없습니다. 기본 페이지로 이동합니다.</p></div>;
        }
        // Return null or a placeholder during navigation to avoid rendering default content briefly
        return null; 
      }
      content = <div className="main-content"><p>페이지를 찾을 수 없습니다.</p></div>;
  }

  return (
    <div className="app-container">
      <Sidebar activeItem={currentPage} onNavigate={handleNavigation} currentUser={currentUser} />
      <div className="main-layout">
        <Header appName="비욘드 오더 허브" currentUser={currentUser} onLogout={handleLogout} />
        {content}
      </div>
      <OrderDetailModal order={selectedOrderForModal} isOpen={isOrderDetailModalOpen} onClose={handleCloseOrderDetailModal} onSaveFulfillment={handleSaveOrderFulfillment} />
      <ReturnDetailModal returnRequest={selectedReturnForModal} isOpen={isReturnModalOpen} onClose={handleCloseReturnModal} onSave={handleSaveReturnRequest} currentUser={currentUser} onRequestReturnPickup={handleRequestReturnPickup} />
      {currentUser?.role === 'master' && (
        <UserEditModal isOpen={isUserModalOpen} onClose={handleCloseUserModal} userToEdit={selectedUserForEdit} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} />
      )}
      <ProductEditModal isOpen={isProductModalOpen} onClose={handleCloseProductModal} productToEdit={selectedProductForEdit} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} currentUser={currentUser} onToggleStatus={handleToggleProductStatus} />
      {currentUser?.role === 'master' && (
        <StockMovementModal isOpen={isStockMovementModalOpen} onClose={handleCloseStockMovementModal} onAddStockMovement={handleAddStockMovement} products={products} />
      )}
      <ShippingProcessModal isOpen={isShippingModalOpen} onClose={handleCloseShippingModal} orderToShip={selectedOrderForShipping} onProcessShipment={handleProcessShipment} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
      <ToastContainer />
    </ToastProvider>
  );
};

export default App;
