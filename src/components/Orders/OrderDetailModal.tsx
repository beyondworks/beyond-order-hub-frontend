import React, { useState, useEffect, useRef, useContext } from 'react';
import { OrderDetail } from '../../types';
import { getStatusClassName } from '../../utils';
import { CloseIcon, SaveIcon } from '../../assets/icons'; // SaveIcon 추가
import { ToastContext } from '../../contexts/ToastContext';

interface OrderDetailModalProps {
  order: OrderDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveFulfillment: (orderId: string, shippingCarrier: string, trackingNumber: string) => Promise<boolean>; // Prop 추가
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose, onSaveFulfillment }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('');
  const [isSaving, setIsSaving] = useState(false); // 저장 로딩 상태
  const toastContext = useContext(ToastContext);

  useEffect(() => {
    if (order) {
      setTrackingNumber(order.fulfillment.trackingNumber || '');
      setShippingCarrier(order.fulfillment.shippingCarrier || (order.fulfillment.shippingCarriersAvailable.length > 0 ? order.fulfillment.shippingCarriersAvailable[0] : ''));
    }
    setIsSaving(false); // 모달 열릴 때마다 초기화
  }, [order, isOpen]); // isOpen 추가하여 모달 다시 열릴 때 상태 초기화

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) { // 저장 중에는 Esc로 닫히지 않도록
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      modalRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, isSaving]);


  if (!isOpen || !order) return null;

  const handleSaveTracking = async () => {
    if (!shippingCarrier || !trackingNumber) {
        toastContext?.addToast('택배사와 송장번호를 모두 입력해주세요.', 'warning');
        return;
    }
    setIsSaving(true);
    const success = await onSaveFulfillment(order.id, shippingCarrier, trackingNumber);
    setIsSaving(false);
    if (success) {
      // onClose(); // 성공 시 모달 닫기 (선택적)
    }
  };
  
  const modalTitleId = `order-detail-title-${order.id}`;

  return (
    <div className="modal-overlay" onClick={isSaving ? undefined : onClose} role="presentation">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1} 
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        aria-describedby="order-detail-description" 
      >
        <div className="modal-header">
          <h3 id={modalTitleId}>주문 상세 정보 (BOH: {order.id})</h3>
          <button onClick={isSaving ? undefined : onClose} className="modal-close-button" aria-label="Close modal" disabled={isSaving}>
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body" id="order-detail-description">
          {/* ... 다른 섹션들은 동일 ... */}
          <section className="modal-section" aria-labelledby={`order-info-heading-${order.id}`}>
            <h4 id={`order-info-heading-${order.id}`}>기본 정보</h4>
            <p><strong>플랫폼:</strong> {order.platform} ({order.platformOrderId})</p>
            <p><strong>주문일시:</strong> {order.dateTime}</p>
            <p><strong>처리 상태:</strong> <span className={getStatusClassName(order.status)}>{order.status}</span></p>
          </section>

          <section className="modal-section" aria-labelledby={`customer-info-heading-${order.id}`}>
            <h4 id={`customer-info-heading-${order.id}`}>주문자 정보</h4>
            <p><strong>이름:</strong> {order.customer.name}</p>
            <p><strong>연락처:</strong> {order.customer.contact}</p>
            <p><strong>배송지:</strong> ({order.customer.zipCode}) {order.customer.address}</p>
          </section>

          <section className="modal-section" aria-labelledby={`product-list-heading-${order.id}`}>
            <h4 id={`product-list-heading-${order.id}`}>상품 목록</h4>
            <table className="modal-products-table" aria-label="Products in this order">
              <thead>
                <tr><th>상품명</th><th>옵션</th><th>수량</th><th>단가</th><th>합계</th></tr>
              </thead>
              <tbody>
                {order && Array.isArray(order.products) ? order.products.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td><td>{p.option}</td><td>{p.quantity}</td>
                    <td>{p.unitPrice.toLocaleString()}원</td><td>{p.subtotal.toLocaleString()}원</td>
                  </tr>
                )) : null}
              </tbody>
              <tfoot>
                <tr><td colSpan={4} style={{ textAlign: 'right' }}><strong>총 결제 금액:</strong></td><td><strong>{order.totalAmount.toLocaleString()}원</strong></td></tr>
              </tfoot>
            </table>
          </section>
          <section className="modal-section" aria-labelledby={`fulfillment-info-heading-${order.id}`}>
            <h4 id={`fulfillment-info-heading-${order.id}`}>배송 처리</h4>
            <p><strong>3PL 전송 상태:</strong> {order.fulfillment.threePLStatus}</p>
            <div className="form-group">
              <label htmlFor={`shipping-carrier-${order.id}`}>택배사:</label>
              <select
                id={`shipping-carrier-${order.id}`}
                value={shippingCarrier}
                onChange={(e) => setShippingCarrier(e.target.value)}
                disabled={isSaving}
              >
                <option value="">택배사 선택</option>
                {order && order.fulfillment && Array.isArray(order.fulfillment.shippingCarriersAvailable) ? order.fulfillment.shippingCarriersAvailable.map(c => <option key={c} value={c}>{c}</option>) : null}
                {!order.fulfillment.shippingCarriersAvailable.includes("기타직접입력") && <option value="기타직접입력">기타직접입력</option>}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor={`tracking-number-${order.id}`}>송장번호:</label>
              <input
                type="text"
                id={`tracking-number-${order.id}`}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="송장번호 입력"
                disabled={isSaving}
              />
            </div>
            <button onClick={handleSaveTracking} className="action-button primary" disabled={isSaving}>
              <SaveIcon /> {isSaving ? '저장 중...' : '송장 저장/수정'}
            </button>
          </section>

          <section className="modal-section" aria-labelledby={`history-heading-${order.id}`}>
            <h4 id={`history-heading-${order.id}`}>주문 처리 이력</h4>
            <ul className="order-history-list">
              {order && Array.isArray(order.history) ? order.history.map((h, index) => <li key={index}>{h.timestamp} - {h.event}</li>) : null}
            </ul>
          </section>
        </div>
        <div className="modal-footer">
          <button onClick={isSaving ? undefined : onClose} className="action-button" disabled={isSaving}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
