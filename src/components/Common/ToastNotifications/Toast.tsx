import React, { useEffect, useContext } from 'react';
import { ToastContext } from '../../../contexts/ToastContext';
import { ToastMessage } from '../../../types';
import { CloseIcon, SuccessIcon, ErrorIcon, InfoIcon, WarningIcon } from '../../../assets/icons'; // 아이콘 임포트

interface ToastProps {
  toast: ToastMessage;
}

const Toast: React.FC<ToastProps> = ({ toast }) => {
  const context = useContext(ToastContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      context?.removeToast(toast.id);
    }, 5000); // 5초 후 자동 제거

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, context]);

  if (!context) return null;

  const { removeToast } = context;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'info':
        return <InfoIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return null;
    }
  };

  return (
    <div className={`toast toast-${toast.type}`} role="alert" aria-live="assertive" aria-atomic="true">
      <div className="toast-icon">
        {getIcon()}
      </div>
      <p className="toast-message">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="toast-close-button"
        aria-label="Close notification"
      >
        <CloseIcon />
      </button>
    </div>
  );
};

export default Toast;
