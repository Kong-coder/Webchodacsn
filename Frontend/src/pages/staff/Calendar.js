import React, { useState, useEffect, useCallback, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Calendar.css';
import { Calendar as CalendarIcon, CheckCircle, Gift, Star, Info, Trash2, Eye, Search, Filter, Clock, User, Phone, Mail, Edit, Crown, Plus, TrendingDown } from 'lucide-react';

const SpaCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNoteSlot, setSelectedNoteSlot] = useState(null);
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [quickNotes, setQuickNotes] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const currentUser = useMemo(() => {
    try {
      const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      console.log('=== CALENDAR DEBUG ===');
      console.log('Raw userInfo:', userInfo);
      const parsed = userInfo ? JSON.parse(userInfo) : null;
      console.log('Parsed userInfo:', parsed);
      console.log('User ID:', parsed?.id);
      console.log('User ma_nguoi_dung:', parsed?.ma_nguoi_dung);
      console.log('User maNguoiDung:', parsed?.maNguoiDung);
      
      // Handle different possible field names for user ID
      if (parsed) {
        // Ensure we have an 'id' field - check multiple possible field names
        if (!parsed.id && parsed.ma_nguoi_dung) {
          parsed.id = parsed.ma_nguoi_dung;
        } else if (!parsed.id && parsed.maNguoiDung) {
          parsed.id = parsed.maNguoiDung;
        }
        console.log('Final User ID:', parsed.id);
      }
      
      return parsed;
    } catch (error) {
      console.error("Failed to parse user info from localStorage", error);
      return null;
    }
  }, []);

  const noteTypes = [
    { value: 'break', label: '☕ Nghỉ giải lao', color: '#fff3cd' },
    { value: 'off', label: '🚫 Nghỉ phép', color: '#f8d7da' },
    { value: 'busy', label: '⏰ Bận việc', color: '#d1ecf1' }
  ];

  const timeSlots = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  const formatDateToISO = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWeekDates = (date) => {
    const curr = new Date(date);
    const firstDayOfWeek = curr.getDate() - curr.getDay(); // Sunday is 0
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr.getFullYear(), curr.getMonth(), firstDayOfWeek + i);
      weekDates.push(day);
    }
    return weekDates;
  };

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const fetchShifts = useCallback(async () => {
    if (!currentUser || !currentUser.id) {
      console.log('=== FETCH SHIFTS SKIPPED ===');
      console.log('currentUser:', currentUser);
      console.log('currentUser.id:', currentUser?.id);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const requestBody = {
        employeeId: currentUser.id,
        from: formatDateToISO(weekStart),
        to: formatDateToISO(weekEnd),
        status: filterStatus === 'all' ? null : filterStatus,
      };
      
      console.log('=== FETCH SHIFTS REQUEST ===');
      console.log('Request URL:', '/api/staff-shifts/search');
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      console.log('Token exists:', !!token);
      
      const response = await fetch(`/api/staff-shifts/search?t=${Date.now()}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error('Failed to fetch shifts');
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      console.log('Number of shifts:', data?.length || 0);
      
      // Log first shift to check format
      if (data && data.length > 0) {
        console.log('First shift sample:', JSON.stringify(data[0], null, 2));
        console.log('First shift date:', data[0].date);
        console.log('First shift startTime:', data[0].startTime);
        console.log('First shift endTime:', data[0].endTime);
        console.log('timeSlots array:', timeSlots);
        console.log('Is startTime in timeSlots?', timeSlots.includes(data[0].startTime));
      }
      
      setShifts(data || []);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      alert(`Lỗi khi tải lịch làm việc: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentUser, weekStart, weekEnd, filterStatus]);

  const fetchQuickNotes = useCallback(async () => {
    if (!currentUser || !currentUser.id) return;
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch('/api/quick-notes', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (!response.ok) throw new Error('Failed to fetch quick notes');
      const data = await response.json();
      // Filter notes client-side for the current week
      const notesForWeek = data.filter(note => {
        const noteDate = new Date(note.date);
        return noteDate >= weekStart && noteDate <= weekEnd;
      });
      setQuickNotes(notesForWeek || []);
    } catch (error) {
      console.error("Error fetching quick notes:", error);
    }
  }, [currentUser, weekStart, weekEnd]);

  const fetchAttendanceRecords = useCallback(async () => {
    if (!currentUser || !currentUser.id) return;
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch(`/api/attendance/qr/employee/${currentUser.id}?from=${formatDateToISO(weekStart)}&to=${formatDateToISO(weekEnd)}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (!response.ok) throw new Error('Failed to fetch attendance records');
      const data = await response.json();
      setAttendanceRecords(data || []);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    }
  }, [currentUser, weekStart, weekEnd]);

  const fetchServicesList = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch('/api/dich-vu', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (!response.ok) throw new Error('Failed to fetch services list');
      const data = await response.json();
      // Map Vietnamese field names to English for consistency
      const mappedData = data.map(service => ({
        id: service.id,
        name: service.ten,
        description: service.moTa,
        duration: service.thoiLuongPhut,
        price: service.gia,
        available: service.coSan,
        image: service.hinhAnh,
        type: service.loai
      }));
      console.log('Services loaded:', mappedData);
      setServicesList(mappedData || []);
    } catch (error) {
      console.error("Error fetching services list:", error);
    }
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      fetchShifts();
      fetchQuickNotes();
      fetchAttendanceRecords();
    }
  }, [fetchShifts, fetchQuickNotes, fetchAttendanceRecords, currentUser]);

  useEffect(() => {
    fetchServicesList();
  }, [fetchServicesList]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'shift-data-updated') {
        console.log('Shift data was updated in another tab. Refetching...');
        fetchShifts();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchShifts]);

  const calculateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    serviceId: '',
    customerName: '',
    employeeId: currentUser?.id || '',
    phone: '',
    note: '',
    status: 'pending',
    commission: 0
  });

  const [noteFormData, setNoteFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    type: 'break',
    note: '',
    color: '#fff3cd',
    employeeId: currentUser?.id || '',
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, employeeId: currentUser?.id || '' }));
    setNoteFormData(prev => ({ ...prev, employeeId: currentUser?.id || '' }));
  }, [currentUser]);

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleTimeSlotClick = (date, time, e) => {
    if (e && e.button === 2) {
      e.preventDefault();
      handleAddQuickNote(date, time);
      return;
    }
    
    setEditingShift(null);
    setFormData({
      date: formatDateToISO(date),
      startTime: time,
      endTime: calculateEndTime(time, servicesList[0]?.duration || 60), // Default duration
      serviceId: '',
      customerName: '',
      employeeId: currentUser?.id || '',
      phone: '',
      note: '',
      status: 'pending',
      commission: 0
    });
    setShowModal(true);
  };

  const handleAddQuickNote = (date, time) => {
    setSelectedNoteSlot({ date: formatDateToISO(date), time });
    setNoteFormData({
      date: formatDateToISO(date),
      startTime: time,
      endTime: calculateEndTime(time, 60),
      type: 'break',
      note: '',
      color: '#fff3cd',
      employeeId: currentUser?.id || '',
    });
    setShowNoteModal(true);
  };

  const handleShiftClick = (shift, e) => {
    e.stopPropagation();
    setEditingShift(shift.id);
    const service = servicesList.find(s => s.id === shift.serviceId);
    
    // Find attendance record for this shift
    const attendance = attendanceRecords.find(a => a.date === shift.date);
    
    setFormData({
      ...shift,
      serviceId: shift.serviceId,
      date: formatDateToISO(new Date(shift.date)),
      endTime: calculateEndTime(shift.startTime, service?.duration || 60),
      attendanceId: attendance?.id,
      checkInTime: attendance?.checkInTime,
      checkOutTime: attendance?.checkOutTime,
      totalHours: attendance?.totalHours
    });
    setShowModal(true);
  };

  const handleCheckOut = async (attendanceId) => {
    if (!attendanceId) {
      alert('Không tìm thấy bản ghi chấm công');
      return;
    }

    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch(`/api/attendance/qr/checkout/${attendanceId}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Chấm công ra thất bại');
      }

      const data = await response.json();
      alert(`Chấm công ra thành công! Tổng giờ làm: ${data.totalHours?.toFixed(1)}h`);
      
      // Refresh attendance records
      fetchAttendanceRecords();
      setShowModal(false);
    } catch (error) {
      console.error('Check-out error:', error);
      alert(error.message);
    }
  };

  const handleNoteClick = (note, e) => {
    e.stopPropagation();
    setSelectedNoteSlot({ date: note.date, time: note.startTime });
    setNoteFormData({ ...note, date: formatDateToISO(new Date(note.date)) });
    setShowNoteModal(true);
  };

  const handleDeleteShift = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa ca làm này?')) {
      try {
        const response = await fetch(`/api/staff-shifts/${id}`, { method: 'DELETE' });
        if (!response.ok && response.status !== 204) throw new Error('Failed to delete shift');
        fetchShifts();
        setShowModal(false);
      } catch (error) {
        console.error("Delete shift error:", error);
        alert("Xóa ca làm thất bại.");
      }
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa ghi chú này?')) {
      try {
        const response = await fetch(`/api/quick-notes/${id}`, { method: 'DELETE' });
        if (!response.ok && response.status !== 204) throw new Error('Failed to delete note');
        fetchQuickNotes();
        setShowNoteModal(false);
      } catch (error) {
        console.error("Delete note error:", error);
        alert("Xóa ghi chú thất bại.");
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.startTime || !formData.serviceId || !formData.customerName) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    const service = servicesList.find(s => s.id === formData.serviceId);
    const payload = {
      ...formData,
      employeeId: currentUser.id,
      serviceId: formData.serviceId,
      duration: service?.duration || 60,
      price: service?.price || 0,
      commission: (service?.price || 0) * 0.5, // Example commission calculation
    };

    try {
      const url = editingShift ? `/api/staff-shifts/${editingShift}` : '/api/staff-shifts';
      const method = editingShift ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save shift');
      fetchShifts();
      setShowModal(false);
    } catch (error) {
      console.error("Save shift error:", error);
      alert("Lưu ca làm thất bại.");
    }
  };

  const handleNoteSubmit = async () => {
    if (!noteFormData.date || !noteFormData.startTime || !noteFormData.note) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    const payload = { ...noteFormData, employeeId: currentUser.id };

    try {
      const existingNote = quickNotes.find(n => n.date === noteFormData.date && n.startTime === noteFormData.startTime);
      const url = existingNote ? `/api/quick-notes/${existingNote.id}` : '/api/quick-notes';
      const method = existingNote ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save note');
      fetchQuickNotes();
      setShowNoteModal(false);
    } catch (error) {
      console.error("Save note error:", error);
      alert("Lưu ghi chú thất bại.");
    }
  };

  const handleServiceChange = (serviceId) => {
    const service = servicesList.find(s => s.id === parseInt(serviceId));
    if (service) {
      const endTime = calculateEndTime(formData.startTime, service.duration);
      setFormData({
        ...formData,
        serviceId: parseInt(serviceId),
        endTime: endTime,
        commission: (service.price || 0) * 0.5 // Example commission calculation
      });
    }
  };

  const handleNoteTypeChange = (type) => {
    const noteType = noteTypes.find(t => t.value === type);
    if (noteType) {
      setNoteFormData({
        ...noteFormData,
        type: type,
        color: noteType.color
      });
    }
  };

  const getShiftForTimeSlot = (date, time) => {
    const dateStr = formatDateToISO(date);
    return shifts.find(shift => shift.date === dateStr && shift.startTime === time);
  };

  const getNoteForTimeSlot = (date, time) => {
    const dateStr = formatDateToISO(date);
    return quickNotes.find(note => note.date === dateStr && note.startTime === time);
  };

  const calculateShiftHeight = (startTime, endTime) => {
    const start = timeSlots.indexOf(startTime);
    const end = timeSlots.indexOf(endTime);
    if (start === -1 || end === -1 || start >= end) return 1; // Default to 1 slot if invalid
    return end - start;
  };

  const getWeekStats = (weekStart, weekEnd) => {
    const weekShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= weekStart && shiftDate <= weekEnd;
    });
    
    const completed = weekShifts.filter(s => s.status === 'completed').length;
    const totalCommission = weekShifts
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + (s.commission || 0), 0);
    
    const totalHours = weekShifts.reduce((sum, shift) => {
      const service = servicesList.find(s => s.id === shift.serviceId);
      return sum + (service?.duration || 0) / 60;
    }, 0);
    
    return {
      total: weekShifts.length,
      completed,
      pending: weekShifts.length - completed,
      commission: totalCommission,
      hours: totalHours
    };
  };

  const stats = getWeekStats(weekStart, weekEnd);

  if (!currentUser || !currentUser.id) {
    console.error('Calendar: No user found or no user ID');
    console.error('currentUser:', currentUser);
    return (
      <div className="container text-center py-5">
        <div className="alert alert-warning">
          <h4>Vui lòng đăng nhập để xem lịch làm việc</h4>
          <p>Bạn cần đăng nhập với tài khoản Nhân viên để truy cập trang này.</p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/LoginPage'}>
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="stats-banner">
        <h5 className="mb-0" style={{ fontWeight: 600 }}>
          <CalendarIcon className="me-2" size={20} />
          Tuần {weekStart.getDate()}/{weekStart.getMonth() + 1} - {weekEnd.getDate()}/{weekEnd.getMonth() + 1}/{weekEnd.getFullYear()}
        </h5>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-value">{stats.total}</div><div className="stat-label">Ca làm</div></div>
          <div className="stat-item"><div className="stat-value">{stats.completed}</div><div className="stat-label">Hoàn thành</div></div>
          <div className="stat-item"><div className="stat-value">{stats.pending}</div><div className="stat-label">Chưa xong</div></div>
          <div className="stat-item"><div className="stat-value">{stats.hours.toFixed(1)}h</div><div className="stat-label">Tổng giờ</div></div>
          <div className="stat-item"><div className="stat-value">{(stats.commission / 1000).toFixed(0)}K</div><div className="stat-label">Hoa hồng</div></div>
        </div>
      </div>

      <div className="calendar-controls">
        <div className="btn-group">
          <button className="btn btn-outline-primary" onClick={handlePrevWeek}>Tuần trước</button>
          <button className="btn btn-outline-primary" onClick={() => setCurrentDate(new Date())}>Hôm nay</button>
          <button className="btn btn-outline-primary" onClick={handleNextWeek}>Tuần sau</button>
        </div>

        <div className="filter-tabs">
          <button className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>Tất cả ({shifts.length})</button>
          <button className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>Chưa xong ({shifts.filter(s => s.status === 'pending').length})</button>
          <button className={`filter-tab ${filterStatus === 'completed' ? 'active' : ''}`} onClick={() => setFilterStatus('completed')}>Hoàn thành ({shifts.filter(s => s.status === 'completed').length})</button>
        </div>
      </div>

      <div className="help-text">💡 <strong>Mẹo:</strong> Click chuột phải vào ô trống để thêm ghi chú nhanh (nghỉ phép, bận việc, giờ nghỉ...)</div>

      <div className="week-view-container">
        <div className="week-grid">
          <div className="time-column">
            <div className="time-slot-header"></div>
            {timeSlots.map(time => <div key={time} className="time-slot">{time}</div>)}
          </div>

          {weekDates.map((date, dayIndex) => {
            const isToday = formatDateToISO(date) === formatDateToISO(new Date());
            return (
              <div key={dayIndex} className="day-column">
                <div className={`day-header ${isToday ? 'today' : ''}`}><div className="day-name">{['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][dayIndex]}</div><div className="day-date">{date.getDate()}</div></div>
                {timeSlots.map((time, timeIndex) => {
                  const shift = getShiftForTimeSlot(date, time);
                  const note = getNoteForTimeSlot(date, time);
                  const hasEvent = !!shift || !!note;
                  
                  return (
                    <div key={timeIndex} className={`time-cell ${hasEvent ? 'has-event' : ''}`} onClick={(e) => !hasEvent && handleTimeSlotClick(date, time, e)} onContextMenu={(e) => { e.preventDefault(); handleAddQuickNote(date, time); }}>
                      {shift && timeIndex === timeSlots.indexOf(shift.startTime) && (
                        <div className="shift-block" style={{ backgroundColor: shift.color || '#e3f2fd', height: `${calculateShiftHeight(shift.startTime, shift.endTime) * 60 - 4}px` }} onClick={(e) => handleShiftClick(shift, e)}>
                          <div className="shift-service">
                            {shift.serviceId ? 
                              (servicesList.find(s => s.id === shift.serviceId)?.name || 'Dịch vụ không rõ') : 
                              'Ca làm việc'}
                          </div>
                          {shift.customerName && <div className="shift-customer">{shift.customerName}</div>}
                          <div className="shift-time">{shift.startTime} - {shift.endTime}</div>
                          {shift.status === 'completed' && <span className="shift-status-badge badge bg-success">✓ Xong</span>}
                          {shift.status === 'registered' && <span className="shift-status-badge badge bg-info">📋 Đã đăng ký</span>}
                        </div>
                      )}
                      {note && timeIndex === timeSlots.indexOf(note.startTime) && (
                        <div className="note-block" style={{ backgroundColor: note.color || '#fff3cd', height: `${calculateShiftHeight(note.startTime, note.endTime) * 60 - 4}px` }} onClick={(e) => handleNoteClick(note, e)}>
                          <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px' }}>{noteTypes.find(t => t.value === note.type)?.label}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{note.note}</div>
                          <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>{note.startTime} - {note.endTime}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Shift Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingShift ? 'Chi tiết ca làm' : 'Thêm ca làm mới'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 mb-3"><label className="form-label">Ngày làm việc</label><input type="date" className="form-control" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} /></div>
                  <div className="col-md-4 mb-3"><label className="form-label">Giờ bắt đầu</label><select className="form-select" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})}><option value="">Chọn giờ</option>{timeSlots.map(time => <option key={time} value={time}>{time}</option>)}</select></div>
                  <div className="col-md-4 mb-3"><label className="form-label">Giờ kết thúc</label><input type="text" className="form-control" value={formData.endTime} disabled placeholder="Tự động tính" style={{ background: '#f8f9fa' }} /></div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3"><label className="form-label">Dịch vụ</label><select className="form-select" value={formData.serviceId} onChange={(e) => handleServiceChange(e.target.value)}><option value="">Chọn dịch vụ</option>{servicesList.map(service => <option key={service.id} value={service.id}>{service.name} ({service.duration}p - {service.price.toLocaleString('vi-VN')}đ)</option>)}</select></div>
                  <div className="col-md-6 mb-3"><label className="form-label">Tên khách hàng</label><input type="text" className="form-control" placeholder="Nhập tên khách" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} /></div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3"><label className="form-label">Số điện thoại</label><input type="tel" className="form-control" placeholder="0901234567" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
                  <div className="col-md-6 mb-3"><label className="form-label">Trạng thái</label><select className="form-select" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}><option value="pending">Chưa hoàn thành</option><option value="completed">Đã hoàn thành</option></select></div>
                </div>
                <div className="mb-3"><label className="form-label">Ghi chú</label><textarea className="form-control" rows="3" placeholder="VD: Khách muốn tinh dầu oải hương, yêu cầu massage nhẹ nhàng..." value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})}></textarea></div>
                
                {/* Attendance Information */}
                {formData.attendanceId && (
                  <div className="alert alert-info mb-3">
                    <h6 className="alert-heading">📋 Thông tin chấm công</h6>
                    <div className="row">
                      <div className="col-md-4">
                        <strong>Giờ vào:</strong> {formData.checkInTime || 'Chưa chấm công'}
                      </div>
                      <div className="col-md-4">
                        <strong>Giờ ra:</strong> {formData.checkOutTime || 'Chưa chấm công ra'}
                      </div>
                      <div className="col-md-4">
                        <strong>Tổng giờ:</strong> {formData.totalHours ? `${formData.totalHours.toFixed(1)}h` : '-'}
                      </div>
                    </div>
                    {formData.checkInTime && !formData.checkOutTime && (
                      <button 
                        type="button" 
                        className="btn btn-success btn-sm mt-2"
                        onClick={() => handleCheckOut(formData.attendanceId)}
                      >
                        ✓ Chấm công ra
                      </button>
                    )}
                  </div>
                )}

                <div className="d-flex justify-content-between pt-3 border-top">
                  {editingShift && <button type="button" className="btn btn-danger" onClick={() => handleDeleteShift(editingShift)}>Xóa ca làm</button>}
                  {!editingShift && <div></div>}
                  <div><button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>Hủy</button><button type="button" className="btn btn-primary" onClick={handleSubmit}>Lưu ca làm</button></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Note Modal */}
      {showNoteModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm ghi chú nhanh</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowNoteModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Loại ghi chú</label>
                  <div className="note-type-selector">
                    {noteTypes.map(type => (
                      <div key={type.value} className={`note-type-card ${noteFormData.type === type.value ? 'active' : ''}`} style={{ backgroundColor: noteFormData.type === type.value ? type.color : 'white' }} onClick={() => handleNoteTypeChange(type.value)}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>{type.label.split(' ')[0]}</div>
                        <div style={{ fontSize: '13px', fontWeight: '500' }}>{type.label.split(' ').slice(1).join(' ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-3"><label className="form-label">Ngày</label><input type="date" className="form-control" value={noteFormData.date} onChange={(e) => setNoteFormData({...noteFormData, date: e.target.value})} /></div>
                  <div className="col-md-4 mb-3"><label className="form-label">Từ giờ</label><select className="form-select" value={noteFormData.startTime} onChange={(e) => setNoteFormData({...noteFormData, startTime: e.target.value})}><option value="">Chọn</option>{timeSlots.map(time => <option key={time} value={time}>{time}</option>)}</select></div>
                  <div className="col-md-4 mb-3"><label className="form-label">Đến giờ</label><select className="form-select" value={noteFormData.endTime} onChange={(e) => setNoteFormData({...noteFormData, endTime: e.target.value})}><option value="">Chọn</option>{timeSlots.map(time => <option key={time} value={time}>{time}</option>)}</select></div>
                </div>
                <div className="mb-3"><label className="form-label">Ghi chú chi tiết</label><textarea className="form-control" rows="3" placeholder="VD: Nghỉ trưa, đi khám bệnh, họp nhóm..." value={noteFormData.note} onChange={(e) => setNoteFormData({...noteFormData, note: e.target.value})}></textarea></div>
                <div className="d-flex justify-content-between pt-3 border-top">
                  {selectedNoteSlot && quickNotes.find(n => n.date === selectedNoteSlot.date && n.startTime === selectedNoteSlot.time) && <button type="button" className="btn btn-danger" onClick={() => { const note = quickNotes.find(n => n.date === selectedNoteSlot.date && n.startTime === selectedNoteSlot.time); if (note) handleDeleteNote(note.id); }}>Xóa ghi chú</button>}
                  {!selectedNoteSlot && <div></div>}
                  <div><button type="button" className="btn btn-secondary me-2" onClick={() => setShowNoteModal(false)}>Hủy</button><button type="button" className="btn btn-primary" onClick={handleNoteSubmit}>Lưu ghi chú</button></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <button className="quick-action-btn" onClick={() => handleTimeSlotClick(new Date(), '09:00')} title="Thêm ca làm mới"><Plus size={28} /></button>

      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"/>
    </div>
  );
};

export default SpaCalendar;