import React, { useEffect, useRef } from 'react';
import { ErrorLogEntry } from '../../types';
import { CloseIcon } from '../../assets/icons';

interface ErrorAnalysisModalProps {
  errorEntry: ErrorLogEntry | null;
  analysisResult: string | null;
  isLoading: boolean;
  analysisError: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const ErrorAnalysisModal: React.FC<ErrorAnalysisModalProps> = ({
  errorEntry,
  analysisResult,
  isLoading,
  analysisError,
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalTitleId = errorEntry ? `error-analysis-title-${errorEntry.id}` : 'error-analysis-title';

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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
  }, [isOpen, onClose]);

  if (!isOpen || !errorEntry) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={modalTitleId}
        aria-describedby="error-analysis-description"
      >
        <div className="modal-header">
          <h3 id={modalTitleId}>AI 오류 분석 (ID: {errorEntry.id})</h3>
          <button onClick={onClose} className="modal-close-button" aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body" id="error-analysis-description">
          <section className="modal-section" aria-labelledby={`error-message-heading-${errorEntry.id}`}>
            <h4 id={`error-message-heading-${errorEntry.id}`}>오류 메시지 원문</h4>
            <p style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', border: '1px solid #e9ecef' }}>
                {errorEntry.message}
            </p>
          </section>
          
          <section className="modal-section" aria-labelledby={`ai-analysis-heading-${errorEntry.id}`}>
            <h4 id={`ai-analysis-heading-${errorEntry.id}`}>AI 분석 결과</h4>
            {isLoading && <p>AI 분석 중입니다... 잠시만 기다려 주세요.</p>}
            {analysisError && <p style={{ color: 'red' }}>오류 분석 중 문제가 발생했습니다: {analysisError}</p>}
            {analysisResult && !isLoading && (
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {analysisResult}
              </div>
            )}
          </section>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="action-button">닫기</button>
        </div>
      </div>
    </div>
  );
};

export default ErrorAnalysisModal;