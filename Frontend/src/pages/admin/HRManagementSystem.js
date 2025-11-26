import React, { useState, useMemo, useEffect, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/pages/admin/HRManagementSystem.css";
import QRCodeGenerator from "../../components/attendance/QRCodeGenerator";

const HRManagementSystem = () => {
  // Data states
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showPromoteCustomerModal, setShowPromoteCustomerModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingShift, setEditingShift] = useState(null);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [shiftFilterEmployee, setShiftFilterEmployee] = useState("");
  const [shiftFilterDate, setShiftFilterDate] = useState("");
  const [attendanceFilterEmployee, setAttendanceFilterEmployee] = useState("");
  const [attendanceFilterDate, setAttendanceFilterDate] = useState("");
  const [activities, setActivities] = useState([]);

  const positions = useMemo(() => 
    [...new Set(employees.map(e => e.position))].filter(Boolean),
     [employees]
  );
  const roles = useMemo(() => 
    [...new Set(employees.map(e => e.role))].filter(Boolean),
    [employees]
  );
  const shiftTypes = ["Sáng", "Chiều", "Tối"];

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchEmployees = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        role: filterRole,
      });
      const response = await fetch(`/api/employees?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      // Backend returns Page object with 'content' array
      setEmployees(data.content || data || []);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi tải danh sách nhân viên.');
    }
  }, [searchTerm, filterRole]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch('/api/user/customers', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data || []);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi tải danh sách khách hàng.');
    }
  }, []);

  const handlePromoteToEmployee = async () => {
    if (!selectedCustomer) {
      alert('Vui lòng chọn khách hàng!');
      return;
    }
    
    try {
      const response = await fetch(`/api/user/${selectedCustomer.id}/promote-to-employee`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to promote customer');
      
      alert(`Đã nâng cấp ${selectedCustomer.name} lên nhân viên thành công!`);
      setShowPromoteCustomerModal(false);
      setSelectedCustomer(null);
      setCustomerSearchTerm('');
      fetchEmployees();
    } catch (error) {
      console.error(error);
      alert('Nâng cấp nhân viên thất bại.');
    }
  };

  const fetchShifts = useCallback(async () => {
    try {
      const request = {
        employeeId: shiftFilterEmployee ? parseInt(shiftFilterEmployee) : null,
        from: shiftFilterDate || null,
        to: shiftFilterDate || null,
        status: null
      };
      const response = await fetch(`/api/staff-shifts/search`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error('Failed to fetch shifts');
      const data = await response.json();
      
      // Map backend response to frontend format
      const mappedShifts = (data || []).map(shift => {
        // Parse time strings (format: "HH:mm" or "HH:mm:ss")
        const [startHour, startMin] = shift.startTime.split(':').map(Number);
        const [endHour, endMin] = shift.endTime.split(':').map(Number);
        
        // Calculate hours
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const hours = Math.round((endMinutes - startMinutes) / 60 * 10) / 10;
        
        // Determine shift type based on start time
        let shiftType = 'Sáng';
        if (startHour >= 12 && startHour < 17) shiftType = 'Chiều';
        else if (startHour >= 17) shiftType = 'Tối';
        
        // Map status
        let statusText = 'Đã đăng ký';
        if (shift.status === 'completed') statusText = 'Đã chấm công';
        else if (shift.status === 'registered') statusText = 'Đã đăng ký';
        else if (shift.status === 'pending') statusText = 'Chưa chấm công';
        
        return {
          id: shift.id,
          employeeId: shift.employeeId,
          employeeName: shift.employeeName || 'N/A', // Use employeeName from backend
          date: shift.date, // Already in YYYY-MM-DD format
          shift: shiftType,
          startTime: shift.startTime.substring(0, 5), // Format as HH:mm
          endTime: shift.endTime.substring(0, 5), // Format as HH:mm
          hours: hours,
          status: statusText
        };
      });
      
      setShifts(mappedShifts);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi tải danh sách ca làm việc.');
    }
  }, [shiftFilterEmployee, shiftFilterDate]);

    const fetchAttendance = useCallback(async () => {
    try {
        const params = new URLSearchParams();
        if (attendanceFilterEmployee) params.append('employeeId', attendanceFilterEmployee);
        if (attendanceFilterDate) {
            params.append('from', attendanceFilterDate);
            params.append('to', attendanceFilterDate);
        }
        const response = await fetch(`/api/attendance?${params.toString()}`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch attendance records');
        const data = await response.json();
        setAttendanceRecords(data || []);
    } catch (error) {
        console.error(error);
        alert('Lỗi khi tải dữ liệu chấm công.');
    }
}, [attendanceFilterEmployee, attendanceFilterDate]);

  const fetchActivities = useCallback(async () => {
    try {
      const response = await fetch(`/api/dashboard/recent-activities`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      setActivities(data || []);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi tải hoạt động gần đây.');
    }
  }, []);


  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { fetchShifts(); }, [fetchShifts]);
  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);
  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const handleSaveEmployee = async (formData) => {
    const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees';
    const method = editingEmployee ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(editingEmployee ? 'Failed to update employee' : 'Failed to create employee');
      setShowModal(false);
      setEditingEmployee(null);
      alert(`Đã ${editingEmployee ? 'cập nhật' : 'thêm'} nhân viên thành công!`);
      fetchEmployees();
    } catch (error) {
      console.error(error);
      alert('Thao tác thất bại.');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
        if (!response.ok && response.status !== 204) throw new Error('Failed to delete employee');
        alert('Đã xóa nhân viên thành công.');
        fetchEmployees();
      } catch (error) {
        console.error(error);
        alert('Xóa thất bại.');
      }
    }
  };

  const handleSaveShift = async (formData) => {
    const url = editingShift ? `/api/staff-shifts/${editingShift.id}` : '/api/staff-shifts';
    const method = editingShift ? 'PUT' : 'POST';
    try {
        // Map frontend fields to backend DTO (new format with separate date and time)
        const body = {
          employeeId: parseInt(formData.employeeId),
          date: formData.date, // YYYY-MM-DD
          startTime: formData.startTime, // HH:mm
          endTime: formData.endTime, // HH:mm
          status: 'registered', // Always set to "Đã đăng ký"
          serviceId: null,
          customerName: null,
          phone: null,
          note: null,
          duration: null,
          price: null,
          commission: null,
          color: null
        };
        
        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(editingShift ? 'Failed to update shift' : 'Failed to create shift');
        setShowShiftModal(false);
        setEditingShift(null);
        alert(`Đã ${editingShift ? 'cập nhật' : 'thêm'} ca làm việc thành công!`);
        localStorage.setItem('shift-data-updated', new Date().getTime());
        fetchShifts();
    } catch (error) {
        console.error(error);
        alert('Thao tác ca làm việc thất bại.');
    }
  };

  const handleDeleteShift = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ca làm việc này?")) {
        try {
            const response = await fetch(`/api/staff-shifts/${id}`, { 
              method: 'DELETE',
              headers: getAuthHeaders()
            });
            if (!response.ok && response.status !== 204) throw new Error('Failed to delete shift');
            alert('Đã xóa ca làm việc.');
            fetchShifts();
        } catch (error) {
            console.error(error);
            alert('Xóa ca làm việc thất bại.');
        }
    }
  };

  const handleSaveAttendance = async (formData) => {
    const url = editingAttendance ? `/api/attendance/${editingAttendance.id}` : '/api/attendance';
    const method = editingAttendance ? 'PUT' : 'POST';
    try {
        const body = { ...formData, employeeId: parseInt(formData.employeeId) };
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(editingAttendance ? 'Failed to update attendance' : 'Failed to create attendance');
        setShowAttendanceModal(false);
        setEditingAttendance(null);
        alert(`Đã ${editingAttendance ? 'cập nhật' : 'lưu'} chấm công thành công!`);
        fetchAttendance();
    } catch (error) {
        console.error(error);
        alert('Thao tác chấm công thất bại.');
    }
  };

  const handleDeleteAttendance = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi chấm công này?")) {
        try {
            const response = await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) throw new Error('Failed to delete attendance');
            alert('Đã xóa chấm công.');
            fetchAttendance();
        } catch (error) {
            console.error(error);
            alert('Xóa chấm công thất bại.');
        }
    }
  };

  const getEmployeeName = useCallback((id) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? emp.name : "N/A";
  }, [employees]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const calculateTotalSalary = useCallback((employee) => {
    return (employee.baseSalary || 0) + (employee.bonus || 0);
  }, []);

  const dashboardStats = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.status === "Đang làm việc").length;
    const totalSalary = employees.reduce((sum, emp) => sum + calculateTotalSalary(emp), 0);
    return {
      totalEmployees,
      activeEmployees,
      totalShiftsToday: shifts.length, 
      completedShifts: shifts.filter(s => s.status === "Đã chấm công").length,
      totalSalary,
      avgSalary: totalEmployees > 0 ? totalSalary / totalEmployees : 0,
    };
  }, [employees, shifts, calculateTotalSalary]);

  const calculateMonthlyHours = (employeeId) => {
    const employeeShifts = shifts.filter(
      (s) => s.employeeId === employeeId && s.status === "Đã chấm công"
    );
    return employeeShifts.reduce((sum, shift) => sum + shift.hours, 0);
  };

  const statsData = [
    {
      className: "hr-stat-card-1",
      icon: "👥",
      value: dashboardStats.totalEmployees,
      label: "Tổng Nhân Viên",
      sub: `${dashboardStats.activeEmployees} đang làm việc`,
    },
    {
      className: "hr-stat-card-2",
      icon: "📅",
      value: dashboardStats.totalShiftsToday,
      label: "Ca Hôm Nay",
      sub: `${dashboardStats.completedShifts} hoàn thành`,
    },
    {
      className: "hr-stat-card-3",
      icon: "💰",
      value: `${(dashboardStats.totalSalary / 1000000).toFixed(1)}M`,
      label: "Tổng Lương",
      sub: "VNĐ / tháng",
    },
    {
      className: "hr-stat-card-4",
      icon: "📈",
      value: `${(dashboardStats.avgSalary / 1000000).toFixed(1)}M`,
      label: "Lương TB",
      sub: "VNĐ / người",
    },
  ];


  return (
    <div className="hr-page-background">
      <div className="container-fluid">
        <div className="card shadow-lg hr-main-card">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0 hr-header-title">
                🏢 Hệ Thống Quản Lý Nhân Sự
              </h2>
            </div>

            <ul className="nav nav-tabs mb-4 hr-tabs">
              {[
                { key: "dashboard", label: "📊 Tổng Quan" },
                { key: "employees", label: "👥 Nhân Viên" },
                { key: "shifts", label: "📅 Ca Làm Việc" },
                { key: "attendance", label: "⏰ Chấm Công" },
              ].map((tab) => (
                <li key={tab.key} className="nav-item">
                  <button
                    className={`nav-link hr-tab-button ${
                      activeTab === tab.key ? "active" : ""
                    }`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            {activeTab === "dashboard" && (
              <div>
                <div className="row mb-4">
                  {statsData.map((stat, idx) => (
                    <div key={idx} className="col-lg-3 col-md-6 mb-3">
                      <div className={`card h-100 ${stat.className}`}>
                        <div className="card-body text-center">
                          <div className="hr-stat-icon">{stat.icon}</div>
                          <h3 className="mb-0">{stat.value}</h3>
                          <p className="mb-0">{stat.label}</p>
                          <small className="opacity-75">{stat.sub}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="row">
                  <div className="col-lg-6 mb-4">
                    <div className="card h-100 hr-activity-card">
                      <div className="card-header hr-card-header">
                        <h5 className="mb-0">📈 Hoạt Động Gần Đây</h5>
                      </div>
                      <div className="card-body">
                        <div className="list-group list-group-flush">
                          {activities.map((activity, idx) => (
                            <div
                              key={idx}
                              className="list-group-item border-0 px-0"
                            >
                              <div className="d-flex align-items-center">
                                <div
                                  className={`badge bg-${activity.color} rounded-circle p-2 me-3 hr-activity-badge`}
                                >
                                  {activity.icon}
                                </div>
                                <div>
                                  <h6 className="mb-0">{activity.title}</h6>
                                  <small className="text-muted">
                                    {activity.sub}
                                  </small>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <div className="card h-100 hr-activity-card">
                      <div className="card-header hr-card-header">
                        <h5 className="mb-0">🏆 Top Nhân Viên</h5>
                      </div>
                      <div className="card-body">
                        {employees.slice(0, 3).map((emp, index) => (
                          <div
                            key={emp.id}
                            className="d-flex align-items-center mb-3"
                          >
                            <div
                              className={`badge ${
                                index === 0
                                  ? "bg-warning"
                                  : index === 1
                                  ? "bg-secondary"
                                  : "bg-warning"
                              } rounded-circle p-2 me-3 hr-rank-badge rank-${
                                index + 1
                              }`}
                            >
                              {index + 1}
                            </div>
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="hr-employee-avatar"
                            />
                            <div className="flex-grow-1">
                              <h6 className="mb-0">{emp.name}</h6>
                              <small className="text-muted">
                                {calculateMonthlyHours(emp.id)}h làm việc
                              </small>
                            </div>
                            <div className="text-end">
                              <strong className="hr-salary-text">
                                {(calculateTotalSalary(emp) / 1000000).toFixed(
                                  1
                                )}
                                M
                              </strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "employees" && (
              <>
                <div className="row mb-4">
                  <div className="col-md-5">
                    <div className="input-group">
                      <span className="input-group-text hr-search-icon">
                        🔍
                      </span>
                      <input
                        type="text"
                        className="form-control hr-filter-input"
                        placeholder="Tìm kiếm theo tên, email, SĐT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select hr-filter-input"
                      value={filterPosition}
                      onChange={(e) => setFilterPosition(e.target.value)}
                    >
                      <option value="">🎯 Tất cả vị trí</option>
                      {positions.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select hr-filter-input"
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <option value="">🔐 Tất cả quyền</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button
                      className="btn w-100 hr-add-button"
                      onClick={() => {
                        setShowPromoteCustomerModal(true);
                        fetchCustomers();
                      }}
                    >
                      ➕ Thêm mới
                    </button>
                  </div>
                </div>

                <div className="hr-table-wrapper">
                  <table className="table table-hover hr-table">
                    <thead className="hr-table-header">
                      <tr>
                        <th>STT</th>
                        <th>Nhân viên</th>
                        <th>SĐT</th>
                        <th>Email</th>
                        <th>Vị trí</th>
                        <th>Quyền</th>
                        <th>Loại HĐ</th>
                        <th>Lương cứng</th>
                        <th>Lương thưởng</th>
                        <th>Giờ công</th>
                        <th>Tổng lương</th>
                        <th style={{ textAlign: "center" }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, index) => {
                        const totalSalary = calculateTotalSalary(emp);

                        return (
                          <tr key={emp.id} className="hr-table-row">
                            <td className="hr-table-cell-bold">{index + 1}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={emp.avatar}
                                  alt={emp.name}
                                  className="hr-employee-avatar-table"
                                />
                                <div>
                                  <div className="hr-employee-name">
                                    {emp.name}
                                  </div>
                                  <small className="hr-employee-date">
                                    Từ {formatDate(emp.startDate)}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td className="hr-table-cell">{emp.phone}</td>
                            <td>{emp.email}</td>
                            <td>
                              <span className="badge hr-badge-position">
                                {emp.position}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge hr-badge-role ${
                                  emp.role === "Admin"
                                    ? "bg-danger"
                                    : "bg-success"
                                }`}
                              >
                                {emp.role}
                              </span>
                            </td>
                            <td>{emp.contractType}</td>
                            <td className="hr-salary-base">
                              {emp.baseSalary.toLocaleString("vi-VN")}đ
                            </td>
                            <td className="hr-salary-bonus">
                              {emp.bonus.toLocaleString("vi-VN")}đ
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <div className="hr-badge-hours">
                                ⏱️ {calculateMonthlyHours(emp.id)}h
                              </div>
                            </td>
                            <td className="hr-salary-total">
                              {totalSalary.toLocaleString("vi-VN")}đ
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <button
                                className="btn btn-sm btn-outline-primary me-2 hr-action-button"
                                onClick={() => {
                                  setEditingEmployee(emp);
                                  setShowModal(true);
                                }}
                              >
                                ✏️
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger hr-action-button"
                                onClick={() => handleDeleteEmployee(emp.id)}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === "shifts" && (
              <>
                <div className="row mb-4">
                  <div className="col-md-5">
                    <select
                      className="form-select hr-filter-input"
                      value={shiftFilterEmployee}
                      onChange={(e) => setShiftFilterEmployee(e.target.value)}
                    >
                      <option value="">👤 Tất cả nhân viên</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-5">
                    <input
                      type="date"
                      className="form-control hr-filter-input"
                      value={shiftFilterDate}
                      onChange={(e) => setShiftFilterDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <button
                      className="btn w-100 hr-add-button"
                      onClick={() => {
                        setEditingShift(null);
                        setShowShiftModal(true);
                      }}
                    >
                      ➕ Thêm ca
                    </button>
                  </div>
                </div>

                <div className="hr-table-wrapper">
                  <table className="table table-hover hr-table">
                    <thead className="hr-table-header">
                      <tr>
                        <th>STT</th>
                        <th>Nhân viên</th>
                        <th>Ngày làm việc</th>
                        <th>Ca</th>
                        <th>Giờ bắt đầu</th>
                        <th>Giờ kết thúc</th>
                        <th>Số giờ</th>
                        <th>Trạng thái</th>
                        <th style={{ textAlign: "center" }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shifts.map((shift, index) => (
                        <tr key={shift.id} className="hr-table-row">
                          <td className="hr-table-cell-bold">{index + 1}</td>
                          <td className="hr-employee-id">
                            {shift.employeeName}
                          </td>
                          <td>{formatDate(shift.date)}</td>
                          <td>
                            <span className="badge bg-info hr-badge-shift">
                              {shift.shift}
                            </span>
                          </td>
                          <td>{shift.startTime}</td>
                          <td>{shift.endTime}</td>
                          <td style={{ textAlign: "center" }}>
                            <div className="hr-badge-shift-hours">
                              {shift.hours}h
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge hr-badge-status ${
                                shift.status === "Đã chấm công"
                                  ? "bg-success"
                                  : "bg-warning"
                              }`}
                            >
                              {shift.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              className="btn btn-sm btn-outline-primary me-2 hr-action-button"
                              onClick={() => {
                                setEditingShift(shift);
                                setShowShiftModal(true);
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger hr-action-button"
                              onClick={() => handleDeleteShift(shift.id)}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === "attendance" && (
              <>
                {/* QR Code Generator Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <QRCodeGenerator />
                  </div>
                </div>

                {/* Filters Section */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <select
                      className="form-select hr-filter-input"
                      value={attendanceFilterEmployee}
                      onChange={(e) =>
                        setAttendanceFilterEmployee(e.target.value)
                      }
                    >
                      <option value="">👤 Tất cả nhân viên</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <input
                      type="date"
                      className="form-control hr-filter-input"
                      value={attendanceFilterDate}
                      onChange={(e) => setAttendanceFilterDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="hr-table-wrapper">
                  <table className="table table-hover hr-table">
                    <thead className="hr-table-header">
                      <tr>
                        <th>STT</th>
                        <th>Nhân viên</th>
                        <th>Ngày</th>
                        <th>Giờ vào</th>
                        <th>Giờ ra</th>
                        <th>Tổng giờ</th>
                        <th>Trạng thái</th>
                        <th style={{ textAlign: "center" }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((record, index) => (
                        <tr key={record.id} className="hr-table-row">
                          <td className="hr-table-cell-bold">{index + 1}</td>
                          <td className="hr-employee-id">
                            {getEmployeeName(record.employeeId)}
                          </td>
                          <td>{formatDate(record.date)}</td>
                          <td>{record.checkIn}</td>
                          <td>{record.checkOut}</td>
                          <td style={{ textAlign: "center" }}>
                            <div className="hr-badge-attendance-hours">
                              {record.totalHours}h
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge hr-badge-status ${
                                record.status === "Đúng giờ"
                                  ? "bg-success"
                                  : record.status === "Đi muộn"
                                  ? "bg-warning"
                                  : "bg-danger"
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              className="btn btn-sm btn-outline-primary me-2 hr-action-button"
                              onClick={() => {
                                setEditingAttendance(record);
                                setShowAttendanceModal(true);
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger hr-action-button"
                              onClick={() => handleDeleteAttendance(record.id)}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          positions={positions}
          roles={roles}
          onSave={handleSaveEmployee}
          onClose={() => {
            setShowModal(false);
            setEditingEmployee(null);
          }}
        />
      )}

      {showShiftModal && (
        <ShiftModal
          shift={editingShift}
          employees={employees}
          shiftTypes={shiftTypes}
          onSave={handleSaveShift}
          onClose={() => {
            setShowShiftModal(false);
            setEditingShift(null);
          }}
        />
      )}

      {showAttendanceModal && (
        <AttendanceModal
          attendance={editingAttendance}
          employees={employees}
          onSave={handleSaveAttendance}
          onClose={() => {
            setShowAttendanceModal(false);
            setEditingAttendance(null);
          }}
        />
      )}

      {showPromoteCustomerModal && (
        <PromoteCustomerModal
          customers={customers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          searchTerm={customerSearchTerm}
          setSearchTerm={setCustomerSearchTerm}
          onPromote={handlePromoteToEmployee}
          onClose={() => {
            setShowPromoteCustomerModal(false);
            setSelectedCustomer(null);
            setCustomerSearchTerm('');
          }}
        />
      )}
    </div>
  );
};

const EmployeeModal = ({ employee, positions, roles, onSave, onClose }) => {
  const [formData, setFormData] = useState(
    employee || {
      name: "",
      phone: "",
      email: "",
      position: "",
      role: "Nhân viên",
      baseSalary: 0,
      bonus: 0,
      hourlyRate: 0,
      contractType: "Toàn thời gian",
      startDate: new Date().toISOString().split("T")[0],
    }
  );

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ tên";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email không hợp lệ";
    if (!formData.position) newErrors.position = "Vui lòng chọn vị trí";
    if (formData.baseSalary < 0) newErrors.baseSalary = "Lương không được âm";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal show d-block hr-modal-backdrop">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content hr-modal-content">
          <div className="modal-header hr-modal-header">
            <h5 className="modal-title">
              {employee ? "✏️ Chỉnh sửa nhân viên" : "➕ Thêm nhân viên mới"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body hr-modal-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label hr-form-label">
                  Họ tên <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label hr-form-label">
                  Số điện thoại <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone}</div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label hr-form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label hr-form-label">
                  Vị trí <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${
                    errors.position ? "is-invalid" : ""
                  }`}
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                >
                  <option value="">Chọn vị trí</option>
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
                {errors.position && (
                  <div className="invalid-feedback">{errors.position}</div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label hr-form-label">Quyền</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label hr-form-label">Loại hợp đồng</label>
                <select
                  className="form-select"
                  value={formData.contractType}
                  onChange={(e) =>
                    setFormData({ ...formData, contractType: e.target.value })
                  }
                >
                  <option value="Toàn thời gian">Toàn thời gian</option>
                  <option value="Bán thời gian">Bán thời gian</option>
                  <option value="Thử việc">Thử việc</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label hr-form-label">Lương cơ bản (VNĐ)</label>
                <input
                  type="number"
                  className={`form-control ${
                    errors.baseSalary ? "is-invalid" : ""
                  }`}
                  value={formData.baseSalary}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      baseSalary: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                {errors.baseSalary && (
                  <div className="invalid-feedback">{errors.baseSalary}</div>
                )}
              </div>
              <div className="col-md-4">
                <label className="form-label hr-form-label">Thưởng (VNĐ)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.bonus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bonus: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="col-md-4">
                <label className="form-label hr-form-label">Lương giờ (VNĐ/h)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hourlyRate: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-label hr-form-label">Ngày bắt đầu</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn hr-modal-submit-button"
              onClick={handleSubmit}
            >
              {employee ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PromoteCustomerModal = ({ customers, selectedCustomer, setSelectedCustomer, searchTerm, setSearchTerm, onPromote, onClose }) => {
  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  return (
    <div className="modal show d-block hr-modal-backdrop">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content hr-modal-content">
          <div className="modal-header hr-modal-header">
            <h5 className="modal-title">
              👤 Chọn Khách Hàng Nâng Cấp Lên Nhân Viên
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body hr-modal-body">
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Tìm kiếm khách hàng theo tên, email, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="table table-hover">
                <thead className="table-light sticky-top">
                  <tr>
                    <th>Chọn</th>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>SĐT</th>
                    <th>Ngày đăng ký</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        Không tìm thấy khách hàng
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(customer => (
                      <tr 
                        key={customer.id}
                        className={selectedCustomer?.id === customer.id ? 'table-active' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <td>
                          <input
                            type="radio"
                            name="selectedCustomer"
                            checked={selectedCustomer?.id === customer.id}
                            onChange={() => setSelectedCustomer(customer)}
                          />
                        </td>
                        <td>{customer.name || 'N/A'}</td>
                        <td>{customer.email || 'N/A'}</td>
                        <td>{customer.phone || 'N/A'}</td>
                        <td>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {selectedCustomer && (
              <div className="alert alert-info mt-3">
                <strong>Đã chọn:</strong> {selectedCustomer.name} ({selectedCustomer.email})
                <br />
                <small>Khách hàng này sẽ được nâng cấp lên role Nhân Viên</small>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onPromote}
              disabled={!selectedCustomer}
            >
              ✅ Nâng cấp lên Nhân Viên
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShiftModal = ({ shift, employees, shiftTypes, onSave, onClose }) => {
  const [formData, setFormData] = useState(
    shift || {
      employeeId: "",
      date: new Date().toISOString().split("T")[0],
      shift: "Sáng",
      startTime: "",
      endTime: "",
      status: "Đã đăng ký",
    }
  );

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeId) newErrors.employeeId = "Vui lòng chọn nhân viên";
    if (!formData.startTime) newErrors.startTime = "Vui lòng nhập giờ bắt đầu";
    if (!formData.endTime) newErrors.endTime = "Vui lòng nhập giờ kết thúc";
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01 ${formData.startTime}`);
      const end = new Date(`2000-01-01 ${formData.endTime}`);
      if (end <= start) {
        newErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal show d-block hr-modal-backdrop">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content hr-modal-content">
          <div className="modal-header hr-modal-header">
            <h5 className="modal-title">
              {shift ? "✏️ Chỉnh sửa ca làm việc" : "➕ Thêm ca làm việc"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body hr-modal-body">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label hr-form-label">
                  Nhân viên <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${
                    errors.employeeId ? "is-invalid" : ""
                  }`}
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                >
                  <option value="">Chọn nhân viên</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                {errors.employeeId && (
                  <div className="invalid-feedback">{errors.employeeId}</div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label hr-form-label">
                  Ngày <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label hr-form-label">Ca làm việc</label>
                <select
                  className="form-select"
                  value={formData.shift}
                  onChange={(e) =>
                    setFormData({ ...formData, shift: e.target.value })
                  }
                >
                  {shiftTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label hr-form-label">
                  Giờ bắt đầu <span className="text-danger">*</span>
                </label>
                <input
                  type="time"
                  className={`form-control ${
                    errors.startTime ? "is-invalid" : ""
                  }`}
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
                {errors.startTime && (
                  <div className="invalid-feedback">{errors.startTime}</div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label hr-form-label">
                  Giờ kết thúc <span className="text-danger">*</span>
                </label>
                <input
                  type="time"
                  className={`form-control ${
                    errors.endTime ? "is-invalid" : ""
                  }`}
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
                {errors.endTime && (
                  <div className="invalid-feedback">{errors.endTime}</div>
                )}
              </div>
            </div>
            <div className="alert alert-info mt-3 mb-0">
              <small>ℹ️ Trạng thái ca làm việc sẽ tự động được đặt là <strong>"Đã đăng ký"</strong></small>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn hr-modal-submit-button"
              onClick={handleSubmit}
            >
              {shift ? "Cập nhật" : "Thêm ca"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttendanceModal = ({ attendance, employees, onSave, onClose }) => {
  const [formData, setFormData] = useState(
    attendance || {
      employeeId: "",
      date: new Date().toISOString().split("T")[0],
      checkIn: "",
      checkOut: "",
      status: "Đúng giờ",
    }
  );

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeId) newErrors.employeeId = "Vui lòng chọn nhân viên";
    if (!formData.checkIn) newErrors.checkIn = "Vui lòng nhập giờ vào";
    if (!formData.checkOut) newErrors.checkOut = "Vui lòng nhập giờ ra";
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(`2000-01-01 ${formData.checkIn}`);
      const checkOut = new Date(`2000-01-01 ${formData.checkOut}`);
      if (checkOut <= checkIn) {
        newErrors.checkOut = "Giờ ra phải sau giờ vào";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal show d-block hr-modal-backdrop">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content hr-modal-content">
          <div className="modal-header hr-modal-header">
            <h5 className="modal-title">
              {attendance
                ? "✏️ Chỉnh sửa chấm công"
                : "➕ Thêm bản ghi chấm công"}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body hr-modal-body">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label hr-form-label">
                  Nhân viên <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${
                    errors.employeeId ? "is-invalid" : ""
                  }`}
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                >
                  <option value="">Chọn nhân viên</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                {errors.employeeId && (
                  <div className="invalid-feedback">{errors.employeeId}</div>
                )}
              </div>
              <div className="col-12">
                <label className="form-label hr-form-label">
                  Ngày <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label hr-form-label">
                  Giờ vào <span className="text-danger">*</span>
                </label>
                <input
                  type="time"
                  className={`form-control ${
                    errors.checkIn ? "is-invalid" : ""
                  }`}
                  value={formData.checkIn}
                  onChange={(e) =>
                    setFormData({ ...formData, checkIn: e.target.value })
                  }
                />
                {errors.checkIn && (
                  <div className="invalid-feedback">{errors.checkIn}</div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label hr-form-label">
                  Giờ ra <span className="text-danger">*</span>
                </label>
                <input
                  type="time"
                  className={`form-control ${
                    errors.checkOut ? "is-invalid" : ""
                  }`}
                  value={formData.checkOut}
                  onChange={(e) =>
                    setFormData({ ...formData, checkOut: e.target.value })
                  }
                />
                {errors.checkOut && (
                  <div className="invalid-feedback">{errors.checkOut}</div>
                )}
              </div>
              <div className="col-12">
                <label className="form-label hr-form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Đúng giờ">Đúng giờ</option>
                  <option value="Đi muộn">Đi muộn</option>
                  <option value="Về sớm">Về sớm</option>
                  <option value="Vắng mặt">Vắng mặt</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn hr-modal-submit-button"
              onClick={handleSubmit}
            >
              {attendance ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRManagementSystem;
