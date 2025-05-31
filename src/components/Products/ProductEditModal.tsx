import React, { useState, useEffect, useRef } from 'react';
import { Product, User, ProductStatus } from '../../types';
import { CloseIcon, SaveIcon } from '../../assets/icons'; // Removed ToggleOn/Off as status is a select

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  onAddProduct: (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>; // Promise
  onUpdateProduct: (updatedProduct: Product) => Promise<boolean>; // Promise
  currentUser: User | null;
  onToggleStatus: (productId: string, newStatus: ProductStatus) => void; // Kept for direct status change from table, not modal save
}

const availableStatuses: ProductStatus[] = ['판매중', '품절', '숨김', '판매중지'];

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onAddProduct,
  onUpdateProduct,
  currentUser,
  // onToggleStatus // Not used directly for save, status is part of productData
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [productData, setProductData] = useState<Partial<Product>>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setProductData({ ...productToEdit });
      } else {
        setProductData({
          productCode: '', name: '', category: '', sellingPrice: 0,
          stockQuantity: 0, status: '판매중', purchasePrice: undefined,
          safeStockQuantity: undefined, imageUrl: '', description: '',
        });
      }
      setErrors({});
      setIsSaving(false);
    }
  }, [isOpen, productToEdit]);

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
    if (!productData.productCode?.trim()) newErrors.productCode = '상품코드를 입력해주세요.';
    if (!productData.name?.trim()) newErrors.name = '상품명을 입력해주세요.';
    if (productData.sellingPrice === undefined || productData.sellingPrice < 0) newErrors.sellingPrice = '판매가를 올바르게 입력해주세요.';
    if (productData.stockQuantity === undefined || productData.stockQuantity < 0) newErrors.stockQuantity = '재고 수량을 올바르게 입력해주세요.';
    if (productData.purchasePrice !== undefined && productData.purchasePrice < 0) newErrors.purchasePrice = '매입가를 올바르게 입력해주세요 (선택).';
    if (productData.safeStockQuantity !== undefined && productData.safeStockQuantity < 0) newErrors.safeStockQuantity = '안전 재고를 올바르게 입력해주세요 (선택).';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | undefined = value;
    if (type === 'number') {
      processedValue = value === '' ? undefined : parseFloat(value);
    } else if (name === 'status') {
      processedValue = value as ProductStatus;
    }
    setProductData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    const finalProductData = { ...productData };
    finalProductData.sellingPrice = finalProductData.sellingPrice ?? 0;
    finalProductData.stockQuantity = finalProductData.stockQuantity ?? 0;
    finalProductData.status = finalProductData.status ?? '판매중';

    let success = false;
    if (productToEdit) {
      success = await onUpdateProduct(finalProductData as Product);
    } else {
      success = await onAddProduct(finalProductData as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setIsSaving(false);
    // 모달 닫기는 성공 시 App.tsx에서 처리
  };

  if (!isOpen || !currentUser || currentUser.role !== 'master') return null;

  const modalTitleId = productToEdit ? `product-edit-title-${productData.id}` : 'product-add-title';
  
  return (
    <div className="modal-overlay" onClick={isSaving ? undefined : onClose}>
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
          <h3 id={modalTitleId}>{productToEdit ? '상품 정보 수정' : '새 상품 등록'}</h3>
          <button onClick={isSaving ? undefined : onClose} className="modal-close-button" aria-label="Close modal" disabled={isSaving}>
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <div> {/* Column 1 */}
              <div className="form-group">
                <label htmlFor="product-code">상품코드 (SKU):</label>
                <input type="text" id="product-code" name="productCode" value={productData.productCode || ''} onChange={handleChange} disabled={isSaving} />
                {errors.productCode && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.productCode}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="product-name">상품명:</label>
                <input type="text" id="product-name" name="name" value={productData.name || ''} onChange={handleChange} disabled={isSaving} />
                {errors.name && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.name}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="product-category">카테고리:</label>
                <input type="text" id="product-category" name="category" value={productData.category || ''} onChange={handleChange} placeholder="예: 의류 > 상의" disabled={isSaving}/>
              </div>
              <div className="form-group">
                <label htmlFor="product-sellingPrice">판매가 (원):</label>
                <input type="number" id="product-sellingPrice" name="sellingPrice" value={productData.sellingPrice === undefined ? '' : productData.sellingPrice} onChange={handleChange} min="0" disabled={isSaving}/>
                {errors.sellingPrice && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.sellingPrice}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="product-stockQuantity">재고 수량 (개):</label>
                <input type="number" id="product-stockQuantity" name="stockQuantity" value={productData.stockQuantity === undefined ? '' : productData.stockQuantity} onChange={handleChange} min="0" disabled={isSaving}/>
                {errors.stockQuantity && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.stockQuantity}</p>}
              </div>
            </div>
            <div> {/* Column 2 */}
              <div className="form-group">
                <label htmlFor="product-status">판매 상태:</label>
                <select id="product-status" name="status" value={productData.status || '판매중'} onChange={handleChange} disabled={isSaving}>
                  {availableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="product-purchasePrice">매입가 (원, 선택사항):</label>
                <input type="number" id="product-purchasePrice" name="purchasePrice" value={productData.purchasePrice === undefined ? '' : productData.purchasePrice} onChange={handleChange} min="0" placeholder="입력 시 수익률 계산 등에 활용" disabled={isSaving}/>
                {errors.purchasePrice && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.purchasePrice}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="product-safeStockQuantity">안전 재고 수량 (개, 선택사항):</label>
                <input type="number" id="product-safeStockQuantity" name="safeStockQuantity" value={productData.safeStockQuantity === undefined ? '' : productData.safeStockQuantity} onChange={handleChange} min="0" placeholder="재고 부족 알림 기준" disabled={isSaving}/>
                {errors.safeStockQuantity && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.safeStockQuantity}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="product-imageUrl">이미지 URL (선택사항):</label>
                <input type="text" id="product-imageUrl" name="imageUrl" value={productData.imageUrl || ''} onChange={handleChange} placeholder="https://example.com/image.jpg" disabled={isSaving}/>
              </div>
               <div className="form-group">
                <label htmlFor="product-description">상품 설명 (선택사항):</label>
                <textarea id="product-description" name="description" value={productData.description || ''} onChange={handleChange} rows={2} disabled={isSaving}></textarea>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="action-button primary" disabled={isSaving}>
              <SaveIcon /> {isSaving ? (productToEdit ? '저장 중...' : '등록 중...') : (productToEdit ? '저장' : '상품 등록')}
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

export default ProductEditModal;
