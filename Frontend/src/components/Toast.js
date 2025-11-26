import React, { useState, useEffect } from 'react';
import '../styles/Toast.css';

let toastId = 0;
let addToastCallback = null;

// Global function to show toast from anywhere
export const showToast = (message, type = 'success') => {
  if (addToastCallback) {
    addToastCallback(message, type);
  }
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Register the callback
    addToastCallback = (message, type) => {
      const id = toastId++;
      const newToast = { id, message, type };
      setToasts(prev => [...prev, newToast]);

      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 5000);
    };

    return () => {
      addToastCallback = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'info' && 'ℹ'}
          </div>
          <div className="toast-content">
            <div className="toast-title">
              {toast.type === 'success' && 'Thành công'}
              {toast.type === 'error' && 'Lỗi'}
              {toast.type === 'warning' && 'Cảnh báo'}
              {toast.type === 'info' && 'Thông báo'}
            </div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
