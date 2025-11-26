package com.example.demo.controller;

import com.example.demo.dto.CreateCustomerRequest;
import com.example.demo.dto.CustomerLoyaltyUpdate;
import com.example.demo.dto.UpdateCustomerRequest;
import com.example.demo.model.NguoiDung;
import com.example.demo.model.VaiTro;
import com.example.demo.repository.NguoiDungRepository;
import com.example.demo.repository.VaiTroRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customers")
@PreAuthorize("hasAnyRole('QUANLY', 'NHANVIEN')")
public class CustomerController {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;
    
    @Autowired
    private VaiTroRepository vaiTroRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<?> getCustomers(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "hoTen,asc") String[] sort,
            @RequestParam(required = false) Boolean vip,
            @RequestParam(required = false) Boolean active) {
        
        try {
            String sortField = sort[0];
            String sortDirection = sort.length > 1 ? sort[1] : "asc";
            
            Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
            
            // Tìm vai trò khách hàng (ID = 1)
            VaiTro khachHangRole = vaiTroRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò Khách hàng"));
            
            // Nếu có lọc trạng thái hoạt động
            if (active != null) {
                // Sử dụng searchEmployees với tham số includeCustomers = true để bao gồm cả khách hàng
                List<NguoiDung> customers = nguoiDungRepository.searchEmployees(
                    "KHACHHANG", // Lọc theo vai trò khách hàng
                    active,      // Trạng thái hoạt động
                    search,      // Từ khóa tìm kiếm
                    true         // Bao gồm cả khách hàng
                );
                
                // Phân trang thủ công vì searchEmployees trả về List
                int start = (int) pageable.getOffset();
                int end = Math.min((start + pageable.getPageSize()), customers.size());
                Page<NguoiDung> customerPage = new org.springframework.data.domain.PageImpl<>(
                    customers.subList(start, end), 
                    pageable, 
                    customers.size()
                );
                
                return ResponseEntity.ok(customerPage.map(this::convertToDto));
            }

    
            
            Page<NguoiDung> customers = nguoiDungRepository.findByVaiTroAndSearch(
                khachHangRole,
                search,
                pageable
            );
            
            return ResponseEntity.ok(customers.map(this::convertToDto));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi lấy danh sách khách hàng: " + e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('QUANLY')")
    public ResponseEntity<?> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        // Check if email already exists
        if (nguoiDungRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Email đã được sử dụng"));
        }
        
        // Check if phone already exists
        if (nguoiDungRepository.existsBySoDienThoai(request.getPhone())) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Số điện thoại đã được sử dụng"));
        }
        
        // Create new customer
        NguoiDung customer = new NguoiDung();
        customer.setHoTen(request.getName());
        customer.setEmail(request.getEmail());
        customer.setSoDienThoai(request.getPhone());
        customer.setDiaChi(request.getAddress());
        // Convert Date to LocalDate if birthDate is not null
        if (request.getBirthDate() != null) {
            customer.setNgaySinh(new java.sql.Date(request.getBirthDate().getTime()).toLocalDate());
        }
        customer.setVip(false); // Default to false for new customers
        customer.setDiemTichLuy(BigDecimal.ZERO); // Start with 0 points
        customer.setGhiChu(request.getNote());
        customer.setTenDangNhap(request.getEmail()); // Use email as username
        customer.setMatKhauBam(passwordEncoder.encode("123456")); // Default password
        customer.setDangHoatDong(true);
        customer.setNgayTao(OffsetDateTime.now(ZoneOffset.UTC));
        customer.setSoLanDen(0);
        customer.setTongTienChiTieu(BigDecimal.ZERO);
        
        // Set customer role (ma_vai_tro = 1)
        VaiTro customerRole = vaiTroRepository.findById(1)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò khách hàng"));
        customer.setVaiTro(customerRole);
        
        // Save customer
        NguoiDung savedCustomer = nguoiDungRepository.save(customer);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(savedCustomer));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable Integer id) {
        try {
            return nguoiDungRepository.findById(id)
                .map(customer -> {
                    if (!customer.getVaiTro().getMaVaiTro().equals(1)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Chỉ có thể xem thông tin khách hàng"));
                    }
                    return ResponseEntity.ok(convertToCustomerDetailDto(customer));
                })
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi lấy thông tin khách hàng: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> updateCustomer(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateCustomerRequest request) {
        
        System.out.println("=== UPDATE CUSTOMER DEBUG ===");
        System.out.println("Customer ID: " + id);
        System.out.println("Request - Name: " + request.getName());
        System.out.println("Request - Phone: " + request.getPhone());
        System.out.println("Request - Email: " + request.getEmail());
        
        try {
            return nguoiDungRepository.findById(id)
                .map(customer -> {
                    System.out.println("Found customer: " + customer.getHoTen());
                    
                    if (!customer.getVaiTro().getMaVaiTro().equals(1)) {
                        System.out.println("ERROR: Not a customer role");
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Chỉ có thể cập nhật thông tin khách hàng"));
                    }
                    
                    // Update basic info
                    if (request.getName() != null && !request.getName().trim().isEmpty()) {
                        System.out.println("Updating name from '" + customer.getHoTen() + "' to '" + request.getName() + "'");
                        customer.setHoTen(request.getName());
                    }
                    
                    if (request.getEmail() != null && !request.getEmail().equals(customer.getEmail())) {
                        if (nguoiDungRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
                            System.out.println("ERROR: Email already exists");
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(Map.of("error", "Email đã được sử dụng bởi tài khoản khác"));
                        }
                        System.out.println("Updating email to: " + request.getEmail());
                        customer.setEmail(request.getEmail());
                    }
                    
                    if (request.getPhone() != null && !request.getPhone().equals(customer.getSoDienThoai())) {
                        if (nguoiDungRepository.existsByPhoneAndIdNot(request.getPhone(), id)) {
                            System.out.println("ERROR: Phone already exists");
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(Map.of("error", "Số điện thoại đã được sử dụng bởi tài khoản khác"));
                        }
                        System.out.println("Updating phone to: " + request.getPhone());
                        customer.setSoDienThoai(request.getPhone());
                    }
                    
                    if (request.getAddress() != null) {
                        System.out.println("Updating address to: " + request.getAddress());
                        customer.setDiaChi(request.getAddress());
                    }
                    
                    if (request.getBirthDate() != null) {
                        System.out.println("Updating birthDate to: " + request.getBirthDate());
                        customer.setNgaySinh(new java.sql.Date(request.getBirthDate().getTime()).toLocalDate());
                    }
                    
                    if (request.getNote() != null) {
                        System.out.println("Updating note to: " + request.getNote());
                        customer.setGhiChu(request.getNote());
                    }
                    
                    if (request.getActive() != null) {
                        System.out.println("Updating active status to: " + request.getActive());
                        customer.setDangHoatDong(request.getActive());
                    }
                    
                    System.out.println("Saving customer...");
                    NguoiDung updatedCustomer = nguoiDungRepository.save(customer);
                    nguoiDungRepository.flush();
                    System.out.println("Customer saved successfully. New name: " + updatedCustomer.getHoTen());
                    System.out.println("=== END DEBUG ===");
                    
                    return ResponseEntity.ok(convertToDto(updatedCustomer));
                })
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            System.err.println("ERROR updating customer: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi cập nhật thông tin khách hàng: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/loyalty")
    public ResponseEntity<?> updateLoyalty(
            @PathVariable Integer id,
            @RequestBody CustomerLoyaltyUpdate update) {
        try {
            return nguoiDungRepository.findById(id)
                .map(customer -> {
                    if (!customer.getVaiTro().getMaVaiTro().equals(1)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Chỉ có thể cập nhật điểm tích lũy cho khách hàng"));
                    }
                    
                    // Update VIP status if provided
                    if (update.getVip() != null) {
                        customer.setVip(update.getVip());
                    }
                    
                    // Update note if provided
                    if (update.getNote() != null) {
                        customer.setGhiChu(update.getNote());
                    }
                    
                    NguoiDung updatedCustomer = nguoiDungRepository.save(customer);
                    return ResponseEntity.ok(convertToDto(updatedCustomer));
                })
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi cập nhật thông tin khách hàng: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('QUANLY')")
    public ResponseEntity<?> deleteCustomer(@PathVariable Integer id) {
        try {
            return nguoiDungRepository.findById(id)
                .map(customer -> {
                    // Check if customer has customer role
                    if (!customer.getVaiTro().getMaVaiTro().equals(1)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Chỉ có thể xóa khách hàng"));
                    }
                    
                    // Check for pending transactions
                    if (hasPendingTransactions(id)) {
                        return ResponseEntity.badRequest()
                            .body(Map.of("error", "Không thể xóa khách hàng vì còn giao dịch chưa hoàn tất"));
                    }
                    
                    // Soft delete
                    customer.setDangHoatDong(false);
                    nguoiDungRepository.save(customer);
                    
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi xóa khách hàng: " + e.getMessage()));
        }
    }

    /**
     * Safely handles null strings by returning empty string if null
     */
    private String safe(String input) {
        return input != null ? input : "";
    }

    /**
     * Escapes strings for CSV format (handles commas and quotes)
     */
    private String csv(String input) {
        if (input == null) return "";
        // Escape quotes by doubling them
        String escaped = input.replace("\"", "\"\"");
        // If contains comma or newline, wrap in quotes
        if (escaped.contains(",") || escaped.contains("\n") || escaped.contains("\r")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportCustomersCsv() {
        try {
            List<NguoiDung> list = nguoiDungRepository.findByRoleId(1);
            StringBuilder sb = new StringBuilder();
            sb.append("\uFEFF");
            sb.append(String.join(",",
                    "ID","Họ tên","Số điện thoại","Email","VIP","Điểm",
                    "Số lượt","Tổng chi tiêu","Dịch vụ yêu thích","Nhân viên yêu thích",
                    "Lần cuối","Sinh nhật","Địa chỉ"));
            sb.append("\n");
            for (NguoiDung n : list) {
                String id = String.valueOf(n.getMaNguoiDung());
                String name = safe(n.getHoTen());
                String phone = safe(n.getSoDienThoai());
                String email = safe(n.getEmail());
                String vip = n.isVip() ? "VIP" : "Thường";
                String points = n.getDiemTichLuy() != null ? n.getDiemTichLuy().toPlainString() : "0";
                String visits = n.getSoLanDen() != null ? n.getSoLanDen().toString() : "0";
                String total = n.getTongTienChiTieu() != null ? n.getTongTienChiTieu().toPlainString() : "0";
                String favService = safe(n.getDichVuYeuThich());
                String favStaff = safe(n.getNhanVienYeuThich());
                String lastVisit = n.getLanCuoiDen() != null ? n.getLanCuoiDen().toString() : "";
                String birthday = n.getNgaySinh() != null ? n.getNgaySinh().toString() : "";
                String address = safe(n.getDiaChi());
                sb.append(String.join(",",
                        csv(id), csv(name), csv(phone), csv(email), csv(vip), csv(points),
                        csv(visits), csv(total), csv(favService), csv(favStaff),
                        csv(lastVisit), csv(birthday), csv(address)));
                sb.append("\n");
            }
            return ResponseEntity.ok()
                    .header("Content-Type", "text/csv; charset=UTF-8")
                    .header("Content-Disposition", "attachment; filename=customers.csv")
                    .body(sb.toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi export: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchCustomers(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            // Get customer role
            VaiTro customerRole = vaiTroRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò khách hàng"));
            
            // Create pageable
            Pageable pageable = PageRequest.of(page, size, Sort.by("hoTen").ascending());
            
            // Search customers
            Page<NguoiDung> customers;
            if (keyword != null && !keyword.trim().isEmpty()) {
                customers = nguoiDungRepository.findByVaiTroAndSearch(
                    customerRole, keyword, pageable);
            } else {
                customers = nguoiDungRepository.findByVaiTro(customerRole, pageable);
            }
            
            // Convert to DTO
            return ResponseEntity.ok(customers.map(this::convertToDto));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Lỗi khi tìm kiếm khách hàng: " + e.getMessage()));
        }
    }
    
    private Map<String, Object> convertToDto(NguoiDung nguoiDung) {
        if (nguoiDung == null) {
            return null;
        }
        
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", nguoiDung.getMaNguoiDung());
        dto.put("name", nguoiDung.getHoTen());
        dto.put("phone", nguoiDung.getSoDienThoai());
        dto.put("email", nguoiDung.getEmail());
        
        // Handle avatar - use anhDaiDien if available, otherwise use avatar, otherwise use default
        String avatar = nguoiDung.getAnhDaiDien() != null ? nguoiDung.getAnhDaiDien() : 
                      (nguoiDung.getAvatar() != null ? nguoiDung.getAvatar() : 
                      "https://i.pravatar.cc/150?img=" + (nguoiDung.getMaNguoiDung() % 70 + 1));
        dto.put("avatar", avatar);
        
        dto.put("vip", nguoiDung.isVip());
        dto.put("points", 0); // Default to 0, update if you have a points field
        dto.put("visits", nguoiDung.getSoLanDen() != null ? nguoiDung.getSoLanDen() : 0);
        dto.put("totalSpent", nguoiDung.getTongTienChiTieu() != null ? nguoiDung.getTongTienChiTieu().intValue() : 0);
        dto.put("favoriteService", nguoiDung.getDichVuYeuThich() != null ? nguoiDung.getDichVuYeuThich() : "Chưa có");
        dto.put("favoriteStaff", nguoiDung.getNhanVienYeuThich() != null ? nguoiDung.getNhanVienYeuThich() : "Chưa có");
        dto.put("lastVisit", nguoiDung.getLanCuoiDen() != null ? nguoiDung.getLanCuoiDen().toString() : "Chưa đến");
        dto.put("birthday", nguoiDung.getNgaySinh() != null ? nguoiDung.getNgaySinh().toString() : null);
        dto.put("address", nguoiDung.getDiaChi());
        dto.put("notes", nguoiDung.getGhiChu());
        dto.put("active", nguoiDung.isDangHoatDong());
        
        // Add empty history and promos arrays to match frontend structure
        dto.put("history", new ArrayList<>());
        dto.put("promos", new ArrayList<>());
        
        return dto;
    }
    
    private Map<String, Object> convertToCustomerDetailDto(NguoiDung nguoiDung) {
        Map<String, Object> dto = convertToDto(nguoiDung);
        if (dto == null) return null;
        
        // Add more detailed information for customer detail view
        dto.put("createdAt", nguoiDung.getNgayTao() != null ? nguoiDung.getNgayTao().toString() : null);
        
        // Add empty appointment history (to be implemented)
        List<Map<String, Object>> appointmentHistory = new ArrayList<>();
        dto.put("appointmentHistory", appointmentHistory);
        
        // Add empty transaction history (to be implemented)
        List<Map<String, Object>> transactionHistory = new ArrayList<>();
        dto.put("transactionHistory", transactionHistory);
        
        return dto;
    }
    
    /**
     * Check if a customer has any pending transactions
     * @param customerId The ID of the customer
     * @return true if there are pending transactions, false otherwise
     */
    private boolean hasPendingTransactions(Integer customerId) {
        // TODO: Implement actual logic to check for pending transactions
        // For now, return false to allow deletion
        return false;
    }
    
    /**
     * Handle validation errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        System.err.println("Validation errors: " + errors);
        
        // Return first error message
        String firstError = errors.values().stream().findFirst().orElse("Dữ liệu không hợp lệ");
        return ResponseEntity.badRequest()
            .body(Map.of("error", firstError, "details", errors));
    }
}
