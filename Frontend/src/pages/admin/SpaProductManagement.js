import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Package,
  AlertTriangle,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  DollarSign,
  BarChart3,
  X,
  CheckCircle,
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/pages/admin/SpaProductManagement.css";
import { showConfirm } from "../../components/ConfirmModal";

const SpaProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAction, setStockAction] = useState("in");
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockNote, setStockNote] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    minStock: "",
    image: "",
    expiryDate: "",
    supplier: "",
    cost: "",
  });

  const categories = [
    "Chăm sóc da mặt",
    "Chăm sóc cơ thể",
    "Massage",
    "Mặt nạ",
    "Tẩy tế bào chết",
    "Nước hoa",
  ];

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (filterType !== 'all') params.append('filterType', filterType);

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data || []);
    } catch (error) {
      console.error(error);
      showNotificationMessage("Lỗi khi tải sản phẩm!", "error");
    }
  }, [searchTerm, selectedCategory, filterType]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const showNotificationMessage = (message, type = "success") => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleSaveProduct = async () => {
    const url = modalType === 'add' ? '/api/products' : `/api/products/${selectedProduct.id}`;
    const method = modalType === 'add' ? 'POST' : 'PUT';
    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct),
        });
        if (!response.ok) throw new Error(modalType === 'add' ? 'Create failed' : 'Update failed');
        setShowModal(false);
        showNotificationMessage(`✅ Đã ${modalType === 'add' ? 'thêm' : 'cập nhật'} sản phẩm thành công!`);
        fetchProducts();
    } catch (error) {
        console.error(error);
        showNotificationMessage(`Lỗi: ${error.message}`, 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirmed = await showConfirm("Bạn có chắc chắn muốn xóa sản phẩm này?", "Xóa sản phẩm");
    if (confirmed) {
      try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (!response.ok && response.status !== 204) throw new Error('Delete failed');
        showNotificationMessage("✅ Đã xóa sản phẩm thành công!");
        fetchProducts();
      } catch (error) {
        console.error(error);
        showNotificationMessage("Lỗi khi xóa sản phẩm.", 'error');
      }
    }
  };

  const handleStockUpdate = async () => {
    if (!selectedProduct || !stockQuantity) return;
    try {
        const response = await fetch('/api/stock-transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: selectedProduct.id,
                action: stockAction,
                quantity: parseInt(stockQuantity),
                note: stockNote,
            }),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Stock update failed');
        }
        setShowStockModal(false);
        setStockQuantity("");
        setStockNote("");
        showNotificationMessage(`✅ Đã ${stockAction === 'in' ? 'nhập' : 'xuất'} kho thành công!`);
        fetchProducts(); // Refetch products to get updated quantity
    } catch (error) {
        console.error(error);
        showNotificationMessage(`Lỗi: ${error.message}`, 'error');
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: "", category: "", price: "", quantity: "", minStock: "",
      image: "", expiryDate: "", supplier: "", cost: "",
    });
    setSelectedProduct(null);
  };

  const openModal = (type, product = null) => {
    setModalType(type);
    setSelectedProduct(product);
    if (product) {
      setNewProduct(product);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const openStockModal = (product, action) => {
    setSelectedProduct(product);
    setStockAction(action);
    setShowStockModal(true);
  };

  const getLowStockProducts = () => products.filter((p) => p.quantity <= p.minStock);
  const getExpiringProducts = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return products.filter((p) => p.expiryDate && new Date(p.expiryDate) <= thirtyDaysFromNow);
  };

  const getTotalValue = () => products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const getTotalCost = () => products.reduce((sum, p) => sum + p.cost * p.quantity, 0);

  const formatCurrency = (amount) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString("vi-VN") : 'N/A';

  const exportToCSV = () => {
    // This can be replaced with a backend call to /api/products/export
    const headers = ["ID", "Tên sản phẩm", "Danh mục", "Giá bán", "Giá vốn", "Tồn kho", "Tồn kho tối thiểu", "Hạn dùng", "Nhà cung cấp"];
    const rows = products.map((p) => [p.id, p.name, p.category, p.price, p.cost, p.quantity, p.minStock, p.expiryDate, p.supplier]);
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `danh-sach-san-pham-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotificationMessage("✅ Đã xuất file Excel thành công!");
  };

  const calculateNewQuantity = () => {
    if (!selectedProduct || !stockQuantity) return selectedProduct?.quantity || 0;
    const qty = parseInt(stockQuantity || 0);
    return stockAction === "in" ? (selectedProduct?.quantity || 0) + qty : Math.max(0, (selectedProduct?.quantity || 0) - qty);
  };

  const willBeLowStock = () => calculateNewQuantity() <= (selectedProduct?.minStock || 0);

  return (
    <div className="container-fluid p-3 spa-container">
      {showNotification && (
        <div className="position-fixed top-0 end-0 p-3 spa-notification">
          <div className="toast show" role="alert">
            <div className="toast-header bg-success text-white border-0">
              <CheckCircle className="me-2" size={18} />
              <strong className="me-auto">Thông báo</strong>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowNotification(false)}></button>
            </div>
            <div className="toast-body">{notificationMessage}</div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 text-dark fw-bold"><Package className="me-2 mb-1" size={32} />Quản lý Sản phẩm Spa</h2>
          <p className="text-muted mb-0">Quản lý kho hàng và theo dõi sản phẩm hiệu quả</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-success" onClick={exportToCSV}><Download className="me-1" size={16} />Xuất Excel</button>
          <button className="btn btn-outline-primary"><BarChart3 className="me-1" size={16} />Báo cáo</button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card border-0 shadow-sm h-100 card-gradient-purple">
            <div className="card-body p-3 text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small mb-1 fw-semibold">TỔNG SẢN PHẨM</div>
                  <div className="h3 mb-0 fw-bold">{products.length}</div>
                  <small className="text-white-50">sản phẩm</small>
                </div>
                <div className="rounded-circle p-3 card-icon-circle"><Package size={32} /></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card border-0 shadow-sm h-100 card-gradient-pink">
            <div className="card-body p-3 text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small mb-1 fw-semibold">SẮP HẾT HÀNG</div>
                  <div className="h3 mb-0 fw-bold">{getLowStockProducts().length}</div>
                  <small className="text-white-50">sản phẩm cần nhập</small>
                </div>
                <div className="rounded-circle p-3 card-icon-circle"><TrendingDown size={32} /></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card border-0 shadow-sm h-100 card-gradient-blue">
            <div className="card-body p-3 text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small mb-1 fw-semibold">GIÁ TRỊ KHO</div>
                  <div className="h5 mb-0 fw-bold">{formatCurrency(getTotalValue())}</div>
                  <small className="text-white-50">Vốn: {formatCurrency(getTotalCost())}</small>
                </div>
                <div className="rounded-circle p-3 card-icon-circle"><DollarSign size={32} /></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6">
          <div className="card border-0 shadow-sm h-100 card-gradient-orange">
            <div className="card-body p-3 text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small mb-1 fw-semibold">SẮP HẾT HẠN</div>
                  <div className="h3 mb-0 fw-bold">{getExpiringProducts().length}</div>
                  <small className="text-white-50">trong 30 ngày tới</small>
                </div>
                <div className="rounded-circle p-3 card-icon-circle"><Calendar size={32} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body p-3">
          <div className="row g-3 align-items-end">
            <div className="col-lg-4 col-md-6">
              <label className="form-label small text-muted mb-1 fw-semibold">Tìm kiếm sản phẩm</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><Search size={16} className="text-muted" /></span>
                <input type="text" className="form-control border-start-0 ps-0" placeholder="Nhập tên hoặc danh mục..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <label className="form-label small text-muted mb-1 fw-semibold">Danh mục</label>
              <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
            </div>
            <div className="col-lg-5 col-md-12">
              <div className="d-flex gap-2 justify-content-lg-end">
                <button className="btn btn-primary" onClick={() => openModal("add")}><Plus className="me-1" size={16} />Thêm sản phẩm</button>
                <button className={`btn ${filterType !== "all" ? "btn-warning" : "btn-outline-secondary"}`} onClick={() => setShowFilterModal(true)}>
                  <Filter className="me-1" size={16} />Lọc
                  {filterType !== "all" && (<span className="badge bg-white text-warning ms-1">1</span>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <h5 className="mb-1 fw-bold">Danh sách sản phẩm</h5>
                    <small className="text-muted">Hiển thị {products.length} sản phẩm</small>
                </div>
                {filterType !== "all" && (
                <button className="btn btn-sm btn-outline-danger" onClick={() => setFilterType("all")}><X size={14} className="me-1" />Xóa bộ lọc</button>
                )}
            </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="ps-3" width="80">Ảnh</th>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th className="text-end">Giá bán</th>
                  <th className="text-end">Giá vốn</th>
                  <th className="text-center">Tồn kho</th>
                  <th>Hạn dùng</th>
                  <th>Nhà cung cấp</th>
                  <th className="text-center pe-3" width="150">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="9" className="text-center py-5 text-muted"><Package size={48} className="mb-2 empty-state-icon" /><div>Không tìm thấy sản phẩm nào</div></td></tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td className="ps-3"><img src={product.image} alt={product.name} className="rounded shadow-sm product-image" /></td>
                      <td>
                        <div className="fw-semibold text-dark">{product.name}</div>
                        <small className="text-muted">#{product.id}</small>
                      </td>
                      <td><span className="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1">{product.category}</span></td>
                      <td className="text-end"><div className="fw-bold text-success">{formatCurrency(product.price)}</div></td>
                      <td className="text-end"><div className="text-muted small">{formatCurrency(product.cost)}</div></td>
                      <td className="text-center">
                        <div className="d-flex flex-column align-items-center">
                          <span className={`badge ${product.quantity <= product.minStock ? "bg-danger" : product.quantity <= product.minStock * 1.5 ? "bg-warning text-dark" : "bg-success"} mb-1 px-3 py-1`}>{product.quantity}</span>
                          <small className="text-muted text-micro">Tối thiểu: {product.minStock}</small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          <span className={`badge ${new Date(product.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "bg-danger" : "bg-info"} mb-1`}>{formatDate(product.expiryDate)}</span>
                          <small className="text-muted text-micro">Còn {Math.max(0, Math.floor((new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)))} ngày</small>
                        </div>
                      </td>
                      <td><small className="text-muted">{product.supplier}</small></td>
                      <td className="text-center pe-3">
                        <div className="btn-group btn-group-sm" role="group">
                          <button className="btn btn-outline-success" onClick={() => openStockModal(product, "in")} title="Nhập kho"><Plus size={14} /></button>
                          <button className="btn btn-outline-warning" onClick={() => openStockModal(product, "out")} title="Xuất kho"><TrendingDown size={14} /></button>
                          <button className="btn btn-outline-primary" onClick={() => openModal("edit", product)} title="Chỉnh sửa"><Edit3 size={14} /></button>
                          <button className="btn btn-outline-danger" onClick={() => handleDeleteProduct(product.id)} title="Xóa"><Trash2 size={14} /></button>
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

      {/* Modals */} 
      {showFilterModal && (
        <div className="modal show d-block modal-backdrop-custom" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-2">
                <h5 className="modal-title fw-bold"><Filter className="me-2 mb-1" size={20} />Bộ lọc sản phẩm</h5>
                <button type="button" className="btn-close" onClick={() => setShowFilterModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="list-group">
                  <button className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${filterType === "all" ? "active" : ""}`} onClick={() => { setFilterType("all"); setShowFilterModal(false); }}>
                    <div><div className="fw-semibold">Tất cả sản phẩm</div><small>Hiển thị toàn bộ sản phẩm</small></div>
                    <span className="badge bg-primary rounded-pill">{products.length}</span>
                  </button>
                  <button className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${filterType === "lowStock" ? "active" : ""}`} onClick={() => { setFilterType("lowStock"); setShowFilterModal(false); }}>
                    <div><div className="fw-semibold">Sắp hết hàng</div><small>Sản phẩm có số lượng ≤ tồn kho tối thiểu</small></div>
                    <span className="badge bg-danger rounded-pill">{getLowStockProducts().length}</span>
                  </button>
                  <button className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${filterType === "expiring" ? "active" : ""}`} onClick={() => { setFilterType("expiring"); setShowFilterModal(false); }}>
                    <div><div className="fw-semibold">Sắp hết hạn</div><small>Hết hạn trong vòng 30 ngày</small></div>
                    <span className="badge bg-warning text-dark rounded-pill">{getExpiringProducts().length}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal show d-block modal-backdrop-custom" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-2">
                <h5 className="modal-title fw-bold">{modalType === "add" ? <><Plus className="me-2 mb-1" size={20} />Thêm sản phẩm mới</> : <><Edit3 className="me-2 mb-1" size={20} />Chỉnh sửa sản phẩm</>}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6"><label className="form-label fw-semibold">Tên sản phẩm <span className="text-danger">*</span></label><input type="text" className="form-control" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Nhập tên sản phẩm" /></div>
                  <div className="col-md-6"><label className="form-label fw-semibold">Danh mục <span className="text-danger">*</span></label><select className="form-select" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}><option value="">Chọn danh mục</option>{categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
                  <div className="col-md-6"><label className="form-label fw-semibold">Giá bán <span className="text-danger">*</span></label><input type="number" className="form-control" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0" /></div>
                  <div className="col-md-6"><label className="form-label fw-semibold">Giá vốn</label><input type="number" className="form-control" value={newProduct.cost} onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })} placeholder="0" /></div>
                  <div className="col-md-6"><label className="form-label fw-semibold">Số lượng</label><input type="number" className="form-control" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })} placeholder="0" /></div>
                  <div className="col-md-6"><label className="form-label fw-semibold">Tồn kho tối thiểu</label><input type="number" className="form-control" value={newProduct.minStock} onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })} placeholder="10" /></div>
                  <div className="col-md-6"><label className="form-label fw-semibold">Hạn sử dụng</label><input type="date" className="form-control" value={newProduct.expiryDate} onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })} /></div>
                  <div className="col-md-6"><label className="form-label fw-semibold">Nhà cung cấp</label><input type="text" className="form-control" placeholder="Tên nhà cung cấp" value={newProduct.supplier} onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })} /></div>
                  <div className="col-12"><label className="form-label fw-semibold">URL hình ảnh</label><input type="text" className="form-control" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} placeholder="https://example.com/image.jpg" /><small className="text-muted">Để trống để tạo ảnh placeholder tự động</small></div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-2">
                <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="button" className="btn btn-primary px-4" onClick={handleSaveProduct}>{modalType === "add" ? <><Plus className="me-1" size={16} />Thêm sản phẩm</> : <><Edit3 className="me-1" size={16} />Cập nhật</>}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStockModal && (
        <div className="modal show d-block modal-backdrop-custom" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-2">
                <div>
                  <h5 className="modal-title fw-bold mb-1">{stockAction === "in" ? <><Plus className="me-2 mb-1" size={20} />Nhập kho</> : <><TrendingDown className="me-2 mb-1" size={20} />Xuất kho</>}</h5>
                  <p className="text-muted small mb-0">{selectedProduct?.name}</p>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowStockModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6"><label className="form-label fw-semibold">Tồn kho hiện tại</label><input type="text" className="form-control bg-light fw-bold" value={`${selectedProduct?.quantity || 0} sản phẩm`} disabled /></div>
                  <div className="col-md-6"><label className="form-label fw-semibold">Số lượng {stockAction === "in" ? "nhập" : "xuất"} <span className="text-danger">*</span></label><input type="number" className="form-control" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} min="1" placeholder="0" /></div>
                  <div className="col-12"><label className="form-label fw-semibold">Ghi chú</label><textarea className="form-control" rows="2" value={stockNote} onChange={(e) => setStockNote(e.target.value)} placeholder={`Ghi chú về việc ${stockAction === 'in' ? 'nhập' : 'xuất'} kho...`} /></div>
                  {stockQuantity && (
                    <div className="col-12">
                      <div className={`alert mb-0 ${stockAction === 'out' && parseInt(stockQuantity || 0) > (selectedProduct?.quantity || 0) ? "alert-danger" : willBeLowStock() ? "alert-warning" : "alert-success"}`}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong className="d-block mb-1">Tồn kho sau khi {stockAction === "in" ? "nhập" : "xuất"}:</strong>
                            <span className="h5 mb-0">{calculateNewQuantity()} sản phẩm</span>
                          </div>
                          {stockAction === 'out' && parseInt(stockQuantity || 0) > (selectedProduct?.quantity || 0) && <AlertTriangle size={24} />}
                        </div>
                        {stockAction === 'out' && parseInt(stockQuantity || 0) > (selectedProduct?.quantity || 0) && <small className="d-block mt-2">⚠️ Số lượng xuất vượt quá tồn kho!</small>}
                        {willBeLowStock() && <small className="d-block mt-2">⚠️ Cảnh báo: Tồn kho sau khi {stockAction === "in" ? "nhập" : "xuất"} sẽ nhỏ hơn hoặc bằng mức tối thiểu ({selectedProduct?.minStock})!</small>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer border-0 pt-2">
                <button type="button" className="btn btn-light px-4" onClick={() => setShowStockModal(false)}>Hủy</button>
                <button type="button" className={`btn px-4 ${stockAction === 'in' ? 'btn-success' : 'btn-warning'}`} onClick={handleStockUpdate} disabled={!stockQuantity || (stockAction === 'out' && parseInt(stockQuantity || 0) > (selectedProduct?.quantity || 0))}>{stockAction === "in" ? <><Plus className="me-1" size={16} />Xác nhận nhập</> : <><TrendingDown className="me-1" size={16} />Xác nhận xuất</>}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaProductManagement;
