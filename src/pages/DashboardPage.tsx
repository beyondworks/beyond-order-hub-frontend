import React, { useState, useEffect, useCallback } from 'react';
import { mockSummaryData } from '../data/mockData'; 
import { Order, Product } from '../types'; // Product 타입 추가
import { SearchIcon, RefreshIcon, AlertTriangleIcon } from '../assets/icons'; // AlertTriangleIcon 추가
import SummaryCard from '../components/Dashboard/SummaryCard';
import OrdersTable from '../components/Orders/OrdersTable';

interface DashboardPageProps {
  orders: Order[];
  products: Product[]; // products prop 추가
  onViewDetails: (orderId: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ orders, products, onViewDetails }) => {
  const [summary, setSummary] = useState(mockSummaryData);
  const [filters, setFilters] = useState({
    platform: '전체',
    status: '전체',
    date: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedRecentOrders, setDisplayedRecentOrders] = useState<Order[]>(orders);

  const availablePlatforms = ['전체', '스마트스토어', '쿠팡', '오늘의집', '29CM', '아임웹', '카카오톡스토어', '토스쇼핑'];
  const availableStatuses = ['전체', '신규', '처리중', '3PL대기', '3PL완료', '출고대기', '발송완료', '취소'];

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const applyDashboardFiltersAndSearch = useCallback(() => {
    let filtered = safeOrders;

    if (filters.platform !== '전체') {
      filtered = filtered.filter(order => order.platform === filters.platform);
    }
    if (filters.status !== '전체') {
      filtered = filtered.filter(order => order.status === filters.status);
    }
    if (filters.date) {
      filtered = filtered.filter(order => order.dateTime.startsWith(filters.date));
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(term) ||
        order.platformOrderId.toLowerCase().includes(term) ||
        order.productSummary.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term)
      );
    }
    setDisplayedRecentOrders(filtered);
  }, [filters, searchTerm, safeOrders]);

  useEffect(() => {
    applyDashboardFiltersAndSearch();
  }, [filters, searchTerm, orders, applyDashboardFiltersAndSearch]);
  
  useEffect(() => { 
    setDisplayedRecentOrders(safeOrders);
    applyDashboardFiltersAndSearch(); 
  }, [orders, applyDashboardFiltersAndSearch]);

  const resetFilters = () => {
    setFilters({ platform: '전체', status: '전체', date: '' });
    setSearchTerm('');
  };

  const lowStockProducts = safeProducts
    .filter(p => p.safeStockQuantity !== undefined && p.safeStockQuantity > 0 && p.stockQuantity <= p.safeStockQuantity)
    .slice(0, 5); // 최대 5개 표시

  return (
    <main className="main-content" id="main-dashboard" role="main" aria-labelledby="dashboard-title-h2">
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '30px', alignItems: 'start' }}>
        <div>
          <section className="summary-section" aria-labelledby="summary-title">
            <h2 id="summary-title" className="sr-only">Order Summary</h2>
            <SummaryCard title="오늘의 신규 주문" count={summary.newOrders} />
            <SummaryCard title="처리 중 주문" count={summary.processingOrders} />
            <SummaryCard title="오늘 발송 완료" count={summary.shippedToday} />
            {summary.errors > 0 && <SummaryCard title="주의! 오류 발생" count={summary.errors} isError />}
          </section>

          <section className="orders-section" aria-labelledby="recent-orders-title-h2">
            <div className="page-header-container">
                <h2 id="recent-orders-title-h2">최근 주문 목록</h2>
            </div>
            <div className="filters-toolbar" role="search" aria-label="Filter recent orders">
              <select name="platform" value={filters.platform} onChange={handleFilterChange} aria-label="Filter by platform">
                {availablePlatforms.map(p => <option key={p} value={p === '전체' ? '전체' : p}>{p}</option>)}
              </select>
              <select name="status" value={filters.status} onChange={handleFilterChange} aria-label="Filter by status">
                {availableStatuses.map(s => <option key={s} value={s === '전체' ? '전체' : s}>{s}</option>)}
              </select>
              <input type="date" name="date" value={filters.date} onChange={handleFilterChange} aria-label="Filter by date" />
              <div className="filter-group search-group">
                <input type="text" placeholder="주문번호/상품명 검색..." value={searchTerm} onChange={handleSearchTermChange} aria-label="Search orders text" />
                <button type="button" onClick={applyDashboardFiltersAndSearch}><SearchIcon/>검색</button>
              </div>
              <button type="button" className="action-button secondary" onClick={resetFilters}><RefreshIcon />초기화</button>
            </div>
            <OrdersTable orders={Array.isArray(displayedRecentOrders) ? displayedRecentOrders : []} onViewDetails={onViewDetails} isCompact={true}/>
          </section>
        </div>
        
        <aside className="low-stock-alert-section" aria-labelledby="low-stock-title">
          <div className="page-header-container" style={{display: 'flex', alignItems: 'center', marginBottom: '15px'}}>
             <AlertTriangleIcon />
            <h3 id="low-stock-title" style={{ marginLeft: '8px', fontSize: '1.2em', color: '#c0392b', marginBottom: '0'}}>재고 부족 알림</h3>
          </div>
          {Array.isArray(lowStockProducts) && lowStockProducts.length > 0 ? (
            <ul className="low-stock-list">
              {lowStockProducts.map(p => (
                <li key={p.id}>
                  <strong>{p.name}</strong> (코드: {p.productCode})
                  <br/>
                  <span style={{color: '#e74c3c'}}>현재고: {p.stockQuantity}</span> / 안전재고: {p.safeStockQuantity}
                </li>
              ))}
            </ul>
          ) : (
            <p>모든 상품 재고가 양호합니다.</p>
          )}
        </aside>
      </div>
    </main>
  );
};

export default DashboardPage;