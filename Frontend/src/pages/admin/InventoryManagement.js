import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, AlertTriangle, TrendingUp, FileText, Download, Loader, X, CheckCircle } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE_URL = '/api'; // Use relative path for proxy

const SpaInventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [modalType, setModalType] = useState('import'); // 'import' or 'export'
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Mỹ phẩm',
    quantity: 0,
    unit: 'Chai',
    minStock: 10,
    price: 0,
    usageCount: 0 // Assuming backend handles this or initializes
  });
  const [stockTransactionData, setStockTransactionData] = useState({
    productId: '',
    quantity: 0,
    notes: ''
  });
  const [showAddRow, setShowAddRow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState('');
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/dich-vu`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Map Vietnamese field names to expected format
        const mappedData = data.map(service => ({
          maDichVu: service.id,
          tenDichVu: service.ten,
          moTa: service.moTa,
          thoiLuongPhut: service.thoiLuongPhut,
          gia: service.gia,
          coSan: service.coSan,
          hinhAnh: service.hinhAnh,
          loai: service.loai
        }));
        console.log('Services loaded:', mappedData);
        setServices(mappedData || []);
      } else {
        console.error('Failed to fetch services:', response.status);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const showNotificationMsg = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(''), 3000);
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Don't show error, just set empty products array to allow UI to display
      setProducts([]);
      // setError("Failed to fetch products.");
      // showNotificationMsg("Tải dữ liệu sản phẩm thất bại!", "error");
    } finally {
      setLoading(false);
    }
  };

  const lowStockProducts = products.filter(p => p.quantity <= p.minStock);
  const topProducts = [...products].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5);

  const handleAddProduct = async () => {
    if (!formData.name || !formData.category || formData.quantity < 0 || formData.price < 0) {
      showNotificationMsg('Vui lòng nhập đầy đủ và hợp lệ các thông tin sản phẩm!', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newProduct = await response.json();
      
      // Lưu liên kết với dịch vụ nếu có chọn
      if (selectedServices.length > 0) {
        await saveServiceProductLinks(newProduct.id, selectedServices);
      }
      
      showNotificationMsg('Thêm sản phẩm thành công!');
      fetchProducts();
      setShowAddModal(false);
      setShowAddRow(false); // Hide the add row after successful addition
      setSelectedServices([]);
      resetForm();
    } catch (error) {
      console.error("Error adding product:", error);
      showNotificationMsg("Thêm sản phẩm thất bại!", "error");
    }
  };

  const saveServiceProductLinks = async (productId, serviceIds) => {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      for (const serviceId of serviceIds) {
        await fetch(`${API_BASE_URL}/service-products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({
            serviceId: parseInt(serviceId),
            productId: productId,
            quantityPerUse: 1
          }),
        });
      }
    } catch (error) {
      console.error("Error saving service-product links:", error);
    }
  };

  const handleEditProduct = async () => {
    if (!formData.name || !formData.category || formData.quantity < 0 || formData.price < 0) {
      showNotificationMsg('Vui lòng nhập đầy đủ và hợp lệ các thông tin sản phẩm!', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/products/${currentProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ ...formData, id: currentProduct.id }), // Ensure ID is in body if backend expects it
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      showNotificationMsg('Cập nhật sản phẩm thành công!');
      fetchProducts();
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error("Error editing product:", error);
      showNotificationMsg("Cập nhật sản phẩm thất bại!", "error");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        showNotificationMsg('Xóa sản phẩm thành công!');
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        showNotificationMsg("Xóa sản phẩm thất bại!", "error");
      }
    }
  };

  const handleStockTransaction = async () => {
    if (!stockTransactionData.productId || stockTransactionData.quantity <= 0) {
      showNotificationMsg('Vui lòng chọn sản phẩm và nhập số lượng hợp lệ!', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/stock-transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          productId: stockTransactionData.productId,
          quantity: stockTransactionData.quantity,
          action: modalType === 'import' ? 'in' : 'out', // Backend expects 'in' or 'out'
          note: stockTransactionData.notes, // Backend uses 'note' not 'notes'
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      showNotificationMsg(`${modalType === 'import' ? 'Nhập' : 'Xuất'} kho thành công!`);
      fetchProducts(); // Re-fetch to update quantities
      setShowStockModal(false);
      setStockTransactionData({ productId: '', quantity: 0, notes: '' }); // Reset stock form
    } catch (error) {
      console.error("Error performing stock transaction:", error);
      showNotificationMsg(`${modalType === 'import' ? 'Nhập' : 'Xuất'} kho thất bại: ${error.message}`, "error");
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Mỹ phẩm',
      quantity: 0,
      unit: 'Chai',
      minStock: 10,
      price: 0,
      usageCount: 0
    });
    setCurrentProduct(null);
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      unit: product.unit,
      minStock: product.minStock,
      price: product.price,
      usageCount: product.usageCount // Keep usageCount
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Loader className="spin" size={50} />
        <p className="ms-3">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {notification && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`alert ${notification.type === 'error' ? 'alert-danger' : 'alert-success'} shadow-lg border-0 d-flex align-items-center`}
            style={{ borderRadius: '15px', minWidth: '300px' }}>
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

      {lowStockProducts.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-warning d-flex align-items-center" role="alert">
              <AlertTriangle className="me-2" size={24} />
              <div>
                <strong>Cảnh báo tồn kho!</strong> Có {lowStockProducts.length} sản phẩm sắp hết hàng: {' '}
                {lowStockProducts.map(p => p.name).join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-2">Tổng sản phẩm</h6>
              <h3 className="mb-0">{products.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-2">Cảnh báo hết hàng</h6>
              <h3 className="mb-0 text-warning">{lowStockProducts.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-2">Tổng giá trị kho</h6>
              <h3 className="mb-0 text-success">
                {(products.reduce((sum, p) => sum + (p.quantity * p.price), 0)).toLocaleString('vi-VN')}đ
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <TrendingUp className="me-2" size={20} />
                  Top 5 Sản phẩm dùng nhiều nhất
                </h5>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Tên sản phẩm</th>
                      <th>Danh mục</th>
                      <th>Số lần sử dụng</th>
                      <th>Tồn kho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map(product => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td><span className="badge bg-info">{product.category}</span></td>
                        <td><strong>{product.usageCount}</strong> lần</td>
                        <td>
                          <span className={`badge ${product.quantity <= product.minStock ? 'bg-danger' : 'bg-success'}`}>
                            {product.quantity} {product.unit}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
            <div className="card-header bg-white border-0" style={{ borderRadius: '16px 16px 0 0', padding: '1.5rem' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1" style={{ fontWeight: '700', color: '#1e293b' }}>Danh sách sản phẩm</h5>
                  <small className="text-muted">Quản lý {products.length} sản phẩm trong kho</small>
                </div>
                <div>
                  <button
                    className="btn btn-success btn-sm me-2 shadow-sm"
                    onClick={() => { setModalType('import'); setShowStockModal(true); }}
                    style={{ borderRadius: '8px', fontWeight: '600' }}
                  >
                    <Download size={16} className="me-1" />
                    Phiếu nhập
                  </button>
                  <button
                    className="btn btn-danger btn-sm shadow-sm"
                    onClick={() => { setModalType('export'); setShowStockModal(true); }}
                    style={{ borderRadius: '8px', fontWeight: '600' }}
                  >
                    <FileText size={16} className="me-1" />
                    Phiếu xuất
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#64748b', fontSize: '0.875rem' }}>ID</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#64748b', fontSize: '0.875rem' }}>Tên sản phẩm</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#64748b', fontSize: '0.875rem' }}>Danh mục</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#64748b', fontSize: '0.875rem' }}>Số lượng</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#64748b', fontSize: '0.875rem' }}>Giá</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#64748b', fontSize: '0.875rem' }}>Dịch vụ</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#64748b', fontSize: '0.875rem' }}>Tồn kho tối thiểu</th>
                      <th style={{ padding: '1rem', fontWeight: '600', color: '#64748b', fontSize: '0.875rem' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!showAddRow ? (
                      <tr
                        style={{
                          backgroundColor: '#f0fdf4',
                          cursor: 'pointer',
                          borderLeft: '4px solid #22c55e'
                        }}
                        onClick={() => setShowAddRow(true)}
                      >
                        <td colSpan="8" style={{ padding: '1.5rem', textAlign: 'center' }}>
                          <div className="d-flex align-items-center justify-content-center">
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                backgroundColor: '#22c55e',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '1rem'
                              }}
                            >
                              <Plus size={24} color="white" strokeWidth={3} />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ fontWeight: '700', fontSize: '1rem', color: '#166534' }}>
                                Thêm sản phẩm mới vào kho
                              </div>
                              <div style={{ fontSize: '0.875rem', color: '#15803d' }}>
                                Nhấn vào đây để thêm sản phẩm mới: mỹ phẩm, tinh dầu, dụng cụ...
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #22c55e' }}>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#475569' }}>Mới</td>
                        <td style={{ padding: '1rem' }}>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Tên sản phẩm"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ borderRadius: '6px', border: '2px solid #86efac' }}
                          />
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <select
                            className="form-select form-select-sm"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            style={{ borderRadius: '6px', border: '2px solid #86efac' }}
                          >
                            <option value="Mỹ phẩm">Mỹ phẩm</option>
                            <option value="Tinh dầu">Tinh dầu</option>
                            <option value="Dụng cụ">Dụng cụ</option>
                          </select>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div className="d-flex gap-1">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="SL"
                              value={formData.quantity}
                              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                              style={{ width: '60px', borderRadius: '6px', border: '2px solid #86efac' }}
                            />
                            <select
                              className="form-select form-select-sm"
                              value={formData.unit}
                              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                              style={{ width: '80px', borderRadius: '6px', border: '2px solid #86efac' }}
                            >
                              <option value="Chai">Chai</option>
                              <option value="Hộp">Hộp</option>
                              <option value="Cái">Cái</option>
                              <option value="Lọ">Lọ</option>
                            </select>
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Giá"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                            style={{ borderRadius: '6px', border: '2px solid #86efac' }}
                          />
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <select
                            multiple
                            className="form-select form-select-sm"
                            value={selectedServices}
                            onChange={(e) => {
                              const selected = Array.from(e.target.selectedOptions, option => option.value);
                              setSelectedServices(selected);
                            }}
                            style={{ height: '80px', borderRadius: '6px', border: '2px solid #86efac', fontSize: '0.75rem' }}
                          >
                            <option value="" disabled>Chọn dịch vụ...</option>
                            {services.map(service => (
                              <option key={service.maDichVu} value={service.maDichVu}>
                                {service.tenDichVu}
                              </option>
                            ))}
                          </select>
                          <small style={{ color: '#15803d', fontSize: '0.7rem' }}>Giữ Ctrl để chọn nhiều</small>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Min"
                            value={formData.minStock}
                            onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                            style={{ width: '70px', borderRadius: '6px', border: '2px solid #86efac', marginBottom: '0.5rem' }}
                          />
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            className="btn btn-sm me-1"
                            onClick={() => {
                              handleAddProduct();
                            }}
                            style={{
                              backgroundColor: '#22c55e',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.4rem 0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            ✓
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => {
                              setShowAddRow(false);
                              resetForm();
                            }}
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.4rem 0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    )}
                    {showAddRow && (
                      <tr style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
                        <td colSpan="8" style={{ padding: '1rem' }}>
                          <div className="d-flex align-items-center gap-3">
                            <strong style={{ color: '#92400e', minWidth: '150px' }}>🔗 Liên kết dịch vụ:</strong>
                            <div className="flex-grow-1">
                              <select
                                multiple
                                className="form-select form-select-sm"
                                value={selectedServices}
                                onChange={(e) => {
                                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                                  setSelectedServices(selected);
                                }}
                                style={{ 
                                  borderRadius: '6px', 
                                  border: '2px solid #fbbf24',
                                  minHeight: '80px'
                                }}
                              >
                                {services.map(service => (
                                  <option key={service.maDichVu} value={service.maDichVu}>
                                    {service.tenDichVu} ({service.thoiLuongPhut} phút)
                                  </option>
                                ))}
                              </select>
                              <small className="text-muted d-block mt-1">
                                💡 Giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn nhiều dịch vụ. 
                                Sản phẩm này sẽ tự động trừ khi hoàn thành các dịch vụ đã chọn.
                              </small>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {products.map(product => (
                      <tr key={product.id} style={{ borderLeft: '4px solid transparent' }}>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#475569' }}>#{product.id}</td>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#1e293b' }}>{product.name}</td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: product.category === 'Mỹ phẩm' ? '#dbeafe' : product.category === 'Tinh dầu' ? '#fce7f3' : '#fef3c7',
                              color: product.category === 'Mỹ phẩm' ? '#1e40af' : product.category === 'Tinh dầu' ? '#9f1239' : '#92400e',
                              fontWeight: '600',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '6px'
                            }}
                          >
                            {product.category}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', color: '#475569' }}>
                          <span style={{ fontWeight: '700', color: '#1e293b' }}>{product.quantity}</span> {product.unit}
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '600', color: '#059669' }}>
                          {product.price.toLocaleString('vi-VN')}đ
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
                          <span className="badge bg-secondary">Xem chi tiết</span>
                        </td>
                        <td style={{ padding: '1rem', color: '#6b7280' }}>
                          {product.minStock}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {product.quantity <= product.minStock ? (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                                fontWeight: '600',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px'
                              }}
                            >
                              <AlertTriangle size={14} className="me-1" />
                              Sắp hết
                            </span>
                          ) : (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                                fontWeight: '600',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px'
                              }}
                            >
                              Còn hàng
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            className="btn btn-sm me-2"
                            onClick={() => openEditModal(product)}
                            style={{
                              backgroundColor: '#eff6ff',
                              color: '#1e40af',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.5rem 0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.5rem 0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm sản phẩm mới</h5>
                <button type="button" className="btn-close" onClick={() => { setShowAddModal(false); resetForm(); }}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tên sản phẩm</label>
                  <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Danh mục</label>
                  <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                    <option value="Mỹ phẩm">Mỹ phẩm</option>
                    <option value="Tinh dầu">Tinh dầu</option>
                    <option value="Dụng cụ">Dụng cụ</option>
                  </select>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Số lượng</label>
                    <input type="number" className="form-control" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Đơn vị</label>
                    <select className="form-select" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                      <option value="Chai">Chai</option>
                      <option value="Hộp">Hộp</option>
                      <option value="Cái">Cái</option>
                      <option value="Lọ">Lọ</option>
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Tồn kho tối thiểu</label>
                    <input type="number" className="form-control" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Giá (VNĐ)</label>
                    <input type="number" className="form-control" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAddModal(false); resetForm(); }}>Hủy</button>
                <button type="button" className="btn btn-primary" onClick={handleAddProduct}>Thêm sản phẩm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sửa thông tin sản phẩm</h5>
                <button type="button" className="btn-close" onClick={() => { setShowEditModal(false); resetForm(); }}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tên sản phẩm</label>
                  <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Danh mục</label>
                  <select className="form-select" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                    <option value="Mỹ phẩm">Mỹ phẩm</option>
                    <option value="Tinh dầu">Tinh dầu</option>
                    <option value="Dụng cụ">Dụng cụ</option>
                  </select>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Số lượng</label>
                    <input type="number" className="form-control" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Đơn vị</label>
                    <select className="form-select" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                      <option value="Chai">Chai</option>
                      <option value="Hộp">Hộp</option>
                      <option value="Cái">Cái</option>
                      <option value="Lọ">Lọ</option>
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Tồn kho tối thiểu</label>
                    <input type="number" className="form-control" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Giá (VNĐ)</label>
                    <input type="number" className="form-control" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); resetForm(); }}>Hủy</button>
                <button type="button" className="btn btn-primary" onClick={handleEditProduct}>Cập nhật</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStockModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === 'import' ? 'Tạo phiếu nhập kho' : 'Tạo phiếu xuất kho'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowStockModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <strong>Gợi ý nhập hàng:</strong> Các sản phẩm sau đang có tồn kho thấp và cần nhập thêm:
                  <ul className="mb-0 mt-2">
                    {lowStockProducts.map(p => (
                      <li key={p.id}>{p.name} - Còn {p.quantity} {p.unit} (Tối thiểu: {p.minStock})</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-3">
                  <label className="form-label">Chọn sản phẩm</label>
                  <select
                    className="form-select"
                    value={stockTransactionData.productId}
                    onChange={(e) => setStockTransactionData({ ...stockTransactionData, productId: e.target.value })}
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Hiện có: {p.quantity} {p.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Số lượng</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Nhập số lượng"
                    value={stockTransactionData.quantity}
                    onChange={(e) => setStockTransactionData({ ...stockTransactionData, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Ghi chú thêm..."
                    value={stockTransactionData.notes}
                    onChange={(e) => setStockTransactionData({ ...stockTransactionData, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStockModal(false)}>Hủy</button>
                <button type="button" className="btn btn-primary" onClick={handleStockTransaction}>
                  {modalType === 'import' ? 'Tạo phiếu nhập' : 'Tạo phiếu xuất'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaInventoryManagement;