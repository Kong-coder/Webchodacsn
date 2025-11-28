package com.example.demo.service.impl;

import com.example.demo.dto.DatLichRequest;
import com.example.demo.dto.DatLichResponse;
import com.example.demo.dto.KhungGioKhaDungDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.service.DatLichService;
import com.example.demo.service.ThanhToanService;
import com.example.demo.service.ProductDeductionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DatLichServiceImpl implements DatLichService {

    @Autowired
    private LichHenRepository lichHenRepository;
    
    @Autowired
    private DichVuRepository dichVuRepository;
    
    @Autowired
    private NguoiDungRepository nguoiDungRepository;
    
    @Autowired
    private KhachHangRepository khachHangRepository;
    
    @Autowired
    private HoaDonRepository hoaDonRepository;
    
    @Autowired
    private ComboRepository comboRepository;
    
    // Removed unused nhanVienRepository
    @Autowired
    private KhungGioLamViecRepository khungGioLamViecRepository;
    
    @Autowired
    private ProductDeductionService productDeductionService;
    
    @Autowired
    private ThanhToanService thanhToanService;

    @Override
    @Transactional
    public DatLichResponse datLich(DatLichRequest request) {
        // Validate request
        if (request.getThoiGianBatDau() == null || request.getThoiGianKetThuc() == null) {
            throw new IllegalArgumentException("Thời gian bắt đầu và kết thúc không được để trống");
        }
        
        // Validate không cho phép đặt lịch trong quá khứ
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (request.getThoiGianBatDau().isBefore(now)) {
            throw new IllegalArgumentException("Không thể đặt lịch trong quá khứ. Vui lòng chọn thời gian từ hiện tại trở đi.");
        }
        
        // Check if booking is for service or combo
        boolean isComboBooking = request.getComboId() != null || request.getGoiDichVuId() != null;
        Long comboId = request.getComboId() != null ? request.getComboId() : request.getGoiDichVuId();
        
        DichVu dichVu = null;
        if (!isComboBooking) {
            // Convert dichVuId to Integer
            Integer dichVuId = request.getDichVuId() != null ? request.getDichVuId().intValue() : null;
            
            // Lấy thông tin dịch vụ
            dichVu = dichVuRepository.findById(dichVuId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + request.getDichVuId()));
        }
        
        // Lấy thông tin khách hàng (từ authentication)
        NguoiDung khachHang = null;
        try {
            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getName();
            khachHang = nguoiDungRepository.findByTenDangNhap(username)
                    .orElse(null);
        } catch (Exception e) {
            // If not authenticated, try to get first customer (for testing)
            System.out.println("Warning: Could not get authenticated user, using first customer");
        }
        
        if (khachHang == null) {
            // Fallback: get first customer with role KhachHang
            khachHang = nguoiDungRepository.findAll().stream()
                    .filter(u -> u.getVaiTro() != null && u.getVaiTro().getMaVaiTro() == 1)
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin khách hàng"));
        }
        
        // Tìm khách hàng trong bảng khach_hang theo ma_nguoi_dung
        KhachHang khachHangEntity = khachHangRepository.findByMaNguoiDung(khachHang.getMaNguoiDung());
        if (khachHangEntity == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin khách hàng với mã người dùng: " + khachHang.getMaNguoiDung());
        }
        
        // Tạo mới lịch hẹn
        LichHen lichHen = new LichHen();
        lichHen.setMaKhachHang(khachHangEntity.getId().intValue());
        
        if (isComboBooking) {
            lichHen.setMaCombo(comboId);
            lichHen.setMaDichVu(null); // Combo không cần dichVuId
        } else {
            lichHen.setMaDichVu(dichVu.getMaDichVu());
            lichHen.setMaCombo(null);
        }
        
        // Convert LocalDateTime to OffsetDateTime with system default offset
        OffsetDateTime thoiGianBatDau = request.getThoiGianBatDau().atZone(ZoneOffset.systemDefault()).toOffsetDateTime();
        OffsetDateTime thoiGianKetThuc = request.getThoiGianKetThuc().atZone(ZoneOffset.systemDefault()).toOffsetDateTime();
        
        // Set thời gian
        lichHen.setThoiGianHen(thoiGianBatDau);
        lichHen.setThoiGianBatDau(thoiGianBatDau);
        lichHen.setThoiGianKetThuc(thoiGianKetThuc);
        lichHen.setTrangThai("CHO_XAC_NHAN");
        lichHen.setNgayTao(OffsetDateTime.now());
        lichHen.setGhiChu(request.getGhiChu());
        
        // Calculate total price
        double tongTien = isComboBooking ? (request.getTongTien() != null ? request.getTongTien() : 0.0) : calculateTongTien(dichVu, request);
        lichHen.setTongTien(tongTien);
        
        // Set phương thức thanh toán nếu có
        if (request.getPhuongThucThanhToan() != null) {
            lichHen.setPhuongThucThanhToan(request.getPhuongThucThanhToan());
        }
        
        // Lưu lịch hẹn
        lichHen = lichHenRepository.save(lichHen);
        
        // Tạo hóa đơn cho tất cả các lịch hẹn
        HoaDon hoaDon = new HoaDon();
        hoaDon.setMaLichHen(lichHen.getMaLichHen());
        hoaDon.setMaKhachHang(lichHen.getMaKhachHang());
        hoaDon.setTongTien(java.math.BigDecimal.valueOf(tongTien));
        hoaDon.setPhuongThucThanhToan(request.getPhuongThucThanhToan() != null ? request.getPhuongThucThanhToan() : "cash");
        hoaDon.setTrangThai("unpaid"); // Mặc định chưa thanh toán
        hoaDon.setNgayXuat(OffsetDateTime.now());
        hoaDon = hoaDonRepository.save(hoaDon);
        
        DatLichResponse response = convertToResponse(lichHen);
        // Set orderId to hoaDon ID (dùng cho cả MoMo và tracking)
        response.setOrderId(hoaDon.getMaHoaDon().longValue());
        
        return response;
    }

    @Override
    public List<KhungGioKhaDungDTO> getKhungGioKhaDung(LocalDate ngay, Long dichVuId, int thoiGianThucHien) {
        // Convert dichVuId to Integer
        Integer dichVuIdInt = dichVuId != null ? dichVuId.intValue() : null;
        
        // Lấy thông tin dịch vụ (không cần lưu vào biến vì không sử dụng)
        dichVuRepository.findById(dichVuIdInt)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy dịch vụ với ID: " + dichVuId));
        
        // Lấy khung giờ làm việc
        KhungGioLamViec khungGioLamViec = khungGioLamViecRepository.findFirstByActiveTrue();
        if (khungGioLamViec == null) {
            throw new ResourceNotFoundException("Không tìm thấy cấu hình giờ làm việc");
        }
        
        // Tạo danh sách khung giờ khả dụng
        List<KhungGioKhaDungDTO> khungGioKhaDung = new ArrayList<>();
        
        // Tạo các khung giờ từ giờ mở cửa đến giờ đóng cửa
        LocalTime current = khungGioLamViec.getGioMoCua();
        while (current.plusMinutes(thoiGianThucHien).isBefore(khungGioLamViec.getGioDongCua()) || 
               current.plusMinutes(thoiGianThucHien).equals(khungGioLamViec.getGioDongCua())) {
            
            KhungGioKhaDungDTO khungGio = new KhungGioKhaDungDTO();
            khungGio.setGioBatDau(current);
            khungGio.setGioKetThuc(current.plusMinutes(thoiGianThucHien));
            
            // Kiểm tra xem khung giờ này có bận không
            boolean isAvailable = isKhungGioKhaDung(
                ngay.atTime(khungGio.getGioBatDau()),
                ngay.atTime(khungGio.getGioKetThuc()),
                dichVuId
            );
            
            khungGio.setKhaDung(isAvailable);
            if (!isAvailable) {
                khungGio.setLyDoKhongKhaDung("Đã có lịch hẹn khác trong khung giờ này");
            }
            
            khungGioKhaDung.add(khungGio);
            current = current.plusMinutes(khungGioLamViec.getKhoangThoiGianMotLich());
        }
        
        return khungGioKhaDung;
    }

    private LichHen getLichHenById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID không được để trống");
        }
        return lichHenRepository.findById(id.intValue())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với ID: " + id));
    }

    @Override
    public DatLichResponse getChiTietDatLich(Long id) {
        LichHen lichHen = getLichHenById(id);
        return convertToResponse(lichHen);
    }

    @Override
    @Transactional
    public void huyDatLich(Long id, String lyDo) {
        LichHen lichHen = getLichHenById(id);
        
        if ("DA_HUY".equals(lichHen.getTrangThai()) || "HOAN_THANH".equals(lichHen.getTrangThai())) {
            throw new IllegalStateException("Không thể hủy lịch hẹn ở trạng thái: " + lichHen.getTrangThai());
        }
        
        lichHen.setTrangThai("DA_HUY");
        // Thay thế hoàn toàn ghi chú cũ bằng lý do hủy của khách hàng
        lichHen.setGhiChu("Khách hàng hủy: " + lyDo);
        lichHenRepository.save(lichHen);
    }
    
    @Override
    public java.util.List<DatLichResponse> getMyAppointments() {
        // Lấy thông tin khách hàng hiện tại
        NguoiDung khachHang = null;
        try {
            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getName();
            khachHang = nguoiDungRepository.findByTenDangNhap(username)
                    .orElse(null);
        } catch (Exception e) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin người dùng");
        }
        
        if (khachHang == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin người dùng");
        }
        
        // Tìm khách hàng trong bảng khach_hang
        KhachHang khachHangEntity = khachHangRepository.findByMaNguoiDung(khachHang.getMaNguoiDung());
        if (khachHangEntity == null) {
            return new java.util.ArrayList<>();
        }
        
        // Lấy tất cả lịch hẹn của khách hàng
        java.util.List<LichHen> lichHens = lichHenRepository.findByMaKhachHangOrderByThoiGianHenDesc(
                khachHangEntity.getId().intValue());
        
        // Convert sang response
        return lichHens.stream()
                .map(this::convertToResponse)
                .collect(java.util.stream.Collectors.toList());
    }
    
    @Override
    public java.util.List<DatLichResponse> getAllAppointments() {
        // Lấy tất cả lịch hẹn (cho nhân viên/quản lý)
        java.util.List<LichHen> lichHens = lichHenRepository.findAll();
        
        // Convert sang response
        return lichHens.stream()
                .map(this::convertToResponse)
                .sorted((a, b) -> {
                    if (a.getThoiGianBatDau() == null) return 1;
                    if (b.getThoiGianBatDau() == null) return -1;
                    return b.getThoiGianBatDau().compareTo(a.getThoiGianBatDau());
                })
                .collect(java.util.stream.Collectors.toList());
    }
    
    // Các phương thức hỗ trợ
    private boolean isKhungGioKhaDung(java.time.LocalDateTime batDau, java.time.LocalDateTime ketThuc, Long dichVuId) {
        // Kiểm tra xem có lịch hẹn nào trùng khung giờ không
        if (dichVuId == null) {
            throw new IllegalArgumentException("dichVuId không được để trống");
        }
        
        // Chuyển đổi LocalDateTime sang OffsetDateTime nếu cần
        OffsetDateTime batDauOffset = batDau != null ? batDau.atOffset(ZoneOffset.UTC) : null;
        OffsetDateTime ketThucOffset = ketThuc != null ? ketThuc.atOffset(ZoneOffset.UTC) : null;
        
        // Gọi repository với các tham số đã chuyển đổi
        long count = lichHenRepository.countByDichVu_MaDichVuAndThoiGianBetweenAndTrangThaiNot(
                dichVuId.intValue(), batDauOffset, ketThucOffset, "DA_HUY");
                
        return count == 0;
    }
    
    private double calculateTongTien(DichVu dichVu, DatLichRequest request) {
        // Tính tổng tiền dựa trên dịch vụ và các yêu cầu khác (giảm giá, v.v.)
        double tongTien = dichVu.getGia() != null ? dichVu.getGia().doubleValue() : 0.0;
        
        // Áp dụng giảm giá nếu có
        if (request.getGiamGia() != null && request.getGiamGia() > 0) {
            tongTien -= request.getGiamGia();
        }
        
        // Đảm bảo tổng tiền không âm
        return Math.max(0, tongTien);
    }
    
    private DatLichResponse convertToResponse(LichHen lichHen) {
        DatLichResponse response = new DatLichResponse();
        response.setId(lichHen.getMaLichHen() != null ? lichHen.getMaLichHen().longValue() : null);
        response.setMaDatLich(lichHen.getMaLichHen() != null ? lichHen.getMaLichHen().toString() : null);
        
        // Lấy thông tin khách hàng từ repository nếu cần
        if (lichHen.getMaKhachHang() != null) {
            // ma_khach_hang trong lichhen là ID từ bảng khach_hang
            KhachHang khachHangEntity = khachHangRepository.findById(lichHen.getMaKhachHang().longValue()).orElse(null);
            if (khachHangEntity != null) {
                response.setKhachHangId(khachHangEntity.getId());
                
                // Lấy thông tin từ bảng nguoi_dung
                NguoiDung nguoiDung = nguoiDungRepository.findById(khachHangEntity.getMaNguoiDung()).orElse(null);
                if (nguoiDung != null) {
                    response.setTenKhachHang(nguoiDung.getHoTen());
                    response.setSoDienThoai(nguoiDung.getSoDienThoai());
                    response.setEmail(nguoiDung.getEmail());
                }
            }
        }
        
        // Lấy thông tin nhân viên nếu có
        if (lichHen.getMaNhanVien() != null) {
            NguoiDung nhanVien = nguoiDungRepository.findById(lichHen.getMaNhanVien()).orElse(null);
            if (nhanVien != null) {
                response.setNhanVienId(nhanVien.getMaNguoiDung() != null ? nhanVien.getMaNguoiDung().longValue() : null);
                response.setTenNhanVien(nhanVien.getHoTen());
                // Note: DatLichResponse doesn't have sdtNhanVien or emailNhanVien fields
            }
        }
        
        // Lấy thông tin dịch vụ hoặc combo
        if (lichHen.getMaCombo() != null) {
            Combo combo = comboRepository.findById(lichHen.getMaCombo()).orElse(null);
            if (combo != null) {
                response.setComboId(combo.getId());
                response.setTenCombo(combo.getTenCombo());
            }
        } else if (lichHen.getMaDichVu() != null) {
            DichVu dichVu = dichVuRepository.findById(lichHen.getMaDichVu()).orElse(null);
            if (dichVu != null) {
                response.setDichVuId(dichVu.getMaDichVu().longValue());
                response.setTenDichVu(dichVu.getTenDichVu());
                response.setThoiLuongPhut(dichVu.getThoiLuongPhut());
            }
        }
        
        // Chuyển đổi OffsetDateTime sang LocalDateTime nếu cần
        if (lichHen.getThoiGianHen() != null) {
            response.setThoiGianBatDau(lichHen.getThoiGianHen().toLocalDateTime());
        }
        if (lichHen.getThoiGianKetThuc() != null) {
            response.setThoiGianKetThuc(lichHen.getThoiGianKetThuc().toLocalDateTime());
        }
        
        response.setTrangThai(lichHen.getTrangThai());
        response.setGhiChu(lichHen.getGhiChu());
        response.setTongTien(lichHen.getTongTien() != null ? lichHen.getTongTien() : 0.0);
        response.setPhuongThucThanhToan(lichHen.getPhuongThucThanhToan());
        
        // Set orderId (same as lichHen id for MoMo payment)
        response.setOrderId(lichHen.getMaLichHen() != null ? lichHen.getMaLichHen().longValue() : null);
        
        if (lichHen.getNgayTao() != null) {
            response.setNgayTao(lichHen.getNgayTao().toLocalDateTime());
        }
        if (lichHen.getNgayCapNhat() != null) {
            response.setNgayCapNhat(lichHen.getNgayCapNhat().toLocalDateTime());
        }
        
        return response;
    }
    
    @Override
    @Transactional
    public DatLichResponse xacNhanLichHen(Long id) {
        LichHen lichHen = getLichHenById(id);
        
        if (!"CHO_XAC_NHAN".equals(lichHen.getTrangThai())) {
            throw new IllegalStateException("Chỉ có thể xác nhận lịch hẹn ở trạng thái CHỜ XÁC NHẬN");
        }
        
        // Gán nhân viên hiện tại đang xác nhận
        try {
            String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getName();
            NguoiDung nhanVien = nguoiDungRepository.findByTenDangNhap(username).orElse(null);
            if (nhanVien != null) {
                lichHen.setMaNhanVien(nhanVien.getMaNguoiDung());
            }
        } catch (Exception e) {
            System.out.println("Warning: Could not get authenticated staff user");
        }
        
        lichHen.setTrangThai("DA_XAC_NHAN");
        lichHen.setNgayCapNhat(java.time.OffsetDateTime.now());
        LichHen saved = lichHenRepository.save(lichHen);
        
        // Directly process cash payment upon confirmation
        try {
            // Find the corresponding invoice
            List<HoaDon> invoices = hoaDonRepository.findAll().stream()
                .filter(hd -> saved.getMaLichHen().equals(hd.getMaLichHen()))
                .collect(Collectors.toList());

            if (!invoices.isEmpty()) {
                HoaDon invoice = invoices.get(0);
                String paymentMethod = invoice.getPhuongThucThanhToan() != null ? invoice.getPhuongThucThanhToan().trim() : "";
                
                // Check if payment method is cash and invoice is unpaid
                if (("TIEN_MAT".equalsIgnoreCase(paymentMethod) || "cash".equalsIgnoreCase(paymentMethod)) 
                        && "unpaid".equalsIgnoreCase(invoice.getTrangThai())) {
                            
                    System.out.println("Appointment confirmed with cash payment. Processing invoice " + invoice.getMaHoaDon());
                    thanhToanService.cashInit(invoice.getMaHoaDon());
                    thanhToanService.cashConfirm(invoice.getMaHoaDon());
                    System.out.println("Cash payment processed for invoice " + invoice.getMaHoaDon());
                }
            }
        } catch (Exception e) {
            System.err.println("!!! CRITICAL: Exception caught during direct cash processing for appointment " + saved.getMaLichHen());
            e.printStackTrace();
        }
        
        return convertToResponse(saved);
    }
    
    @Override
    @Transactional
    public void tuChoiLichHen(Long id, String lyDo) {
        LichHen lichHen = getLichHenById(id);
        
        if (!"CHO_XAC_NHAN".equals(lichHen.getTrangThai())) {
            throw new IllegalStateException("Chỉ có thể từ chối lịch hẹn ở trạng thái CHỜ XÁC NHẬN");
        }
        
        lichHen.setTrangThai("DA_HUY");
        // Thay thế hoàn toàn ghi chú cũ bằng lý do từ chối của nhân viên
        lichHen.setGhiChu("Nhân viên từ chối: " + lyDo);
        lichHen.setNgayCapNhat(java.time.OffsetDateTime.now());
        lichHenRepository.save(lichHen);
    }
    
    @Override
    @Transactional
    public DatLichResponse capNhatLichHen(Long id, DatLichRequest request) {
        LichHen lichHen = getLichHenById(id);
        
        // Chỉ cho phép cập nhật nếu chưa hoàn thành hoặc đã hủy
        if ("HOAN_THANH".equals(lichHen.getTrangThai()) || "DA_HUY".equals(lichHen.getTrangThai())) {
            throw new IllegalStateException("Không thể cập nhật lịch hẹn đã hoàn thành hoặc đã hủy");
        }
        
        // Validate không cho phép cập nhật lịch với thời gian trong quá khứ
        if (request.getThoiGianBatDau() != null) {
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            if (request.getThoiGianBatDau().isBefore(now)) {
                throw new IllegalArgumentException("Không thể cập nhật lịch với thời gian trong quá khứ. Vui lòng chọn thời gian từ hiện tại trở đi.");
            }
        }
        
        // Cập nhật thông tin với timezone Việt Nam (+07:00)
        if (request.getThoiGianBatDau() != null) {
            // Convert LocalDateTime to OffsetDateTime with Vietnam timezone
            OffsetDateTime thoiGianBatDau = request.getThoiGianBatDau()
                .atZone(java.time.ZoneId.systemDefault())
                .toOffsetDateTime();
            lichHen.setThoiGianHen(thoiGianBatDau);
            lichHen.setThoiGianBatDau(thoiGianBatDau);
        }
        if (request.getThoiGianKetThuc() != null) {
            // Convert LocalDateTime to OffsetDateTime with Vietnam timezone
            OffsetDateTime thoiGianKetThuc = request.getThoiGianKetThuc()
                .atZone(java.time.ZoneId.systemDefault())
                .toOffsetDateTime();
            lichHen.setThoiGianKetThuc(thoiGianKetThuc);
        }
        if (request.getGhiChu() != null) {
            // Thay thế ghi chú cũ bằng ghi chú mới
            lichHen.setGhiChu(request.getGhiChu());
        }
        
        // Đặt lại trạng thái về CHO_XAC_NHAN để nhân viên duyệt lại
        lichHen.setTrangThai("CHO_XAC_NHAN");
        // Xóa nhân viên cũ vì cần duyệt lại
        lichHen.setMaNhanVien(null);
        lichHen.setNgayCapNhat(java.time.OffsetDateTime.now());
        
        lichHenRepository.save(lichHen);
        
        return convertToResponse(lichHen);
    }
    
    @Override
    @Transactional
    public DatLichResponse hoanThanhLichHen(Long id) {
        LichHen lichHen = getLichHenById(id);
        
        // Chỉ cho phép hoàn thành nếu đã xác nhận
        if (!"DA_XAC_NHAN".equals(lichHen.getTrangThai())) {
            throw new IllegalStateException("Chỉ có thể hoàn thành lịch hẹn đã được xác nhận");
        }
        
        // Cập nhật trạng thái
        lichHen.setTrangThai("HOAN_THANH");
        lichHen.setNgayCapNhat(java.time.OffsetDateTime.now());
        lichHenRepository.save(lichHen);
        
        // Tự động trừ sản phẩm liên quan đến dịch vụ
        if (lichHen.getMaDichVu() != null) {
            try {
                productDeductionService.deductProductsForService(lichHen.getMaDichVu());
                System.out.println("Successfully deducted products for service ID: " + lichHen.getMaDichVu());
            } catch (Exception e) {
                System.err.println("Error deducting products for service ID " + lichHen.getMaDichVu() + ": " + e.getMessage());
                // Không throw exception để không làm fail transaction hoàn thành lịch hẹn
            }
        }
        
        return convertToResponse(lichHen);
    }
}
