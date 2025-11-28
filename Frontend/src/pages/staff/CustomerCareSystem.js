import React, { useState, useEffect } from 'react';
import { Users, Send, Mail, Phone, MessageSquare, Gift, Bell, Plus, Edit2, Trash2, Search, Calendar, Clock, CheckCircle, X, Heart, Star, Tag, TrendingUp, Sparkles, Award, UserCheck } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/customer-care'; // Adjust if your backend runs on a different port or path

const CustomerCareSystem = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [notification, setNotification] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageTemplates, setMessageTemplates] = useState({});

  useEffect(() => {
    fetchCustomers();
    fetchMessageTemplates();
  }, [searchTerm, filterStatus]);

  const fetchMessageTemplates = async () => {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch(`/api/message-templates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessageTemplates(data);
    } catch (error) {
      console.error("Error fetching message templates:", error);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const params = new URLSearchParams({
        search: searchTerm,
        page: 0,
        size: 100,
      });
      if (filterStatus !== 'all') {
        params.append('active', filterStatus === 'active');
      }
      
      const response = await fetch(`/api/customers?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // API trả về Page object với content array
      setCustomers(data.content || data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Failed to fetch customers.");
      showNotificationMsg("Tải dữ liệu khách hàng thất bại!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCustomers = async () => {
    try {
      showNotificationMsg('Đang đồng bộ khách hàng...', 'info');
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      // Use reset=true to clear old data and sync fresh
      const response = await fetch(`${API_BASE_URL}/sync-customers?reset=true`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      showNotificationMsg('Đồng bộ khách hàng thành công!');
      fetchCustomers(); // Reload customers after sync
    } catch (error) {
      console.error("Error syncing customers:", error);
      showNotificationMsg("Đồng bộ khách hàng thất bại!", "error");
    }
  };

  const [formData, setFormData] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    ngaySinh: '',
    diaChi: '',
    ghiChu: ''
  });

  const [messageData, setMessageData] = useState({
    type: 'reminder',
    content: '',
    sendSMS: true,
    sendEmail: true
  });



  const showNotificationMsg = (message, type = 'success') => {
    setNotification({message, type});
    setTimeout(() => setNotification(''), 3000);
  };

  const fillTemplate = (template, customer) => {
    return template
      .replace(/\[TÊN\]/g, customer.hoTen)
      .replace('[LỊCH HẸN]', customer.nextAppointment || 'Chưa có lịch') // Assuming nextAppointment will be added to KhachHang model or derived
      .replace('[DỊCH VỤ YÊU THÍCH]', customer.favoriteService || 'Dịch vụ bất kỳ') // Assuming favoriteService will be added or derived
      .replace('[ĐIỂM]', customer.diemTichLuy)
      .replace('[TRẠNG THÁI]', customer.status || 'Regular'); // Assuming status will be added or derived
  };

  const openModal = (type, customer = null) => {
    setModalType(type);
    setSelectedCustomer(customer);
    setShowModal(true);
    
    if (type === 'edit' && customer) {
      setFormData({
        hoTen: customer.hoTen,
        soDienThoai: customer.soDienThoai,
        email: customer.email,
        ngaySinh: customer.ngaySinh || '',
        diaChi: customer.diaChi,
        ghiChu: customer.ghiChu || ''
      });
    } else if (type === 'message' && customer) {
      setMessageData({
        type: 'reminder',
        content: fillTemplate(messageTemplates.reminder, customer),
        sendSMS: true,
        sendEmail: true
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  const handleSaveCustomer = async () => {
    if (!formData.hoTen || !formData.soDienThoai) {
      showNotificationMsg('Vui lòng nhập đầy đủ thông tin!', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      showNotificationMsg('Cập nhật thông tin thành công!');
      fetchCustomers(); // Re-fetch customers to update the list
      closeModal();
    } catch (error) {
      console.error("Error saving customer:", error);
      showNotificationMsg("Lưu thông tin thất bại!", "error");
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Bạn có chắc muốn xóa khách hàng này?')) {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        showNotificationMsg('Đã xóa khách hàng!');
        fetchCustomers(); // Re-fetch customers to update the list
      } catch (error) {
        console.error("Error deleting customer:", error);
        showNotificationMsg("Xóa khách hàng thất bại!", "error");
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageData.content) {
      showNotificationMsg('Vui lòng nhập nội dung tin nhắn!', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          messageType: messageData.type,
          content: messageData.content,
          sendSMS: messageData.sendSMS,
          sendEmail: messageData.sendEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const channels = [];
      if (messageData.sendSMS) channels.push('SMS');
      if (messageData.sendEmail) channels.push('Email');

      showNotificationMsg(`Đã gửi tin nhắn đến ${selectedCustomer.hoTen} qua ${channels.join(' & ')}!`);
      closeModal();
    } catch (error) {
      console.error("Error sending message:", error);
      showNotificationMsg("Gửi tin nhắn thất bại!", "error");
    }
  };

  const handleBulkMessage = async (messageType, filter = null) => {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const payload = {
        messageType: messageType,
        content: messageTemplates[messageType] || "", // Use template or empty string
        sendSMS: true, // Assuming bulk messages are sent via SMS by default
        sendEmail: true, // Assuming bulk messages are sent via Email by default
      };

      if (filter) {
        payload.filterStatus = filter;
      } else {
        payload.customerIds = filteredCustomers.map(c => c.id); // Send to all filtered customers
      }

      const response = await fetch(`${API_BASE_URL}/bulk-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const count = filter ? customers.filter(c => c.status === filter).length : filteredCustomers.length;
      showNotificationMsg(`Đã gửi ${messageType} đến ${count} khách hàng!`);
    } catch (error) {
      console.error("Error sending bulk message:", error);
      showNotificationMsg("Gửi tin nhắn hàng loạt thất bại!", "error");
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const name = customer.name || customer.hoTen || '';
    const phone = customer.phone || customer.soDienThoai || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         phone.includes(searchTerm);
    // The backend now handles status filtering, so this client-side filter might be redundant
    // but keeping it for consistency if the backend filter is not always applied.
    const matchesFilter = filterStatus === 'all' || customer.status === filterStatus || customer.vip === (filterStatus === 'VIP');
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: customers.length,
    vip: customers.filter(c => c.vip === true).length,
    totalRevenue: customers.reduce((sum, c) => sum + (c.totalSpent || c.tongChiTieu || 0), 0),
    totalVisits: customers.reduce((sum, c) => sum + (c.visits || c.soLanDen || 0), 0)
  };

  return (
    <div style={{minHeight: '100vh'}}>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet" />

      <div className="container-fluid p-4">

        {/* Statistics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-lg h-100" style={{borderRadius: '20px', background: 'white'}}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="p-3" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '15px'}}>
                    <Users size={24} className="text-white" />
                  </div>
                  <span className="badge bg-light text-dark">+12%</span>
                </div>
                <h3 className="fw-bold mb-1" style={{fontSize: '2rem'}}>{stats.total}</h3>
                <p className="text-muted mb-0">Tổng khách hàng</p>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-lg h-100" style={{borderRadius: '20px', background: 'white'}}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="p-3" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '15px'}}>
                    <Award size={24} className="text-white" />
                  </div>
                  <span className="badge bg-warning text-dark">VIP</span>
                </div>
                <h3 className="fw-bold mb-1" style={{fontSize: '2rem'}}>{stats.vip}</h3>
                <p className="text-muted mb-0">Khách hàng VIP</p>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-lg h-100" style={{borderRadius: '20px', background: 'white'}}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="p-3" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '15px'}}>
                    <TrendingUp size={24} className="text-white" />
                  </div>
                  <span className="badge bg-success">Active</span>
                </div>
                <h3 className="fw-bold mb-1" style={{fontSize: '2rem'}}>{stats.totalVisits}</h3>
                <p className="text-muted mb-0">Lượt sử dụng dịch vụ</p>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="card border-0 shadow-lg h-100" style={{borderRadius: '20px', background: 'white'}}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="p-3" style={{background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '15px'}}>
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <span className="badge bg-info">Revenue</span>
                </div>
                <h3 className="fw-bold mb-1" style={{fontSize: '2rem'}}>{(stats.totalRevenue / 1000000).toFixed(1)}M</h3>
                <p className="text-muted mb-0">Tổng doanh thu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="card border-0 shadow-lg" style={{borderRadius: '25px'}}>
          <div className="card-body p-0">
            {/* Tabs */}
            <div className="p-4 border-bottom">
              <div className="row g-3">
                <div className="col-md-6">
                  <button 
                    className={`btn w-100 py-3 ${activeTab === 'customers' ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => setActiveTab('customers')}
                    style={{borderRadius: '15px', fontWeight: '600'}}
                  >
                    <Users size={20} className="me-2" />
                    Danh sách khách hàng
                  </button>
                </div>
                <div className="col-md-6">
                  <button 
                    className={`btn w-100 py-3 ${activeTab === 'messages' ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => setActiveTab('messages')}
                    style={{borderRadius: '15px', fontWeight: '600'}}
                  >
                    <MessageSquare size={20} className="me-2" />
                    Tin nhắn hàng loạt
                  </button>
                </div>
              </div>
            </div>

            {/* Customer List Tab */}
            {activeTab === 'customers' && (
              <div className="p-4">
                {/* Search & Filter */}
                <div className="row g-3 mb-4">
                  <div className="col-md-5">
                    <div className="input-group" style={{borderRadius: '15px', overflow: 'hidden'}}>
                      <span className="input-group-text bg-light border-0">
                        <Search size={20} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        placeholder="Tìm kiếm khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <select 
                      className="form-select border-0 bg-light"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      style={{borderRadius: '15px', padding: '12px'}}
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="VIP">VIP</option>
                      <option value="Regular">Regular</option>
                      <option value="New">New</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <button 
                      className="btn btn-success w-100 py-2"
                      onClick={handleSyncCustomers}
                      style={{borderRadius: '15px', fontWeight: '600'}}
                      title="Đồng bộ khách hàng từ hệ thống"
                    >
                      <UserCheck size={20} className="me-2" />
                      Đồng bộ khách hàng
                    </button>
                  </div>
                </div>

                {/* Customer Cards */}
                <div className="row g-3">
                  {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="col-md-6 col-lg-4">
                      <div className="card border-0 shadow-sm h-100" style={{borderRadius: '20px', transition: 'transform 0.2s'}}
                           onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                           onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div className="card-body p-4">
                          {/* Header */}
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="d-flex align-items-center">
                              <div className="me-3">
                                {customer.avatar ? (
                                  <img 
                                    src={customer.avatar} 
                                    alt={customer.name || customer.hoTen} 
                                    style={{
                                      width: '50px', 
                                      height: '50px', 
                                      borderRadius: '50%', 
                                      objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                ) : null}
                                <div style={{
                                  fontSize: '2.5rem',
                                  display: customer.avatar ? 'none' : 'block'
                                }}>
                                  👤
                                </div>
                              </div>
                              <div>
                                <h6 className="fw-bold mb-1">{customer.name || customer.hoTen || 'N/A'}</h6>
                                <span className={`badge ${
                                  customer.vip ? 'bg-warning text-dark' : 'bg-primary'
                                }`} style={{borderRadius: '10px', padding: '5px 10px'}}>
                                  {customer.vip && <Star size={12} className="me-1" />}
                                  {customer.vip ? 'VIP' : 'Thường'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="mb-3">
                            <div className="d-flex align-items-center mb-2 text-muted small">
                              <Phone size={14} className="me-2" />
                              {customer.phone || customer.soDienThoai || 'N/A'}
                            </div>
                            <div className="d-flex align-items-center text-muted small">
                              <Mail size={14} className="me-2" />
                              {customer.email || 'N/A'}
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="row g-2 mb-3">
                            <div className="col-4">
                              <div className="text-center p-2 bg-light" style={{borderRadius: '10px'}}>
                                <div className="fw-bold text-primary">{customer.visits || customer.soLanDen || 0}</div>
                                <small className="text-muted">Lượt đến</small>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="text-center p-2 bg-light" style={{borderRadius: '10px'}}>
                                <div className="fw-bold text-success">
                                  {((customer.totalSpent || customer.tongChiTieu || 0) / 1000).toFixed(0)}K
                                </div>
                                <small className="text-muted">Chi tiêu</small>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="text-center p-2 bg-light" style={{borderRadius: '10px'}}>
                                <div className="fw-bold text-warning">{customer.points || customer.diemTichLuy || 0}</div>
                                <small className="text-muted">Điểm</small>
                              </div>
                            </div>
                          </div>

                          {/* Next Appointment */}
                          {customer.nextAppointment && (
                            <div className="alert alert-info mb-3" style={{borderRadius: '10px', padding: '10px'}}>
                              <small className="d-flex align-items-center">
                                <Clock size={14} className="me-2" />
                                <strong>Lịch hẹn:</strong>&nbsp;{customer.nextAppointment}
                              </small>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary flex-fill"
                              onClick={() => openModal('message', customer)}
                              style={{borderRadius: '10px'}}
                            >
                              <Send size={14} className="me-1" />
                              Gửi tin
                            </button>
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => openModal('edit', customer)}
                              style={{borderRadius: '10px'}}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteCustomer(customer.id)}
                              style={{borderRadius: '10px'}}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100" style={{borderRadius: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                      <div className="card-body p-4 text-white">
                        <div className="d-flex align-items-center mb-3">
                          <div className="p-3 bg-white bg-opacity-25" style={{borderRadius: '15px'}}>
                            <Bell size={30} />
                          </div>
                          <div className="ms-3">
                            <h5 className="fw-bold mb-1">Nhắc lịch hẹn</h5>
                            <p className="mb-0 opacity-75 small">Gửi nhắc nhở tự động</p>
                          </div>
                        </div>
                        <p className="mb-3 opacity-90">Gửi tin nhắn nhắc nhở cho tất cả khách hàng có lịch hẹn sắp tới trong 24-48 giờ.</p>
                        <button 
                          className="btn btn-light w-100 py-2 fw-bold"
                          onClick={() => handleBulkMessage('nhắc lịch hẹn')}
                          style={{borderRadius: '12px'}}
                        >
                          <Send size={18} className="me-2" />
                          Gửi ngay ({customers.filter(c => c.nextAppointment).length} khách)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100" style={{borderRadius: '20px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                      <div className="card-body p-4 text-white">
                        <div className="d-flex align-items-center mb-3">
                          <div className="p-3 bg-white bg-opacity-25" style={{borderRadius: '15px'}}>
                            <Heart size={30} />
                          </div>
                          <div className="ms-3">
                            <h5 className="fw-bold mb-1">Lời cảm ơn</h5>
                            <p className="mb-0 opacity-75 small">Gửi sau khi sử dụng dịch vụ</p>
                          </div>
                        </div>
                        <p className="mb-3 opacity-90">Gửi tin nhắn cảm ơn kèm ưu đãi đến khách hàng đã sử dụng dịch vụ trong 7 ngày qua.</p>
                        <button 
                          className="btn btn-light w-100 py-2 fw-bold"
                          onClick={() => handleBulkMessage('lời cảm ơn')}
                          style={{borderRadius: '12px'}}
                        >
                          <Heart size={18} className="me-2" />
                          Gửi ngay ({customers.filter(c => c.lastVisit).length} khách)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100" style={{borderRadius: '20px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                      <div className="card-body p-4 text-white">
                        <div className="d-flex align-items-center mb-3">
                          <div className="p-3 bg-white bg-opacity-25" style={{borderRadius: '15px'}}>
                            <Gift size={30} />
                          </div>
                          <div className="ms-3">
                            <h5 className="fw-bold mb-1">Chúc mừng sinh nhật</h5>
                            <p className="mb-0 opacity-75 small">Tự động gửi vào ngày sinh nhật</p>
                          </div>
                        </div>
                        <p className="mb-3 opacity-90">Gửi lời chúc sinh nhật kèm voucher đặc biệt 200K và ưu đãi giảm 30% tất cả dịch vụ.</p>
                        <button 
                          className="btn btn-light w-100 py-2 fw-bold"
                          onClick={() => handleBulkMessage('chúc mừng sinh nhật')}
                          style={{borderRadius: '12px'}}
                        >
                          <Gift size={18} className="me-2" />
                          Gửi lời chúc sinh nhật
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100" style={{borderRadius: '20px', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>
                      <div className="card-body p-4 text-white">
                        <div className="d-flex align-items-center mb-3">
                          <div className="p-3 bg-white bg-opacity-25" style={{borderRadius: '15px'}}>
                            <MessageSquare size={30} />
                          </div>
                          <div className="ms-3">
                              <h5 className="fw-bold mb-1">Mời quay lại</h5>
                            <p className="mb-0 opacity-75 small">Cho khách lâu không đến</p>
                          </div>
                        </div>
                        <p className="mb-3 opacity-90">Gửi tin nhắn mời quay lại kèm ưu đãi 25% cho khách hàng lâu không sử dụng dịch vụ.</p>
                        <button 
                          className="btn btn-light w-100 py-2 fw-bold"
                          onClick={() => handleBulkMessage('mời quay lại')}
                          style={{borderRadius: '12px'}}
                        >
                          <MessageSquare size={18} className="me-2" />
                          Gửi lời mời quay lại
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Promotions Tab */}
            {activeTab === 'promotions' && (
              <div className="p-4">
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100" style={{borderRadius: '20px'}}>
                      <div className="card-body p-4 text-center">
                        <div className="mb-3">
                          <div className="d-inline-flex p-4" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '20px'}}>
                            <Tag size={40} className="text-white" />
                          </div>
                        </div>
                        <h5 className="fw-bold mb-2">Giảm giá 20%</h5>
                        <p className="text-muted mb-3">Áp dụng cho tất cả dịch vụ massage trong tháng này</p>
                        <div className="mb-3">
                          <span className="badge bg-success px-3 py-2" style={{borderRadius: '10px', fontSize: '0.85rem'}}>
                            <CheckCircle size={14} className="me-1" />
                            Đang áp dụng
                          </span>
                        </div>
                        <button 
                          className="btn btn-primary w-100 py-2"
                          onClick={() => handleBulkMessage('khuyến mãi giảm 20%')}
                          style={{borderRadius: '12px', fontWeight: '600'}}
                        >
                          <Send size={16} className="me-2" />
                          Gửi cho {stats.total} khách hàng
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100" style={{borderRadius: '20px'}}>
                      <div className="card-body p-4 text-center">
                        <div className="mb-3">
                          <div className="d-inline-flex p-4" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '20px'}}>
                            <Gift size={40} className="text-white" />
                          </div>
                        </div>
                        <h5 className="fw-bold mb-2">Combo đặc biệt</h5>
                        <p className="text-muted mb-3">Mua 2 dịch vụ chỉ với giá 1 - Tiết kiệm đến 50%</p>
                        <div className="mb-3">
                          <span className="badge bg-warning text-dark px-3 py-2" style={{borderRadius: '10px', fontSize: '0.85rem'}}>
                            <Clock size={14} className="me-1" />
                            Sắp diễn ra
                          </span>
                        </div>
                        <button 
                          className="btn btn-primary w-100 py-2"
                          onClick={() => handleBulkMessage('combo đặc biệt')}
                          style={{borderRadius: '12px', fontWeight: '600'}}
                        >
                          <Send size={16} className="me-2" />
                          Gửi cho {stats.total} khách hàng
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="card border-0 shadow-sm h-100" style={{borderRadius: '20px'}}>
                      <div className="card-body p-4 text-center">
                        <div className="mb-3">
                          <div className="d-inline-flex p-4" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '20px'}}>
                            <Star size={40} className="text-white" />
                          </div>
                        </div>
                        <h5 className="fw-bold mb-2">Ưu đãi VIP</h5>
                        <p className="text-muted mb-3">Giảm 30% dành riêng cho khách hàng VIP thân thiết</p>
                        <div className="mb-3">
                          <span className="badge bg-danger px-3 py-2" style={{borderRadius: '10px', fontSize: '0.85rem'}}>
                            <Award size={14} className="me-1" />
                            Độc quyền VIP
                          </span>
                        </div>
                        <button 
                          className="btn btn-primary w-100 py-2"
                          onClick={() => handleBulkMessage('ưu đãi VIP')}
                          style={{borderRadius: '12px', fontWeight: '600'}}
                        >
                          <Send size={16} className="me-2" />
                          Gửi cho {stats.vip} khách VIP
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {showModal && modalType === 'edit' && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{borderRadius: '25px', overflow: 'hidden'}}>
              <div className="modal-header border-0" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px'}}>
                <h5 className="modal-title text-white fw-bold d-flex align-items-center">
                  <Edit2 size={24} className="me-2" />
                  Cập nhật thông tin khách hàng
                </h5>
                <button className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Họ và tên <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control border-0 bg-light"
                      value={formData.hoTen}
                      onChange={(e) => setFormData({...formData, hoTen: e.target.value})}
                      placeholder="Nhập họ và tên"
                      style={{borderRadius: '12px', padding: '12px'}}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Số điện thoại <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control border-0 bg-light"
                      value={formData.soDienThoai}
                      onChange={(e) => setFormData({...formData, soDienThoai: e.target.value})}
                      placeholder="Nhập số điện thoại"
                      style={{borderRadius: '12px', padding: '12px'}}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Email</label>
                    <input
                      type="email"
                      className="form-control border-0 bg-light"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Nhập địa chỉ email"
                      style={{borderRadius: '12px', padding: '12px'}}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Ngày sinh</label>
                    <input
                      type="date"
                      className="form-control border-0 bg-light"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      style={{borderRadius: '12px', padding: '12px'}}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">Địa chỉ</label>
                    <input
                      type="text"
                      className="form-control border-0 bg-light"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Nhập địa chỉ"
                      style={{borderRadius: '12px', padding: '12px'}}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">Ghi chú</label>
                    <textarea
                      className="form-control border-0 bg-light"
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Ghi chú về sở thích, yêu cầu đặc biệt..."
                      style={{borderRadius: '12px', padding: '12px'}}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 bg-light p-4">
                <button 
                  className="btn btn-light px-4 py-2" 
                  onClick={closeModal}
                  style={{borderRadius: '12px', fontWeight: '600'}}
                >
                  Hủy bỏ
                </button>
                <button 
                  className="btn btn-primary px-4 py-2" 
                  onClick={handleSaveCustomer}
                  style={{borderRadius: '12px', fontWeight: '600'}}
                >
                  <CheckCircle size={18} className="me-2" />
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showModal && modalType === 'message' && selectedCustomer && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{borderRadius: '25px', overflow: 'hidden'}}>
              <div className="modal-header border-0" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '25px'}}>
                <h5 className="modal-title text-white fw-bold d-flex align-items-center">
                  <MessageSquare size={24} className="me-2" />
                  Gửi tin nhắn cho: {selectedCustomer.hoTen}
                </h5>
                <button className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>

              <div className="modal-body p-4">
                {/* Customer Info */}
                <div className="card border-0 shadow-sm mb-4" style={{borderRadius: '15px', background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)'}}>
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        {selectedCustomer.avatar && selectedCustomer.avatar.startsWith('http') ? (
                          <img 
                            src={selectedCustomer.avatar} 
                            alt={selectedCustomer.hoTen || selectedCustomer.name} 
                            style={{
                              width: '60px', 
                              height: '60px', 
                              borderRadius: '50%', 
                              objectFit: 'cover',
                              border: '3px solid white',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div style={{
                          fontSize: '2.5rem',
                          display: (selectedCustomer.avatar && selectedCustomer.avatar.startsWith('http')) ? 'none' : 'flex',
                          width: '60px',
                          height: '60px',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          borderRadius: '50%',
                          border: '3px solid white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          👤
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="row g-2">
                          <div className="col-md-6">
                            <small className="text-muted">Tên khách hàng</small>
                            <div className="fw-bold">{selectedCustomer.hoTen || selectedCustomer.name}</div>
                          </div>
                          <div className="col-md-6">
                            <small className="text-muted">Số điện thoại</small>
                            <div className="fw-bold">{selectedCustomer.soDienThoai || selectedCustomer.phone}</div>
                          </div>
                          <div className="col-md-6">
                            <small className="text-muted">Email</small>
                            <div className="fw-bold">{selectedCustomer.email || 'N/A'}</div>
                          </div>
                          <div className="col-md-6">
                            <small className="text-muted">Trạng thái</small>
                            <div>
                              <span className={`badge ${
                                selectedCustomer.vip || selectedCustomer.status === 'VIP' ? 'bg-warning text-dark' :
                                selectedCustomer.status === 'Regular' ? 'bg-primary' : 'bg-success'
                              }`} style={{borderRadius: '8px'}}>
                                {selectedCustomer.vip || selectedCustomer.status === 'VIP' ? 'VIP' : selectedCustomer.status || 'Regular'}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <small className="text-muted">Lượt đến</small>
                            <div className="fw-bold text-primary">{selectedCustomer.visits || 0} lần</div>
                          </div>
                          <div className="col-md-6">
                            <small className="text-muted">Chi tiêu</small>
                            <div className="fw-bold text-success">{(selectedCustomer.totalSpent || 0).toLocaleString('vi-VN')}đ</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Templates */}
                <div className="mb-4">
                  <label className="form-label fw-bold mb-3">Chọn mẫu tin nhắn:</label>
                  <div className="row g-2">
                    {[
                      {type: 'reminder', icon: Bell, label: 'Nhắc lịch', color: 'primary'},
                      {type: 'thankyou', icon: Heart, label: 'Cảm ơn', color: 'success'},
                      {type: 'promotion', icon: Tag, label: 'Khuyến mãi', color: 'warning'},
                      {type: 'birthday', icon: Gift, label: 'Sinh nhật', color: 'danger'},
                      {type: 'loyalty', icon: Star, label: 'VIP', color: 'info'},
                      {type: 'comeback', icon: UserCheck, label: 'Quay lại', color: 'secondary'}
                    ].map(({type, icon: Icon, label, color}) => (
                      <div key={type} className="col-6 col-md-4">
                        <button
                          className={`btn w-100 ${messageData.type === type ? `btn-${color}` : 'btn-outline-secondary'}`}
                          onClick={() => setMessageData({
                            ...messageData,
                            type,
                            content: fillTemplate(messageTemplates[type], selectedCustomer)
                          })}
                          style={{borderRadius: '12px', padding: '12px', fontWeight: '600'}}
                        >
                          <Icon size={16} className="me-1" />
                          {label}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Content */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Nội dung tin nhắn:</label>
                  <textarea
                    className="form-control border-0 bg-light"
                    rows="10"
                    value={messageData.content}
                    onChange={(e) => setMessageData({...messageData, content: e.target.value})}
                    placeholder="Nhập nội dung tin nhắn..."
                    style={{borderRadius: '12px', padding: '15px', fontFamily: 'monospace'}}
                  />
                  <small className="text-muted">
                    💡 Bạn có thể chỉnh sửa nội dung tin nhắn trước khi gửi
                  </small>
                </div>

                {/* Send Options */}
                <div className="card border-0 bg-light" style={{borderRadius: '12px'}}>
                  <div className="card-body p-3">
                    <label className="form-label fw-bold mb-3">Kênh gửi tin nhắn:</label>
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="sendSMS"
                            checked={messageData.sendSMS}
                            onChange={(e) => setMessageData({...messageData, sendSMS: e.target.checked})}
                            style={{width: '50px', height: '25px'}}
                          />
                          <label className="form-check-label ms-2" htmlFor="sendSMS">
                            <Phone size={16} className="me-2" />
                            <strong>Gửi qua SMS</strong>
                            <div className="small text-muted">{selectedCustomer.soDienThoai}</div>
                          </label>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-check form-switch">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id="sendEmail"
                            checked={messageData.sendEmail}
                            onChange={(e) => setMessageData({...messageData, sendEmail: e.target.checked})}
                            style={{width: '50px', height: '25px'}}
                          />
                          <label className="form-check-label ms-2" htmlFor="sendEmail">
                            <Mail size={16} className="me-2" />
                            <strong>Gửi qua Email</strong>
                            <div className="small text-muted">{selectedCustomer.email}</div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 bg-light p-4">
                <button 
                  className="btn btn-light px-4 py-2" 
                  onClick={closeModal}
                  style={{borderRadius: '12px', fontWeight: '600'}}
                >
                  Hủy bỏ
                </button>
                <button 
                  className="btn btn-primary px-4 py-2" 
                  onClick={handleSendMessage}
                  style={{borderRadius: '12px', fontWeight: '600'}}
                >
                  <Send size={18} className="me-2" />
                  Gửi tin nhắn ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="position-fixed top-0 end-0 p-3" style={{zIndex: 9999}}>
          <div className={`alert ${notification.type === 'error' ? 'alert-danger' : 'alert-success'} shadow-lg border-0 d-flex align-items-center`}
               style={{borderRadius: '15px', minWidth: '300px'}}>
            <div className="me-3">
              {notification.type === 'error' ? <X size={24} /> : <CheckCircle size={24} />}
            </div>
            <div className="flex-grow-1">
              <strong>{notification.message}</strong>
            </div>
            <button 
              className="btn-close ms-3" 
              onClick={() => setNotification('')}
            ></button>
          </div>
        </div>
      )}

      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js"></script>
    </div>
  );
};

export default CustomerCareSystem;