import React, { useState, useEffect, useCallback } from 'react';
import { StockMovement, Product, User } from '../types';
import { SearchIcon, RefreshIcon, PlusCircleIcon } from '../assets/icons';
import StockMovementTable from '../components/Inventory/StockMovementTable';
import PaginationControls from '../components/Common/PaginationControls';
// StockMovementModal은 App.tsx에서 관리하므로 여기서는 onOpenStockMovementModal prop을 통해 호출

interface InventoryManagementPageProps {
  products: Product[]; // 상품 선택을 위해 필요
  initialStockMovements: StockMovement[];
  onOpenStockMovementModal: () => void;
  currentUser: User | null;
}

const InventoryManagementPage: React.FC<InventoryManagementPageProps> = ({
  products,
  initialStockMovements,
  onOpenStockMovementModal,
  currentUser
}) => {
  const [filters, setFilters] = useState({
    type: '전체' as '전체' | StockMovement['type'],
    productId: '전체', // 상품 ID로 필터링
    startDate: '',
    endDate: '',
    searchTerm: '', // 상품명, 상품코드, 사유, 메모 등 검색
  });
  const [displayedMovements, setDisplayedMovements] = useState<StockMovement[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const availableTypes: ('전체' | StockMovement['type'])[] = ['전체', '입고', '출고', '조정'];
  // 상품 목록 필터 옵션 (ID와 이름 매핑)
  const availableProducts = [{ id: '전체', name: '전체 상품' }, ...products.map(p => ({ id: p.id, name: `${p.name} (${p.productCode})` }))];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value as any }));
  };

  const resetFilters = () => {
    setFilters({
      type: '전체',
      productId: '전체',
      startDate: '',
      endDate: '',
      searchTerm: '',
    });
  };

  const applyFiltersAndSearch = useCallback(() => {
    let filtered = initialStockMovements;

    if (filters.type !== '전체') {
      filtered = filtered.filter(m => m.type === filters.type);
    }
    if (filters.productId !== '전체') {
      filtered = filtered.filter(m => m.productId === filters.productId);
    }
    if (filters.startDate) {
      filtered = filtered.filter(m => new Date(m.movementDate) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(m => new Date(m.movementDate) <= new Date(filters.endDate));
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.productName.toLowerCase().includes(term) ||
        m.productCode.toLowerCase().includes(term) ||
        (m.reason && m.reason.toLowerCase().includes(term)) ||
        (m.memo && m.memo.toLowerCase().includes(term)) ||
        m.id.toLowerCase().includes(term)
      );
    }
    return filtered.sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()); // 최신순 정렬
  }, [filters, initialStockMovements]);

  useEffect(() => {
    const filteredAndSearched = applyFiltersAndSearch();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedMovements(filteredAndSearched.slice(startIndex, endIndex));
  }, [filters, currentPage, itemsPerPage, applyFiltersAndSearch, initialStockMovements]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.type, filters.productId, filters.startDate, filters.endDate, filters.searchTerm, initialStockMovements]);

  const totalPages = Math.ceil(applyFiltersAndSearch().length / itemsPerPage);
  const canAddMovement = currentUser?.role === 'master';

  return (
    <main className="main-content inventory-page" role="main" aria-labelledby="inventory-page-title"> {/* inventory-page 클래스 추가 */}
      <div className="page-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 id="inventory-page-title">재고 관리</h2>
          <p className="page-description">상품의 입/출고 내역을 확인하고 재고를 관리합니다.</p>
        </div>
        {canAddMovement && (
          <button
            className="action-button primary"
            onClick={onOpenStockMovementModal}
            aria-label="Add new stock movement"
          >
            <PlusCircleIcon /> 새 입/출고 기록
          </button>
        )}
      </div>
      <div className="filters-toolbar" role="search" aria-label="Filter stock movements">
        <div className="filter-group">
          <label htmlFor="type-filter-inventory">유형:</label>
          <select id="type-filter-inventory" name="type" value={filters.type} onChange={handleFilterChange}>
            {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="product-filter-inventory">상품:</label>
          <select id="product-filter-inventory" name="productId" value={filters.productId} onChange={handleFilterChange} style={{minWidth: '200px'}}>
            {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="date-start-filter-inventory">기간(시작):</label>
          <input type="date" id="date-start-filter-inventory" name="startDate" value={filters.startDate} onChange={handleFilterChange} aria-label="Filter by start date" />
        </div>
        <div className="filter-group">
          <label htmlFor="date-end-filter-inventory">기간(종료):</label>
          <input type="date" id="date-end-filter-inventory" name="endDate" value={filters.endDate} onChange={handleFilterChange} aria-label="Filter by end date" />
        </div>
        <div className="filter-group search-group">
          <input type="text" name="searchTerm" placeholder="상품명, 코드, 사유 등 검색..." value={filters.searchTerm} onChange={handleFilterChange} aria-label="Search stock movements" />
          <button type="button" onClick={() => setCurrentPage(1)}><SearchIcon />검색</button>
        </div>
        <button type="button" className="action-button secondary" onClick={resetFilters}><RefreshIcon />초기화</button>
      </div>
      <StockMovementTable movements={displayedMovements} />
      {totalPages > 0 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
    </main>
  );
};

export default InventoryManagementPage;