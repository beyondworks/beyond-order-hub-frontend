import React, { useState, useEffect, useRef } from 'react';
import { Product, StockMovement, StockMovementType } from '../../types'; // User type not needed here
import { CloseIcon, SaveIcon } from '../../assets/icons';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStockMovement: (newMovement: Omit<StockMovement, 'id' | 'currentStockAfterMovement'>) => Promise<boolean>; // Promise
  products: Product[];
}

const availableMovementTypes: StockMovementType[] = ['입고', '출고', '조정'];

const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  onAddStockMovement,
  products,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [type, setType] = useState<StockMovementType>('입고');
  const [quantityChanged, setQuantityChanged] = useState<number | ''>('');
  const [reason, setReason] = useState<string>('');
  const [movementDate, setMovementDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [memo, setMemo] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedProductId(products.length > 0 ? products[0].id : '');
      setType('입고');
      setQuantityChanged('');
      setReason('');
      setMovementDate(new Date().toISOString().split('T')[0]);
      setMemo('');
      setErrors({});
      setIsSaving(false);
    }
  }, [isOpen, products]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      modalRef.current?.focus();
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, isSaving]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!selectedProductId) newErrors.selectedProductId = '상품을 선택해주세요.';
    if (quantityChanged === '' || Number.isNaN(Number(quantityChanged)) || Number(quantityChanged) === 0) {
      newErrors.quantityChanged = '변경 수량을 올바르게 입력해주세요 (0 제외).';
    }
    if (!reason.trim()) newErrors.reason = '변동 사유를 입력해주세요.';
    if (!movementDate) newErrors.movementDate = '변동일을 선택해주세요.';
    
    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (type === '출고' && selectedProduct && Number(quantityChanged) > selectedProduct.stockQuantity) {
        newErrors.quantityChanged = `출고 수량(${quantityChanged})이 현재고(${selectedProduct.stockQuantity})를 초과할 수 없습니다.`;
    } else if (type === '조정' && selectedProduct && Number(quantityChanged) < 0 && Math.abs(Number(quantityChanged)) > selectedProduct.stockQuantity ) {
        newErrors.quantityChanged = `차감 조정 수량(${Math.abs(Number(quantityChanged))})이 현재고(${selectedProduct.stockQuantity})를 초과할 수 없습니다.`;
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (!selectedProduct) {
        setErrors(prev => ({...prev, selectedProductId: '선택된 상품 정보를 찾을 수 없습니다.'}));
        setIsSaving(false);
        return;
    }
    
    let actualQuantityChanged = Number(quantityChanged);
    if (type === '출고' || (type === '조정' && actualQuantityChanged < 0)) {
      actualQuantityChanged = -Math.abs(actualQuantityChanged);
    } else if (type === '입고' || (type === '조정' && actualQuantityChanged > 0)) {
      actualQuantityChanged = Math.abs(actualQuantityChanged);
    }

    const newMovement: Omit<StockMovement, 'id' | 'currentStockAfterMovement'> = {
      productId: selectedProduct.id,
      productCode: selectedProduct.productCode,
      productName: selectedProduct.name,
      type,
      quantityChanged: actualQuantityChanged,
      reason,
      movementDate: new Date(movementDate).toISOString(),
      memo,
    };
    await onAddStockMovement(newMovement);
    setIsSaving(false);
    // 모달 닫기는 App.tsx에서 처리
  };

  if (!isOpen) return null;
  const modalTitleId = 'stock-movement-modal-title';

  return (
    <div className="modal-overlay" onClick={isSaving ? undefined : onClose}>
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
          <h3 id={modalTitleId}>새 입/출고 기록</h3>
          <button onClick={isSaving ? undefined : onClose} className="modal-close-button" aria-label="Close modal" disabled={isSaving}>
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="sm-product">상품:</label>
              <select id="sm-product" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} style={{width: '100%'}} disabled={isSaving}>
                <option value="" disabled>상품 선택</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.productCode}) - 현재고: {p.stockQuantity}</option>
                ))}
              </select>
              {errors.selectedProductId && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.selectedProductId}</p>}
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 15px'}}>
                <div className="form-group">
                <label htmlFor="sm-type">유형:</label>
                <select id="sm-type" value={type} onChange={(e) => setType(e.target.value as StockMovementType)} disabled={isSaving}>
                    {availableMovementTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                </div>
                <div className="form-group">
                <label htmlFor="sm-quantity">변경 수량:</label>
                <input type="number" id="sm-quantity" value={quantityChanged} onChange={(e) => setQuantityChanged(e.target.value === '' ? '' : parseInt(e.target.value, 10))} placeholder={type === '입고' ? "입고 수량 (양수)" : (type === '출고' ? "출고 수량 (양수)" : "조정 수량 (양수/음수)")} disabled={isSaving}/>
                {errors.quantityChanged && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.quantityChanged}</p>}
                </div>
            </div>
            <div className="form-group">
              <label htmlFor="sm-reason">사유:</label>
              <input type="text" id="sm-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="예: 정기 입고, 판매 (주문번호), 재고실사차이" disabled={isSaving}/>
              {errors.reason && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.reason}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="sm-date">변동일:</label>
              <input type="date" id="sm-date" value={movementDate} onChange={(e) => setMovementDate(e.target.value)} disabled={isSaving}/>
              {errors.movementDate && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.movementDate}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="sm-memo">메모 (선택):</label>
              <textarea id="sm-memo" value={memo} onChange={(e) => setMemo(e.target.value)} rows={2} disabled={isSaving}></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="action-button primary" disabled={isSaving}>
              <SaveIcon /> {isSaving ? '저장 중...' : '기록 저장'}
            </button>
            <button type="button" onClick={isSaving ? undefined : onClose} className="action-button" disabled={isSaving}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMovementModal;
