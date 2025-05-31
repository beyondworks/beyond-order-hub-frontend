import React, { useState, useEffect, useCallback } from 'react';
// import { mockAllOrdersData } from '../data/mockData'; // mockAllOrdersData 제거
import { Order } from '../types';
import { SearchIcon, RefreshIcon } from '../assets/icons';
import OrdersTable from '../components/Orders/OrdersTable';
import PaginationControls from '../components/Common/PaginationControls';

interface AllOrdersPageProps {
  orders: Order[]; // App.tsx로부터 전달받는 전체 주문 목록
  onViewDetails: (orderId: string) => void;
}

const AllOrdersPage: React.FC<AllOrdersPageProps> = ({ orders, onViewDetails }) => {
  const [filters, setFilters] = useState({
    platform: '전체',
    status: '전체',
    startDate: '',
    endDate: '',
    searchTerm: '',
  });
  const [displayedOrders, setDisplayedOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const availablePlatforms = ['전체', '스마트스토어', '쿠팡', '오늘의집', '29CM', '아임웹', '카카오톡스토어', '토스쇼핑'];
  const availableStatuses = ['전체', '신규', '처리중', '3PL대기', '3PL완료', '출고대기', '발송완료', '취소'];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
        platform: '전체',
        status: '전체',
        startDate: '',
        endDate: '',
        searchTerm: '',
    });
  };

  const applyFiltersAndSearch = useCallback(() => {
    let filtered = orders; // props.orders를 기준으로 필터링

    if (filters.platform !== '전체') {
      filtered = filtered.filter(order => order.platform === filters.platform);
    }
    if (filters.status !== '전체') {
      filtered = filtered.filter(order => order.status === filters.status);
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
    return filtered;
  }, [filters, orders]); // orders를 의존성 배열에 추가

  useEffect(() => {
    const filteredAndSearched = applyFiltersAndSearch();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedOrders(filteredAndSearched.slice(startIndex, endIndex));
  }, [filters, currentPage, itemsPerPage, applyFiltersAndSearch, orders]); // orders 의존성 추가

  useEffect(() => {
    setCurrentPage(1); 
  }, [filters.platform, filters.status, filters.startDate, filters.endDate, filters.searchTerm, orders]); // orders도 필터 변경으로 간주


  const totalPages = Math.ceil(applyFiltersAndSearch().length / itemsPerPage);

  return (
    <main className="main-content all-orders-page" role="main" aria-labelledby="all-orders-page-title">
        <div className="page-header-container">
            <h2 id="all-orders-page-title">전체 주문 목록</h2>
            <p className="page-description">수집된 모든 주문 내역을 확인하고 관리합니다.</p>
        </div>
        <div className="filters-toolbar" role="search" aria-label="Filter all orders">
            <div className="filter-group">
                <label htmlFor="platform-filter-all">플랫폼:</label>
                <select id="platform-filter-all" name="platform" value={filters.platform} onChange={handleFilterChange}>
                    {availablePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div className="filter-group">
                <label htmlFor="status-filter-all">주문상태:</label>
                <select id="status-filter-all" name="status" value={filters.status} onChange={handleFilterChange}>
                    {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="filter-group">
                <label htmlFor="date-start-filter-all">기간(시작):</label>
                <input type="date" id="date-start-filter-all" name="startDate" value={filters.startDate} onChange={handleFilterChange} aria-label="Filter by start date" />
            </div>
            <div className="filter-group">
                <label htmlFor="date-end-filter-all">기간(종료):</label>
                <input type="date" id="date-end-filter-all" name="endDate" value={filters.endDate} onChange={handleFilterChange} aria-label="Filter by end date" />
            </div>
            <div className="filter-group search-group">
                <input type="text" name="searchTerm" placeholder="주문번호, 상품명, 주문자 검색..." value={filters.searchTerm} onChange={handleFilterChange} aria-label="Search all orders text" />
                 <button type="button" onClick={() => setCurrentPage(1)}><SearchIcon/>검색</button>
            </div>
             <button type="button" className="action-button secondary" onClick={resetFilters}><RefreshIcon />초기화</button>
        </div>
        <OrdersTable orders={displayedOrders} onViewDetails={onViewDetails} isCompact={false} />
        {totalPages > 0 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
    </main>
  );
};
export default AllOrdersPage;