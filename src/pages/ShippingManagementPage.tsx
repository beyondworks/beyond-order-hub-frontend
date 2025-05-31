import React, { useState, useEffect, useCallback } from 'react';
import { Order, User } from '../types';
import { SearchIcon, RefreshIcon, TruckIcon } from '../assets/icons';
import ShippingTable from '../components/Shipping/ShippingTable';
import PaginationControls from '../components/Common/PaginationControls';

interface ShippingManagementPageProps {
  orders: Order[]; // App.tsx로부터 전달받는 전체 주문 목록
  onOpenShippingModal: (order: Order) => void;
  currentUser: User | null;
}

const ShippingManagementPage: React.FC<ShippingManagementPageProps> = ({
  orders,
  onOpenShippingModal,
  currentUser
}) => {
  const [filters, setFilters] = useState({
    platform: '전체',
    startDate: '',
    endDate: '',
    searchTerm: '',
  });
  const [displayedOrders, setDisplayedOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const ordersToShip = orders.filter(order => order.status === '출고대기');
  const availablePlatforms = ['전체', ...new Set(ordersToShip.map(o => o.platform))];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      platform: '전체',
      startDate: '',
      endDate: '',
      searchTerm: '',
    });
  };

  const applyFiltersAndSearch = useCallback(() => {
    let filtered = ordersToShip;

    if (filters.platform !== '전체') {
      filtered = filtered.filter(order => order.platform === filters.platform);
    }
    if (filters.startDate) {
      filtered = filtered.filter(order => new Date(order.dateTime.split(' ')[0]) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(order => new Date(order.dateTime.split(' ')[0]) <= new Date(filters.endDate));
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(term) ||
        order.platformOrderId.toLowerCase().includes(term) ||
        order.productSummary.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term)
      );
    }
    return filtered.sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()); // 오래된 주문 먼저 처리
  }, [filters, ordersToShip]);

  useEffect(() => {
    const filteredAndSearched = applyFiltersAndSearch();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedOrders(filteredAndSearched.slice(startIndex, endIndex));
  }, [filters, currentPage, itemsPerPage, applyFiltersAndSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.platform, filters.startDate, filters.endDate, filters.searchTerm, orders]);

  const totalPages = Math.ceil(applyFiltersAndSearch().length / itemsPerPage);
  const canProcessShipment = currentUser?.role === 'master';

  return (
    <main className="main-content shipping-page" role="main" aria-labelledby="shipping-page-title">
      <div className="page-header-container">
        <h2 id="shipping-page-title">배송 관리</h2>
        <p className="page-description">'출고대기' 상태의 주문을 확인하고 송장 정보를 입력하여 발송 처리합니다. 발송 처리 시 재고가 자동으로 차감됩니다.</p>
      </div>
      <div className="filters-toolbar" role="search" aria-label="Filter orders to ship">
        <div className="filter-group">
          <label htmlFor="platform-filter-shipping">플랫폼:</label>
          <select id="platform-filter-shipping" name="platform" value={filters.platform} onChange={handleFilterChange}>
            {availablePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="date-start-filter-shipping">주문일(시작):</label>
          <input type="date" id="date-start-filter-shipping" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
        </div>
        <div className="filter-group">
          <label htmlFor="date-end-filter-shipping">주문일(종료):</label>
          <input type="date" id="date-end-filter-shipping" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
        </div>
        <div className="filter-group search-group">
          <input type="text" name="searchTerm" placeholder="주문번호, 상품명, 고객명 검색..." value={filters.searchTerm} onChange={handleFilterChange} />
          <button type="button" onClick={() => setCurrentPage(1)}><SearchIcon />검색</button>
        </div>
        <button type="button" className="action-button secondary" onClick={resetFilters}><RefreshIcon />초기화</button>
      </div>
      <ShippingTable 
        orders={displayedOrders} 
        onProcessShipment={canProcessShipment ? onOpenShippingModal : undefined} 
      />
      {totalPages > 0 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
    </main>
  );
};

export default ShippingManagementPage;