import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { showToast } from "../../components/Toast";

const BeautySpaBooking = () => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState([]);
  const [combos, setCombos] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", email: "", note: "" });
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [bookingResponse, setBookingResponse] = useState(null);

  // Load user info from localStorage if logged in
  useEffect(() => {
    try {
      const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        setCustomerInfo({
          name: user.fullName || user.name || "",
          phone: user.phone || "",
          email: user.email || "",
          note: ""
        });
        console.log('Auto-filled user info:', user);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  }, []);

  // Fetch services and combos
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('=== BOOKING PAGE DEBUG ===');
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        console.log('Token:', token ? 'Found' : 'Not found');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Fetch services
        const servicesRes = await fetch("/api/dich-vu?onlyAvailable=true", { headers });
        console.log('Services response status:', servicesRes.status);
        if (!servicesRes.ok) throw new Error('Failed to fetch services');
        const servicesData = await servicesRes.json();
        console.log('Services data:', servicesData);
        
        // Map backend Vietnamese fields to frontend English fields
        const mappedServices = (servicesData || []).map(service => ({
          id: service.id,
          name: service.ten,
          description: service.moTa,
          duration: service.thoiLuongPhut,
          price: service.gia || 0,
          status: service.coSan ? 'active' : 'inactive',
          image: service.hinhAnh,
          category: service.loai,
          discount: 0  // Default value
        }));
        
        console.log('Mapped services:', mappedServices);
        setServices(mappedServices);
        
        // Fetch combos
        const combosRes = await fetch("/api/combos?status=active", { headers });
        if (combosRes.ok) {
          const combosData = await combosRes.json();
          const mappedCombos = (combosData || []).map(combo => ({
            id: combo.id,
            name: combo.tenCombo,
            description: combo.moTa,
            price: Number(combo.gia) || 0,
            discount: Number(combo.giamGia) || 0,
            duration: 90, // Default duration for combo
            dichVus: combo.dichVus || []
          }));
          console.log('Mapped combos:', mappedCombos);
          setCombos(mappedCombos);
          
          // Pre-select combo if comboId in URL
          const comboId = searchParams.get('comboId');
          console.log('ComboId from URL:', comboId);
          if (comboId) {
            const preSelectedCombo = mappedCombos.find(c => c.id === parseInt(comboId));
            console.log('Pre-selected combo:', preSelectedCombo);
            if (preSelectedCombo) {
              setSelectedCombo(preSelectedCombo);
              setSelectedService(null); // Clear service selection
            }
          }
        }
        
        // Pre-select service if serviceId in URL
        const serviceId = searchParams.get('serviceId');
        console.log('ServiceId from URL:', serviceId);
        if (serviceId) {
          const preSelectedService = mappedServices.find(s => s.id === parseInt(serviceId));
          console.log('Pre-selected service:', preSelectedService);
          if (preSelectedService) {
            setSelectedService(preSelectedService);
            setSelectedCombo(null); // Clear combo selection
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showToast("Không thể tải danh sách dịch vụ. Vui lòng thử lại", "error");
      }
    };
    fetchData();
  }, [searchParams]);

  // Generate fixed time slots (simplified - no need to check availability)
  useEffect(() => {
    if (bookingDate && (selectedService || selectedCombo)) {
      // Generate time slots from 8:00 to 20:00 with 30-minute intervals
      const slots = [];
      for (let hour = 8; hour <= 20; hour++) {
        for (let minute of [0, 30]) {
          if (hour === 20 && minute === 30) break; // Stop at 20:00
          const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          slots.push(timeStr);
        }
      }
      setTimeSlots(slots);
    } else {
      setTimeSlots([]);
    }
  }, [bookingDate, selectedService, selectedCombo]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedCombo(null); // Clear combo when selecting service
  };

  const handleComboSelect = (combo) => {
    setSelectedCombo(combo);
    setSelectedService(null); // Clear service when selecting combo
  };

  const handleBookingSubmit = async () => {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    
    // Create datetime in local timezone (Vietnam)
    const [hours, minutes] = bookingTime.split(':');
    const [year, month, day] = bookingDate.split('-').map(Number);
    
    // Create date object with local timezone
    const thoiGianBatDauDate = new Date(year, month - 1, day, parseInt(hours), parseInt(minutes), 0);
    const thoiGianKetThucDate = new Date(thoiGianBatDauDate.getTime() + (selectedService?.duration || selectedCombo?.duration || 90) * 60 * 1000);
    
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
    
    const thoiGianBatDau = formatWithTimezone(thoiGianBatDauDate);
    const thoiGianKetThuc = formatWithTimezone(thoiGianKetThucDate);
    
    const requestBody = {
        dichVuId: selectedService?.id || null,
        comboId: selectedCombo?.id || null,
        thoiGianBatDau: thoiGianBatDau,
        thoiGianKetThuc: thoiGianKetThuc,
        ghiChu: customerInfo.note || '',
        phuongThucThanhToan: paymentMethod || 'TIEN_MAT',
        tongTien: selectedService?.price || selectedCombo?.price || 0
    };

    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Step 1: Create booking
        const response = await fetch('/api/dat-lich', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Booking failed');
        }
        const result = await response.json();
        console.log('Booking result:', result);
        console.log('orderId:', result.orderId);
        console.log('Payment method:', paymentMethod);
        setBookingResponse(result);
        
        // Step 2: If MoMo payment, redirect to MoMo
        if (paymentMethod === 'MOMO') {
            console.log('Attempting MoMo payment with orderId:', result.orderId);
            if (!result.orderId) {
                console.error('No orderId in response');
                showToast('Không thể tạo thanh toán MoMo: Thiếu mã đơn hàng', 'error');
                nextStep();
                return;
            }
            
            try {
                console.log('Calling MoMo API...');
                const momoResponse = await fetch(`/api/thanh-toan/momo/create?hoa_don_id=${result.orderId}`, {
                    method: 'POST',
                    headers: headers
                });
                console.log('MoMo response status:', momoResponse.status);
                
                if (momoResponse.ok) {
                    const momoData = await momoResponse.json();
                    console.log('MoMo data:', momoData);
                    if (momoData.payUrl) {
                        console.log('Redirecting to MoMo:', momoData.payUrl);
                        // Redirect to MoMo payment page
                        window.location.href = momoData.payUrl;
                        return;
                    } else {
                        console.error('No payUrl in MoMo response');
                        showToast('Không thể tạo thanh toán MoMo: Thiếu URL thanh toán', 'error');
                    }
                } else {
                    const errorText = await momoResponse.text();
                    console.error('MoMo API error:', errorText);
                    showToast('Không thể tạo thanh toán MoMo. Vui lòng thử lại.', 'error');
                }
            } catch (momoError) {
                console.error("MoMo payment error:", momoError);
                showToast('Không thể tạo thanh toán MoMo. Vui lòng chọn thanh toán tiền mặt.', 'error');
            }
            // Don't proceed to next step if MoMo payment failed
            return;
        }
        
        // Step 3: Move to confirmation page (for cash payment)
        nextStep();
        showToast('Đặt lịch thành công!', 'success');
    } catch (error) {
        console.error("Booking submission error:", error);
        showToast(`Đặt lịch thất bại: ${error.message}`, 'error');
    }
  };

  const calculateTotal = () => {
    return selectedService?.price || selectedCombo?.price || 0;
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div className="position-relative overflow-hidden" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", paddingTop: "6rem", paddingBottom: "4rem", marginTop: "70px" }}>
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="container position-relative">
          <div className="text-center text-white">
            <h1 className="display-3 fw-light mb-3" style={{ fontFamily: "Georgia, serif", letterSpacing: "2px" }}>BeautySpa</h1>
            <p className="lead opacity-90 mb-2">Hệ thống đặt lịch thông minh</p>
            <p className="opacity-75">Trải nghiệm dịch vụ spa cao cấp với quy trình đặt lịch hiện đại</p>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-11">
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "15px" }}>
              <div className="card-body py-4">
                <div className="row text-center align-items-center">
                  {[
                    { step: 1, title: "Chọn Dịch Vụ", icon: "🛍️" },
                    { step: 2, title: "Đặt Lịch", icon: "📅" },
                    { step: 3, title: "Xác Nhận", icon: "💳" },
                    { step: 4, title: "Hoàn Tất", icon: "📄" },
                  ].map(({ step, title, icon }) => (
                    <div key={step} className="col-3">
                      <div className="d-flex flex-column align-items-center">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${currentStep >= step ? "text-white shadow-sm" : "bg-light text-muted border"}`} style={{ width: "60px", height: "60px", background: currentStep >= step ? "linear-gradient(135deg, #667eea, #764ba2)" : "transparent", fontSize: "1.5rem", transition: "all 0.3s ease" }}>
                          {currentStep >= step ? "✓" : icon}
                        </div>
                        <h6 className={`mb-1 ${currentStep >= step ? "text-primary" : "text-muted"}`}>{title}</h6>
                        <small className="text-muted">Bước {step}</small>
                      </div>
                      {step < 4 && <div className="position-relative"><hr className={`my-0 ${currentStep > step ? "border-primary" : "border-light"}`} style={{ position: "absolute", top: "-30px", left: "50%", width: "100%", zIndex: -1 }} /></div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {currentStep === 1 && (
                <div className="card shadow-sm border-0" style={{ borderRadius: "15px" }}>
                    <div className="card-header border-0 text-center" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "15px 15px 0 0", padding: "2rem" }}>
                        <h3 className="text-white mb-1 fw-light">Chọn Dịch Vụ hoặc Combo</h3>
                        <p className="text-white-50 mb-0">Lựa chọn dịch vụ hoặc combo phù hợp với nhu cầu của bạn</p>
                    </div>
                    <div className="card-body p-4">
                        {selectedService && (
                            <div className="alert alert-info mb-4">
                                <strong>Dịch vụ đã chọn:</strong> {selectedService.name} - {selectedService.price.toLocaleString("vi-VN")} ₫
                            </div>
                        )}
                        {selectedCombo && (
                            <div className="alert alert-success mb-4">
                                <strong>Combo đã chọn:</strong> {selectedCombo.name} - {selectedCombo.price.toLocaleString("vi-VN")} ₫
                                {selectedCombo.discount > 0 && <span className="badge bg-danger ms-2">Giảm {selectedCombo.discount}%</span>}
                            </div>
                        )}
                        <div className="row g-3">
                            {services.length > 0 ? services.map((service) => (
                                <div key={service.id} className="col-md-6">
                                    <div className={`card h-100 border-0 shadow-sm ${selectedService?.id === service.id ? "border-primary border-2" : ""}`} style={{ cursor: "pointer" }} onClick={() => handleServiceSelect(service)}>
                                        <div className="card-body p-3">
                                            <div className="d-flex align-items-center">
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1">{service.name}</h6>
                                                    <small className="text-muted">{service.duration} phút</small>
                                                    {service.description && <p className="text-muted small mb-0 mt-1">{service.description}</p>}
                                                </div>
                                                <div className="text-end ms-3">
                                                    <div className="fw-bold text-primary mb-2">{service.price.toLocaleString("vi-VN")} ₫</div>
                                                    <button className={`btn btn-sm ${selectedService?.id === service.id ? "btn-primary" : "btn-outline-primary"}`} style={{ borderRadius: "20px" }}>{selectedService?.id === service.id ? "✓ Đã chọn" : "Chọn"}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-12 text-center text-muted py-5">
                                    <p>Đang tải dịch vụ...</p>
                                </div>
                            )}
                        </div>
                        
                        {combos.length > 0 && (
                            <>
                                <hr className="my-4" />
                                <h5 className="text-success mb-3">Hoặc chọn Combo tiết kiệm</h5>
                                <div className="row g-3">
                                    {combos.map((combo) => (
                                        <div key={combo.id} className="col-md-6">
                                            <div className={`card h-100 border-0 shadow-sm ${selectedCombo?.id === combo.id ? "border-success border-2" : ""}`} style={{ cursor: "pointer" }} onClick={() => handleComboSelect(combo)}>
                                                <div className="card-body p-3">
                                                    <div className="d-flex align-items-start justify-content-between mb-2">
                                                        <h6 className="mb-0">{combo.name}</h6>
                                                        {combo.discount > 0 && <span className="badge bg-danger">-{combo.discount}%</span>}
                                                    </div>
                                                    {combo.description && <p className="text-muted small mb-2">{combo.description}</p>}
                                                    <div className="mb-2">
                                                        <small className="text-muted">Bao gồm:</small>
                                                        <div className="d-flex flex-wrap gap-1 mt-1">
                                                            {combo.dichVus.map((dv, i) => (
                                                                <span key={i} className="badge bg-light text-dark border">{dv.ten}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div className="fw-bold text-success">{combo.price.toLocaleString("vi-VN")} ₫</div>
                                                        <button className={`btn btn-sm ${selectedCombo?.id === combo.id ? "btn-success" : "btn-outline-success"}`} style={{ borderRadius: "20px" }}>{selectedCombo?.id === combo.id ? "✓ Đã chọn" : "Chọn"}</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="card-footer border-0 bg-light text-end p-4" style={{ borderRadius: "0 0 15px 15px" }}>
                        <button className="btn btn-lg px-5" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none", borderRadius: "25px", color: "white" }} onClick={nextStep} disabled={!selectedService && !selectedCombo}>Tiếp theo →</button>
                    </div>
                </div>
            )}

            {currentStep === 2 && (
                <div className="card shadow-sm border-0" style={{ borderRadius: "15px" }}>
                    <div className="card-header border-0 text-center" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "15px 15px 0 0", padding: "2rem" }}>
                        <h3 className="text-white mb-1 fw-light">Thông Tin Đặt Lịch</h3>
                        <p className="text-white-50 mb-0">Vui lòng điền đầy đủ thông tin để hoàn tất đặt lịch</p>
                    </div>
                    <div className="card-body p-4">
                        {selectedService && (
                            <div className="alert alert-info mb-4">
                                <strong>Dịch vụ đã chọn:</strong> {selectedService.name} - {selectedService.duration} phút - {selectedService.price.toLocaleString("vi-VN")} ₫
                            </div>
                        )}
                        {selectedCombo && (
                            <div className="alert alert-success mb-4">
                                <strong>Combo đã chọn:</strong> {selectedCombo.name} - {selectedCombo.price.toLocaleString("vi-VN")} ₫
                                {selectedCombo.discount > 0 && <span className="badge bg-danger ms-2">Giảm {selectedCombo.discount}%</span>}
                            </div>
                        )}
                        <div className="row g-4">
                            <div className="col-lg-6">
                                <h5 className="text-primary mb-4">Thông Tin Khách Hàng</h5>
                                <div className="mb-3"><label className="form-label fw-semibold">Họ và tên *</label><input type="text" className="form-control form-control-lg" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} placeholder="Nhập họ và tên" /></div>
                                <div className="mb-3"><label className="form-label fw-semibold">Số điện thoại *</label><input type="tel" className="form-control form-control-lg" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} placeholder="Nhập số điện thoại" /></div>
                                <div className="mb-3"><label className="form-label fw-semibold">Email</label><input type="email" className="form-control form-control-lg" value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} placeholder="Nhập email" /></div>
                                <div className="mb-0"><label className="form-label fw-semibold">Ghi chú</label><textarea className="form-control" rows="2" value={customerInfo.note} onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })} placeholder="Yêu cầu thêm (nếu có)"></textarea></div>
                            </div>
                            <div className="col-lg-6">
                                <h5 className="text-success mb-4">Chọn Thời Gian</h5>
                                <div className="mb-4"><label className="form-label fw-semibold">Ngày *</label><input type="date" className="form-control form-control-lg" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={new Date().toISOString().split("T")[0]} /></div>
                                <div className="mb-0">
                                    <label className="form-label fw-semibold mb-3">Giờ *</label>
                                    <div className="row g-2">
                                        {timeSlots.length > 0 ? timeSlots.map((time) => (
                                            <div key={time} className="col-4"><button type="button" className={`btn w-100 ${bookingTime === time ? "btn-success" : "btn-outline-secondary"}`} onClick={() => setBookingTime(time)}>{time}</button></div>
                                        )) : (
                                            <div className="col-12">
                                                <div className="alert alert-warning">
                                                    {!bookingDate ? (
                                                        <p className="mb-0">📅 Vui lòng chọn ngày trước để xem giờ trống</p>
                                                    ) : (
                                                        <p className="mb-0">⏰ Đang tải khung giờ có sẵn...</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer border-0 bg-light d-flex justify-content-between align-items-center p-4">
                        <button className="btn btn-outline-secondary btn-lg px-4" onClick={prevStep}>← Quay lại</button>
                        <button className="btn btn-lg px-5" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none", color: "white" }} onClick={nextStep} disabled={!customerInfo.name || !customerInfo.phone || !bookingDate || !bookingTime}>Tiếp theo →</button>
                    </div>
                </div>
            )}

            {currentStep === 3 && (
                <div className="card shadow-sm border-0" style={{ borderRadius: "15px" }}>
                    <div className="card-header border-0 text-center" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: "15px 15px 0 0", padding: "2rem" }}>
                        <h3 className="text-white mb-1 fw-light">Xác Nhận & Thanh Toán</h3>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-4">
                            <div className="col-lg-7">
                                <h5 className="text-primary mb-3">Chi tiết lịch hẹn</h5>
                                <div className="border rounded p-3 mb-3">
                                    <p className="mb-2"><strong>Khách hàng:</strong> {customerInfo.name}</p>
                                    <p className="mb-2"><strong>Số điện thoại:</strong> {customerInfo.phone}</p>
                                    <p className="mb-2"><strong>Email:</strong> {customerInfo.email || 'Không có'}</p>
                                    {selectedService && <p className="mb-2"><strong>Dịch vụ:</strong> {selectedService.name}</p>}
                                    {selectedCombo && <p className="mb-2"><strong>Combo:</strong> {selectedCombo.name}</p>}
                                    <p className="mb-2"><strong>Thời gian:</strong> {bookingTime} - Ngày {bookingDate}</p>
                                    <p className="mb-0"><strong>Ghi chú:</strong> {customerInfo.note || "Không có"}</p>
                                </div>
                            </div>
                            <div className="col-lg-5">
                                <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                                    <div className="card-body p-4">
                                        <h5 className="mb-3 d-flex align-items-center">
                                            <span className="me-2">📋</span>
                                            Tóm tắt đơn hàng
                                        </h5>
                                        <div className="bg-white rounded p-3 mb-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted">Ngày:</span>
                                                <strong>{new Date(bookingDate).toLocaleDateString('vi-VN')}</strong>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted">Giờ:</span>
                                                <strong>{bookingTime}</strong>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-muted">Khách hàng:</span>
                                                <strong>{customerInfo.name}</strong>
                                            </div>
                                            {selectedService && (
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Dịch vụ:</span>
                                                    <strong className="text-end" style={{ maxWidth: '60%' }}>{selectedService.name}</strong>
                                                </div>
                                            )}
                                            {selectedCombo && (
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Combo:</span>
                                                    <strong className="text-end" style={{ maxWidth: '60%' }}>{selectedCombo.name}</strong>
                                                </div>
                                            )}
                                            <hr />
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="h6 mb-0">Tổng cộng:</span>
                                                <span className="h4 mb-0 text-success fw-bold">{calculateTotal().toLocaleString("vi-VN")} ₫</span>
                                            </div>
                                        </div>
                                        <div className="alert alert-info mb-0 small">
                                            <i className="bi bi-info-circle me-2"></i>
                                            Thanh toán sau khi spa xác nhận lịch hẹn
                                        </div>
                                    </div>
                                </div>
                                
                                <h5 className="text-success mb-3">Phương thức thanh toán</h5>
                                <div className="mb-3">
                                    <div className="form-check mb-3 p-3 border rounded" style={{ cursor: 'pointer' }} onClick={() => setPaymentMethod('TIEN_MAT')}>
                                        <input className="form-check-input" type="radio" name="paymentMethod" id="cash" checked={paymentMethod === 'TIEN_MAT'} onChange={() => setPaymentMethod('TIEN_MAT')} />
                                        <label className="form-check-label w-100" htmlFor="cash" style={{ cursor: 'pointer' }}>
                                            <div className="d-flex align-items-center">
                                                <span className="fs-4 me-3">💵</span>
                                                <div>
                                                    <strong>Tiền mặt</strong>
                                                    <p className="mb-0 small text-muted">Thanh toán tại quầy khi đến</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                    <div className="form-check p-3 border rounded" style={{ cursor: 'pointer' }} onClick={() => setPaymentMethod('MOMO')}>
                                        <input className="form-check-input" type="radio" name="paymentMethod" id="momo" checked={paymentMethod === 'MOMO'} onChange={() => setPaymentMethod('MOMO')} />
                                        <label className="form-check-label w-100" htmlFor="momo" style={{ cursor: 'pointer' }}>
                                            <div className="d-flex align-items-center">
                                                <span className="fs-4 me-3">📱</span>
                                                <div>
                                                    <strong>MoMo</strong>
                                                    <p className="mb-0 small text-muted">Thanh toán online qua MoMo</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer border-0 bg-light d-flex justify-content-between align-items-center p-4">
                        <button className="btn btn-outline-secondary btn-lg px-4" onClick={prevStep}>← Quay lại</button>
                        <button className="btn btn-success btn-lg px-5" onClick={handleBookingSubmit} disabled={!paymentMethod}>
                            {paymentMethod === 'MOMO' ? '💳 Thanh toán MoMo' : '✓ Xác nhận đặt lịch'}
                        </button>
                    </div>
                </div>
            )}

            {currentStep === 4 && (
                <div className="card shadow-sm border-0" style={{ borderRadius: "15px", overflow: 'hidden' }}>
                    {/* Success Header */}
                    <div className="text-center text-white p-5" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                        <div className="mb-3">
                            <div className="rounded-circle bg-white d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                <span style={{ fontSize: '3rem' }}>✓</span>
                            </div>
                        </div>
                        <h2 className="fw-bold mb-2">Đặt Lịch Thành Công!</h2>
                        <p className="mb-0 opacity-90">Cảm ơn bạn đã tin tưởng BeautySpa</p>
                    </div>

                    <div className="card-body p-4">
                        {/* Spa Info */}
                        <div className="text-center mb-4 pb-4 border-bottom">
                            <h5 className="text-primary mb-1">BeautySpa</h5>
                            <p className="text-muted small mb-1">123 Đường ABC, Quận 1, TP.HCM</p>
                            <p className="text-muted small mb-0">📞 0123 456 789 • ✉️ info@beautyspa.com</p>
                        </div>

                        <div className="row g-4 mb-4">
                            {/* Customer Info */}
                            <div className="col-md-6">
                                <div className="border rounded p-3 h-100">
                                    <h6 className="text-primary mb-3">
                                        <span className="me-2">👤</span>
                                        Thông tin khách hàng
                                    </h6>
                                    <div className="mb-2">
                                        <small className="text-muted">Họ tên:</small>
                                        <div className="fw-semibold">{customerInfo.name}</div>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted">Điện thoại:</small>
                                        <div className="fw-semibold">{customerInfo.phone}</div>
                                    </div>
                                    <div>
                                        <small className="text-muted">Email:</small>
                                        <div className="fw-semibold">{customerInfo.email || 'Không có'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Info */}
                            <div className="col-md-6">
                                <div className="border rounded p-3 h-100">
                                    <h6 className="text-success mb-3">
                                        <span className="me-2">📅</span>
                                        Thông tin đặt lịch
                                    </h6>
                                    <div className="mb-2">
                                        <small className="text-muted">Mã đặt lịch:</small>
                                        <div className="fw-semibold text-primary">#{bookingResponse?.id || bookingResponse?.maDatLich || 'N/A'}</div>
                                    </div>
                                    <div className="mb-2">
                                        <small className="text-muted">Ngày hẹn:</small>
                                        <div className="fw-semibold">{new Date(bookingDate).toLocaleDateString('vi-VN')}</div>
                                    </div>
                                    <div>
                                        <small className="text-muted">Giờ hẹn:</small>
                                        <div className="fw-semibold">{bookingTime}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Service Details */}
                        <div className="border rounded p-3 mb-4">
                            <h6 className="text-info mb-3">
                                <span className="me-2">💆</span>
                                Chi tiết dịch vụ
                            </h6>
                            <table className="table table-borderless mb-0">
                                <thead>
                                    <tr className="border-bottom">
                                        <th className="text-muted small">Dịch vụ</th>
                                        <th className="text-muted small text-end">Thời gian</th>
                                        <th className="text-muted small text-end">Giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedService && (
                                        <tr>
                                            <td className="fw-semibold">{selectedService.name}</td>
                                            <td className="text-end">{selectedService.duration} phút</td>
                                            <td className="text-end">{selectedService.price.toLocaleString('vi-VN')} ₫</td>
                                        </tr>
                                    )}
                                    {selectedCombo && (
                                        <tr>
                                            <td className="fw-semibold">
                                                {selectedCombo.name}
                                                {selectedCombo.discount > 0 && <span className="badge bg-danger ms-2">-{selectedCombo.discount}%</span>}
                                            </td>
                                            <td className="text-end">{selectedCombo.duration || 90} phút</td>
                                            <td className="text-end">{selectedCombo.price.toLocaleString('vi-VN')} ₫</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="border-top">
                                        <td colSpan="2" className="fw-bold">Tổng cộng:</td>
                                        <td className="text-end">
                                            <span className="h5 text-success fw-bold mb-0">
                                                {calculateTotal().toLocaleString('vi-VN')} ₫
                                            </span>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Note */}
                        <div className="alert alert-info mb-4">
                            <div className="d-flex align-items-start">
                                <span className="me-2">💡</span>
                                <div>
                                    <strong>Cảm ơn quý khách!</strong>
                                    <p className="mb-0 small">Hãy đến đúng giờ để có trải nghiệm tốt nhất. Vui lòng đến sớm 5-10 phút để làm thủ tục.</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="d-flex gap-3 justify-content-center">
                            <button className="btn btn-outline-primary px-4" onClick={() => window.print()}>
                                🖨️ In hóa đơn
                            </button>
                            <button className="btn btn-primary px-4" onClick={() => { setCurrentStep(1); setSelectedService(null); setSelectedCombo(null); setBookingDate(''); setBookingTime(''); }}>
                                📅 Đặt lịch mới
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeautySpaBooking;