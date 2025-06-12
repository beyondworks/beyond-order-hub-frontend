import React from 'react';
import { Order } from '../../types';
import { getStatusClassName } from '../../utils';

interface OrdersTableProps {
  orders: Order[];
  onViewDetails: (orderId: string) => void;
  isCompact?: boolean;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, onViewDetails, isCompact = false }) => {
  return (
    <div className="orders-table-container">
      <table className="orders-table" aria-label={isCompact ? "Recent Orders" : "All Orders"}>
        <thead>
          <tr>
            <th>주문일시</th>
            <th>플랫폼</th>
            <th>주문번호 (BOH)</th>
            {!isCompact && <th>플랫폼 주문번호</th>}
            <th>상품명(요약)</th>
            <th>수량</th>
            <th>주문자</th>
            <th>주문상태</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(orders) && orders.length === 0 ? (
            <tr>
              <td colSpan={isCompact ? 8 : 9} style={{ textAlign: 'center' }}>주문이 없습니다.</td>
            </tr>
          ) : Array.isArray(orders) ? (
            orders.map(order => (
              <tr key={order.id}>
                <td>{order.dateTime}</td>
                <td>{order.platform}</td>
                <td>{order.id}</td>
                {!isCompact && <td>{order.platformOrderId}</td>}
                <td>{order.productSummary}</td>
                <td>{order.quantity}</td>
                <td>{order.customerName}</td>
                <td><span className={getStatusClassName(order.status)}>{order.status}</span></td>
                <td>
                  <button
                    className="action-button"
                    onClick={() => onViewDetails(order.id)}
                    aria-label={`View details for order ${order.id}`}
                  >
                    상세보기
                  </button>
                </td>
              </tr>
            ))
          ) : null}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
