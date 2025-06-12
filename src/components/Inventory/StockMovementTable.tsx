import React from 'react';
import { StockMovement } from '../../types';

const getStockMovementTypeClassName = (type: StockMovement['type']) => {
  switch (type) {
    case '입고': return 'status-connected'; // Greenish (like connected or success)
    case '출고': return 'status-cancelled'; // Reddish (like cancelled or error)
    case '조정': return 'status-processing'; // Yellowish/Orangish (like processing or warning)
    default: return '';
  }
};

interface StockMovementTableProps {
  movements: StockMovement[];
  // onEditMovement?: (movement: StockMovement) => void; // 추후 수정 기능 추가 시
}

const StockMovementTable: React.FC<StockMovementTableProps> = ({ movements }) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="orders-table-container"> {/* Reusing for consistent styling */}
      <table className="stock-movements-table orders-table" aria-label="Stock Movement Log"> {/* stock-movements-table 클래스 추가 */}
        <thead>
          <tr>
            <th>변동일시</th>
            <th>상품코드</th>
            <th>상품명</th>
            <th>유형</th>
            <th>변경수량</th>
            <th>사유</th>
            <th>메모</th>
            <th>변동 후 재고</th>
            {/* {onEditMovement && <th>관리</th>} */}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(movements) && movements.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center' }}>입/출고 내역이 없습니다.</td>
            </tr>
          ) : (
            Array.isArray(movements) ? movements.map(move => (
              <tr key={move.id}>
                <td>{formatDate(move.movementDate)}</td>
                <td>{move.productCode}</td>
                <td>{move.productName}</td>
                <td>
                  <span
                    className={getStockMovementTypeClassName(move.type)}
                    style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.85em', fontWeight: '500' }}
                  >
                    {move.type}
                  </span>
                </td>
                <td style={{ color: move.quantityChanged > 0 ? 'green' : (move.quantityChanged < 0 ? 'red' : 'inherit')}}>
                  {move.quantityChanged > 0 ? `+${move.quantityChanged}` : move.quantityChanged}
                </td>
                <td>{move.reason}</td>
                <td>{move.memo || '-'}</td>
                <td>{move.currentStockAfterMovement !== undefined ? move.currentStockAfterMovement.toLocaleString() + '개' : '-'}</td>
                {/* {onEditMovement && (
                  <td>
                    <button
                      className="action-button"
                      onClick={() => onEditMovement(move)}
                      aria-label={`Edit stock movement ${move.id}`}
                    >
                      수정
                    </button>
                  </td>
                )} */}
              </tr>
            )) : null
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockMovementTable;