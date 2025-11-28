import React, { useState, useEffect } from 'react';
import '../styles/Toast.css';

let toastId = 0;
let addToastCallback = null;

// Global function to show toast from anywhere
export const showToast = (message, type = 'success') => {
  console.log('showToast called:', message, type, 'callback exists:', !!addToastCallback);
  if (addToastCallback) {
    addToastCallback(message, type);
  } else {
    console.error('Toast callback not registered yet!');
  }
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Register the callback
    addToastCallback = (message, type) => {
      const id = toastId++;
      const newToast = { id, message, type };
      console.log('Adding toast to state:', newToast);
      setToasts(prev => {
        const updated = [...prev, newToast];
        console.log('Updated toasts array:', updated);
        return updated;
      });

      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 5000);
    };

    console.log('Toast callback registered');
    return () => {
      addToastCallback = null;
      console.log('Toast callback unregistered');
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  console.log('Rendering ToastContainer, toasts count:', toasts.length);
  
  return (
    <div 
      className="toast-container"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}
    >
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            minWidth: '300px',
            maxWidth: '400px',
            padding: '16px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            animation: 'slideIn 0.3s ease-out',
            pointerEvents: 'all',
            cursor: 'pointer',
            borderLeft: `4px solid ${
              toast.type === 'success' ? '#10b981' :
              toast.type === 'error' ? '#ef4444' :
              toast.type === 'warning' ? '#f59e0b' : '#3b82f6'
            }`
          }}
        >
          <div 
            className="toast-icon"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              flexShrink: 0,
              marginRight: '12px',
              background: toast.type === 'success' ? '#d1fae5' :
                         toast.type === 'error' ? '#fee2e2' :
                         toast.type === 'warning' ? '#fef3c7' : '#dbeafe',
              color: toast.type === 'success' ? '#10b981' :
                    toast.type === 'error' ? '#ef4444' :
                    toast.type === 'warning' ? '#f59e0b' : '#3b82f6'
            }}
          >
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'info' && 'ℹ'}
          </div>
          <div className="toast-content" style={{ flex: 1, minWidth: 0 }}>
            <div 
              className="toast-title"
              style={{
                fontWeight: 600,
                fontSize: '14px',
                color: '#1f2937',
                marginBottom: '4px'
              }}
            >
              {toast.type === 'success' && 'Thành công'}
              {toast.type === 'error' && 'Lỗi'}
              {toast.type === 'warning' && 'Cảnh báo'}
              {toast.type === 'info' && 'Thông báo'}
            </div>
            <div 
              className="toast-message"
              style={{
                fontSize: '13px',
                color: '#6b7280',
                wordWrap: 'break-word'
              }}
            >
              {toast.message}
            </div>
          </div>
          <button 
            className="toast-close" 
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            style={{
              width: '24px',
              height: '24px',
              border: 'none',
              background: 'transparent',
              color: '#9ca3af',
              fontSize: '24px',
              lineHeight: 1,
              cursor: 'pointer',
              padding: 0,
              marginLeft: '8px',
              flexShrink: 0
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
