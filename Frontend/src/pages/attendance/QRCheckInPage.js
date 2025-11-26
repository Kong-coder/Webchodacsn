import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './QRCheckInPage.css';

const QRCheckInPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Đang xử lý chấm công...');
  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Mã QR không hợp lệ. Vui lòng quét lại.');
      return;
    }

    // Check if user is logged in
    const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    
    if (!userToken) {
      // Redirect to login with return URL
      const returnUrl = `/attendance/checkin?token=${token}`;
      navigate(`/LoginPage?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // User is logged in, proceed with check-in
    performCheckIn(token, userToken);
  }, [searchParams, navigate]);

  const performCheckIn = async (token, userToken) => {
    try {
      const response = await fetch(`/api/attendance/qr/checkin?token=${token}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Chấm công thành công!');
        setAttendanceData(data);
        
        // Redirect to calendar after 3 seconds
        setTimeout(() => {
          navigate('/Calendar');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Chấm công thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setStatus('error');
      setMessage('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="checkin-page">
      <div className="checkin-container">
        <div className={`checkin-card ${status}`}>
          {status === 'processing' && (
            <div className="checkin-content">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h2>{message}</h2>
              <p>Vui lòng đợi trong giây lát...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="checkin-content">
              <div className="success-icon">✅</div>
              <h2>{message}</h2>
              
              {attendanceData && (
                <div className="attendance-details">
                  <div className="detail-row">
                    <span className="label">Ngày:</span>
                    <span className="value">{formatDate(attendanceData.date)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Giờ vào:</span>
                    <span className="value highlight">{formatTime(attendanceData.checkInTime)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Trạng thái:</span>
                    <span className="badge bg-success">Đã chấm công vào</span>
                  </div>
                </div>
              )}

              <p className="redirect-message">
                Đang chuyển đến trang lịch làm việc...
              </p>

              <button 
                className="btn btn-primary"
                onClick={() => navigate('/Calendar')}
              >
                Xem lịch làm việc ngay
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="checkin-content">
              <div className="error-icon">❌</div>
              <h2>Chấm công thất bại</h2>
              <p className="error-message">{message}</p>
              
              <div className="error-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/Calendar')}
                >
                  Về trang chủ
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCheckInPage;
