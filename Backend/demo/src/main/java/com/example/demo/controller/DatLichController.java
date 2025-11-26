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
                            String tenKhachHang = jdbcTemplate.queryForObject(
                                "SELECT ho_ten FROM khach_hang WHERE id = ?",
                                String.class,
                                apt.getMaKhachHang()
                            );
                            map.put("tenKhachHang", tenKhachHang);
                            
                            // Also get phone and email
                            try {
                                String soDienThoai = jdbcTemplate.queryForObject(
                                    "SELECT so_dien_thoai FROM khach_hang WHERE id = ?",
                                    String.class,
                                    apt.getMaKhachHang()
                                );
                                map.put("soDienThoai", soDienThoai);
                            } catch (Exception ex) {}
                            
                            try {
                                String email = jdbcTemplate.queryForObject(
                                    "SELECT email FROM khach_hang WHERE id = ?",
                                    String.class,
                                    apt.getMaKhachHang()
                                );
                                map.put("email", email);
                            } catch (Exception ex) {}
                        } catch (Exception e) {
                            map.put("tenKhachHang", "Khách hàng #" + apt.getMaKhachHang());
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
