package com.example.demo.controller;

import com.example.demo.model.HoaDon;
import com.example.demo.repository.HoaDonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hoa-don")
public class HoaDonManagementController {

    @Autowired
    private HoaDonRepository hoaDonRepository;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Get all invoices
     */
    @GetMapping
    public ResponseEntity<?> getAllInvoices() {
        try {
            List<HoaDon> hoaDons = hoaDonRepository.findAll();
            
            List<Map<String, Object>> result = hoaDons.stream()
                .map(hd -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", hd.getMaHoaDon());
                    map.put("maHoaDon", hd.getMaHoaDon());
                    map.put("maKhachHang", hd.getMaKhachHang());
                    map.put("maLichHen", hd.getMaLichHen());
                    map.put("tongTien", hd.getTongTien());
                    map.put("trangThai", hd.getTrangThai());
                    map.put("phuongThucThanhToan", hd.getPhuongThucThanhToan());
                    map.put("ngayXuat", hd.getNgayXuat());
                    
                    // Load customer name from khach_hang
                    if (hd.getMaKhachHang() != null) {
                        try {
                            String tenKhachHang = jdbcTemplate.queryForObject(
                                "SELECT ho_ten FROM khach_hang WHERE id = ?",
                                String.class,
                                hd.getMaKhachHang()
                            );
                            map.put("tenKhachHang", tenKhachHang);
                        } catch (Exception e) {
                            map.put("tenKhachHang", "Khách hàng #" + hd.getMaKhachHang());
                        }
                    }
                    
                    return map;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("Error getting invoices: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi lấy danh sách hóa đơn: " + e.getMessage()));
        }
    }
}
