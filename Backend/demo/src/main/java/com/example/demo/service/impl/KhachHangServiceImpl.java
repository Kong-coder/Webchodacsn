package com.example.demo.service.impl;

import com.example.demo.model.KhachHang;
import com.example.demo.model.NguoiDung;
import com.example.demo.repository.KhachHangRepository;
import com.example.demo.repository.NguoiDungRepository;
import com.example.demo.service.KhachHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class KhachHangServiceImpl implements KhachHangService {

    private final KhachHangRepository khachHangRepository;
    
    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    public KhachHangServiceImpl(KhachHangRepository khachHangRepository) {
        this.khachHangRepository = khachHangRepository;
    }

    @Override
    public List<KhachHang> getAllKhachHang() {
        return khachHangRepository.findAll();
    }

    @Override
    public Optional<KhachHang> getKhachHangById(Long id) {
        return khachHangRepository.findById(id);
    }

    @Override
    public KhachHang saveKhachHang(KhachHang khachHang) {
        return khachHangRepository.save(khachHang);
    }

    @Override
    public void deleteKhachHang(Long id) {
        khachHangRepository.deleteById(id);
    }

    @Override
    public boolean existsBySoDienThoai(String soDienThoai) {
        return khachHangRepository.existsBySoDienThoai(soDienThoai);
    }

    @Override
    public boolean existsBySoDienThoaiAndIdNot(String soDienThoai, Long id) {
        return khachHangRepository.existsBySoDienThoaiAndIdNot(soDienThoai, id);
    }

    @Override
    public List<KhachHang> findAllWithFilters(String searchTerm, String status) {
        List<KhachHang> allCustomers;
        
        // First, apply search filter
        if (searchTerm != null && !searchTerm.isEmpty()) {
            allCustomers = khachHangRepository.findByHoTenContainingIgnoreCaseOrSoDienThoaiContaining(
                searchTerm, searchTerm);
        } else {
            allCustomers = khachHangRepository.findAll();
        }
        
        // Then, apply status filter (VIP, Regular, New, or all)
        if (status != null && !status.isEmpty() && !"all".equalsIgnoreCase(status)) {
            return allCustomers.stream()
                .filter(customer -> status.equalsIgnoreCase(customer.getStatus()))
                .toList();
        }
        
        return allCustomers;
    }

    @Override
    public boolean existsById(Long id) {
        return khachHangRepository.existsById(id);
    }

    @Override
    public void deleteById(Long id) {
        khachHangRepository.deleteById(id);
    }

    @Override
    public Map<String, Object> getCustomerStatistics(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : LocalDateTime.now();
        
        return Map.of(
            "totalCustomers", khachHangRepository.countByNgayTaoBetween(startDateTime, endDateTime),
            "newCustomersThisMonth", khachHangRepository.countByNgayTaoBetween(
                LocalDate.now().withDayOfMonth(1).atStartOfDay(),
                LocalDateTime.now()
            )
        );
    }
    
    @Override
    public Optional<KhachHang> findById(Long id) {
        return khachHangRepository.findById(id);
    }
    
    @Override
    public KhachHang save(KhachHang khachHang) {
        return khachHangRepository.save(khachHang);
    }

    @Override
    public void sendMessageToCustomer(Long customerId, String messageType, String content, boolean sendSMS, boolean sendEmail) {
        // TODO: Implement logic to send message to a single customer
        System.out.println("Sending message to customer " + customerId + ": " + content);
    }

    @Override
    public void sendBulkMessageToCustomers(List<Long> customerIds, String filterStatus, String messageType, String content, boolean sendSMS, boolean sendEmail) {
        // TODO: Implement logic to send bulk messages to customers
        System.out.println("Sending bulk message to customers: " + customerIds + " with filter: " + filterStatus + ", content: " + content);
    }
    
    @Override
    public void syncCustomersFromNguoiDung() {
        // Get all users with role "KhachHang" (ma_vai_tro = 1)
        List<NguoiDung> khachHangUsers = nguoiDungRepository.findAll().stream()
            .filter(user -> user.getVaiTro() != null && user.getVaiTro().getMaVaiTro() == 1)
            .toList();
        
        int successCount = 0;
        int errorCount = 0;
        
        for (NguoiDung nguoiDung : khachHangUsers) {
            try {
                KhachHang result = syncCustomerFromNguoiDung(nguoiDung.getMaNguoiDung());
                if (result != null) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (Exception e) {
                errorCount++;
                System.err.println("Failed to sync customer " + nguoiDung.getMaNguoiDung() + ": " + e.getMessage());
            }
        }
        
        System.out.println("Sync completed: " + successCount + " successful, " + errorCount + " failed");
    }
    
    @Override
    public KhachHang syncCustomerFromNguoiDung(Integer maNguoiDung) {
        // Find the user
        Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findById(maNguoiDung);
        if (nguoiDungOpt.isEmpty()) {
            return null;
        }
        
        NguoiDung nguoiDung = nguoiDungOpt.get();
        
        // Check if user is a customer (ma_vai_tro = 1)
        if (nguoiDung.getVaiTro() == null || nguoiDung.getVaiTro().getMaVaiTro() != 1) {
            return null;
        }
        
        // Check if customer already exists in khach_hang table
        KhachHang khachHang = khachHangRepository.findByMaNguoiDung(maNguoiDung);
        
        boolean isNewCustomer = (khachHang == null);
        if (isNewCustomer) {
            // Create new customer
            khachHang = new KhachHang();
            khachHang.setMaNguoiDung(maNguoiDung);
        }
        
        // Sync data from NguoiDung to KhachHang
        khachHang.setHoTen(nguoiDung.getHoTen());
        
        // Sync phone number directly - allow duplicates as multiple customers can share a phone
        khachHang.setSoDienThoai(nguoiDung.getSoDienThoai());
        
        // Sync email directly
        khachHang.setEmail(nguoiDung.getEmail());
        
        khachHang.setDiaChi(nguoiDung.getDiaChi());
        khachHang.setNgaySinh(nguoiDung.getNgaySinh());
        
        // Handle gender - convert from String to boolean
        if (nguoiDung.getGioiTinh() != null) {
            // Assume "Nam" or "Male" = true, "Nữ" or "Female" = false
            khachHang.setGioiTinh("Nam".equalsIgnoreCase(nguoiDung.getGioiTinh()) || 
                                  "Male".equalsIgnoreCase(nguoiDung.getGioiTinh()));
        }
        
        khachHang.setAvatar(nguoiDung.getAvatar() != null ? nguoiDung.getAvatar() : nguoiDung.getAnhDaiDien());
        khachHang.setGhiChu(nguoiDung.getGhiChu());
        
        // Sync customer-specific data
        if (nguoiDung.getDiemTichLuy() != null) {
            khachHang.setDiemTichLuy(nguoiDung.getDiemTichLuy().intValue());
        }
        if (nguoiDung.getTongTienChiTieu() != null) {
            khachHang.setTongChiTieu(nguoiDung.getTongTienChiTieu());
        }
        if (nguoiDung.getSoLanDen() != null) {
            khachHang.setSoLanDen(nguoiDung.getSoLanDen());
        }
        
        khachHang.setTrangThai(nguoiDung.isDangHoatDong());
        
        try {
            return khachHangRepository.save(khachHang);
        } catch (Exception e) {
            // Log error and skip this customer
            System.err.println("Error syncing customer " + maNguoiDung + ": " + e.getMessage());
            return null;
        }
    }
    
    @Override
    public void deleteAll() {
        khachHangRepository.deleteAll();
    }
}