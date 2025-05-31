import React, { useState, useEffect, useRef } from 'react';
import { ReturnRequest, User } from '../../types';
import { CloseIcon, SaveIcon, RefreshIcon } from '../../assets/icons';

const availableReturnStatuses: ReturnRequest['status'][] = [
  '요청접수', '수거지시', '수거중', '수거완료', '검수중', '처리중', '완료', '반려', '철회'
];
const availableShippingCarriers = ['CJ대한통운', '롯데택배', '한진택배', '우체국택배', '로젠택배', '기타'];

interface ReturnDetailModalProps {
  returnRequest: ReturnRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRequest: ReturnRequest) => Promise<boolean>; // Promise 반환
  currentUser: User | null;
  onRequestReturnPickup: (returnRequestId: string) => Promise<boolean>; // Promise 반환
}

const ReturnDetailModal: React.FC<ReturnDetailModalProps> = ({ 
    returnRequest, 
    isOpen, 
    onClose, 
    onSave, 
    currentUser,
    onRequestReturnPickup 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [editableRequest, setEditableRequest] = useState<ReturnRequest | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRequestingPickup, setIsRequestingPickup] = useState(false);

  useEffect(() => {
    if (returnRequest) {
      setEditableRequest({ ...returnRequest });
    } else {
      setEditableRequest(null);
    }
    setIsSaving(false);
    setIsRequestingPickup(false);
  }, [returnRequest, isOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving && !isRequestingPickup) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      modalRef.current?.focus();
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, isSaving, isRequestingPickup]);

  if (!isOpen || !editableRequest) return null;

  const canEdit = currentUser?.role === 'master';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableRequest(prev => {
      if (!prev) return null;
      if (name.startsWith('returnShippingInfo.')) {
        const field = name.split('.')[1] as keyof NonNullable<ReturnRequest['returnShippingInfo']>;
        return {
          ...prev,
          returnShippingInfo: {
            ...(prev.returnShippingInfo || {}),
            [field]: field === 'cost' ? parseFloat(value) || 0 : value,
          },
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSave = async () => {
    if (editableRequest) {
      setIsSaving(true);
      await onSave(editableRequest);
      setIsSaving(false);
      // 모달 닫기는 onSave 성공 시 App.tsx에서 처리 (이미 그렇게 되어 있음)
    }
  };

  const handlePickupRequest = async () => {
    if (editableRequest) {
        setIsRequestingPickup(true);
        await onRequestReturnPickup(editableRequest.id);
        setIsRequestingPickup(false);
        // 상태 업데이트는 onRequestReturnPickup 핸들러에서 처리 후 모달에 반영 (setSelectedReturnForModal)
    }
  };
  
  const modalTitleId = `return-detail-title-${editableRequest.id}`;
  const showPickupButton = canEdit && editableRequest.status === '수거지시';
  const isProcessing = isSaving || isRequestingPickup;

  return (
    <div className="modal-overlay" onClick={isProcessing ? undefined : onClose}>
      <div
        className="modal-content large" 
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
      >
        <div className="modal-header">
          <h3 id={modalTitleId}>{editableRequest.type} 상세 정보 (요청 ID: {editableRequest.id})</h3>
          <button onClick={isProcessing ? undefined : onClose} className="modal-close-button" aria-label="Close modal" disabled={isProcessing}>
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body">
          {/* ... 다른 섹션 동일 ... */}
          <section className="modal-section">
            <h4>기본 정보</h4>
            <p><strong>주문번호 (BOH):</strong> {editableRequest.orderId}</p>
            <p><strong>플랫폼 주문번호:</strong> {editableRequest.platformOrderId}</p>
            <p><strong>플랫폼:</strong> {editableRequest.platform}</p>
            <p><strong>고객명:</strong> {editableRequest.customerName}</p>
            <p><strong>요청일:</strong> {editableRequest.requestedDate}</p>
          </section>

          <section className="modal-section">
            <h4>요청 상세</h4>
            <p><strong>요청 유형:</strong> {editableRequest.type}</p>
            <p><strong>사유:</strong> {editableRequest.reason}</p>
            <div className="form-group">
              <label htmlFor="return-status">처리 상태:</label>
              {canEdit ? (
                <select 
                    id="return-status" 
                    name="status" 
                    value={editableRequest.status} 
                    onChange={handleChange}
                    disabled={!canEdit || isProcessing}
                >
                  {availableReturnStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <p>{editableRequest.status}</p>
              )}
            </div>
             {showPickupButton && (
                <div className="form-group" style={{marginTop: '15px'}}>
                    <button 
                        type="button" 
                        onClick={handlePickupRequest} 
                        className="action-button"
                        title="3PL에 반품 수거를 자동으로 요청합니다 (시뮬레이션)"
                        disabled={isProcessing}
                    >
                        <RefreshIcon /> {isRequestingPickup ? '접수 중...' : '물류사 자동 수거 접수'}
                    </button>
                </div>
            )}
          </section>

          <section className="modal-section">
            <h4>대상 상품</h4>
            <table className="modal-products-table">
              <thead><tr><th>상품명</th><th>옵션</th><th>수량</th></tr></thead>
              <tbody>
                {editableRequest.items.map((item, index) => (
                  <tr key={`${item.productId}-${index}`}><td>{item.productName}</td><td>{item.option}</td><td>{item.quantity}</td></tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 반품 배송 정보, 교환 재배송 정보, 관리자 메모 섹션 (handleChange, disabled 속성 추가) */}
           {editableRequest.type === '반품' && ( 
            <section className="modal-section">
              <h4>반품 배송 정보</h4>
              <div className="form-group">
                <label htmlFor="return-carrier">반품 택배사:</label>
                {canEdit ? (
                  <select 
                    id="return-carrier" 
                    name="returnShippingInfo.carrier" 
                    value={editableRequest.returnShippingInfo?.carrier || ''} 
                    onChange={handleChange}
                    disabled={!canEdit || isProcessing}
                  >
                    <option value="">택배사 선택</option>
                    {availableShippingCarriers.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (<p>{editableRequest.returnShippingInfo?.carrier || 'N/A'}</p>)}
              </div>
              <div className="form-group">
                <label htmlFor="return-trackingNumber">반품 송장번호:</label>
                <input type="text" id="return-trackingNumber" name="returnShippingInfo.trackingNumber" value={editableRequest.returnShippingInfo?.trackingNumber || ''} onChange={handleChange} placeholder="반품 송장번호 입력" disabled={!canEdit || isProcessing} />
              </div>
               <div className="form-group">
                <label htmlFor="return-cost">반품 배송비 (판매자 부담시):</label>
                <input type="number" id="return-cost" name="returnShippingInfo.cost" value={editableRequest.returnShippingInfo?.cost === undefined ? '' : editableRequest.returnShippingInfo.cost} onChange={handleChange} placeholder="금액 입력" disabled={!canEdit || isProcessing} />
              </div>
            </section>
          )}
           {editableRequest.type === '교환' && ( 
            <section className="modal-section">
              <h4>교환 재배송 정보</h4>
              <div className="form-group">
                <label htmlFor="exchange-carrier">재배송 택배사:</label>
                 {canEdit ? (
                  <select id="exchange-carrier" name="returnShippingInfo.carrier" value={editableRequest.returnShippingInfo?.carrier || ''} onChange={handleChange} disabled={!canEdit || isProcessing}>
                    <option value="">택배사 선택</option>
                    {availableShippingCarriers.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (<p>{editableRequest.returnShippingInfo?.carrier || 'N/A'}</p>)}
              </div>
              <div className="form-group">
                <label htmlFor="exchange-trackingNumber">재배송 송장번호:</label>
                <input type="text" id="exchange-trackingNumber" name="returnShippingInfo.trackingNumber" value={editableRequest.returnShippingInfo?.trackingNumber || ''} onChange={handleChange} placeholder="재배송 송장번호 입력" disabled={!canEdit || isProcessing}/>
              </div>
            </section>
          )}
          <section className="modal-section">
            <h4>관리자 메모</h4>
            <div className="form-group">
              <textarea name="notes" value={editableRequest.notes || ''} onChange={handleChange} rows={3} placeholder="관리자 메모 입력..." disabled={!canEdit || isProcessing}/>
            </div>
          </section>

        </div>
        <div className="modal-footer">
          {canEdit && (
            <button onClick={handleSave} className="action-button primary" disabled={isProcessing}>
              <SaveIcon /> {isSaving ? '저장 중...' : '저장'}
            </button>
          )}
          <button onClick={isProcessing ? undefined : onClose} className="action-button" disabled={isProcessing}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnDetailModal;
