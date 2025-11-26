package com.example.demo.service;

import com.example.demo.model.KhachHang;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface KhachHangService {
    // Existing methods with updated ID type
    List<KhachHang> getAllKhachHang();
    Optional<KhachHang> getKhachHangById(Long id);
    KhachHang saveKhachHang(KhachHang khachHang);
    void deleteKhachHang(Long id);
    boolean existsBySoDienThoai(String soDienThoai);
    boolean existsBySoDienThoaiAndIdNot(String soDienThoai, Long id);
    
    // New methods needed by CustomerCareController
    List<KhachHang> findAllWithFilters(String searchTerm, String status);
    boolean existsById(Long id);
    void deleteById(Long id);
    Map<String, Object> getCustomerStatistics(LocalDate startDate, LocalDate endDate);
    
    // Additional methods that might be needed
    Optional<KhachHang> findById(Long id);
    KhachHang save(KhachHang khachHang);

    void sendMessageToCustomer(Long customerId, String messageType, String content, boolean sendSMS, boolean sendEmail);
    void sendBulkMessageToCustomers(List<Long> customerIds, String filterStatus, String messageType, String content, boolean sendSMS, boolean sendEmail);
    
    // Sync customers from nguoi_dung table
    void syncCustomersFromNguoiDung();
    KhachHang syncCustomerFromNguoiDung(Integer maNguoiDung);
    void deleteAll();
}
