import React, { useState, useEffect, useRef } from 'react';
import { Order } from '../../types';
import { CloseIcon, TruckIcon } from '../../assets/icons'; // SaveIcon not typically used here, TruckIcon is better

interface ShippingProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderToShip: Order | null;
  onProcessShipment: (orderId: string, carrier: string, trackingNumber: string) => Promise<boolean>; // Promise
}

const availableShippingCarriers = ['CJ대한통운', '롯데택배', '한진택배', '우체국택배', '로젠택배', '기타직접입력'];

const ShippingProcessModal: React.FC<ShippingProcessModalProps> = ({
  isOpen,
  onClose,
  orderToShip,
  onProcessShipment,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [carrier, setCarrier] = useState<string>('');
  const [customCarrier, setCustomCarrier] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && orderToShip) {
      setCarrier(orderToShip.shippingInfo?.carrier || availableShippingCarriers[0]);
      setCustomCarrier(
        (orderToShip.shippingInfo?.carrier && !availableShippingCarriers.slice(0,-1).includes(orderToShip.shippingInfo.carrier)) 
        ? orderToShip.shippingInfo.carrier 
        : ''
      );
      setTrackingNumber(orderToShip.shippingInfo?.trackingNumber || '');
      setErrors({});
      setIsProcessing(false);
    }
  }, [isOpen, orderToShip]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isProcessing) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      modalRef.current?.focus();
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, isProcessing]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const finalCarrier = carrier === '기타직접입력' ? customCarrier : carrier;

    if (!finalCarrier.trim()) newErrors.carrier = '택배사를 선택하거나 입력해주세요.';
    if (!trackingNumber.trim()) newErrors.trackingNumber = '송장번호를 입력해주세요.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !orderToShip) return;

    setIsProcessing(true);
    const finalCarrier = carrier === '기타직접입력' ? customCarrier : carrier;
    await onProcessShipment(orderToShip.id, finalCarrier, trackingNumber);
    setIsProcessing(false);
    // 모달 닫기는 App.tsx의 onProcessShipment 성공 시 처리
  };

  if (!isOpen || !orderToShip) return null;

  const modalTitleId = `shipping-process-title-${orderToShip.id}`;

  return (
    <div className="modal-overlay" onClick={isProcessing ? undefined : onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
      >
        <div className="modal-header">
          <h3 id={modalTitleId}>발송 처리 (주문 ID: {orderToShip.id})</h3>
          <button onClick={isProcessing ? undefined : onClose} className="modal-close-button" aria-label="Close modal" disabled={isProcessing}>
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p><strong>주문 요약:</strong> {orderToShip.platform} / {orderToShip.customerName} / {orderToShip.productSummary} ({orderToShip.quantity}개)</p>
            <div className="form-group">
              <label htmlFor="shipping-carrier">택배사:</label>
              <select id="shipping-carrier" value={carrier} 
                onChange={(e) => {
                  setCarrier(e.target.value);
                  if (e.target.value !== '기타직접입력') setCustomCarrier('');
                }}
                disabled={isProcessing}
              >
                {availableShippingCarriers.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {carrier === '기타직접입력' && (
              <div className="form-group">
                <label htmlFor="custom-shipping-carrier">택배사명 직접입력:</label>
                <input type="text" id="custom-shipping-carrier" value={customCarrier} onChange={(e) => setCustomCarrier(e.target.value)} placeholder="택배사명 입력" disabled={isProcessing}/>
              </div>
            )}
            {errors.carrier && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.carrier}</p>}

            <div className="form-group">
              <label htmlFor="tracking-number">송장번호:</label>
              <input type="text" id="tracking-number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="송장번호 입력" disabled={isProcessing}/>
              {errors.trackingNumber && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.trackingNumber}</p>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="action-button primary" disabled={isProcessing}>
              <TruckIcon /> {isProcessing ? '처리 중...' : '저장 및 발송 처리'}
            </button>
            <button type="button" onClick={isProcessing ? undefined : onClose} className="action-button" disabled={isProcessing}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingProcessModal;
