import React, { useState, useEffect } from 'react';
import './QRCodeGenerator.css';

const QRCodeGenerator = () => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Try to load today's QR code on mount
  useEffect(() => {
    loadTodayQRCode();
  }, []);

  const loadTodayQRCode = async () => {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch('/api/attendance/qr/today', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data);
        setError(null);
      } else {
        // No QR code for today yet
        setQrCode(null);
      }
    } catch (err) {
      console.log('No QR code for today yet');
      setQrCode(null);
    }
  };

  const generateQR = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch('/api/attendance/qr/generate', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể tạo mã QR');
      }

      const data = await response.json();
      setQrCode(data);
    } catch (err) {
      setError(err.message);
      console.error('Error generating QR code:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="qr-generator-container">
      <div className="qr-generator-card">
        <div className="qr-header">
          <h3>📱 Mã QR Chấm Công</h3>
          <p className="qr-subtitle">Nhân viên quét mã để chấm công vào ca</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <strong>Lỗi:</strong> {error}
          </div>
        )}

        {!qrCode && !loading && (
          <div className="qr-empty-state">
            <div className="empty-icon">📋</div>
            <p>Chưa có mã QR cho hôm nay</p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={generateQR}
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : '🎯 Tạo mã QR hôm nay'}
            </button>
          </div>
        )}

        {qrCode && (
          <div className="qr-display">
            <div className="qr-info-banner">
              <div className="qr-date">
                <span className="label">Ngày:</span>
                <span className="value">{formatDate(qrCode.createdDate)}</span>
              </div>
              <div className="qr-expires">
                <span className="label">Hết hạn:</span>
                <span className="value">{formatTime(qrCode.expiresAt)}</span>
              </div>
            </div>

            <div className="qr-code-wrapper">
              <img 
                src={qrCode.qrCodeImage} 
                alt="QR Code" 
                className="qr-code-image"
              />
            </div>

            <div className="qr-instructions">
              <h4>📖 Hướng dẫn sử dụng:</h4>
              <ol>
                <li>Nhân viên mở camera điện thoại hoặc app quét QR</li>
                <li>Quét mã QR này</li>
                <li>Đăng nhập nếu chưa đăng nhập</li>
                <li>Hệ thống tự động ghi nhận thời gian chấm công</li>
              </ol>
            </div>

            <div className="qr-actions">
              <button 
                className="btn btn-outline-primary"
                onClick={loadTodayQRCode}
              >
                🔄 Làm mới
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => window.print()}
              >
                🖨️ In mã QR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;
