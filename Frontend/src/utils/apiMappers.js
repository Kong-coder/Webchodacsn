/**
 * API Response Mappers
 * Maps backend Vietnamese field names to frontend English field names
 */

/**
 * Map service data from backend to frontend format
 * @param {Object} service - Service object from backend API
 * @returns {Object} Mapped service object
 */
export const mapServiceFromAPI = (service) => {
  if (!service) return null;
  
  return {
    id: service.id,
    name: service.ten,
    description: service.moTa,
    duration: service.thoiLuongPhut,
    price: service.gia || 0,
    status: service.coSan ? 'active' : 'inactive',
    image: service.hinhAnh,
    category: service.loai,
    discount: 0,  // Default value - can be updated if backend provides this
    bookings: 0,  // Default value - can be updated if backend provides this
    reviews: 0    // Default value - can be updated if backend provides this
  };
};

/**
 * Map array of services from backend to frontend format
 * @param {Array} services - Array of service objects from backend API
 * @returns {Array} Array of mapped service objects
 */
export const mapServicesFromAPI = (services) => {
  if (!Array.isArray(services)) return [];
  return services.map(mapServiceFromAPI);
};

/**
 * Map service data from frontend to backend format for POST/PUT requests
 * @param {Object} service - Service object from frontend
 * @returns {Object} Mapped service object for backend
 */
export const mapServiceToAPI = (service) => {
  if (!service) return null;
  
  return {
    tenDichVu: service.name,
    moTa: service.description,
    thoiLuongPhut: service.duration,
    gia: service.price,
    coSan: service.status === 'active',
    hinhAnh: service.image,
    loai: service.category
  };
};

/**
 * Map user data from backend to frontend format
 * @param {Object} user - User object from backend API
 * @returns {Object} Mapped user object
 */
export const mapUserFromAPI = (user) => {
  if (!user) return null;
  
  return {
    id: user.id,
    username: user.tenDangNhap,
    email: user.email,
    fullName: user.hoTen,
    phone: user.soDienThoai,
    address: user.diaChi,
    role: user.vaiTro,
    createdAt: user.ngayTao
  };
};

/**
 * Map booking data from backend to frontend format
 * @param {Object} booking - Booking object from backend API
 * @returns {Object} Mapped booking object
 */
export const mapBookingFromAPI = (booking) => {
  if (!booking) return null;
  
  return {
    id: booking.id,
    serviceId: booking.maDichVu,
    serviceName: booking.tenDichVu,
    customerId: booking.maKhachHang,
    customerName: booking.tenKhachHang,
    date: booking.ngay,
    time: booking.gio,
    status: booking.trangThai,
    notes: booking.ghiChu,
    createdAt: booking.ngayTao
  };
};

/**
 * Map array of bookings from backend to frontend format
 * @param {Array} bookings - Array of booking objects from backend API
 * @returns {Array} Array of mapped booking objects
 */
export const mapBookingsFromAPI = (bookings) => {
  if (!Array.isArray(bookings)) return [];
  return bookings.map(mapBookingFromAPI);
};
