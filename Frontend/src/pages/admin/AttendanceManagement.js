import React, { useState, useEffect } from 'react';
import QRCodeGenerator from '../../components/attendance/QRCodeGenerator';
import './AttendanceManagement.css';

const AttendanceManagement = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendances();
  }, [selectedDate]);

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch(`/api/attendance/qr/list/${selectedDate}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAttendances(data);
      }
    } catch (error) {
      console.error('Error fetching attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const calculateStatus = (attendance) => {
    if (attendance.checkOutTime) {
      return { text: 'Đã hoàn thành', class: 'completed' };
    } else {
      return { text: 'Đang làm việc', class: 'working' };
    }
  };

  return (
    <div className="attendance-management">
      <div className="container-fluid">
        <div className="page-header">
          <h1>⏰ Quản Lý Chấm Công</h1>
          <p>Tạo mã QR và theo dõi chấm công nhân viên</p>
        </div>

        <div className="row">
          {/* QR Code Generator Section */}
          <div className="col-lg-5 mb-4">
            <QRCodeGenerator />
          </div>

          {/* Attendance List Section */}
          <div className="col-lg-7 mb-4">
            <div className="attendance-list-card">
              <div className="card-header">
                <h3>📋 Danh Sách Chấm Công</h3>
                <div className="date-filter">
                  <label>Ngày:</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : attendances.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p>Chưa có nhân viên nào chấm công trong ngày này</p>
                  </div>
                ) : (
                  <>
                    <div className="attendance-stats">
                      <div className="stat-item">
                        <span className="stat-value">{attendances.length}</span>
                        <span className="stat-label">Tổng số</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">
                          {attendances.filter(a => a.checkOutTime).length}
                        </span>
                        <span className="stat-label">Đã hoàn thành</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">
                          {attendances.filter(a => !a.checkOutTime).length}
                        </span>
                        <span className="stat-label">Đang làm việc</span>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table attendance-table">
                        <thead>
                          <tr>
                            <th>STT</th>
                            <th>Nhân viên</th>
                            <th>Giờ vào</th>
                            <th>Giờ ra</th>
                            <th>Tổng giờ</th>
                            <th>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendances.map((attendance, index) => {
                            const status = calculateStatus(attendance);
                            return (
                              <tr key={attendance.id}>
                                <td>{index + 1}</td>
                                <td>
                                  <div className="employee-info">
                                    <span className="employee-name">
                                      {attendance.employeeName || 'N/A'}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className="time-badge checkin">
                                    {formatTime(attendance.checkInTime)}
                                  </span>
                                </td>
                                <td>
                                  <span className="time-badge checkout">
                                    {formatTime(attendance.checkOutTime)}
                                  </span>
                                </td>
                                <td>
                                  <strong>
                                    {attendance.totalHours ? 
                                      `${attendance.totalHours.toFixed(1)}h` : '-'}
                                  </strong>
                                </td>
                                <td>
                                  <span className={`status-badge ${status.class}`}>
                                    {status.text}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
