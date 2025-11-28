package com.example.demo.controller;

import com.example.demo.dto.DatLichRequest;
import com.example.demo.dto.DatLichResponse;
import com.example.demo.model.LichHen;
import com.example.demo.model.NguoiDung;
import com.example.demo.repository.LichHenRepository;
import com.example.demo.repository.NguoiDungRepository;
import com.example.demo.service.DatLichService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dat-lich")
public class DatLichController {

    @Autowired
    private LichHenRepository lichHenRepository;
    
    @Autowired
    private NguoiDungRepository nguoiDungRepository;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private DatLichService datLichService;

    /**
     * Create new appointment
     */
    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody DatLichRequest request) {
        System.out.println("=== CREATE APPOINTMENT API CALLED ===");
        try {
            DatLichResponse response = datLichService.datLich(request);
            System.out.println("Appointment created successfully: " + response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error creating appointment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi tạo lịch hẹn: " + e.getMessage()));
        }
    }

    /**
     * Get all appointments (for staff/admin)
     */
    @GetMapping
    public ResponseEntity<?> getAllAppointments() {
        System.out.println("=== GET ALL APPOINTMENTS API CALLED ===");
        try {
            // Get all appointments sorted by date descending (newest first)
            List<LichHen> appointments = lichHenRepository.findAll();
            // Sort by thoiGianBatDau descending (newest first)
            appointments.sort((a, b) -> {
                if (a.getThoiGianBatDau() == null && b.getThoiGianBatDau() == null) return 0;
                if (a.getThoiGianBatDau() == null) return 1;
                if (b.getThoiGianBatDau() == null) return -1;
                return b.getThoiGianBatDau().compareTo(a.getThoiGianBatDau());
            });
            System.out.println("Found " + appointments.size() + " total appointments");
            
            List<Map<String, Object>> result = appointments.stream()
                .map(apt -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", apt.getMaLichHen());
                    map.put("maLichHen", apt.getMaLichHen());
                    map.put("trangThai", apt.getTrangThai());
                    map.put("thoiGianBatDau", apt.getThoiGianBatDau());
                    map.put("thoiGianHen", apt.getThoiGianHen());
                    map.put("tongTien", apt.getTongTien());
                    map.put("ghiChu", apt.getGhiChu());
                    map.put("maKhachHang", apt.getMaKhachHang());
                    map.put("maNhanVien", apt.getMaNhanVien());
                    
                    // Load customer name from khach_hang table
                    if (apt.getMaKhachHang() != null) {
                        try {
                            Map<String, Object> khachHang = jdbcTemplate.queryForMap(
                                "SELECT kh.ho_ten, kh.so_dien_thoai, kh.email, nd.vip " +
                                "FROM khach_hang kh " +
                                "LEFT JOIN nguoi_dung nd ON kh.ma_nguoi_dung = nd.ma_nguoi_dung " +
                                "WHERE kh.id = ?",
                                apt.getMaKhachHang()
                            );
                            map.put("tenKhachHang", khachHang.get("ho_ten"));
                            map.put("soDienThoai", khachHang.get("so_dien_thoai"));
                            map.put("email", khachHang.get("email"));
                            map.put("khachHangVip", khachHang.get("vip") != null ? (Boolean) khachHang.get("vip") : false);
                        } catch (Exception e) {
                            map.put("tenKhachHang", "Khách hàng #" + apt.getMaKhachHang());
                            map.put("khachHangVip", false);
                        }
                    }
                    
                    // Load employee name from nguoi_dung table
                    if (apt.getMaNhanVien() != null) {
                        try {
                            String tenNhanVien = jdbcTemplate.queryForObject(
                                "SELECT ho_ten FROM nguoi_dung WHERE ma_nguoi_dung = ?",
                                String.class,
                                apt.getMaNhanVien()
                            );
                            map.put("tenNhanVien", tenNhanVien);
                        } catch (Exception e) {
                            map.put("tenNhanVien", "Nhân viên #" + apt.getMaNhanVien());
                        }
                    }
                    
                    if (apt.getMaDichVu() != null) {
                        map.put("dichVuId", apt.getMaDichVu());
                        map.put("maDichVu", apt.getMaDichVu());
                        try {
                            String tenDichVu = jdbcTemplate.queryForObject(
                                "SELECT ten_dich_vu FROM dichvu WHERE ma_dich_vu = ?",
                                String.class,
                                apt.getMaDichVu()
                            );
                            map.put("tenDichVu", tenDichVu);
                        } catch (Exception e) {
                            map.put("tenDichVu", "Dịch vụ #" + apt.getMaDichVu());
                        }
                    }
                    
                    if (apt.getMaCombo() != null) {
                        map.put("comboId", apt.getMaCombo());
                        map.put("maCombo", apt.getMaCombo());
                        try {
                            String tenCombo = jdbcTemplate.queryForObject(
                                "SELECT ten_combo FROM combo WHERE ma_combo = ?",
                                String.class,
                                apt.getMaCombo()
                            );
                            map.put("tenCombo", tenCombo);
                        } catch (Exception e) {
                            map.put("tenCombo", "Combo #" + apt.getMaCombo());
                        }
                    }
                    
                    // Load payment information from hoadon table
                    try {
                        Map<String, Object> hoaDon = jdbcTemplate.queryForMap(
                            "SELECT order_id, phuong_thuc_thanh_toan, trang_thai FROM hoadon WHERE ma_lich_hen = ?",
                            apt.getMaLichHen()
                        );
                        map.put("orderId", hoaDon.get("order_id"));
                        map.put("phuongThucThanhToan", hoaDon.get("phuong_thuc_thanh_toan"));
                        map.put("trangThaiHoaDon", hoaDon.get("trang_thai")); // unpaid, paid, void
                    } catch (Exception e) {
                        // No invoice found, set defaults
                        map.put("orderId", null);
                        map.put("phuongThucThanhToan", null);
                        map.put("trangThaiHoaDon", "unpaid");
                    }
                    
                    return map;
                })
                .collect(Collectors.toList());
            
            System.out.println("Returning " + result.size() + " appointments");
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("Error getting all appointments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi lấy danh sách lịch hẹn: " + e.getMessage()));
        }
    }

    /**
     * Confirm appointment (for staff/admin)
     */
    @PatchMapping("/{id}/xac-nhan")
    public ResponseEntity<?> confirmAppointment(@PathVariable Long id) {
        System.out.println("=== CONFIRM APPOINTMENT API CALLED for ID: " + id + " ===");
        try {
            DatLichResponse response = datLichService.xacNhanLichHen(id);
            System.out.println("Appointment confirmed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error confirming appointment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi xác nhận lịch hẹn: " + e.getMessage()));
        }
    }

    /**
     * Cancel/Reject appointment (for staff)
     */
    @PatchMapping("/{id}/tu-choi")
    public ResponseEntity<?> rejectAppointment(
            @PathVariable Long id, 
            @RequestParam(required = false) String lyDo) {
        System.out.println("=== REJECT APPOINTMENT API CALLED for ID: " + id + " ===");
        System.out.println("Lý do từ chối: " + lyDo);
        try {
            String reason = lyDo != null && !lyDo.trim().isEmpty() ? lyDo : "Nhân viên từ chối";
            datLichService.tuChoiLichHen(id, reason);
            System.out.println("Appointment rejected successfully with reason: " + reason);
            return ResponseEntity.ok(Map.of("message", "Đã từ chối lịch hẹn"));
        } catch (Exception e) {
            System.err.println("Error rejecting appointment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi từ chối lịch hẹn: " + e.getMessage()));
        }
    }

    /**
     * Cancel appointment (for customer) - using /huy endpoint
     */
    @PostMapping("/{id}/huy")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id, @RequestParam(required = false) String lyDo) {
        System.out.println("=== CANCEL APPOINTMENT API CALLED for ID: " + id + " ===");
        try {
            String reason = lyDo != null ? lyDo : "Khách hàng hủy lịch";
            datLichService.huyDatLich(id, reason);
            System.out.println("Appointment cancelled successfully");
            return ResponseEntity.ok(Map.of("message", "Đã hủy lịch hẹn"));
        } catch (Exception e) {
            System.err.println("Error cancelling appointment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi hủy lịch hẹn: " + e.getMessage()));
        }
    }

    /**
     * Update appointment (for customer)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable Long id, @RequestBody DatLichRequest request) {
        System.out.println("=== UPDATE APPOINTMENT API CALLED for ID: " + id + " ===");
        try {
            DatLichResponse response = datLichService.capNhatLichHen(id, request);
            System.out.println("Appointment updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error updating appointment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi cập nhật lịch hẹn: " + e.getMessage()));
        }
    }

    /**
     * Complete appointment
     */
    @PatchMapping("/{id}/hoan-thanh")
    public ResponseEntity<?> completeAppointment(@PathVariable Long id) {
        System.out.println("=== COMPLETE APPOINTMENT API CALLED for ID: " + id + " ===");
        try {
            DatLichResponse response = datLichService.hoanThanhLichHen(id);
            System.out.println("Appointment completed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error completing appointment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi hoàn thành lịch hẹn: " + e.getMessage()));
        }
    }

    /**
     * Get current user's appointments for rating
     */
    @GetMapping("/my-appointments")
    public ResponseEntity<?> getMyAppointments() {
        System.out.println("=== GET MY APPOINTMENTS API CALLED ===");
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            System.out.println("Username: " + username);
            
            // Get user from username
            NguoiDung user = nguoiDungRepository.findByTenDangNhap(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            System.out.println("User ID (ma_nguoi_dung): " + user.getMaNguoiDung());
            
            // Get customer ID from khach_hang table using ma_nguoi_dung
            Integer customerId = null;
            try {
                customerId = jdbcTemplate.queryForObject(
                    "SELECT id FROM khach_hang WHERE ma_nguoi_dung = ?",
                    Integer.class,
                    user.getMaNguoiDung()
                );
                System.out.println("Customer ID (from khach_hang): " + customerId);
            } catch (Exception e) {
                System.err.println("Customer not found in khach_hang table for user: " + user.getMaNguoiDung());
                return ResponseEntity.ok(new ArrayList<>()); // Return empty list if not a customer
            }
            
            // Get user's appointments using customer ID
            List<LichHen> appointments = lichHenRepository.findByMaKhachHang(customerId);
            // Sort by thoiGianBatDau descending (newest first), handle nulls
            appointments.sort((a, b) -> {
                if (a.getThoiGianBatDau() == null && b.getThoiGianBatDau() == null) return 0;
                if (a.getThoiGianBatDau() == null) return 1;
                if (b.getThoiGianBatDau() == null) return -1;
                return b.getThoiGianBatDau().compareTo(a.getThoiGianBatDau());
            });
            System.out.println("Found " + appointments.size() + " appointments");
            
            List<Map<String, Object>> result = appointments.stream()
                .map(apt -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", apt.getMaLichHen());
                    map.put("maLichHen", apt.getMaLichHen());
                    map.put("trangThai", apt.getTrangThai());
                    map.put("thoiGianBatDau", apt.getThoiGianBatDau());
                    map.put("thoiGianHen", apt.getThoiGianHen());
                    map.put("tongTien", apt.getTongTien());
                    map.put("ghiChu", apt.getGhiChu());
                    map.put("maNhanVien", apt.getMaNhanVien());
                    
                    // Calculate duration in minutes
                    if (apt.getThoiGianBatDau() != null && apt.getThoiGianKetThuc() != null) {
                        long durationMinutes = java.time.Duration.between(
                            apt.getThoiGianBatDau(), 
                            apt.getThoiGianKetThuc()
                        ).toMinutes();
                        map.put("thoiLuongPhut", durationMinutes);
                    } else {
                        map.put("thoiLuongPhut", 60); // Default 60 minutes
                    }
                    
                    // Load employee name from nguoi_dung table
                    if (apt.getMaNhanVien() != null) {
                        try {
                            String tenNhanVien = jdbcTemplate.queryForObject(
                                "SELECT ho_ten FROM nguoi_dung WHERE ma_nguoi_dung = ?",
                                String.class,
                                apt.getMaNhanVien()
                            );
                            map.put("tenNhanVien", tenNhanVien);
                        } catch (Exception e) {
                            map.put("tenNhanVien", "Nhân viên #" + apt.getMaNhanVien());
                        }
                    }
                    
                    if (apt.getMaDichVu() != null) {
                        map.put("dichVuId", apt.getMaDichVu());
                        map.put("maDichVu", apt.getMaDichVu());
                        // Load service name from database
                        try {
                            String tenDichVu = jdbcTemplate.queryForObject(
                                "SELECT ten_dich_vu FROM dichvu WHERE ma_dich_vu = ?",
                                String.class,
                                apt.getMaDichVu()
                            );
                            map.put("tenDichVu", tenDichVu);
                        } catch (Exception e) {
                            map.put("tenDichVu", "Dịch vụ #" + apt.getMaDichVu());
                        }
                    }
                    
                    if (apt.getMaCombo() != null) {
                        map.put("comboId", apt.getMaCombo());
                        map.put("maCombo", apt.getMaCombo());
                        // Load combo name from database
                        try {
                            String tenCombo = jdbcTemplate.queryForObject(
                                "SELECT ten_combo FROM combo WHERE ma_combo = ?",
                                String.class,
                                apt.getMaCombo()
                            );
                            map.put("tenCombo", tenCombo);
                        } catch (Exception e) {
                            map.put("tenCombo", "Combo #" + apt.getMaCombo());
                        }
                    }
                    
                    // Load payment information from hoadon table
                    try {
                        Map<String, Object> hoaDon = jdbcTemplate.queryForMap(
                            "SELECT order_id, phuong_thuc_thanh_toan, trang_thai FROM hoadon WHERE ma_lich_hen = ?",
                            apt.getMaLichHen()
                        );
                        map.put("orderId", hoaDon.get("order_id"));
                        map.put("phuongThucThanhToan", hoaDon.get("phuong_thuc_thanh_toan"));
                        map.put("trangThaiHoaDon", hoaDon.get("trang_thai")); // unpaid, paid, void
                    } catch (Exception e) {
                        // No invoice found, set defaults
                        map.put("orderId", null);
                        map.put("phuongThucThanhToan", null);
                        map.put("trangThaiHoaDon", "unpaid");
                    }
                    
                    return map;
                })
                .collect(Collectors.toList());
            
            System.out.println("Returning " + result.size() + " appointments");
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("Error getting my appointments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi lấy danh sách lịch hẹn: " + e.getMessage()));
        }
    }
}
