import React, { useState, useEffect } from "react";
import {
  Search,
  Send,
  Gift,
  Calendar,
  Award,
  Star,
  Phone,
  Mail,
  Clock,
  Edit,
  Trash2,
  Plus,
  UserPlus,
  Filter,
  Download,
  Upload,
  MessageCircle,
  Bell,
  Tag,
  FileText,
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/pages/admin/CustomerManagement.css";
import { showToast } from "../../components/Toast";
import { showConfirm } from "../../components/ConfirmModal";

const CustomerManagement = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filterVIP, setFilterVIP] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [preferences, setPreferences] = useState({
    favoriteService: '',
    preferredStaff: '',
    notes: ''
  });
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    birthDate: "",
    address: "",
    note: "",
  });

  const fetchCustomers = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const params = new URLSearchParams({
        search: searchTerm,
        page: 0,
        size: 100,
      });
      if (filterVIP !== 'all') {
        params.append('vip', filterVIP === 'vip');
      }
      
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/customers?${params.toString()}`, { headers });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCustomers(data.content || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      showToast("Không thể tải danh sách khách hàng", "error");
    }
  }, [searchTerm, filterVIP]);

  useEffect(() => {
    const debounceFetch = setTimeout(() => {
        fetchCustomers();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [fetchCustomers]);


  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      showToast("Vui lòng nhập họ tên và số điện thoại!", "warning");
      return;
    }
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        showToast('Vui lòng đăng nhập lại!', 'error');
        return;
      }
      
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            ...newCustomer,
            birthDate: newCustomer.birthDate || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "An unknown error occurred" }));
        throw new Error(errorData.error || 'Failed to create customer');
      }

      setShowAddModal(false);
      setNewCustomer({ name: "", phone: "", email: "", birthDate: "", address: "", note: "" });
      showToast("Đã thêm khách hàng thành công!", "success");
      fetchCustomers();
    } catch (error) {
      console.error("Failed to add customer:", error);
      showToast(`Lỗi khi thêm khách hàng: ${error.message}`, "error");
    }
  };

  const handleEditCustomer = async () => {
    if (!editCustomer || !editCustomer.id) return;
    
    console.log('=== FRONTEND UPDATE DEBUG ===');
    console.log('Edit Customer Data:', editCustomer);
    console.log('Sending to backend:', {
      name: editCustomer.name,
      phone: editCustomer.phone,
      email: editCustomer.email,
      address: editCustomer.address,
      birthDate: editCustomer.birthday,
      note: editCustomer.notes,
      active: editCustomer.active
    });
    
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        showToast('Vui lòng đăng nhập lại!', 'error');
        return;
      }
      
      const response = await fetch(`/api/customers/${editCustomer.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: editCustomer.name,
            phone: editCustomer.phone,
            email: editCustomer.email,
            address: editCustomer.address,
            birthDate: editCustomer.birthday,
            note: editCustomer.notes,
            active: editCustomer.active
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "An unknown error occurred" }));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to update customer');
      }

      const result = await response.json();
      console.log('Update successful:', result);
      console.log('=== END FRONTEND DEBUG ===');

      setShowEditModal(false);
      setEditCustomer(null);
      showToast("Đã cập nhật thông tin khách hàng!", "success");
      fetchCustomers();
    } catch (error) {
      console.error("Failed to edit customer:", error);
      showToast(`Lỗi khi cập nhật: ${error.message}`, "error");
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    const confirmed = await showConfirm("Bạn có chắc muốn xóa (ẩn) khách hàng này?", "Xóa khách hàng");
    if (confirmed) {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          showToast('Vui lòng đăng nhập lại!', 'error');
          return;
        }
        
        const response = await fetch(`/api/customers/${customerId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok && response.status !== 204) {
          const errorData = await response.json().catch(() => ({ error: "An unknown error occurred" }));
          throw new Error(errorData.error || 'Failed to delete customer');
        }

        showToast("Đã xóa (ẩn) khách hàng thành công!", "success");
        if (selectedCustomer?.id === customerId) {
          setSelectedCustomer(null);
        }
        fetchCustomers();
      } catch (error) {
        console.error("Failed to delete customer:", error);
        showToast(`Lỗi khi xóa: ${error.message}`, "error");
      }
    }
  };

  const handleUpdatePreferences = async () => {
    if (!selectedCustomer) return;
    
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        showToast('Vui lòng đăng nhập lại!', 'error');
        return;
      }
      
      const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: selectedCustomer.name,
          phone: selectedCustomer.phone,
          email: selectedCustomer.email,
          address: selectedCustomer.address,
          birthDate: selectedCustomer.birthday,
          note: preferences.notes,
          preferences: preferences.favoriteService,
          preferredStaff: preferences.preferredStaff,
          active: selectedCustomer.active
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "An unknown error occurred" }));
        throw new Error(errorData.error || 'Failed to update preferences');
      }

      setShowPreferencesModal(false);
      showToast("Đã cập nhật thói quen & sở thích!", "success");
      fetchCustomers();
    } catch (error) {
      console.error("Failed to update preferences:", error);
      showToast(`Lỗi khi cập nhật: ${error.message}`, "error");
    }
  };

  const handleUpdateVIP = async (customerId, currentVipStatus) => {
     const confirmed = await showConfirm(`Bạn có chắc muốn ${currentVipStatus ? 'hủy' : 'nâng cấp'} VIP cho khách hàng này?`, "Cập nhật VIP");
     if (confirmed) {
        try {
            const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
            if (!token) {
              showToast('Vui lòng đăng nhập lại!', 'error');
              return;
            }
            
            const response = await fetch(`/api/customers/${customerId}/loyalty`, {
                method: 'PUT',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ vip: !currentVipStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "An unknown error occurred" }));
                throw new Error(errorData.error || 'Failed to update VIP status');
            }
            showToast("Đã cập nhật trạng thái VIP thành công!", "success");
            fetchCustomers();
        } catch (error) {
            console.error("Failed to update VIP status:", error);
            showToast(`Lỗi khi cập nhật VIP: ${error.message}`, "error");
        }
     }
  };

  return (
    <div className="customer-management-container">
      <div className="container-fluid">
        <div className="row">
          {/* Customer List */}
          <div className="col-lg-5 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                {/* Search and Filter */}
                <div className="mb-3">
                  <div className="input-group mb-2 search-input-group">
                    <span className="input-group-text">
                      <Search size={18} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm tên, SĐT, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <div className="btn-group flex-grow-1" role="group">
                      <button
                        className={`btn btn-sm ${
                          filterVIP === "all"
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => setFilterVIP("all")}
                      >
                        Tất cả
                      </button>
                      <button
                        className={`btn btn-sm ${
                          filterVIP === "vip"
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => setFilterVIP("vip")}
                      >
                        <Star size={14} className="me-1" />
                        VIP
                      </button>
                      <button
                        className={`btn btn-sm ${
                          filterVIP === "normal"
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => setFilterVIP("normal")}
                      >
                        Thường
                      </button>
                    </div>
                    <button
                      className="btn btn-sm gradient-button"
                      onClick={() => setShowAddModal(true)}
                    >
                      <UserPlus size={14} className="me-1" />
                      Thêm mới
                    </button>
                  </div>
                </div>

                {/* Customer Cards */}
                <div className="customer-list-scroll">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className={`card mb-2 customer-card ${
                        selectedCustomer?.id === customer.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <div className="card-body p-3">
                        <div className="d-flex align-items-start">
                          <img
                            src={customer.avatar}
                            alt={customer.name}
                            className="rounded-circle customer-avatar"
                          />
                          <div className="ms-3 flex-grow-1">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <div className="d-flex align-items-center gap-2">
                                <h6 className="mb-0 fw-bold">
                                  {customer.name}
                                </h6>
                                {customer.vip && (
                                  <span className="badge text-white px-2 py-1 vip-badge">
                                    <Star size={10} className="me-1" />
                                    VIP
                                  </span>
                                )}
                              </div>
                              <button
                                className="btn btn-sm btn-link text-danger p-0 ms-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomer(customer.id);
                                }}
                                title="Xóa khách hàng"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <p className="mb-1 small text-muted">
                              <Phone size={12} className="me-1" />
                              {customer.phone}
                            </p>
                            <div className="d-flex gap-3">
                              <small className="text-muted">
                                <Award size={12} className="me-1" />
                                {customer.points} điểm
                              </small>
                              <small className="text-muted">
                                <Calendar size={12} className="me-1" />
                                {customer.visits} lượt
                              </small>
                              <small className="text-success fw-bold">
                                {(customer.totalSpent / 1000000).toFixed(1)}M
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Detail */}
          <div className="col-lg-7">
            {selectedCustomer ? (
              <div className="card border-0 shadow-sm">
                <div className="card-header text-white p-4 gradient-bg">
                  <div className="d-flex align-items-center">
                    <img
                      src={selectedCustomer.avatar}
                      alt={selectedCustomer.name}
                      className="rounded-circle border border-3 border-white detail-header-avatar"
                    />
                    <div className="ms-4 flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h4 className="mb-0 fw-bold">
                          {selectedCustomer.name}
                        </h4>
                        {selectedCustomer.vip && (
                          <span className="badge bg-warning text-dark px-2 py-1">
                            <Star size={14} className="me-1" />
                            VIP Member
                          </span>
                        )}
                      </div>
                      <div className="d-flex gap-3 small text-white-50">
                        <span>
                          <Phone size={14} className="me-1" />
                          {selectedCustomer.phone}
                        </span>
                        <span>
                          <Mail size={14} className="me-1" />
                          {selectedCustomer.email}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-light btn-sm"
                        onClick={() => {
                          setEditCustomer({ ...selectedCustomer });
                          setShowEditModal(true);
                        }}
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn btn-light btn-sm"
                        onClick={() => setShowPromoModal(true)}
                        title="Gửi ưu đãi"
                      >
                        <Send size={16} />
                      </button>
                      <button
                        className="btn btn-light btn-sm"
                        onClick={() => handleUpdateVIP(selectedCustomer.id, selectedCustomer.vip)}
                        title={
                          selectedCustomer.vip ? "Hủy VIP" : "Nâng cấp VIP"
                        }
                      >
                        <Star size={16} />
                      </button>
                      <button
                        className="btn btn-light btn-sm"
                        onClick={() =>
                          handleDeleteCustomer(selectedCustomer.id)
                        }
                        title="Xóa khách hàng"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card-body p-4">
                  {/* Info Grid */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div className="info-card p-3 rounded">
                        <div className="d-flex align-items-center mb-2">
                          <Award size={20} className="text-primary me-2" />
                          <small className="text-muted">Điểm tích lũy</small>
                        </div>
                        <h3 className="mb-0 fw-bold text-primary">
                          {selectedCustomer.points} điểm
                        </h3>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="info-card p-3 rounded">
                        <div className="d-flex align-items-center mb-2">
                          <Gift size={20} className="text-success me-2" />
                          <small className="text-muted">Tổng chi tiêu</small>
                        </div>
                        <h3 className="mb-0 fw-bold text-success">
                          {selectedCustomer.totalSpent?.toLocaleString()}đ
                        </h3>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="info-card p-3 rounded">
                        <div className="d-flex align-items-center mb-2">
                          <Calendar size={20} className="text-info me-2" />
                          <small className="text-muted">Số lượt đặt</small>
                        </div>
                        <h3 className="mb-0 fw-bold text-info">
                          {selectedCustomer.visits} lượt
                        </h3>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="info-card p-3 rounded">
                        <div className="d-flex align-items-center mb-2">
                          <Clock size={20} className="text-warning me-2" />
                          <small className="text-muted">Ngày tham gia</small>
                        </div>
                        <h6 className="mb-0 fw-bold text-warning">
                          {selectedCustomer.joinDate ? new Date(selectedCustomer.joinDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </h6>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Info */}
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">
                      <FileText size={18} className="me-2" />
                      Thông tin chi tiết
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="detail-item">
                          <label className="text-muted small">Sinh nhật</label>
                          <p className="mb-0 fw-medium">
                            {selectedCustomer.birthday ? new Date(selectedCustomer.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                          </p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="detail-item">
                          <label className="text-muted small">Ngày sinh nhật</label>
                          <p className="mb-0 fw-medium">
                            {selectedCustomer.birthday ? new Date(selectedCustomer.birthday).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="detail-item">
                          <label className="text-muted small">Email</label>
                          <p className="mb-0 fw-medium">
                            {selectedCustomer.email || 'Chưa cập nhật'}
                          </p>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="detail-item">
                          <label className="text-muted small">Địa chỉ</label>
                          <p className="mb-0 fw-medium">
                            {selectedCustomer.address || 'Chưa cập nhật'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preferences & Notes */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fw-bold mb-0">
                        <Tag size={18} className="me-2" />
                        Thói quen & Sở thích
                      </h6>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          setPreferences({
                            favoriteService: selectedCustomer.preferences || '',
                            preferredStaff: selectedCustomer.preferredStaff || '',
                            notes: selectedCustomer.notes || ''
                          });
                          setShowPreferencesModal(true);
                        }}
                      >
                        <Edit size={14} className="me-1" />
                        Sửa
                      </button>
                    </div>
                    <div className="alert alert-light mb-3">
                      <small className="text-muted">Dịch vụ yêu thích</small>
                      <p className="mb-0 fw-medium">
                        {selectedCustomer.preferences || 'Massage body'}
                      </p>
                    </div>
                    <div className="alert alert-light mb-0">
                      <small className="text-muted">Nhân viên ưa chuộng</small>
                      <p className="mb-0 fw-medium">
                        {selectedCustomer.preferredStaff || 'Thu Hà'}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <h6 className="fw-bold mb-3">
                      <MessageCircle size={18} className="me-2" />
                      Ghi chú
                    </h6>
                    <div className="alert alert-info mb-0">
                      <p className="mb-0">
                        {selectedCustomer.notes || 'Thích phòng yên tĩnh, da nhạy cảm'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center empty-state">
                  <Award size={64} className="text-muted mb-3" />
                  <h5 className="text-muted">
                    Chọn khách hàng để xem chi tiết
                  </h5>
                  <p className="text-muted">
                    Nhấn vào khách hàng bên trái để xem thông tin đầy đủ
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="modal d-block modal-backdrop-custom">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header text-white modal-header-gradient">
                  <h5 className="modal-title">
                    <UserPlus size={20} className="me-2" />
                    Thêm khách hàng mới
                  </h5>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Họ tên *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nguyễn Văn A"
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label">Số điện thoại *</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="09xxxxxxxx"
                        value={newCustomer.phone}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="email@example.com"
                        value={newCustomer.email}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Sinh nhật</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newCustomer.birthDate}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          birthDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Địa chỉ</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Địa chỉ khách hàng"
                      value={newCustomer.address}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ghi chú</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Thói quen, sở thích..."
                      value={newCustomer.note}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          note: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn gradient-button"
                    onClick={handleAddCustomer}
                  >
                    Thêm khách hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Modal */}
        {showPreferencesModal && (
          <div className="modal d-block modal-backdrop-custom">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header text-white modal-header-gradient">
                  <h5 className="modal-title">
                    <Tag size={20} className="me-2" />
                    Cập nhật ghi chú khách hàng
                  </h5>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => setShowPreferencesModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Dịch vụ yêu thích</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Massage body"
                      value={preferences.favoriteService}
                      onChange={(e) =>
                        setPreferences({ ...preferences, favoriteService: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nhân viên ưa chuộng</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Thu Hà"
                      value={preferences.preferredStaff}
                      onChange={(e) =>
                        setPreferences({ ...preferences, preferredStaff: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ghi chú thói quen</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Thích phòng yên tĩnh, da nhạy cảm"
                      value={preferences.notes}
                      onChange={(e) =>
                        setPreferences({ ...preferences, notes: e.target.value })
                      }
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowPreferencesModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn gradient-button"
                    onClick={handleUpdatePreferences}
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {showEditModal && editCustomer && (
          <div className="modal d-block modal-backdrop-custom">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header text-white modal-header-gradient">
                  <h5 className="modal-title">
                    <Edit size={20} className="me-2" />
                    Chỉnh sửa thông tin khách hàng
                  </h5>
                  <button
                    className="btn-close btn-close-white"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditCustomer(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Họ tên *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editCustomer.name || ''}
                      onChange={(e) =>
                        setEditCustomer({ ...editCustomer, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label">Số điện thoại *</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={editCustomer.phone || ''}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={editCustomer.email || ''}
                        onChange={(e) =>
                          setEditCustomer({
                            ...editCustomer,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Sinh nhật</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editCustomer.birthday || ''}
                      onChange={(e) =>
                        setEditCustomer({
                          ...editCustomer,
                          birthday: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Địa chỉ</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={editCustomer.address || ''}
                      onChange={(e) =>
                        setEditCustomer({
                          ...editCustomer,
                          address: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ghi chú</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={editCustomer.notes || ''}
                      onChange={(e) =>
                        setEditCustomer({
                          ...editCustomer,
                          notes: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="activeCheck"
                      checked={editCustomer.active !== false}
                      onChange={(e) =>
                        setEditCustomer({
                          ...editCustomer,
                          active: e.target.checked,
                        })
                      }
                    />
                    <label className="form-check-label" htmlFor="activeCheck">
                      Tài khoản đang hoạt động
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditCustomer(null);
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn gradient-button"
                    onClick={handleEditCustomer}
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerManagement;