import React from 'react';
import { Order } from '../../types';
import { TruckIcon } from '../../assets/icons';
import { getStatusClassName } from '../../utils';


interface ShippingTableProps {
  orders: Order[];
  onProcessShipment?: (order: Order) => void; // 마스터 사용자만 발송 처리 가능
}

const ShippingTable: React.FC<ShippingTableProps> = ({ orders, onProcessShipment }) => {
  return (
    <div className="orders-table-container">
      <table className="orders-table" aria-label="Orders to Ship"> {/* Reusing orders-table styles */}
        <thead>
          <tr>
            <th>주문일시</th>
            <th>플랫폼</th>
            <th>주문번호 (BOH)</th>
            <th>고객명</th>
            <th>상품(요약)</th>
            <th>수량</th>
            <th>현재상태</th>
            {onProcessShipment && <th>발송처리</th>}
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={onProcessShipment ? 8 : 7} style={{ textAlign: 'center' }}>발송 처리할 주문이 없습니다.</td>
            </tr>
          ) : (
            orders.map(order => (
              <tr key={order.id}>
                <td>{order.dateTime}</td>
                <td>{order.platform}</td>
                <td>{order.id} ( {order.platformOrderId} )</td>
                <td>{order.customerName}</td>
                <td>{order.productSummary}</td>
                <td>{order.quantity}</td>
                <td><span className={getStatusClassName(order.status)}>{order.status}</span></td>
                {onProcessShipment && (
                  <td>
                    <button
                      className="action-button primary" // primary 스타일 적용
                      onClick={() => onProcessShipment(order)}
                      aria-label={`Process shipment for order ${order.id}`}
                      disabled={order.status !== '출고대기'} // 출고대기 상태일 때만 활성화
                      title={order.status !== '출고대기' ? '출고대기 상태의 주문만 발송 처리 가능합니다.' : '송장 입력 및 발송 처리'}
                    >
                      <TruckIcon /> 발송 처리
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ShippingTable;