import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { showToast } from '../../components/Toast';

const ServiceRating = () => {
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('rate'); // 'rate' or 'history'

  useEffect(() => {
    fetchCompletedAppointments();
    fetchRatingHistory();
  }, []);

  const fetchRatingHistory = async () => {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch('/api/danh-gia/my-ratings', { headers });
      if (!response.ok) throw new Error('Failed to fetch rating history');
      
      const data = await response.json();
      setRatingHistory(data || []);
    } catch (error) {
      console.error('Error fetching rating history:', error);
    }
  };

  const fetchCompletedAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch('/api/dat-lich/my-appointments', { headers });
      if (!response.ok) throw new Error('Failed to fetch appointments');
      
      const data = await response.json();
      
      // Filter appointments that are confirmed and have passed (can be rated)
      const now = new Date();
      const completed = data.filter(apt => {
        // Check if appointment is confirmed
        if (apt.trangThai !== 'DA_XAC_NHAN' && apt.trangThai !== 'HOAN_THANH') {
          return false;
        }
        
        // Check if appointment time has passed
        if (apt.thoiGianBatDau) {
          const appointmentTime = new Date(apt.thoiGianBatDau);
          return appointmentTime < now;
        }
        
        return false;
      });
      
      setCompletedAppointments(completed);
    } catch (error) {
      console.error('Error fetching completed appointments:', error);
      showToast('Không thể tải danh sách dịch vụ đã hoàn thành', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isServiceRated = (dichVuId) => {
    return ratingHistory.some(r => r.dichVuId === dichVuId);
  };

  const handleSubmitRating = async () => {
    if (!selectedAppointment) return;
    if (rating === 0) {
      showToast('Vui lòng chọn số sao đánh giá', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const requestBody = {
        dichVuId: selectedAppointment.dichVuId || selectedAppointment.comboId,
        diem: rating,
        noiDung: comment
      };

      const response = await fetch('/api/danh-gia', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error('Failed to submit rating');

      showToast('Cảm ơn bạn đã đánh giá!', 'success');
      setSelectedAppointment(null);
      setRating(0);
      setComment('');
      fetchCompletedAppointments();
      fetchRatingHistory();
    } catch (error) {
      console.error('Error submitting rating:', error);
      showToast('Không thể gửi đánh giá. Vui lòng thử lại', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (currentRating, isInteractive = false) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        style={{
          fontSize: isInteractive ? '2.5rem' : '1.5rem',
          cursor: isInteractive ? 'pointer' : 'default',
          color: star <= (isInteractive ? (hoveredStar || rating) : currentRating) ? '#ffc107' : '#e0e0e0',
          transition: 'all 0.2s'
        }}
        onClick={() => isInteractive && setRating(star)}
        onMouseEnter={() => isInteractive && setHoveredStar(star)}
        onMouseLeave={() => isInteractive && setHoveredStar(0)}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '80px' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="display-5 fw-bold mb-3" style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Đánh Giá Dịch Vụ
              </h1>
              <p className="text-muted">Chia sẻ trải nghiệm của bạn về các dịch vụ đã sử dụng</p>
            </div>

            {/* Tabs */}
            <div className="d-flex justify-content-center mb-4">
              <button
                className={`btn ${activeTab === 'rate' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                onClick={() => setActiveTab('rate')}
                style={{ borderRadius: '20px', minWidth: '150px' }}
              >
                Đánh giá dịch vụ
              </button>
              <button
                className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveTab('history')}
                style={{ borderRadius: '20px', minWidth: '150px' }}
              >
                Lịch sử đánh giá
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'rate' ? (
              completedAppointments.length === 0 ? (
                <div className="card shadow-sm border-0 text-center p-5" style={{ borderRadius: '15px' }}>
                  <div className="mb-4">
                    <span style={{ fontSize: '4rem' }}>📝</span>
                  </div>
                  <h4 className="mb-3">Chưa có dịch vụ nào để đánh giá</h4>
                  <p className="text-muted">Sau khi sử dụng dịch vụ, bạn có thể quay lại đây để đánh giá</p>
                </div>
              ) : (
                <div className="row g-4">
                  {completedAppointments.map((appointment) => {
                    const dichVuId = appointment.dichVuId || appointment.comboId;
                    const rated = isServiceRated(dichVuId);
                    
                    return (
                      <div key={appointment.id} className="col-md-6">
                        <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h5 className="card-title mb-1">
                                  {appointment.tenDichVu || appointment.tenCombo || 'Dịch vụ'}
                                </h5>
                                <small className="text-muted">
                                  {appointment.thoiGianBatDau && new Date(appointment.thoiGianBatDau).toLocaleDateString('vi-VN')}
                                </small>
                              </div>
                              {rated ? (
                                <span className="badge bg-success">✓ Đã đánh giá</span>
                              ) : (
                                <span className="badge bg-warning text-dark">Chờ đánh giá</span>
                              )}
                            </div>
                            
                            <div className="mb-3">
                              <div className="d-flex justify-content-between text-muted small mb-2">
                                <span>Mã lịch hẹn:</span>
                                <strong>#{appointment.id}</strong>
                              </div>
                              <div className="d-flex justify-content-between text-muted small">
                                <span>Tổng tiền:</span>
                                <strong className="text-success">{(appointment.tongTien || 0).toLocaleString('vi-VN')} ₫</strong>
                              </div>
                            </div>

                            <button 
                              className="btn btn-primary w-100" 
                              style={{ borderRadius: '10px' }}
                              onClick={() => setSelectedAppointment(appointment)}
                              disabled={rated}
                            >
                              {rated ? '✓ Đã đánh giá' : '⭐ Đánh giá ngay'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* Rating History Tab */
              ratingHistory.length === 0 ? (
                <div className="card shadow-sm border-0 text-center p-5" style={{ borderRadius: '15px' }}>
                  <div className="mb-4">
                    <span style={{ fontSize: '4rem' }}>📋</span>
                  </div>
                  <h4 className="mb-3">Chưa có đánh giá nào</h4>
                  <p className="text-muted">Các đánh giá của bạn sẽ hiển thị ở đây</p>
                </div>
              ) : (
                <div className="row g-4">
                  {ratingHistory.map((review) => (
                    <div key={review.id} className="col-12">
                      <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h5 className="card-title mb-1">{review.tenDichVu || 'Dịch vụ'}</h5>
                              <small className="text-muted">
                                {review.thoiGianTao && new Date(review.thoiGianTao).toLocaleDateString('vi-VN', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </small>
                            </div>
                            <div className="text-end">
                              {renderStars(review.diem)}
                            </div>
                          </div>
                          {review.noiDung && (
                            <p className="mb-0 text-muted">{review.noiDung}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {selectedAppointment && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedAppointment(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Đánh giá dịch vụ</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedAppointment(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-4">
                  <h6 className="mb-3">{selectedAppointment.tenDichVu || selectedAppointment.tenCombo}</h6>
                  <div className="mb-3">
                    {renderStars(rating, true)}
                  </div>
                  <p className="text-muted small mb-0">
                    {rating === 0 && 'Chọn số sao để đánh giá'}
                    {rating === 1 && 'Rất không hài lòng'}
                    {rating === 2 && 'Không hài lòng'}
                    {rating === 3 && 'Bình thường'}
                    {rating === 4 && 'Hài lòng'}
                    {rating === 5 && 'Rất hài lòng'}
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Nhận xét của bạn</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ này..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ borderRadius: '10px' }}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedAppointment(null)}
                  style={{ borderRadius: '10px' }}
                >
                  Hủy
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSubmitRating}
                  disabled={submitting || rating === 0}
                  style={{ borderRadius: '10px' }}
                >
                  {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRating;
