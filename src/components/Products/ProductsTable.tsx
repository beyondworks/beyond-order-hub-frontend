import React from 'react';
import { Product } from '../../types';

// 상품 상태에 따른 클래스명 반환 함수 (추후 utils.ts로 이동 가능)
const getProductStatusClassName = (status: Product['status']) => {
  switch (status) {
    case '판매중': return 'status-connected'; // 녹색 계열 (활성)
    case '품절': return 'status-error'; // 주황/노랑 계열
    case '숨김': return 'status-disconnected'; // 회색/흐린 계열 (비활성)
    case '판매중지': return 'status-cancelled'; // 빨간색 계열
    default: return '';
  }
};

interface ProductsTableProps {
  products: Product[];
  onEditProduct: (id: string) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ products, onEditProduct }) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="orders-table-container"> {/* Reusing for consistent styling */}
      <table className="products-table orders-table" aria-label="Product List"> {/* products-table 클래스 추가, orders-table 재활용 */}
        <thead>
          <tr>
            <th>상품코드</th>
            <th>상품명</th>
            <th>카테고리</th>
            <th>판매가</th>
            <th>재고</th>
            <th>판매상태</th>
            <th>등록일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(products) && products.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center' }}>등록된 상품이 없습니다.</td>
            </tr>
          ) : (
            Array.isArray(products) ? products.map(prod => (
              <tr key={prod.id}>
                <td>{prod.productCode}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {prod.imageUrl && 
                      <img 
                        src={prod.imageUrl} 
                        alt={prod.name} 
                        style={{ width: '40px', height: '40px', marginRight: '10px', borderRadius: '4px', objectFit: 'cover' }} 
                      />}
                    <span>{prod.name}</span>
                  </div>
                </td>
                <td>{prod.category || '-'}</td>
                <td>{prod.sellingPrice.toLocaleString()}원</td>
                <td>{prod.stockQuantity.toLocaleString()}개</td>
                <td>
                  <span 
                    className={getProductStatusClassName(prod.status)} 
                    style={{padding: '3px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: '500'}}
                  >
                    {prod.status}
                  </span>
                </td>
                <td>{formatDate(prod.createdAt)}</td>
                <td>
                  <button
                    className="action-button"
                    onClick={() => onEditProduct(prod.id)}
                    aria-label={`Edit product ${prod.name}`}
                  >
                    수정
                  </button>
                </td>
              </tr>
            )) : null
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;