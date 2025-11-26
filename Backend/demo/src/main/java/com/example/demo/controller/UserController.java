package com.example.demo.controller;

import com.example.demo.dto.UpdateProfileRequest;
import com.example.demo.model.NguoiDung;
import com.example.demo.repository.NguoiDungRepository;
import com.example.demo.Security.JwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Get current user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            System.out.println("=== GET PROFILE DEBUG ===");
            System.out.println("Username from token: " + username);
            
            NguoiDung user = nguoiDungRepository.findByTenDangNhap(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            System.out.println("Found user: " + user.getHoTen() + " (ID: " + user.getMaNguoiDung() + ")");
            System.out.println("=== END GET PROFILE DEBUG ===");
            
            return ResponseEntity.ok(convertToProfileDto(user));
            
        } catch (Exception e) {
            System.err.println("Error getting profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi lấy thông tin: " + e.getMessage()));
        }
    }

    /**
     * Update current user profile
     * Any authenticated user can update their own profile
     */
    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<?> updateCurrentUserProfile(@Valid @RequestBody UpdateProfileRequest request) {
        
        System.out.println("=== UPDATE PROFILE DEBUG ===");
        System.out.println("Request - Name: " + request.getName());
        System.out.println("Request - Phone: " + request.getPhone());
        System.out.println("Request - Email: " + request.getEmail());
        System.out.println("Request - Address: " + request.getAddress());
        System.out.println("Request - BirthDate: " + request.getBirthDate());
        
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            
            System.out.println("Username from token: " + username);
            
            NguoiDung user = nguoiDungRepository.findByTenDangNhap(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            System.out.println("Found user: " + user.getHoTen() + " (ID: " + user.getMaNguoiDung() + ")");
            System.out.println("Current role: " + (user.getVaiTro() != null ? user.getVaiTro().getTenVaiTro() : "null"));
            
            // Update basic info
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                System.out.println("Updating name from '" + user.getHoTen() + "' to '" + request.getName() + "'");
                user.setHoTen(request.getName());
            }
            
            if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
                // Check if email already exists (excluding current user)
                if (nguoiDungRepository.existsByEmailAndIdNot(request.getEmail(), user.getMaNguoiDung())) {
                    System.out.println("ERROR: Email already exists");
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Email đã được sử dụng bởi tài khoản khác"));
                }
                System.out.println("Updating email to: " + request.getEmail());
                user.setEmail(request.getEmail());
                // Also update username if it's email-based
                if (user.getTenDangNhap().equals(user.getEmail())) {
                    user.setTenDangNhap(request.getEmail());
                }
            }
            
            if (request.getPhone() != null && !request.getPhone().equals(user.getSoDienThoai())) {
                // Check if phone already exists (excluding current user)
                if (nguoiDungRepository.existsByPhoneAndIdNot(request.getPhone(), user.getMaNguoiDung())) {
                    System.out.println("ERROR: Phone already exists");
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Số điện thoại đã được sử dụng bởi tài khoản khác"));
                }
                System.out.println("Updating phone to: " + request.getPhone());
                user.setSoDienThoai(request.getPhone());
            }
            
            if (request.getAddress() != null) {
                System.out.println("Updating address to: " + request.getAddress());
                user.setDiaChi(request.getAddress());
            }
            
            if (request.getBirthDate() != null) {
                System.out.println("Updating birthDate to: " + request.getBirthDate());
                user.setNgaySinh(new java.sql.Date(request.getBirthDate().getTime()).toLocalDate());
            }
            
            if (request.getGender() != null) {
                System.out.println("Updating gender to: " + request.getGender());
                user.setGioiTinh(request.getGender());
            }
            
            System.out.println("Saving user...");
            NguoiDung updatedUser = nguoiDungRepository.save(user);
            nguoiDungRepository.flush();
            System.out.println("User saved successfully. New name: " + updatedUser.getHoTen());
            System.out.println("=== END UPDATE PROFILE DEBUG ===");
            
            return ResponseEntity.ok(convertToProfileDto(updatedUser));
            
        } catch (Exception e) {
            System.err.println("ERROR updating profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi cập nhật thông tin: " + e.getMessage()));
        }
    }

    /**
     * Get all customers (users with KhachHang role)
     */
    @GetMapping("/customers")
    public ResponseEntity<?> getAllCustomers() {
        try {
            // Get all users with KhachHang role (role ID 1)
            List<NguoiDung> customers = nguoiDungRepository.findByVaiTro_MaVaiTro(1);
            
            List<Map<String, Object>> customerDtos = new ArrayList<>();
            for (NguoiDung customer : customers) {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", customer.getMaNguoiDung());
                dto.put("name", customer.getHoTen());
                dto.put("email", customer.getEmail());
                dto.put("phone", customer.getSoDienThoai());
                dto.put("address", customer.getDiaChi());
                dto.put("createdAt", customer.getNgayTao());
                customerDtos.add(dto);
            }
            
            return ResponseEntity.ok(customerDtos);
            
        } catch (Exception e) {
            System.err.println("Error getting customers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi lấy danh sách khách hàng: " + e.getMessage()));
        }
    }

    /**
     * Promote customer to employee
     */
    @PostMapping("/{userId}/promote-to-employee")
    @Transactional
    public ResponseEntity<?> promoteToEmployee(@PathVariable Integer userId) {
        try {
            NguoiDung user = nguoiDungRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if user is already an employee
            if (user.getVaiTro() != null && "NhanVien".equals(user.getVaiTro().getTenVaiTro())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Người dùng này đã là nhân viên"));
            }
            
            // Find NhanVien role (assuming role ID 2 is NhanVien)
            com.example.demo.model.VaiTro nhanVienRole = new com.example.demo.model.VaiTro();
            nhanVienRole.setMaVaiTro(2); // NhanVien role ID
            user.setVaiTro(nhanVienRole);
            
            nguoiDungRepository.save(user);
            
            return ResponseEntity.ok(Map.of(
                "message", "Đã nâng cấp " + user.getHoTen() + " lên nhân viên thành công",
                "user", convertToProfileDto(user)
            ));
            
        } catch (Exception e) {
            System.err.println("Error promoting user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi nâng cấp: " + e.getMessage()));
        }
    }

    /**
     * Convert NguoiDung to Profile DTO
     */
    private Map<String, Object> convertToProfileDto(NguoiDung user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getMaNguoiDung());
        dto.put("fullName", user.getHoTen());
        dto.put("name", user.getHoTen());
        dto.put("email", user.getEmail());
        dto.put("phone", user.getSoDienThoai());
        dto.put("address", user.getDiaChi());
        dto.put("birthDate", user.getNgaySinh() != null ? user.getNgaySinh().toString() : null);
        dto.put("gender", user.getGioiTinh());
        dto.put("avatar", user.getAnhDaiDien() != null ? user.getAnhDaiDien() : user.getAvatar());
        
        // Add role info
        if (user.getVaiTro() != null) {
            dto.put("role", user.getVaiTro().getTenVaiTro());
            dto.put("roleId", user.getVaiTro().getMaVaiTro());
        }
        
        return dto;
    }
}
