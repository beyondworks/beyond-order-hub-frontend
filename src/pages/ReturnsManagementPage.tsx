import React, { useState, useEffect, useCallback } from 'react';
import { ReturnRequest, User } from '../types';
import { SearchIcon, RefreshIcon } from '../assets/icons';
import ReturnsTable from '../components/Returns/ReturnsTable';
import PaginationControls from '../components/Common/PaginationControls';

interface ReturnsManagementPageProps {
  initialReturnRequests: ReturnRequest[];
  onOpenReturnModal: (returnRequest: ReturnRequest) => void;
  currentUser: User | null; // 역할 기반 UI 제어에 사용될 수 있음
}

const ReturnsManagementPage: React.FC<ReturnsManagementPageProps> = ({ initialReturnRequests, onOpenReturnModal, currentUser }) => {
  const [filters, setFilters] = useState({
    platform: '전체',
    type: '전체' as '전체' | '반품' | '교환',
    status: '전체',
    startDate: '',
    endDate: '',
    searchTerm: '',
  });
  const [displayedRequests, setDisplayedRequests] = useState<ReturnRequest[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 필터 옵션들 (mockData에서 동적으로 생성하거나, 고정 목록 사용 가능)
  const availablePlatforms = ['전체', ...new Set(initialReturnRequests.map(r => r.platform))];
  const availableTypes: ('전체' | '반품' | '교환')[] = ['전체', '반품', '교환'];
  const availableStatuses = ['전체', ...new Set(initialReturnRequests.map(r => r.status))];


  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value as any })); // Use 'as any' for simplicity, refine if needed
  };

  const resetFilters = () => {
    setFilters({
      platform: '전체',
      type: '전체',
      status: '전체',
      startDate: '',
      endDate: '',
      searchTerm: '',
    });
  };

  const applyFiltersAndSearch = useCallback(() => {
    let filtered = initialReturnRequests;

    if (filters.platform !== '전체') {
      filtered = filtered.filter(req => req.platform === filters.platform);
    }
    if (filters.type !== '전체') {
      filtered = filtered.filter(req => req.type === filters.type);
    }
    if (filters.status !== '전체') {
      filtered = filtered.filter(req => req.status === filters.status);
    }
    if (filters.startDate) {
      filtered = filtered.filter(req => new Date(req.requestedDate.split(' ')[0]) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(req => new Date(req.requestedDate.split(' ')[0]) <= new Date(filters.endDate));
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        req.id.toLowerCase().includes(term) ||
        req.orderId.toLowerCase().includes(term) ||
        req.platformOrderId.toLowerCase().includes(term) ||
        req.customerName.toLowerCase().includes(term) ||
        req.productSummary.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [filters, initialReturnRequests]);

  useEffect(() => {
    const filteredAndSearched = applyFiltersAndSearch();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedRequests(filteredAndSearched.slice(startIndex, endIndex));
  }, [filters, currentPage, itemsPerPage, applyFiltersAndSearch]);

  useEffect(() => {
    setCurrentPage(1); 
  }, [filters.platform, filters.type, filters.status, filters.startDate, filters.endDate, filters.searchTerm]);

  const totalPages = Math.ceil(applyFiltersAndSearch().length / itemsPerPage);

  return (
    <main className="main-content returns-page" role="main" aria-labelledby="returns-page-title">
      <div className="page-header-container">
        <h2 id="returns-page-title">반품/교환 관리</h2>
        <p className="page-description">고객의 반품 및 교환 요청을 확인하고 처리합니다.</p>
      </div>
      <div className="filters-toolbar" role="search" aria-label="Filter return and exchange requests">
        <div className="filter-group">
          <label htmlFor="platform-filter-returns">플랫폼:</label>
          <select id="platform-filter-returns" name="platform" value={filters.platform} onChange={handleFilterChange}>
            {availablePlatforms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="type-filter-returns">요청유형:</label>
          <select id="type-filter-returns" name="type" value={filters.type} onChange={handleFilterChange}>
            {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="status-filter-returns">처리상태:</label>
          <select id="status-filter-returns" name="status" value={filters.status} onChange={handleFilterChange}>
            {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="date-start-filter-returns">요청일(시작):</label>
          <input type="date" id="date-start-filter-returns" name="startDate" value={filters.startDate} onChange={handleFilterChange} aria-label="Filter by start date" />
        </div>
        <div className="filter-group">
          <label htmlFor="date-end-filter-returns">요청일(종료):</label>
          <input type="date" id="date-end-filter-returns" name="endDate" value={filters.endDate} onChange={handleFilterChange} aria-label="Filter by end date" />
        </div>
        <div className="filter-group search-group">
          <input type="text" name="searchTerm" placeholder="요청 ID, 주문번호, 고객명 등 검색..." value={filters.searchTerm} onChange={handleFilterChange} aria-label="Search return requests" />
          <button type="button" onClick={() => setCurrentPage(1)}><SearchIcon/>검색</button>
        </div>
        <button type="button" className="action-button secondary" onClick={resetFilters}><RefreshIcon />초기화</button>
      </div>
      <ReturnsTable requests={displayedRequests} onOpenDetails={onOpenReturnModal} />
      {totalPages > 0 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
    </main>
  );
};

export default ReturnsManagementPage;