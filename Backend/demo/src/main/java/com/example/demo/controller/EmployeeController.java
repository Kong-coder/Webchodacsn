package com.example.demo.controller;

import com.example.demo.model.NguoiDung;
import com.example.demo.model.VaiTro;
import com.example.demo.repository.NguoiDungRepository;
import com.example.demo.repository.VaiTroRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/employees")
@PreAuthorize("hasAnyRole('QUANLY', 'NHANVIEN')")
public class EmployeeController {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;
    
    @Autowired
    private VaiTroRepository vaiTroRepository;

    @GetMapping
    public ResponseEntity<?> getEmployees(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("hoTen").ascending());
            
            // Nhân viên có ma_vai_tro = 2
            VaiTro nhanVienRole = vaiTroRepository.findById(2)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò Nhân viên"));
            
            Page<NguoiDung> employees = nguoiDungRepository.findByVaiTroAndSearch(
                nhanVienRole,
                search,
                pageable
            );
            
            return ResponseEntity.ok(employees.map(this::convertToDto));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi lấy danh sách nhân viên: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable Integer id) {
        try {
            return nguoiDungRepository.findById(id)
                .map(employee -> {
                    if (!employee.getVaiTro().getMaVaiTro().equals(2)) {
                        return ResponseEntity.status(403)
                            .body(Map.of("error", "Chỉ có thể xem thông tin nhân viên"));
                    }
                    return ResponseEntity.ok(convertToDto(employee));
                })
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi: " + e.getMessage()));
        }
    }
    
    private Map<String, Object> convertToDto(NguoiDung nguoiDung) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", nguoiDung.getMaNguoiDung());
        dto.put("name", nguoiDung.getHoTen());
        dto.put("phone", nguoiDung.getSoDienThoai());
        dto.put("email", nguoiDung.getEmail());
        dto.put("address", nguoiDung.getDiaChi());
        dto.put("birthday", nguoiDung.getNgaySinh() != null ? nguoiDung.getNgaySinh().toString() : null);
        dto.put("active", nguoiDung.isDangHoatDong());
        dto.put("createdAt", nguoiDung.getNgayTao() != null ? nguoiDung.getNgayTao().toString() : null);
        
        // Avatar - use anhDaiDien if available, otherwise use default
        String avatar = nguoiDung.getAnhDaiDien() != null ? nguoiDung.getAnhDaiDien() : 
                      (nguoiDung.getAvatar() != null ? nguoiDung.getAvatar() : 
                      "https://i.pravatar.cc/150?img=" + (nguoiDung.getMaNguoiDung() % 70 + 1));
        dto.put("avatar", avatar);
        
        // Employee specific fields
        dto.put("position", nguoiDung.getGhiChu() != null ? nguoiDung.getGhiChu() : "Nhân viên Spa");
        dto.put("department", "Dịch vụ");
        dto.put("status", nguoiDung.isDangHoatDong() ? "Đang làm việc" : "Nghỉ việc");
        dto.put("startDate", nguoiDung.getNgayTao() != null ? nguoiDung.getNgayTao().toString() : null);
        
        // Role from VaiTro
        dto.put("role", nguoiDung.getVaiTro() != null ? nguoiDung.getVaiTro().getTenVaiTro() : "NhanVien");
        
        // Salary fields (default values since not in database)
        dto.put("baseSalary", 8000000); // Default base salary
        dto.put("bonus", 0); // Default bonus
        dto.put("contractType", "Toàn thời gian"); // Default contract type
        
        return dto;
    }
}
