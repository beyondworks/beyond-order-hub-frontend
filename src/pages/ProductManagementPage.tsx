import React, { useState, useEffect, useCallback } from 'react';
import { Product, User } from '../types';
import { SearchIcon, RefreshIcon, PlusCircleIcon } from '../assets/icons';
import ProductsTable from '../components/Products/ProductsTable';
import PaginationControls from '../components/Common/PaginationControls';

interface ProductManagementPageProps {
  initialProducts: Product[];
  onOpenProductModal: (product?: Product) => void;
  currentUser: User | null;
}

const ProductManagementPage: React.FC<ProductManagementPageProps> = ({ 
  initialProducts, 
  onOpenProductModal, 
  currentUser 
}) => {
  const [filters, setFilters] = useState({
    category: '전체',
    status: '전체' as '전체' | Product['status'],
    searchTerm: '',
  });
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const availableCategories = ['전체', ...new Set(initialProducts.map(p => p.category).filter(c => c))];
  const availableStatuses: ('전체' | Product['status'])[] = ['전체', '판매중', '품절', '숨김', '판매중지'];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value as any }));
  };

  const resetFilters = () => {
    setFilters({
      category: '전체',
      status: '전체',
      searchTerm: '',
    });
  };

  const applyFiltersAndSearch = useCallback(() => {
    let filtered = initialProducts;

    if (filters.category !== '전체') {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters.status !== '전체') {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.productCode.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }
    return filtered;
  }, [filters, initialProducts]);

  useEffect(() => {
    const filteredAndSearched = applyFiltersAndSearch();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedProducts(filteredAndSearched.slice(startIndex, endIndex));
  }, [filters, currentPage, itemsPerPage, applyFiltersAndSearch, initialProducts]);

  useEffect(() => {
    setCurrentPage(1); 
  }, [filters.category, filters.status, filters.searchTerm, initialProducts]);

  const totalPages = Math.ceil(applyFiltersAndSearch().length / itemsPerPage);
  const canAddOrEdit = currentUser?.role === 'master'; // 관리자만 상품 추가/수정 가능하도록 가정

  return (
    <main className="main-content products-page" role="main" aria-labelledby="products-page-title">
      <div className="page-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h2 id="products-page-title">상품 관리</h2>
            <p className="page-description">등록된 모든 상품을 확인하고 관리합니다. 재고 및 판매 상태를 업데이트할 수 있습니다.</p>
        </div>
        {canAddOrEdit && (
            <button 
                className="action-button primary" 
                onClick={() => onOpenProductModal()}
                aria-label="Add new product"
            >
                <PlusCircleIcon /> 새 상품 등록
            </button>
        )}
      </div>
      <div className="filters-toolbar" role="search" aria-label="Filter products">
        <div className="filter-group">
          <label htmlFor="category-filter-products">카테고리:</label>
          <select id="category-filter-products" name="category" value={filters.category} onChange={handleFilterChange}>
            {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="status-filter-products">판매상태:</label>
          <select id="status-filter-products" name="status" value={filters.status} onChange={handleFilterChange}>
            {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group search-group">
          <input type="text" name="searchTerm" placeholder="상품명, 상품코드 검색..." value={filters.searchTerm} onChange={handleFilterChange} aria-label="Search products" />
          <button type="button" onClick={() => setCurrentPage(1)}><SearchIcon/>검색</button>
        </div>
        <button type="button" className="action-button secondary" onClick={resetFilters}><RefreshIcon />초기화</button>
      </div>
      <ProductsTable 
        products={displayedProducts} 
        onEditProduct={canAddOrEdit ? onOpenProductModal : undefined} 
      />
      {totalPages > 0 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
    </main>
  );
};

export default ProductManagementPage;