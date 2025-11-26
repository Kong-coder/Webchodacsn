import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

const AppointmentManager = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editFormData, setEditFormData] = useState({ service: '', date: '', time: '', note: '' });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch('/api/dat-lich/my-appointments', { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      console.log('Appointments API Response:', data);
      console.log('Sample appointment:', data[0]);
      if (data[0]) {
        console.log('Staff name (tenNhanVien):', data[0].tenNhanVien);
        console.log('Staff ID (maNhanVien):', data[0].maNhanVien);
      }
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CHO_XAC_NHAN':
        return <span className="badge bg-warning">Chờ xác nhận</span>;
      case 'DA_XAC_NHAN':
        return <span className="badge bg-info">Đã xác nhận</span>;
      case 'DANG_THUC_HIEN':
        return <span className="badge bg-primary">Đang thực hiện</span>;
      case 'HOAN_THANH':
        return <span className="badge bg-success">Hoàn thành</span>;
      case 'DA_HUY':
        return <span className="badge bg-danger">Đã hủy</span>;
      case 'booked':
        return <span className="badge bg-primary">Đã đặt</span>;
      case 'completed':
        return <span className="badge bg-success">Hoàn thành</span>;
      case 'cancelled':
        return <span className="badge bg-warning text-dark">Đã hủy</span>;
      default:
        return <span className="badge bg-secondary">{status || 'N/A'}</span>;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (activeTab === 'all') return true;
    const status = appointment.trangThai || appointment.status;
    // Map backend status to frontend tabs
    if (activeTab === 'booked') return status === 'CHO_XAC_NHAN' || status === 'DA_XAC_NHAN' || status === 'DANG_THUC_HIEN';
    if (activeTab === 'completed') return status === 'HOAN_THANH';
    if (activeTab === 'cancelled') return status === 'DA_HUY';
    return status === activeTab;
  });

  const handleCancelAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    
    // Parse date from thoiGianBatDau with Vietnam timezone
    const appointmentDate = appointment.thoiGianBatDau ? new Date(appointment.thoiGianBatDau) : new Date();
    
    // Format date as YYYY-MM-DD in local timezone
    const year = appointmentDate.getFullYear();
    const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
    const day = String(appointmentDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Format time as HH:MM in local timezone
    const hours = String(appointmentDate.getHours()).padStart(2, '0');
    const minutes = String(appointmentDate.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    setEditFormData({
      service: appointment.tenDichVu || appointment.tenCombo || 'N/A',
      date: dateStr,
      time: timeStr,
      note: appointment.ghiChu || '',
    });
    setShowEditModal(true);
  };



  const confirmCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const appointmentId = selectedAppointment.id || selectedAppointment.maLichHen;
      const response = await fetch(`/api/dat-lich/${appointmentId}/huy?lyDo=Khách hàng hủy lịch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      alert('Đã hủy lịch hẹn thành công!');
      // Refresh the appointments list
      fetchAppointments();
      setShowCancelModal(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error canceling appointment:', err);
      alert('Lỗi khi hủy lịch hẹn: ' + err.message);
    }
  };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return;

    const { date, time, note } = editFormData;
    
    // Create datetime in local timezone (Vietnam)
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create date object with local timezone
    const thoiGianBatDau = new Date(year, month - 1, day, hours, minutes, 0);
    const thoiGianKetThuc = new Date(thoiGianBatDau.getTime() + 60 * 60 * 1000); // +1 hour
    
    // Format as ISO string with timezone offset
    const formatWithTimezone = (date) => {
      const offset = -date.getTimezoneOffset();
      const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
      const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');
      const offsetSign = offset >= 0 ? '+' : '-';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
    };

    try {
      const appointmentId = selectedAppointment.id || selectedAppointment.maLichHen;
      const response = await fetch(`/api/dat-lich/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          thoiGianBatDau: formatWithTimezone(thoiGianBatDau),
          thoiGianKetThuc: formatWithTimezone(thoiGianKetThuc),
          ghiChu: note
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      alert('Đã cập nhật lịch hẹn! Vui lòng chờ nhân viên xác nhận lại.');
      fetchAppointments();
      setShowEditModal(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('Lỗi khi cập nhật lịch hẹn: ' + err.message);
    }
  };

  const getTabCount = (status) => {
    if (!appointments || !Array.isArray(appointments)) return 0;
    if (status === 'all') return appointments.length;
    const statusMap = {
      'booked': ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_THUC_HIEN'],
      'completed': ['HOAN_THANH'],
      'cancelled': ['DA_HUY']
    };
    return appointments.filter(app => {
      const appStatus = app.trangThai || app.status;
      return statusMap[status]?.includes(appStatus) || appStatus === status;
    }).length;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet" />
      <div style={{backgroundColor: '#f8f9fa', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        <style>{`
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px;
          }
          .hero-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }
          .filter-card {
            background: #ffffff;
            border-radius: 12px;
            padding: 0.75rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          .appointment-card {
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            flex: 1;
          }
          .table {
            margin-bottom: 0;
            font-size: 12px;
          }
          .table thead th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 0.6rem 0.5rem;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            white-space: nowrap;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          .table tbody td {
            padding: 0.7rem 0.5rem;
            vertical-align: middle;
            border-bottom: 1px solid #f0f0f0;
          }
          .table tbody tr:last-child td {
            border-bottom: none;
          }
          .table-hover tbody tr:hover {
            background-color: rgba(102, 126, 234, 0.05);
          }
          .service-tag {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 9px;
            margin: 1px;
            display: inline-block;
            font-weight: 500;
          }
          .therapist-avatar {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 11px;
          }
          .info-badge {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 10px;
            margin: 2px 0;
            display: inline-block;
          }
          .btn-action {
            padding: 0.3rem 0.6rem;
            font-size: 11px;
            border-radius: 8px;
            border-width: 1px;
            font-weight: 600;
            transition: all 0.2s;
          }
          .btn-action:hover {
            transform: translateY(-1px);
          }
          .btn-modern {
            border-radius: 20px;
            font-weight: 600;
            padding: 0.4rem 1rem;
            font-size: 12px;
            transition: all 0.2s;
          }
          .btn-modern:hover {
            transform: translateY(-1px);
          }
          .price-text {
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: bold;
            font-size: 13px;
          }
          .badge {
            padding: 0.3rem 0.6rem;
            font-size: 10px;
            font-weight: 600;
          }
          .modal-content {
            border-radius: 15px;
          }
          .table-container {
            overflow-y: auto;
            flex: 1;
          }
          .table-container::-webkit-scrollbar {
            width: 6px;
          }
          .table-container::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          .table-container::-webkit-scrollbar-thumb {
            background: #667eea;
            border-radius: 3px;
          }
          .rating-star {
            font-size: 2rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          .rating-star:hover {
            transform: scale(1.2);
          }
          .rating-star {
            font-size: 2rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          .rating-star:hover {
            transform: scale(1.2);
          }
        `}</style>

        <div className="container-fluid px-3 py-2" style={{maxWidth: '1400px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
          {/* Hero Header */}
          <div className="row mb-2">
            <div className="col-12">
              <div className="hero-section d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div>
                    <h4 className="fw-bold mb-0">Beauty Spa Manager</h4>
                    <small className="opacity-90">Quản lý lịch hẹn thông minh</small>
                  </div>
                </div>
                <div className="d-flex gap-4">
                  <div className="text-center">
                    <div className="fw-bold fs-5">{getTabCount('booked')}</div>
                    <small className="opacity-90">Đã đặt</small>
                  </div>
                  <div className="text-center">
                    <div className="fw-bold fs-5">{getTabCount('completed')}</div>
                    <small className="opacity-90">Hoàn thành</small>
                  </div>
                  <div className="text-center">
                    <div className="fw-bold fs-5">{getTabCount('cancelled')}</div>
                    <small className="opacity-90">Đã hủy</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="row mb-2">
            <div className="col-12">
              <div className="filter-card">
                <div className="d-flex justify-content-center gap-2">
                  {[
                    { key: 'all', label: 'Tất cả' },
                    { key: 'booked', label: 'Đã đặt' },
                    { key: 'completed', label: 'Hoàn thành' },
                    { key: 'cancelled', label: 'Đã hủy' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`btn btn-sm btn-modern ${
                        activeTab === tab.key ? 'btn-primary' : 'btn-outline-primary'
                      }`}
                    >
                      {tab.label} ({getTabCount(tab.key)})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="row" style={{flex: 1, minHeight: 0}}>
            <div className="col-12" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
              <div className="card appointment-card">
                <div className="table-container">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th style={{width: '25%'}}>Dịch vụ</th>
                        <th style={{width: '10%'}}>Trạng thái</th>
                        <th style={{width: '12%'}}>Thời gian</th>
                        <th style={{width: '18%'}}>Nhân viên</th>
                        <th style={{width: '12%'}}>Địa điểm</th>
                        <th style={{width: '10%'}}>Giá</th>
                        <th className="text-center" style={{width: '13%'}}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments && filteredAppointments.length > 0 ? filteredAppointments.map((appointment) => (
                        <tr key={appointment.id || appointment.maLichHen}>
                          <td>
                            <div className="d-flex align-items-start">
                              <div style={{flex: 1, minWidth: 0}}>
                                <div className="fw-bold mb-1">{appointment.tenDichVu || appointment.tenCombo || 'N/A'}</div>
                                {appointment.ghiChu && (
                                  <div className="info-badge text-muted">{appointment.ghiChu}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{getStatusBadge(appointment.trangThai || appointment.status)}</td>
                          <td>
                            <div className="fw-semibold">{appointment.thoiGianBatDau ? formatDate(appointment.thoiGianBatDau) : 'N/A'}</div>
                            <small className="text-muted d-block">{appointment.thoiGianBatDau ? new Date(appointment.thoiGianBatDau).toLocaleTimeString('vi-VN') : ''}</small>
                            <small className="text-muted">{appointment.thoiLuongPhut || 60} phút</small>
                          </td>
                          <td>
                            {appointment.tenNhanVien ? (
                              <div className="d-flex align-items-center">
                                <div className="therapist-avatar me-2">
                                  {appointment.tenNhanVien.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div style={{flex: 1, minWidth: 0}}>
                                  <div className="fw-semibold" style={{fontSize: '11px'}}>{appointment.tenNhanVien}</div>
                                  <small className="text-muted" style={{fontSize: '10px'}}>Nhân viên</small>
                                </div>
                              </div>
                            ) : (
                              <div className="text-muted" style={{fontSize: '11px'}}>
                                <small>Chưa phân công</small>
                              </div>
                            )}
                          </td>
                          <td>
                            <small>BeautySpa</small>
                          </td>
                          <td>
                            <div className="price-text">{(appointment.tongTien || 0).toLocaleString('vi-VN')}đ</div>
                          </td>
                          <td>
                            <div className="d-flex gap-1 justify-content-center flex-wrap">
                              {(appointment.trangThai === 'CHO_XAC_NHAN' || appointment.trangThai === 'DA_XAC_NHAN' || appointment.trangThai === 'booked') && (
                                <>
                                  <button 
                                    onClick={() => handleEditAppointment(appointment)}
                                    className="btn btn-outline-primary btn-action"
                                    title="Chỉnh sửa"
                                  >
                                    Sửa
                                  </button>
                                  <button 
                                    onClick={() => handleCancelAppointment(appointment)} 
                                    className="btn btn-outline-danger btn-action"
                                    title="Hủy lịch"
                                  >
                                    Hủy
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="7" className="text-center py-5">
                            <div className="text-muted">
                              <p className="mb-0">Không có lịch hẹn nào</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Cancel Modal */}
          {showCancelModal && (
            <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header bg-danger text-white py-2">
                    <h6 className="modal-title fw-bold mb-0">Xác nhận hủy lịch hẹn</h6>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowCancelModal(false)}></button>
                  </div>
                  <div className="modal-body p-3">
                    <div className="text-center mb-3">
                      <p className="mb-2 mt-2">Bạn có chắc chắn muốn hủy lịch hẹn này?</p>
                    </div>
                    <div className="bg-light p-3 rounded mb-3">
                      <div className="fw-bold mb-2">{selectedAppointment?.tenDichVu || selectedAppointment?.tenCombo || 'Dịch vụ'}</div>
                      <small className="d-block mb-1">Ngày: {selectedAppointment && selectedAppointment.thoiGianBatDau && formatDate(selectedAppointment.thoiGianBatDau)} | Giờ: {selectedAppointment?.thoiGianBatDau && new Date(selectedAppointment.thoiGianBatDau).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</small>
                      <small className="d-block">Nhân viên: {selectedAppointment?.tenNhanVien || 'Chưa phân công'} | Địa điểm: BeautySpa</small>
                    </div>
                    <div className="alert alert-warning py-2 mb-0">
                      <small>Việc hủy lịch hẹn có thể áp dụng phí hủy theo chính sách</small>
                    </div>
                  </div>
                  <div className="modal-footer py-2">
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowCancelModal(false)}>Giữ lại</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={confirmCancelAppointment}>Xác nhận hủy</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && (
            <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header bg-primary text-white py-2">
                    <h6 className="modal-title fw-bold mb-0">Chỉnh sửa lịch hẹn</h6>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
                  </div>
                  <div className="modal-body p-3">
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Dịch vụ</label>
                      <input type="text" className="form-control form-control-sm" value={editFormData.service} onChange={(e) => setEditFormData({...editFormData, service: e.target.value})} />
                    </div>
                    <div className="row mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-bold">Ngày</label>
                        <input type="date" className="form-control form-control-sm" value={editFormData.date} onChange={(e) => setEditFormData({...editFormData, date: e.target.value})} />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold">Giờ</label>
                        <input type="time" className="form-control form-control-sm" value={editFormData.time} onChange={(e) => setEditFormData({...editFormData, time: e.target.value})} step="60" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Ghi chú</label>
                      <textarea className="form-control form-control-sm" rows="2" value={editFormData.note} onChange={(e) => setEditFormData({...editFormData, note: e.target.value})}></textarea>
                    </div>
                  </div>
                  <div className="modal-footer py-2">
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowEditModal(false)}>Hủy</button>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleUpdateAppointment}>Lưu thay đổi</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js"></script>
      </div>
    </>
  );
};

export default AppointmentManager;