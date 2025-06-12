import React from 'react';
import { ReturnRequest } from '../../types';
// import { getReturnStatusClassName } from '../../utils'; // utils에 반품 상태 클래스 함수 추가 필요

// 임시 반품 상태 클래스 함수 (추후 utils.ts로 이동 및 확장)
const getReturnStatusClassName = (status: string) => {
  switch (status) {
    case '요청접수': return 'status-return-request'; // 주황색 계열
    case '수거지시':
    case '수거중':
    case '수거완료':
    case '검수중':
      return 'status-processing'; // 노란색/주황색 계열 (처리중과 유사)
    case '처리중': // 교환 상품 발송 등
      return 'status-3pl-pending'; // 보라색 계열
    case '완료':
      return 'status-shipped'; // 파란색/녹색 계열 (발송완료/완료됨과 유사)
    case '반려':
    case '철회':
      return 'status-cancelled'; // 빨간색 계열
    default: return '';
  }
};


interface ReturnsTableProps {
  requests: ReturnRequest[];
  onOpenDetails: (id: string) => void;
}

const ReturnsTable: React.FC<ReturnsTableProps> = ({ requests, onOpenDetails }) => {
  return (
    <div className="orders-table-container"> {/* Reusing for consistent styling */}
      <table className="returns-table orders-table" aria-label="Return and Exchange Requests">
        <thead>
          <tr>
            <th>요청ID</th>
            <th>원주문번호</th>
            <th>플랫폼</th>
            <th>고객명</th>
            <th>상품(요약)</th>
            <th>유형</th>
            <th>사유</th>
            <th>요청일</th>
            <th>상태</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(requests) && requests.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ textAlign: 'center' }}>반품/교환 요청이 없습니다.</td>
            </tr>
          ) : (
            Array.isArray(requests) ? requests.map(req => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.orderId} ( {req.platformOrderId} )</td>
                <td>{req.platform}</td>
                <td>{req.customerName}</td>
                <td>{req.productSummary}</td>
                <td>{req.type}</td>
                <td>{req.reason}</td>
                <td>{req.requestedDate.split(' ')[0]}</td>
                <td><span className={getReturnStatusClassName(req.status)}>{req.status}</span></td>
                <td>
                  <button
                    className="action-button"
                    onClick={() => onOpenDetails(req.id)}
                    aria-label={`View details for return request ${req.id}`}
                  >
                    상세보기
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

export default ReturnsTable;