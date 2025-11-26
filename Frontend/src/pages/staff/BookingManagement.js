import React, { useState, useEffect, useCallback, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Search, Filter, Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, Edit, Eye, Crown, Star } from 'lucide-react';

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCustomerType, setFilterCustomerType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const statusLabels = {
    all: 'Tất cả',
    pending: 'Chờ duyệt',
    confirmed: 'Đã duyệt',
    cancelled: 'Đã hủy'
  };

  const customerTypeLabels = {
    all: 'Tất cả khách',
    vip: 'Khách VIP',
    normal: 'Khách thường'
  };

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Helper function to map backend status to frontend status
  const mapStatus = (backendStatus) => {
    const statusMap = {
      'CHO_XAC_NHAN': 'pending',
      'DA_XAC_NHAN': 'confirmed',
      'DANG_THUC_HIEN': 'confirmed',
      'HOAN_THANH': 'confirmed',
      'DA_HUY': 'cancelled'
    };
    return statusMap[backendStatus] || 'pending';
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      // Use simple GET all appointments endpoint
      const response = await fetch('/api/dat-lich', {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      
      console.log('Raw backend data:', data); // Debug log
      
      // Map backend fields to frontend format
      const mappedData = (data || []).map(booking => {
        const mapped = {
          id: booking.id || booking.maLichHen,
          customerName: booking.tenKhachHang || 'Khách hàng',
          phone: booking.soDienThoai || 'N/A',
          email: booking.email || 'N/A',
          service: booking.tenDichVu || booking.tenCombo || 'Dịch vụ',
          date: booking.thoiGianBatDau || new Date().toISOString(),
          time: booking.thoiGianBatDau ? new Date(booking.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--',
          duration: booking.thoiLuongPhut ? `${booking.thoiLuongPhut} phút` : '60 phút',
          price: booking.thanhTien || booking.tongTien || 0,
          discount: booking.giamGia || 0,
          status: mapStatus(booking.trangThai),
          customerType: 'normal', // Default to normal, can be enhanced later
          visitCount: 1, // Default value, can be enhanced later
          requestType: null, // Can be enhanced later
          cancelReason: null,
          editRequest: null
        };
        console.log('Mapped booking:', mapped); // Debug log
        return mapped;
      });
      
      setBookings(mappedData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      showNotificationMessage('Lỗi khi tải danh sách lịch hẹn.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Filter bookings based on status, customer type, and search term
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Filter by status
      if (filterStatus !== 'all' && booking.status !== filterStatus) {
        return false;
      }
      
      // Filter by customer type
      if (filterCustomerType !== 'all' && booking.customerType !== filterCustomerType) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          booking.customerName.toLowerCase().includes(searchLower) ||
          booking.phone.includes(searchTerm) ||
          booking.email.toLowerCase().includes(searchLower) ||
          booking.service.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [bookings, filterStatus, filterCustomerType, searchTerm]);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
        fetchBookings();
    }, 300); // Debounce to avoid rapid API calls while typing
    return () => clearTimeout(debounceFetch);
  }, [fetchBookings]);

  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleAction = async (id, action) => {
    try {
        const headers = getAuthHeaders();
        console.log('=== ACTION DEBUG ===');
        console.log('Action:', action);
        console.log('ID:', id);
        console.log('Headers:', headers);
        console.log('Token exists:', !!headers.Authorization);
        
        let response;
        if (action === 'confirm') {
            response = await fetch(`/api/dat-lich/${id}/xac-nhan`, {
                method: 'PATCH',
                headers: headers,
            });
        } else if (action === 'cancel') {
            response = await fetch(`/api/dat-lich/${id}/tu-choi?lyDo=Nhân viên từ chối`, {
                method: 'PATCH',
                headers: headers,
            });
        } else {
            throw new Error('Invalid action');
        }
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response:', errorText);
            throw new Error(errorText || 'Action failed');
        }
        
        showNotificationMessage(action === 'confirm' ? 'Đã xác nhận lịch hẹn!' : 'Đã từ chối lịch hẹn!');
        fetchBookings();
        setShowModal(false);
    } catch (error) {
        console.error(`Error performing action ${action}:`, error);
        showNotificationMessage(`Lỗi: ${error.message}`, 'error');
    }
  };

  const handleSyncPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment-sync/sync-all', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Đồng bộ thanh toán thất bại');
      }
      
      const result = await response.json();
      showNotificationMessage(`Đã đồng bộ ${result.synced} thanh toán thành công!`);
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error syncing payments:', error);
      showNotificationMessage(`Lỗi: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const stats = useMemo(() => ({
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    changeRequests: bookings.filter(b => b.requestType !== null).length,
    vip: bookings.filter(b => b.customerType === 'vip').length,
    vipPending: bookings.filter(b => b.customerType === 'vip' && b.status === 'pending').length
  }), [bookings]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e3f2fd 100%)' }}>
      {showNotification && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className="toast show"><div className="toast-body bg-success text-white rounded"><CheckCircle size={18} className="me-2" />{notificationMessage}</div></div>
        </div>
      )}

      <div className="container py-4">
        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          {/* Chờ duyệt */}
          <div className="col-md-2">
            <div className="card shadow-sm border-0" style={{ borderLeft: '4px solid #ffc107' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">Chờ duyệt</p>
                    <h3 className="mb-0 fw-bold">{stats.pending}</h3>
                  </div>
                  <div className="rounded-circle bg-warning bg-opacity-10 p-3">
                    <Clock size={24} className="text-warning" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Đã duyệt */}
          <div className="col-md-2">
            <div className="card shadow-sm border-0" style={{ borderLeft: '4px solid #28a745' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">Đã duyệt</p>
                    <h3 className="mb-0 fw-bold">{stats.confirmed}</h3>
                  </div>
                  <div className="rounded-circle bg-success bg-opacity-10 p-3">
                    <CheckCircle size={24} className="text-success" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Đã hủy */}
          <div className="col-md-2">
            <div className="card shadow-sm border-0" style={{ borderLeft: '4px solid #dc3545' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">Đã hủy</p>
                    <h3 className="mb-0 fw-bold">{stats.cancelled}</h3>
                  </div>
                  <div className="rounded-circle bg-danger bg-opacity-10 p-3">
                    <XCircle size={24} className="text-danger" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Yêu cầu */}
          <div className="col-md-2">
            <div className="card shadow-sm border-0" style={{ borderLeft: '4px solid #17a2b8' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">Yêu cầu</p>
                    <h3 className="mb-0 fw-bold">{stats.changeRequests}</h3>
                  </div>
                  <div className="rounded-circle bg-info bg-opacity-10 p-3">
                    <Edit size={24} className="text-info" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Khách VIP */}
          <div className="col-md-2">
            <div className="card shadow-sm border-0" style={{ borderLeft: '4px solid #ffc107', background: 'linear-gradient(135deg, #fff9e6 0%, #ffffff 100%)' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">Khách VIP</p>
                    <h3 className="mb-0 fw-bold">{stats.vip}</h3>
                  </div>
                  <div className="rounded-circle p-3" style={{ background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)' }}>
                    <Crown size={24} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VIP chờ */}
          <div className="col-md-2">
            <div className="card shadow-sm border-0" style={{ borderLeft: '4px solid #ff6b6b', background: 'linear-gradient(135deg, #fff0f0 0%, #ffffff 100%)' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1 small">VIP chờ</p>
                    <h3 className="mb-0 fw-bold">{stats.vipPending}</h3>
                  </div>
                  <div className="rounded-circle p-3" style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)' }}>
                    <Star size={24} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white"><Search size={20} /></span>
                  <input type="text" className="form-control" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="col-md-4">
                <div className="btn-group w-100">{Object.keys(statusLabels).map(status => <button key={status} type="button" onClick={() => setFilterStatus(status)} className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-outline-primary'}`}>{statusLabels[status]}</button>)}</div>
              </div>
              <div className="col-md-3">
                <div className="btn-group w-100">{Object.keys(customerTypeLabels).map(type => <button key={type} type="button" onClick={() => setFilterCustomerType(type)} className={`btn btn-sm ${filterCustomerType === type ? 'btn-warning' : 'btn-outline-warning'}`}>{type === 'vip' && <Crown size={14} className="me-1" />}{customerTypeLabels[type]}</button>)}</div>
              </div>
            </div>
            
            {/* Sync Payment Button */}
            <div className="row mt-3">
              <div className="col-12">
                <button 
                  className="btn btn-success btn-sm" 
                  onClick={handleSyncPayments}
                  disabled={loading}
                >
                  <CheckCircle size={16} className="me-2" />
                  {loading ? 'Đang đồng bộ...' : 'Đồng bộ thanh toán'}
                </button>
                <small className="text-muted ms-3">
                  Cập nhật hóa đơn và trừ sản phẩm cho các lịch hẹn đã duyệt
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-primary"><tr><th>STT</th><th>Khách hàng</th><th>Loại</th><th>Liên hệ</th><th>Dịch vụ</th><th>Ngày giờ</th><th>Giá</th><th>Trạng thái</th><th className="text-center">Thao tác</th></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="9" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr><td colSpan="9" className="text-center py-5"><Calendar size={48} className="text-muted mb-3" /><p className="text-muted">Không tìm thấy lịch hẹn nào</p></td></tr>
                  ) : (
                    filteredBookings.map((booking, index) => (
                      <tr key={booking.id} style={booking.customerType === 'vip' ? { background: 'linear-gradient(90deg, #fff9e6 0%, #ffffff 100%)', borderLeft: '4px solid #ffc107' } : {}}>
                        <td className="fw-bold">{index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle text-white d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px', fontSize: '18px', fontWeight: 'bold', background: booking.customerType === 'vip' ? 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>{booking.customerName.charAt(0)}</div>
                            <div>
                              <div className="fw-semibold d-flex align-items-center">{booking.customerName}{booking.customerType === 'vip' && <Crown size={16} className="ms-1" style={{ color: '#ffc107' }} />}</div>
                              {booking.requestType && <small className={booking.requestType === 'cancel' ? 'text-danger' : 'text-info'}>{booking.requestType === 'cancel' ? '⚠️ Yêu cầu hủy' : '✏️ Yêu cầu sửa'}</small>}
                            </div>
                          </div>
                        </td>
                        <td>{booking.customerType === 'vip' ? <div><span className="badge text-dark fw-bold" style={{ background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)' }}><Crown size={12} className="me-1" />VIP</span><div className="small text-muted mt-1"><Star size={12} className="me-1" style={{ color: '#ffc107' }} />{booking.visitCount} lần</div>{booking.discount && <div className="small text-success fw-bold">-{booking.discount}%</div>}</div> : <div><span className="badge bg-secondary">Thường</span><div className="small text-muted mt-1">{booking.visitCount} lần</div></div>}</td>
                        <td><small className="d-block"><Phone size={14} className="me-1" />{booking.phone}</small><small className="text-muted"><Mail size={14} className="me-1" />{booking.email}</small></td>
                        <td><div className="fw-medium text-primary">{booking.service}</div><small className="text-muted">{booking.duration}</small></td>
                        <td><div className="fw-medium">{new Date(booking.date).toLocaleDateString('vi-VN')}</div><small className="text-muted"><Clock size={14} className="me-1" />{booking.time}</small></td>
                        <td><div className="fw-bold text-primary">{booking.price.toLocaleString('vi-VN')}đ</div>{booking.discount > 0 && <small className="text-success fw-bold">Giảm {booking.discount}%</small>}</td>
                        <td><span className={`badge ${booking.status === 'pending' ? 'bg-warning' : booking.status === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>{statusLabels[booking.status]}</span>{booking.customerType === 'vip' && booking.status === 'pending' && <div className="small text-danger fw-bold mt-1">Ưu tiên xử lý!</div>}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-1">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => openDetailModal(booking)} title="Xem chi tiết"><Eye size={18} /></button>
                            {booking.status === 'pending' && !booking.requestType && <><button className="btn btn-sm btn-outline-success" onClick={() => handleAction(booking.id, 'confirm')} title="Xác nhận"><CheckCircle size={18} /></button><button className="btn btn-sm btn-outline-danger" onClick={() => handleAction(booking.id, 'cancel')} title="Từ chối"><XCircle size={18} /></button></>}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedBooking && <div className="modal-backdrop show"></div>}
      {showModal && selectedBooking && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Chi tiết lịch hẹn</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  {/* Thông tin khách hàng */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <User size={20} className="text-primary me-2" />
                      <h6 className="mb-0 text-primary">Thông tin khách hàng</h6>
                    </div>
                    <div className="ps-4">
                      <div className="row mb-2">
                        <div className="col-4 text-muted">Họ tên:</div>
                        <div className="col-8 fw-semibold">{selectedBooking.customerName}</div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-4 text-muted">Loại khách:</div>
                        <div className="col-8">
                          {selectedBooking.customerType === 'vip' ? (
                            <span className="badge text-dark" style={{ background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)' }}>
                              <Crown size={12} className="me-1" />Thường
                            </span>
                          ) : (
                            <span className="badge bg-secondary">Thường</span>
                          )}
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-4 text-muted">Số điện thoại:</div>
                        <div className="col-8">{selectedBooking.phone}</div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-4 text-muted">Email:</div>
                        <div className="col-8">{selectedBooking.email}</div>
                      </div>
                      <div className="row">
                        <div className="col-4 text-muted">Lịch sử:</div>
                        <div className="col-8">
                          <span className="badge bg-info text-dark">
                            <Star size={12} className="me-1" />
                            Đã sử dụng dịch vụ {selectedBooking.visitCount} lần
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr />

                  {/* Thông tin dịch vụ */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <Calendar size={20} className="text-primary me-2" />
                      <h6 className="mb-0 text-primary">Thông tin dịch vụ</h6>
                    </div>
                    <div className="ps-4">
                      <div className="row mb-2">
                        <div className="col-4 text-muted">Dịch vụ:</div>
                        <div className="col-8 fw-semibold">{selectedBooking.service}</div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-4 text-muted">Ngày:</div>
                        <div className="col-8">{new Date(selectedBooking.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-4 text-muted">Giờ:</div>
                        <div className="col-8">{selectedBooking.time}</div>
                      </div>
                      <div className="row">
                        <div className="col-4 text-muted">Thời lượng:</div>
                        <div className="col-8">{selectedBooking.duration}</div>
                      </div>
                    </div>
                  </div>

                  <hr />

                  {/* Giá cả */}
                  <div className="mb-3">
                    <div className="row mb-2">
                      <div className="col-4 text-muted">Giá gốc:</div>
                      <div className="col-8 fw-semibold text-primary fs-5">{selectedBooking.price.toLocaleString('vi-VN')}đ</div>
                    </div>
                    {selectedBooking.discount > 0 && (
                      <div className="row">
                        <div className="col-4 text-muted">Giảm giá:</div>
                        <div className="col-8 text-success fw-bold">-{selectedBooking.discount}%</div>
                      </div>
                    )}
                  </div>

                  <hr />

                  {/* Trạng thái */}
                  <div className="mb-3">
                    <div className="row">
                      <div className="col-4 text-muted">Trạng thái:</div>
                      <div className="col-8">
                        <span className={`badge ${selectedBooking.status === 'pending' ? 'bg-warning text-dark' : selectedBooking.status === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
                          {statusLabels[selectedBooking.status]}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
                
                {selectedBooking.status === 'pending' && (
                  <div className="modal-footer d-flex gap-2">
                    <button 
                      className="btn btn-success flex-fill d-flex align-items-center justify-content-center gap-2" 
                      onClick={() => handleAction(selectedBooking.id, 'confirm')}
                    >
                      <CheckCircle size={18} />
                      Xác nhận lịch
                    </button>
                    <button 
                      className="btn btn-danger flex-fill d-flex align-items-center justify-content-center gap-2" 
                      onClick={() => handleAction(selectedBooking.id, 'cancel')}
                    >
                      <XCircle size={18} />
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
      )}
    </div>
  );
}