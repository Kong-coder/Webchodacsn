package com.example.demo.service;

import com.example.demo.dto.EmployeeRequest;
import com.example.demo.dto.EmployeeResponse;
import com.example.demo.model.NguoiDung;
import com.example.demo.model.VaiTro;
import com.example.demo.repository.NguoiDungRepository;
import com.example.demo.repository.VaiTroRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private final NguoiDungRepository nguoiDungRepository;
    private final VaiTroRepository vaiTroRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(NguoiDungRepository nguoiDungRepository,
                           VaiTroRepository vaiTroRepository,
                           PasswordEncoder passwordEncoder) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.vaiTroRepository = vaiTroRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> search(String role, Boolean active, String search) {
        String canonicalRole = canonicalRole(role);
        String searchTerm = normalizeSearch(search);
        boolean includeCustomers = canonicalRole != null && canonicalRole.equalsIgnoreCase("KhachHang");
        List<NguoiDung> results = nguoiDungRepository.searchEmployees(
                canonicalRole,
                active,
                searchTerm,
                includeCustomers
        );
        return results.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmployeeResponse get(Integer id) {
        NguoiDung entity = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nhân viên không tồn tại"));
        return toResponse(entity);
    }

    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        validateCreateRequest(request);
        ensureEmailUnique(request.getEmail(), null);

        NguoiDung entity = new NguoiDung();
        applyCommonFields(entity, request);

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Vui lòng cung cấp mật khẩu cho nhân viên mới");
        }
        entity.setMatKhauBam(passwordEncoder.encode(request.getPassword()));

        entity.setTenDangNhap(generateUsername(request.getEmail(), request.getFullName()));
        entity.setNgayTao(OffsetDateTime.now());
        entity.setDangHoatDong(request.getActive() == null || request.getActive());

        VaiTro vaiTro = resolveRole(request.getRole());
        entity.setVaiTro(vaiTro);

        NguoiDung saved = nguoiDungRepository.save(entity);
        return toResponse(saved);
    }

    @Transactional
    public EmployeeResponse update(Integer id, EmployeeRequest request) {
        NguoiDung entity = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nhân viên không tồn tại"));

        ensureEmailUnique(request.getEmail(), id);
        applyCommonFields(entity, request);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            entity.setMatKhauBam(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            VaiTro vaiTro = resolveRole(request.getRole());
            entity.setVaiTro(vaiTro);
        }

        if (request.getActive() != null) {
            entity.setDangHoatDong(request.getActive());
        }

        NguoiDung saved = nguoiDungRepository.save(entity);
        return toResponse(saved);
    }

    @Transactional
    public void updateStatus(Integer id, boolean active) {
        NguoiDung entity = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nhân viên không tồn tại"));
        entity.setDangHoatDong(active);
        nguoiDungRepository.save(entity);
    }

    @Transactional
    public void delete(Integer id) {
        NguoiDung entity = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nhân viên không tồn tại"));
        entity.setDangHoatDong(false);
        nguoiDungRepository.save(entity);
    }

    private void applyCommonFields(NguoiDung entity, EmployeeRequest request) {
        if (request.getFullName() != null) {
            entity.setHoTen(request.getFullName());
        }
        if (request.getEmail() != null) {
            entity.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            entity.setSoDienThoai(request.getPhone());
        }
        if (request.getAddress() != null) {
            entity.setDiaChi(request.getAddress());
        }
        if (request.getGender() != null) {
            entity.setGioiTinh(request.getGender());
        }
        if (request.getBirthDate() != null) {
            entity.setNgaySinh(parseDate(request.getBirthDate()));
        }
        if (request.getPosition() != null) {
            entity.setChucVu(request.getPosition());
        }
        if (request.getContractType() != null) {
            entity.setLoaiHopDong(request.getContractType());
        }
        if (request.getStartDate() != null) {
            entity.setNgayBatDau(parseDate(request.getStartDate()));
        }
        if (request.getBaseSalary() != null) {
            entity.setLuongCoBan(request.getBaseSalary());
        }
        if (request.getBonus() != null) {
            entity.setThuong(request.getBonus());
        }
        if (request.getHourlyRate() != null) {
            entity.setLuongGio(request.getHourlyRate());
        }
        if (request.getAvatar() != null) {
            entity.setAvatar(request.getAvatar());
        }
    }

    private void validateCreateRequest(EmployeeRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dữ liệu nhân viên không hợp lệ");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email không được để trống");
        }
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new IllegalArgumentException("Họ tên không được để trống");
        }
    }

    private void ensureEmailUnique(String email, Integer excludeId) {
        if (email == null || email.isBlank()) return;
        Optional<NguoiDung> existing = nguoiDungRepository.findByEmail(email);
        if (existing.isPresent() && (excludeId == null || !existing.get().getMaNguoiDung().equals(excludeId))) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }
    }

    private String generateUsername(String email, String fullName) {
        if (email != null && !email.isBlank()) {
            return email;
        }
        String base = (fullName == null || fullName.isBlank()) ? "user" : normalizeName(fullName);
        String candidate = base;
        int suffix = 1;
        while (nguoiDungRepository.findByTenDangNhap(candidate).isPresent()) {
            candidate = base + suffix;
            suffix++;
        }
        return candidate;
    }

    private String normalizeName(String name) {
        String normalized = name.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-");
        return normalized.isBlank() ? "user" : normalized;
    }

    private String normalizeSearch(String search) {
        if (search == null) return null;
        String trimmed = search.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        return LocalDate.parse(value);
    }

    private VaiTro resolveRole(String roleInput) {
        String canonical = canonicalRole(roleInput);
        if (canonical == null) {
            canonical = "NhanVien";
        }
        final String lookup = canonical;
        return vaiTroRepository.findByTenVaiTro(lookup)
                .orElseThrow(() -> new IllegalArgumentException("Vai trò không tồn tại: " + lookup));
    }

    private String canonicalRole(String role) {
        if (role == null || role.isBlank()) return null;
        String value = role.trim().toUpperCase(Locale.ROOT);
        if (value.startsWith("ROLE_")) {
            value = value.substring(5);
        }
        switch (value) {
            case "ADMIN":
            case "MANAGER":
            case "QUANLY":
            case "QUAN_LY":
                return "QuanLy";
            case "STAFF":
            case "EMPLOYEE":
            case "NHANVIEN":
            case "NHAN_VIEN":
                return "NhanVien";
            case "CUSTOMER":
            case "KHACHHANG":
            case "KHACH_HANG":
                return "KhachHang";
            default:
                return null;
        }
    }

    private EmployeeResponse toResponse(NguoiDung entity) {
        EmployeeResponse dto = new EmployeeResponse();
        dto.setId(entity.getMaNguoiDung());
        dto.setUsername(entity.getTenDangNhap());
        dto.setFullName(entity.getHoTen());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getSoDienThoai());
        dto.setAddress(entity.getDiaChi());
        dto.setGender(entity.getGioiTinh());
        dto.setRole(entity.getRoleName());
        dto.setPosition(entity.getChucVu());
        dto.setContractType(entity.getLoaiHopDong());
        dto.setStartDate(entity.getNgayBatDau() != null ? entity.getNgayBatDau().toString() : null);
        dto.setBaseSalary(entity.getLuongCoBan());
        dto.setBonus(entity.getThuong());
        dto.setHourlyRate(entity.getLuongGio());
        dto.setActive(entity.isDangHoatDong());
        dto.setAvatar(entity.getAvatar());
        dto.setBirthDate(entity.getNgaySinh() != null ? entity.getNgaySinh().toString() : null);
        dto.setCreatedAt(entity.getNgayTao());
        return dto;
    }
}
