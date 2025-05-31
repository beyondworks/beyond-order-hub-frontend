import React, { useContext } from 'react';
import { ToastContext } from '../../../contexts/ToastContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const context = useContext(ToastContext);

  if (!context) return null;
  const { toasts } = context;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
