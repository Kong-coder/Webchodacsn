import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, TrendingUp, FileText, Download, Loader, X, CheckCircle, Receipt, User, ShoppingBag, Tag, CreditCard, Calendar, Clock, DollarSign, Percent, Gift, Users, Briefcase, Package, ShoppingCart, Star } from 'lucide-react';
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE_URL = 'http://localhost:8080/api'; // Common base URL for all resources

const PaymentInvoice = () => {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');

  const [invoices, setInvoices] = useState([]); // Now stores don-hang
  const [customers, setCustomers] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState('');

  const [invoiceForm, setInvoiceForm] = useState({
    customerId: '',
    serviceIds: [], // Store only IDs, full objects will be resolved
    productItems: [], // { productId, quantity }
    voucherCode: '',
    paymentMethod: 'cash',
    note: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const showNotificationMsg = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(''), 3000);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const [hoaDonRes, customersRes, servicesRes, productsRes, staffRes, vouchersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/hoa-don`, { headers }), // Fetch from hoadon table
        fetch(`${API_BASE_URL}/customers`, { headers }),
        fetch(`${API_BASE_URL}/dich-vu`, { headers }), // Assuming /api/dich-vu for services
        fetch(`${API_BASE_URL}/products`, { headers }),
        fetch(`${API_BASE_URL}/employees`, { headers }), // Assuming /api/employees for staff
        fetch(`${API_BASE_URL}/vouchers`, { headers }) // Assuming /api/vouchers for vouchers
      ]);

      const hoaDonData = await hoaDonRes.json();
      const customersData = await customersRes.json();
      const servicesData = await servicesRes.json();
      const productsData = await productsRes.json();
      const staffData = await staffRes.json();
      const vouchersData = await vouchersRes.json();



      // Ensure data is array, handle pagination if needed
      setInvoices(Array.isArray(hoaDonData) ? hoaDonData : (hoaDonData.content || [])); 
      setCustomers(Array.isArray(customersData) ? customersData : (customersData.content || []));
      setAvailableServices(Array.isArray(servicesData) ? servicesData : (servicesData.content || []));
      setAvailableProducts(Array.isArray(productsData) ? productsData : (productsData.content || []));
      setStaffList(Array.isArray(staffData) ? staffData : (staffData.content || []));
      setVouchers(Array.isArray(vouchersData) ? vouchersData : (vouchersData.content || []));

    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError("Failed to load initial data.");
      showNotificationMsg("Tải dữ liệu ban đầu thất bại!", "error");
    } finally {
      setLoading(false);
    }
  };

  const getCustomerById = (id) => customers.find(c => c.id === id);
  const getServiceById = (id) => availableServices.find(s => s.id === id);
  const getProductById = (id) => availableProducts.find(p => p.id === id);
  const getStaffById = (id) => staffList.find(s => s.id === id);

  const calculateInvoiceTotal = (form) => {
    const selectedServices = form.serviceIds.map(id => getServiceById(id)).filter(Boolean);
    const selectedProducts = form.productItems.map(item => ({ ...getProductById(item.productId), quantity: item.quantity })).filter(p => p.id);

    const servicesTotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const productsTotal = selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const subtotal = servicesTotal + productsTotal;

    let discount = 0;
    const voucher = vouchers.find(v => v.code === form.voucherCode);
    if (voucher && subtotal >= voucher.minAmount) {
      if (voucher.discountType === 'percent') {
        discount = Math.min((subtotal * voucher.discountValue / 100), voucher.maxDiscount || subtotal);
      } else if (voucher.discountType === 'fixed') {
        discount = voucher.discountValue;
      }
    }

    const finalAmount = subtotal - discount;
    const pointsEarned = Math.floor(finalAmount / 10000);

    return { subtotal, discount, finalAmount, pointsEarned, selectedServices, selectedProducts };
  };

  const handleAddService = (service) => {
    setInvoiceForm(prevForm => ({
      ...prevForm,
      serviceIds: [...prevForm.serviceIds, service.id]
    }));
    setShowServiceSelector(false);
  };

  const handleAddProduct = (product) => {
    setInvoiceForm(prevForm => {
      const existingIndex = prevForm.productItems.findIndex(item => item.productId === product.id);
      if (existingIndex >= 0) {
        const updatedProductItems = [...prevForm.productItems];
        updatedProductItems[existingIndex].quantity += 1;
        return { ...prevForm, productItems: updatedProductItems };
      } else {
        return {
          ...prevForm,
          productItems: [...prevForm.productItems, { productId: product.id, quantity: 1 }]
        };
      }
    });
    setShowProductSelector(false);
  };

  const removeService = (serviceIdToRemove) => {
    setInvoiceForm(prevForm => ({
      ...prevForm,
      serviceIds: prevForm.serviceIds.filter(id => id !== serviceIdToRemove)
    }));
  };

  const removeProduct = (productIdToRemove) => {
    setInvoiceForm(prevForm => ({
      ...prevForm,
      productItems: prevForm.productItems.filter(item => item.productId !== productIdToRemove)
    }));
  };

  const updateProductQuantity = (productIdToUpdate, change) => {
    setInvoiceForm(prevForm => ({
      ...prevForm,
      productItems: prevForm.productItems.map(item => {
        if (item.productId === productIdToUpdate) {
          return { ...item, quantity: Math.max(1, item.quantity + change) };
        }
        return item;
      })
    }));
  };

  const handleCreateInvoice = async () => {
    if (!invoiceForm.customerId) {
      showNotificationMsg('Vui lòng chọn khách hàng!', 'error');
      return;
    }
    if (invoiceForm.serviceIds.length === 0 && invoiceForm.productItems.length === 0) {
      showNotificationMsg('Vui lòng chọn ít nhất 1 dịch vụ hoặc sản phẩm!', 'error');
      return;
    }

    const { subtotal, discount, finalAmount, pointsEarned } = calculateInvoiceTotal(invoiceForm);

    const newDonHangData = {
      customerId: invoiceForm.customerId,
      serviceItems: invoiceForm.serviceIds.map(serviceId => ({ serviceId, staffId: staffList[0]?.id || null })), // Assuming first staff for now
      productItems: invoiceForm.productItems,
      voucherCode: invoiceForm.voucherCode,
      paymentMethod: invoiceForm.paymentMethod,
      note: invoiceForm.note,
      subtotal,
      discount,
      finalAmount,
      pointsEarned,
      paymentStatus: 'unpaid' // Always start as unpaid
    };

    try {
      const response = await fetch(`${API_BASE_URL}/don-hang`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDonHangData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      showNotificationMsg('Tạo hóa đơn thành công!');
      fetchAllData(); // Re-fetch all data to update lists
      setShowInvoiceModal(false);
      setInvoiceForm({
        customerId: '',
        serviceIds: [],
        productItems: [],
        voucherCode: '',
        paymentMethod: 'cash',
        note: ''
      });
    } catch (err) {
      console.error("Error creating don-hang:", err);
      showNotificationMsg("Tạo hóa đơn thất bại!", "error");
    }
  };

  const handleConfirmPayment = async (donHangId) => {
    if (window.confirm('Bạn có chắc muốn xác nhận thanh toán cho hóa đơn này?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/thanh-toan/cash/confirm-by-don-hang?donHangId=${donHangId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        showNotificationMsg('Xác nhận thanh toán thành công!');
        fetchAllData(); // Re-fetch all data to update don-hang status and customer points
        setShowDetailModal(false);
      } catch (err) {
        console.error("Error confirming payment:", err);
        showNotificationMsg("Xác nhận thanh toán thất bại!", "error");
      }
    }
  };

  const handleDeleteInvoice = async (donHangId) => {
    if (window.confirm('Bạn có chắc muốn xóa hóa đơn này?')) {
      try {
        // Assuming backend has an endpoint to delete don-hang
        const response = await fetch(`${API_BASE_URL}/don-hang/${donHangId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        showNotificationMsg('Xóa hóa đơn thành công!');
        fetchAllData(); // Re-fetch all data
        setShowDetailModal(false);
      } catch (err) {
        console.error("Error deleting don-hang:", err);
        showNotificationMsg("Xóa hóa đơn thất bại!", "error");
      }
    }
  };

  const handleExportInvoice = (invoice) => {
    // This function remains largely client-side for generating a text file
    const customer = getCustomerById(invoice.customerId);
    const services = invoice.serviceItems.map(item => getServiceById(item.serviceId));
    const products = invoice.productItems.map(item => ({ ...getProductById(item.productId), quantity: item.quantity }));
    const staff = getStaffById(invoice.staffId); // Assuming staffId is directly on the invoice object

    const content = `
HOÁ ĐƠN THANH TOÁN
===================
Mã HĐ: ${invoice.id}
Ngày: ${new Date(invoice.date).toLocaleString('vi-VN')}

KHÁCH HÀNG:
- Họ tên: ${customer?.name || 'N/A'}
- SĐT: ${customer?.phone || 'N/A'}
- Loại: ${customer?.type === 'vip' ? 'VIP' : 'Khách thường'}

DỊCH VỤ:
${services.map(s => `- ${s?.name || 'N/A'}: ${s?.price.toLocaleString('vi-VN') || 'N/A'}đ`).join('\n')}

SẢN PHẨM:
${products.map(p => `- ${p?.name || 'N/A'} x${p.quantity}: ${(p?.price * p.quantity || 0).toLocaleString('vi-VN')}đ`).join('\n')}

Tạm tính: ${invoice.subtotal.toLocaleString('vi-VN')}đ
Giảm giá: -${invoice.discount.toLocaleString('vi-VN')}đ
TỔNG: ${invoice.finalAmount.toLocaleString('vi-VN')}đ

Điểm được cộng: +${invoice.pointsEarned} điểm
Nhân viên: ${staff?.name || 'N/A'}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HoaDon_${invoice.id}.txt`;
    a.click();
    showNotificationMsg('Đã xuất hóa đơn!');
  };

  const filteredInvoices = invoices.filter(invoice => {
    const invoiceId = String(invoice.id || invoice.maHoaDon || '');
    const customerName = invoice.tenKhachHang || '';
    const matchSearch = invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const status = invoice.trangThai || invoice.paymentStatus;
    const matchStatus = filterStatus === 'all' || status === filterStatus;
    const paymentMethod = invoice.phuongThucThanhToan || invoice.paymentMethod;
    const matchPayment = filterPayment === 'all' || paymentMethod === filterPayment;
    return matchSearch && matchStatus && matchPayment;
  });

  // Helper function to check payment status
  const isPaid = (invoice) => {
    const status = (invoice.trangThai || invoice.paymentStatus || '').toLowerCase();
    return status === 'paid' || status === 'đã thanh toán';
  };

  const isUnpaid = (invoice) => {
    const status = (invoice.trangThai || invoice.paymentStatus || '').toLowerCase();
    return status === 'unpaid' || status === 'chưa thanh toán';
  };

  const report = {
    total: invoices.length,
    paid: invoices.filter(isPaid).length,
    unpaid: invoices.filter(isUnpaid).length,
    revenue: invoices.filter(isPaid).reduce((sum, i) => sum + (i.tongTien || i.finalAmount || 0), 0),
    discount: invoices.reduce((sum, i) => sum + (i.discount || 0), 0),
    paymentMethods: {
      cash: invoices.filter(i => {
        const method = (i.phuongThucThanhToan || i.paymentMethod || '').toUpperCase();
        return method === 'TIEN_MAT' || method === 'CASH' || method === 'TIỀN MẶT';
      }).length,
      card: invoices.filter(i => {
        const method = (i.phuongThucThanhToan || i.paymentMethod || '').toUpperCase();
        return method === 'MOMO' || method === 'CARD' || method === 'CHUYỂN KHOẢN';
      }).length
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Loader className="spin" size={50} />
        <p className="ms-3">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center m-4" role="alert">
        {error}
        <button className="btn btn-primary ms-3" onClick={fetchAllData}>Thử lại</button>
      </div>
    );
  }

  return (
    <div>
      <style>
        {`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f4f8;
            min-height: 100vh;
          }

          .header {
            background: linear-gradient(135deg, #4a5f8f 0%, #364561 100%);
            color: white;
            padding: 25px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .header h1 {
            margin: 0;
            font-size: 28px;
          }

          .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 25px;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
          }

          .stat-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            border-left: 4px solid #5a7bb8;
            transition: all 0.3s ease;
          }

          .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          }

          .stat-card h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .stat-card .value {
            font-size: 32px;
            font-weight: bold;
            color: #4a5f8f;
            margin-bottom: 5px;
          }

          .action-bar {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 25px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }

          .filter-section {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: center;
          }

          .invoice-table {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }

          .table-header {
            background: #f8f9fa;
            color: #333;
            padding: 15px;
            font-weight: 600;
            border-bottom: 2px solid #e0e0e0;
          }

          .table-row {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
            transition: background 0.2s ease;
          }

          .table-row:hover {
            background: #f8f9fa;
          }

          .status-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }

          .status-paid {
            background: #d4edda;
            color: #155724;
          }

          .status-unpaid {
            background: #fff3cd;
            color: #856404;
          }

          .payment-method-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .payment-method-card:hover {
            border-color: #5a7bb8;
            box-shadow: 0 2px 8px rgba(90,123,184,0.2);
          }

          .payment-method-card.active {
            border-color: #5a7bb8;
            background: #e8eef7;
            box-shadow: 0 2px 8px rgba(90,123,184,0.3);
          }
          
          .selector-window {
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            max-height: 250px;
            overflow-y: auto;
            background: white;
            padding: 8px;
            margin-top: 8px;
          }
          
          .selector-item {
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .selector-item:hover {
            background: #f8f9fa;
            border-color: #5a7bb8;
          }
          
          .customer-type-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 8px;
          }
          
          .customer-type-regular {
            background: #e3f2fd;
            color: #1976d2;
          }
          
          .customer-type-vip {
            background: #fff3e0;
            color: #f57c00;
          }

          .total-summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 15px;
          }

          .total-row.final {
            font-size: 20px;
            font-weight: bold;
            color: #4a5f8f;
            border-top: 2px solid #ddd;
            padding-top: 15px;
            margin-top: 10px;
          }

          .quick-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #5a7bb8 0%, #4a6a9f 100%);
            color: white;
            border: none;
            box-shadow: 0 4px 15px rgba(90,123,184,0.4);
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 1000;
          }

          .quick-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(90,123,184,0.5);
          }

          .btn {
            padding: 8px 16px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
          }

          .btn-primary {
            background: linear-gradient(135deg, #5a7bb8 0%, #4a6a9f 100%);
            color: white;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(90,123,184,0.3);
          }

          .btn-secondary {
            background: #6c757d;
            color: white;
          }

          .btn-success {
            background: #28a745;
            color: white;
          }

          .btn-danger {
            background: #dc3545;
            color: white;
          }

          .btn-outline-secondary {
            background: white;
            color: #6c757d;
            border: 1px solid #6c757d;
          }

          .btn-outline-danger {
            background: white;
            color: #dc3545;
            border: 1px solid #dc3545;
          }

          .form-control {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
          }

          .form-control:focus {
            outline: none;
            border-color: #5a7bb8;
            box-shadow: 0 0 0 3px rgba(90,123,184,0.1);
          }

          .form-label {
            display: block;
            margin-bottom: 6px;
            font-weight: 600;
            color: #333;
            font-size: 14px;
          }

          .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1050;
          }

          .modal-dialog {
            position: relative;
            width: auto;
            max-width: 800px;
            margin: 30px auto;
          }

          .modal-content {
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
          }

          .modal-header {
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
            background: linear-gradient(135deg, #4a5f8f 0%, #364561 100%);
            color: white;
            border-radius: 12px 12px 0 0;
          }

          .modal-title {
            margin: 0;
            font-size: 20px;
          }

          .modal-body {
            padding: 25px;
            max-height: 70vh;
            overflow-y: auto;
          }

          .modal-footer {
            padding: 15px 20px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
          }

          .btn-close {
            background: transparent;
            border: none;
            font-size: 24px;
            color: white;
            cursor: pointer;
            opacity: 0.8;
          }

          .btn-close:hover {
            opacity: 1;
          }

          .service-item, .product-item {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 8px;
            border-left: 3px solid #5a7bb8;
          }
        `}
      </style>

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

      <div className="container">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Tổng hóa đơn</h3>
            <div className="value">{invoices.length}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>Tất cả hóa đơn</div>
          </div>
          <div className="stat-card">
            <h3>Đã thanh toán</h3>
            <div className="value" style={{ color: '#28a745' }}>
              {report.paid}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Hoàn thành</div>
          </div>
          <div className="stat-card">
            <h3>Chưa thanh toán</h3>
            <div className="value" style={{ color: '#ffc107' }}>
              {report.unpaid}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Đang chờ</div>
          </div>
          <div className="stat-card">
            <h3>Doanh thu</h3>
            <div className="value" style={{ fontSize: '24px' }}>
              {report.revenue.toLocaleString('vi-VN')}đ
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Đã thu</div>
          </div>
        </div>

        <div className="action-bar">
          <div className="filter-section">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Tìm kiếm hóa đơn, khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
            <select 
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ maxWidth: '180px' }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán</option>
              <option value="unpaid">Chưa thanh toán</option>
            </select>
            <select 
              className="form-control"
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              style={{ maxWidth: '180px' }}
            >
              <option value="all">Phương thức thanh toán</option>
              <option value="cash">Tiền mặt</option>
              <option value="card">Thẻ</option>
            </select>
            <button 
              className="btn btn-primary"
              onClick={() => setShowReportModal(true)}
            >
              <TrendingUp className="me-1" size={16} />
              Báo cáo
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowVoucherModal(true)}
            >
              <Gift className="me-1" size={16} />
              Voucher
            </button>
          </div>
        </div>

        <div className="invoice-table">
          <div className="table-header" style={{ display: 'grid', gridTemplateColumns: '100px 150px 1fr 150px 120px 120px 100px', gap: '15px', alignItems: 'center' }}>
            <div>Mã HĐ</div>
            <div>Ngày</div>
            <div>Khách hàng</div>
            <div>Tổng tiền</div>
            <div>PT thanh toán</div>
            <div>Trạng thái</div>
            <div>Thao tác</div>
          </div>
          {filteredInvoices.map((invoice) => {
            const invoiceId = invoice.id || invoice.maHoaDon;
            const customerName = invoice.tenKhachHang || 'N/A';
            const invoiceDate = invoice.ngayXuat || invoice.date;
            const totalAmount = invoice.tongTien || invoice.finalAmount || 0;
            const paymentMethod = invoice.phuongThucThanhToan || invoice.paymentMethod;
            const status = invoice.trangThai || invoice.paymentStatus;
            
            return (
              <div 
                key={invoiceId} 
                className="table-row"
                style={{ display: 'grid', gridTemplateColumns: '100px 150px 1fr 150px 120px 120px 100px', gap: '15px', alignItems: 'center' }}
              >
                <div style={{ fontWeight: 'bold', color: '#4a5f8f' }}>{invoiceId}</div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {invoiceDate ? new Date(invoiceDate).toLocaleString('vi-VN') : 'N/A'}
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>{customerName}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Mã KH: {invoice.maKhachHang || 'N/A'}</div>
                </div>
                <div style={{ fontWeight: 'bold', color: '#4a5f8f' }}>
                  {totalAmount.toLocaleString('vi-VN')}đ
                </div>
                <div>
                  {(() => {
                    const method = (paymentMethod || '').toUpperCase();
                    if (method === 'TIEN_MAT' || method === 'CASH') return '💵 Tiền mặt';
                    if (method === 'MOMO') return '� MoMo';
                    if (method === 'CARD' || method === 'CHUYEN_KHOAN') return '💳 Chuyển khoản';
                    return paymentMethod || 'N/A';
                  })()}
                </div>
                <div>
                  <span className={isPaid(invoice) ? 'status-badge status-paid' : 'status-badge status-unpaid'}>
                    {isPaid(invoice) ? '✓ Đã thanh toán' : '⏳ Chưa thanh toán'}
                  </span>
                </div>
                <div>
                  <button 
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '13px' }}
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setShowDetailModal(true);
                    }}
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal tạo hóa đơn */}
      {showInvoiceModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <Plus className="me-2" size={20} />
                  Tạo hóa đơn mới
                </h5>
                <button 
                  className="btn-close"
                  onClick={() => setShowInvoiceModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Khách hàng *</label>
                  <select
                    className="form-control"
                    value={invoiceForm.customerId || ''}
                    onChange={(e) => {
                      setInvoiceForm({ ...invoiceForm, customerId: e.target.value });
                    }}
                  >
                    <option value="">-- Chọn khách hàng --</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                  {invoiceForm.customerId && getCustomerById(invoiceForm.customerId) && (
                    <div style={{ marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
                      <strong>{getCustomerById(invoiceForm.customerId).name}</strong>
                      <span className={`customer-type-badge customer-type-${getCustomerById(invoiceForm.customerId).type}`}>
                        {getCustomerById(invoiceForm.customerId).type === 'vip' ? '⭐ VIP' : '👤 Khách thường'}
                      </span>
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                        SĐT: {getCustomerById(invoiceForm.customerId).phone} | Điểm tích lũy: {getCustomerById(invoiceForm.customerId).points}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Dịch vụ</label>
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setShowServiceSelector(!showServiceSelector)}
                  >
                    <Plus className="me-2" size={16} />
                    Chọn dịch vụ
                  </button>
                  
                  {showServiceSelector && (
                    <div className="selector-window">
                      {availableServices.map(service => (
                        <div 
                          key={service.id}
                          className="selector-item"
                          onClick={() => handleAddService(service)}
                        >
                          <div>
                            <div style={{ fontWeight: '600' }}>{service.name}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {service.duration} phút
                            </div>
                          </div>
                          <div style={{ fontWeight: 'bold', color: '#4a5f8f' }}>
                            {service.price.toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {invoiceForm.serviceIds.length > 0 && (
                    <>
                      <div style={{ marginTop: '15px', fontWeight: '600', marginBottom: '10px' }}>
                        Đã chọn ({invoiceForm.serviceIds.length}):
                      </div>
                      {invoiceForm.serviceIds.map((serviceId, index) => {
                        const service = getServiceById(serviceId);
                        if (!service) return null;
                        return (
                          <div key={service.id} className="service-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <div style={{ fontWeight: '600' }}>{service.name}</div>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => removeService(service.id)}
                                style={{ padding: '4px 8px' }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                              <div>
                                <select 
                                  className="form-control form-control-sm"
                                  value={invoiceForm.serviceItems && invoiceForm.serviceItems[index] && invoiceForm.serviceItems[index].staffId || ''} // Pre-select staff if available
                                  onChange={(e) => {
                                    const updatedServiceItems = [...invoiceForm.serviceItems];
                                    if (!updatedServiceItems[index]) {
                                      updatedServiceItems[index] = { serviceId: service.id };
                                    }
                                    updatedServiceItems[index].staffId = e.target.value;
                                    setInvoiceForm({ ...invoiceForm, serviceItems: updatedServiceItems });
                                  }}
                                  style={{ display: 'inline-block', width: 'auto', marginRight: '10px' }}
                                >
                                  <option value="">-- Chọn nhân viên --</option>
                                  {staffList.map(staff => (
                                    <option key={staff.id} value={staff.id}>{staff.name}</option>
                                  ))}
                                </select>
                                <span style={{ color: '#666' }}>{service.duration} phút</span>
                              </div>
                              <span style={{ fontWeight: 'bold', color: '#4a5f8f' }}>
                                {service.price.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Sản phẩm</label>
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setShowProductSelector(!showProductSelector)}
                  >
                    <Plus className="me-2" size={16} />
                    Chọn sản phẩm
                  </button>
                  
                  {showProductSelector && (
                    <div className="selector-window">
                      {availableProducts.map(product => (
                        <div 
                          key={product.id}
                          className="selector-item"
                          onClick={() => handleAddProduct(product)}
                        >
                          <div>
                            <div style={{ fontWeight: '600' }}>{product.name}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Còn: {product.stock} sản phẩm
                            </div>
                          </div>
                          <div style={{ fontWeight: 'bold', color: '#4a5f8f' }}>
                            {product.price.toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {invoiceForm.productItems.length > 0 && (
                    <>
                      <div style={{ marginTop: '15px', fontWeight: '600', marginBottom: '10px' }}>
                        Đã chọn ({invoiceForm.productItems.length}):
                      </div>
                      {invoiceForm.productItems.map((item, index) => {
                        const product = getProductById(item.productId);
                        if (!product) return null;
                        return (
                          <div key={product.id} className="product-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontWeight: '600' }}>{product.name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button 
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => updateProductQuantity(product.id, -1)}
                                    style={{ padding: '2px 8px' }}
                                  >
                                    -
                                  </button>
                                  <span style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                                    {item.quantity}
                                  </span>
                                  <button 
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => updateProductQuantity(product.id, 1)}
                                    style={{ padding: '2px 8px' }}
                                  >
                                    +
                                  </button>
                                </div>
                                <span style={{ fontWeight: 'bold', color: '#4a5f8f', minWidth: '100px', textAlign: 'right' }}>
                                  {(product.price * item.quantity).toLocaleString('vi-VN')}đ
                                </span>
                                <button 
                                  className="btn btn-sm btn-danger"
                                  onClick={() => removeProduct(product.id)}
                                  style={{ padding: '4px 8px' }}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                <div className="row mb-3 mt-4">
                  <div className="col-md-6">
                    <label className="form-label">Mã voucher</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập mã voucher"
                      value={invoiceForm.voucherCode}
                      onChange={(e) => setInvoiceForm({
                        ...invoiceForm,
                        voucherCode: e.target.value.toUpperCase()
                      })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phương thức thanh toán</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      <div 
                        className={`payment-method-card ${invoiceForm.paymentMethod === 'cash' ? 'active' : ''}`}
                        onClick={() => setInvoiceForm({ ...invoiceForm, paymentMethod: 'cash' })}
                      >
                        <DollarSign size={28} />
                        <div style={{ marginTop: '5px', fontSize: '13px', fontWeight: '600' }}>Tiền mặt</div>
                      </div>
                      <div 
                        className={`payment-method-card ${invoiceForm.paymentMethod === 'card' ? 'active' : ''}`}
                        onClick={() => setInvoiceForm({ ...invoiceForm, paymentMethod: 'card' })}
                      >
                        <CreditCard size={28} />
                        <div style={{ marginTop: '5px', fontSize: '13px', fontWeight: '600' }}>Thẻ</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Ghi chú</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Ghi chú thêm..."
                    value={invoiceForm.note}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, note: e.target.value })}
                  ></textarea>
                </div>

                {(invoiceForm.serviceIds.length > 0 || invoiceForm.productItems.length > 0) && (
                  <div className="total-summary">
                    <div className="total-row">
                      <span>Tạm tính:</span>
                      <span>{calculateInvoiceTotal(invoiceForm).subtotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    {calculateInvoiceTotal(invoiceForm).discount > 0 && (
                      <div className="total-row" style={{ color: '#dc3545' }}>
                        <span>Giảm giá ({invoiceForm.voucherCode}):</span>
                        <span>-{calculateInvoiceTotal(invoiceForm).discount.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                    <div className="total-row final">
                      <span>Tổng thanh toán:</span>
                      <span>{calculateInvoiceTotal(invoiceForm).finalAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px', color: '#666' }}>
                      <Star size={14} style={{ color: '#ffc107' }} /> Khách hàng sẽ nhận được {calculateInvoiceTotal(invoiceForm).pointsEarned} điểm
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowInvoiceModal(false)}
                >
                  Hủy
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleCreateInvoice}
                >
                  <CheckCircle className="me-1" size={16} />
                  Tạo hóa đơn
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết hóa đơn */}
      {showDetailModal && selectedInvoice && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <Receipt className="me-2" size={20} />
                  Chi tiết hóa đơn #{selectedInvoice.id}
                </h5>
                <button 
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #4a5f8f' }}>
                  <h6 className="mb-3" style={{ color: '#4a5f8f' }}>
                    <User className="me-2" size={16} />
                    Thông tin khách hàng
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Họ tên:</strong> {getCustomerById(selectedInvoice.customerId)?.name || 'N/A'}
                      <span className={`customer-type-badge customer-type-${getCustomerById(selectedInvoice.customerId)?.type}`}>
                        {getCustomerById(selectedInvoice.customerId)?.type === 'vip' ? '⭐ VIP' : '👤 Khách thường'}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <strong>Số điện thoại:</strong> {getCustomerById(selectedInvoice.customerId)?.phone || 'N/A'}
                    </div>
                    <div className="col-md-6 mt-2">
                      <strong>Điểm tích lũy:</strong> 
                      <span style={{ color: '#ffc107', marginLeft: '5px' }}>
                        <Star size={14} className="me-1" /> {getCustomerById(selectedInvoice.customerId)?.points || 0} điểm
                      </span>
                    </div>
                    <div className="col-md-6 mt-2">
                      <strong>Điểm được cộng:</strong> 
                      <span style={{ color: '#28a745', marginLeft: '5px' }}>
                        +{selectedInvoice.pointsEarned} điểm
                      </span>
                    </div>
                  </div>
                </div>

                <h6 className="mb-3" style={{ color: '#4a5f8f' }}>
                  <Briefcase className="me-2" size={16} />
                  Dịch vụ ({selectedInvoice.serviceItems.length})
                </h6>
                <div className="table-responsive mb-4">
                  <table className="table table-sm table-bordered">
                    <thead style={{ background: '#f8f9fa' }}>
                      <tr>
                        <th>Tên dịch vụ</th>
                        <th>Thời gian</th>
                        <th>Nhân viên</th>
                        <th className="text-end">Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.serviceItems.map((item, index) => {
                        const service = getServiceById(item.serviceId);
                        const staff = getStaffById(item.staffId);
                        if (!service) return null;
                        return (
                          <tr key={index}>
                            <td>{service.name}</td>
                            <td>{service.duration} phút</td>
                            <td>{staff?.name || 'N/A'}</td>
                            <td className="text-end" style={{ fontWeight: 'bold', color: '#4a5f8f' }}>
                              {service.price.toLocaleString('vi-VN')}đ
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {selectedInvoice.productItems.length > 0 && (
                  <>
                    <h6 className="mb-3" style={{ color: '#4a5f8f' }}>
                      <ShoppingCart className="me-2" size={16} />
                      Sản phẩm ({selectedInvoice.productItems.length})
                    </h6>
                    <div className="table-responsive mb-4">
                      <table className="table table-sm table-bordered">
                        <thead style={{ background: '#f8f9fa' }}>
                          <tr>
                            <th>Tên sản phẩm</th>
                            <th className="text-center">Số lượng</th>
                            <th className="text-end">Đơn giá</th>
                            <th className="text-end">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedInvoice.productItems.map((item, index) => {
                            const product = getProductById(item.productId);
                            if (!product) return null;
                            return (
                              <tr key={index}>
                                <td>{product.name}</td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-end">{product.price.toLocaleString('vi-VN')}đ</td>
                                <td className="text-end" style={{ fontWeight: 'bold', color: '#4a5f8f' }}>
                                  {(product.price * item.quantity).toLocaleString('vi-VN')}đ
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                <div className="total-summary">
                  <div className="total-row">
                    <span>Tạm tính:</span>
                    <span>{selectedInvoice.subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="total-row" style={{ color: '#dc3545' }}>
                      <span>Giảm giá ({selectedInvoice.voucherCode}):</span>
                      <span>-{selectedInvoice.discount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="total-row final">
                    <span>Tổng thanh toán:</span>
                    <span>{selectedInvoice.finalAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '20px', borderLeft: '4px solid #4a5f8f' }}>
                  <h6 className="mb-3" style={{ color: '#4a5f8f' }}>
                    <CreditCard className="me-2" size={16} />
                    Thông tin thanh toán
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Phương thức:</strong> 
                      {selectedInvoice.paymentMethod === 'cash' && ' 💵 Tiền mặt'}
                      {selectedInvoice.paymentMethod === 'card' && ' 💳 Thẻ'}
                    </div>
                    <div className="col-md-6">
                      <strong>Trạng thái:</strong> 
                      <span className={selectedInvoice.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}>
                        {selectedInvoice.paymentStatus === 'paid' ? ' ✓ Đã thanh toán' : ' ⏳ Chưa thanh toán'}
                      </span>
                    </div>
                    <div className="col-md-12 mt-2">
                      <strong>Nhân viên:</strong> {getStaffById(selectedInvoice.staffId)?.name || 'N/A'}
                    </div>
                    {selectedInvoice.note && (
                      <div className="col-md-12 mt-2">
                        <strong>Ghi chú:</strong> {selectedInvoice.note}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {selectedInvoice.paymentStatus === 'unpaid' && (
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      handleConfirmPayment(selectedInvoice.id);
                    }}
                  >
                    <CheckCircle className="me-1" size={16} />
                    Xác nhận thanh toán
                  </button>
                )}
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => handleExportInvoice(selectedInvoice)}
                >
                  <Download className="me-1" size={16} />
                  Xuất hóa đơn
                </button>
                <button 
                  className="btn btn-outline-danger"
                  onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                >
                  <Trash2 className="me-1" size={16} />
                  Xóa
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal voucher */}
      {showVoucherModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <Gift className="me-2" size={20} />
                  Quản lý Voucher
                </h5>
                <button 
                  className="btn-close"
                  onClick={() => setShowVoucherModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {vouchers.map((voucher) => (
                  <div key={voucher.id} style={{ 
                    background: 'linear-gradient(135deg, #5a7bb8 0%, #4a6a9f 100%)', 
                    color: 'white',
                    padding: '20px', 
                    borderRadius: '10px', 
                    marginBottom: '15px',
                    boxShadow: '0 3px 10px rgba(90,123,184,0.3)'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '2px' }}>
                      {voucher.code}
                    </div>
                    <div style={{ marginBottom: '12px', fontSize: '16px' }}>
                      {voucher.description}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.95 }}>
                      <div><Calendar className="me-1" size={14} /> Hiệu lực: {new Date(voucher.validFrom).toLocaleDateString('vi-VN')} → {new Date(voucher.validTo).toLocaleDateString('vi-VN')}</div>
                      <div className="mt-2">
                        <Percent className="me-1" size={14} /> {voucher.discountType === 'percent' 
                          ? `Giảm ${voucher.discountValue}% (tối đa ${voucher.maxDiscount.toLocaleString('vi-VN')}đ)`
                          : `Giảm ${voucher.discountValue.toLocaleString('vi-VN')}đ`}
                      </div>
                      {voucher.minAmount > 0 && (
                        <div className="mt-2">
                          <DollarSign className="me-1" size={14} /> Đơn tối thiểu: {voucher.minAmount.toLocaleString('vi-VN')}đ
                        </div>
                      )}
                      <div className="mt-2">
                        <Users className="me-1" size={14} /> Đã sử dụng: {voucher.usedCount} lần
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-primary"
                  onClick={() => showNotificationMsg('Chức năng thêm voucher mới chưa được triển khai!', 'info')}
                >
                  <Plus className="me-1" size={16} />
                  Thêm Voucher
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowVoucherModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal báo cáo */}
      {showReportModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <TrendingUp className="me-2" size={20} />
                  Báo cáo & Thống kê
                </h5>
                <button 
                  className="btn-close"
                  onClick={() => setShowReportModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-4">
                  <div className="col-md-3">
                    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #4a5f8f' }}>
                      <Receipt size={32} style={{ color: '#4a5f8f' }} />
                      <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0', color: '#4a5f8f' }}>
                        {report.total}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>Tổng hóa đơn</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #28a745' }}>
                      <CheckCircle size={32} style={{ color: '#28a745' }} />
                      <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0', color: '#28a745' }}>
                        {report.paid}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>Đã thanh toán</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #ffc107' }}>
                      <Clock size={32} style={{ color: '#ffc107' }} />
                      <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0', color: '#ffc107' }}>
                        {report.unpaid}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>Chưa thanh toán</div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #17a2b8' }}>
                      <DollarSign size={32} style={{ color: '#17a2b8' }} />
                      <div style={{ fontSize: '20px', fontWeight: 'bold', margin: '10px 0', color: '#17a2b8' }}>
                        {report.revenue.toLocaleString('vi-VN')}đ
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>Doanh thu</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                  <h6 style={{ color: '#4a5f8f', marginBottom: '15px' }}>
                    <CreditCard className="me-2" size={16} />
                    Phương thức thanh toán
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div style={{ textAlign: 'center', padding: '15px' }}>
                        <DollarSign size={32} />
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4a5f8f', margin: '8px 0' }}>
                          {report.paymentMethods.cash}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Tiền mặt</div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div style={{ textAlign: 'center', padding: '15px' }}>
                        <CreditCard size={32} />
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4a5f8f', margin: '8px 0' }}>
                          {report.paymentMethods.card}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>Thẻ</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #ffc107' }}>
                  <h6 style={{ color: '#856404', marginBottom: '10px' }}>
                    <Percent className="me-2" size={16} />
                    Tổng giảm giá
                  </h6>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#856404' }}>
                    {report.discount.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-primary"
                  onClick={() => showNotificationMsg('Chức năng xuất báo cáo chưa được triển khai!', 'info')}
                >
                  <Download className="me-1" size={16} />
                  Xuất báo cáo
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowReportModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button 
        className="quick-btn"
        onClick={() => setShowInvoiceModal(true)}
        title="Tạo hóa đơn mới"
      >
        <Plus size={24} />
      </button>

      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
      />
    </div>
  );
};

export default PaymentInvoice;
