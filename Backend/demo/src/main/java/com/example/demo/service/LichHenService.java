package com.example.demo.service;

import com.example.demo.dto.LichHenActionRequest;
import com.example.demo.dto.LichHenRequest;
import com.example.demo.dto.LichHenResponse;
import com.example.demo.dto.LichHenSearchRequest;
import com.example.demo.model.DichVu;
import com.example.demo.model.DonHang;
import com.example.demo.model.DonHangMuc;
import com.example.demo.model.LichHen;
import com.example.demo.model.NguoiDung;
import com.example.demo.model.ServiceProduct;
import com.example.demo.model.Product;
import com.example.demo.model.HoaDon;
import com.example.demo.repository.DichVuRepository;
import com.example.demo.repository.DonHangRepository;
import com.example.demo.repository.LichHenRepository;
import com.example.demo.repository.NguoiDungRepository;
import com.example.demo.repository.ServiceProductRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.HoaDonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class LichHenService {

    private final LichHenRepository lichHenRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final DichVuRepository dichVuRepository;
    private final DonHangRepository donHangRepository;
    private final ServiceProductRepository serviceProductRepository;
    private final ProductRepository productRepository;
    private final HoaDonRepository hoaDonRepository;
    private final ThanhToanService thanhToanService;

    public LichHenService(
            LichHenRepository lichHenRepository,
            NguoiDungRepository nguoiDungRepository,
            DichVuRepository dichVuRepository,
            DonHangRepository donHangRepository,
            ServiceProductRepository serviceProductRepository,
            ProductRepository productRepository,
            HoaDonRepository hoaDonRepository,
            ThanhToanService thanhToanService
    ) {
        this.lichHenRepository = lichHenRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.dichVuRepository = dichVuRepository;
        this.donHangRepository = donHangRepository;
        this.serviceProductRepository = serviceProductRepository;
        this.productRepository = productRepository;
        this.hoaDonRepository = hoaDonRepository;
        this.thanhToanService = thanhToanService;
    }

    @Transactional
    public LichHenResponse upsertByOrderId(Long orderId, LichHenRequest req) {
        LichHen entity = lichHenRepository.findByOrderId(orderId).orElseGet(LichHen::new);
        boolean isNew = entity.getMaLichHen() == null;
        String oldStatus = entity.getTrangThai();
        
        entity.setOrderId(orderId);
        entity.setMaNhanVien(req.getMaNhanVien());
        entity.setMaDichVu(req.getMaDichVu());
        entity.setMaKhachHang(req.getMaKhachHang());
        entity.setThoiGianHen(req.getThoiGianHen());
        entity.setTrangThai(req.getTrangThai());
        entity.setGhiChu(req.getGhiChu());
        entity.setLyDoHuy(req.getLyDoHuy());
        entity.setThoiGianHenMoi(req.getThoiGianHenMoi());
        entity.setGhiChuNhanVien(req.getGhiChuNhanVien());
        if (entity.getNgayTao() == null) entity.setNgayTao(OffsetDateTime.now());
        LichHen saved = lichHenRepository.save(entity);
        
        // Auto-confirm payment if created/updated with DA_XAC_NHAN status
        if ("DA_XAC_NHAN".equals(saved.getTrangThai()) && 
            (isNew || !"DA_XAC_NHAN".equals(oldStatus))) {
            System.out.println("Appointment " + saved.getMaLichHen() + " is DA_XAC_NHAN, auto-confirming payment...");
            autoConfirmPaymentForAppointment(saved);
        }
        
        return mapSingle(saved);
    }

    @Transactional(readOnly = true)
    public LichHenResponse getByOrderId(Long orderId) {
        LichHen lichHen = lichHenRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Lịch hẹn không tồn tại cho đơn hàng"));
        return mapSingle(lichHen);
    }

    @Transactional(readOnly = true)
    public LichHenResponse getById(Integer lichHenId) {
        LichHen lichHen = lichHenRepository.findById(lichHenId)
                .orElseThrow(() -> new IllegalArgumentException("Lịch hẹn không tồn tại"));
        return mapSingle(lichHen);
    }

    @Transactional(readOnly = true)
    public List<LichHenResponse> search(LichHenSearchRequest req) {
        List<String> statuses = req.getTrangThais();
        boolean statusesEmpty = statuses == null || statuses.isEmpty();

        List<LichHen> result = lichHenRepository.search(
                req.getFrom(),
                req.getTo(),
                statusesEmpty ? Collections.emptyList() : statuses,
                statusesEmpty,
                req.getMaNhanVien(),
                req.getMaKhachHang()
        );

        return mapToResponses(result);
    }

    @Transactional
    public LichHenResponse applyAction(Integer lichHenId, LichHenActionRequest req) {
        if (req == null || !hasText(req.getAction())) {
            throw new IllegalArgumentException("Hành động không hợp lệ");
        }

        LichHen entity = lichHenRepository.findById(lichHenId)
                .orElseThrow(() -> new IllegalArgumentException("Lịch hẹn không tồn tại"));

        String action = req.getAction().trim().toLowerCase();
        String oldStatus = entity.getTrangThai();
        
        switch (action) {
            case "confirm" -> {
                entity.setTrangThai("DA_XAC_NHAN");  // Use Vietnamese status
                entity.setLyDoHuy(null);
                entity.setThoiGianHenMoi(null);
                
                // Auto-confirm payment only for cash method when staff confirms appointment
                if (!"DA_XAC_NHAN".equals(oldStatus)) {
                    hoaDonRepository.findByMaLichHen(entity.getMaLichHen()).ifPresent(invoice -> {
                        String paymentMethod = invoice.getPhuongThucThanhToan();
                        if (paymentMethod != null && 
                            (paymentMethod.equalsIgnoreCase("cash") || 
                             paymentMethod.equalsIgnoreCase("TIEN_MAT"))) {
                            autoConfirmPaymentForAppointment(entity);
                        }
                    });
                }
            }
            case "cancel" -> {
                if (!hasText(req.getLyDoHuy())) {
                    throw new IllegalArgumentException("Vui lòng cung cấp lý do hủy");
                }
                entity.setTrangThai("DA_HUY");  // Use Vietnamese status
                entity.setLyDoHuy(req.getLyDoHuy());
                entity.setThoiGianHenMoi(null);
                
                // Refund products if the appointment was paid
                refundProductsForCancelledAppointment(entity);
            }
            case "approve-change" -> {
                OffsetDateTime newTime = req.getThoiGianHenMoi() != null ? req.getThoiGianHenMoi() : entity.getThoiGianHenMoi();
                if (newTime == null) {
                    throw new IllegalArgumentException("Thiếu thời gian hẹn mới để duyệt thay đổi");
                }
                entity.setThoiGianHen(newTime);
                entity.setThoiGianHenMoi(null);
                entity.setLyDoHuy(null);
                entity.setTrangThai("DA_XAC_NHAN");  // Use Vietnamese status
            }
            case "reject-change" -> {
                entity.setThoiGianHenMoi(null);
                entity.setLyDoHuy(null);
                entity.setTrangThai("CHO_XAC_NHAN");  // Use Vietnamese status for pending
            }
            default -> throw new IllegalArgumentException("Hành động không hợp lệ");
        }

        if (hasText(req.getGhiChuNhanVien())) {
            entity.setGhiChuNhanVien(req.getGhiChuNhanVien());
        }
        if (hasText(req.getGhiChu())) {
            entity.setGhiChu(req.getGhiChu());
        }

        LichHen saved = lichHenRepository.save(entity);
        return mapSingle(saved);
    }

    private LichHenResponse mapSingle(LichHen entity) {
        List<LichHenResponse> responses = mapToResponses(Collections.singletonList(entity));
        return responses.isEmpty() ? null : responses.get(0);
    }

    private List<LichHenResponse> mapToResponses(List<LichHen> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Integer> customerIds = entities.stream()
                .map(LichHen::getMaKhachHang)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<Integer> serviceIds = entities.stream()
                .map(LichHen::getMaDichVu)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<Long> orderIds = entities.stream()
                .map(LichHen::getOrderId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Integer, NguoiDung> customers = loadCustomers(customerIds);
        Map<Integer, DichVu> services = loadServices(serviceIds);
        Map<Long, DonHang> orders = loadOrders(orderIds);
        Map<Integer, Long> visitCountCache = new HashMap<>();

        return entities.stream()
                .map(entity -> toResponse(entity, customers, services, orders, visitCountCache))
                .collect(Collectors.toList());
    }

    private Map<Integer, NguoiDung> loadCustomers(Set<Integer> ids) {
        if (ids.isEmpty()) return Collections.emptyMap();
        Map<Integer, NguoiDung> map = new HashMap<>();
        nguoiDungRepository.findByMaNguoiDungIn(ids).forEach(nd -> map.put(nd.getMaNguoiDung(), nd));
        return map;
    }

    private Map<Integer, DichVu> loadServices(Set<Integer> ids) {
        if (ids.isEmpty()) return Collections.emptyMap();
        Map<Integer, DichVu> map = new HashMap<>();
        dichVuRepository.findAllById(ids).forEach(dv -> map.put(dv.getMaDichVu(), dv));
        return map;
    }

    private Map<Long, DonHang> loadOrders(Set<Long> ids) {
        if (ids.isEmpty()) return Collections.emptyMap();
        Map<Long, DonHang> map = new HashMap<>();
        donHangRepository.findAllById(ids).forEach(dh -> map.put(dh.getId(), dh));
        return map;
    }

    private LichHenResponse toResponse(
            LichHen entity,
            Map<Integer, NguoiDung> customers,
            Map<Integer, DichVu> services,
            Map<Long, DonHang> orders,
            Map<Integer, Long> visitCountCache
    ) {
        LichHenResponse dto = new LichHenResponse();
        dto.setMaLichHen(entity.getMaLichHen());
        dto.setMaNhanVien(entity.getMaNhanVien());
        dto.setMaDichVu(entity.getMaDichVu());
        dto.setMaKhachHang(entity.getMaKhachHang());
        dto.setThoiGianHen(entity.getThoiGianHen());
        dto.setThoiGianHenMoi(entity.getThoiGianHenMoi());
        dto.setTrangThai(entity.getTrangThai());
        dto.setGhiChu(entity.getGhiChu());
        dto.setGhiChuNhanVien(entity.getGhiChuNhanVien());
        dto.setLyDoHuy(entity.getLyDoHuy());
        dto.setNgayTao(entity.getNgayTao());
        dto.setOrderId(entity.getOrderId());

        Integer customerId = entity.getMaKhachHang();
        NguoiDung customer = customerId == null ? null : customers.get(customerId);
        if (customer != null) {
            dto.setCustomerName(customer.getHoTen());
            dto.setCustomerEmail(customer.getEmail());
            dto.setCustomerPhone(customer.getSoDienThoai());
        }

        Long visitCount = customerId == null ? null : visitCountCache.computeIfAbsent(customerId, this::countVisitsForCustomer);
        dto.setVisitCount(visitCount);
        dto.setCustomerType(determineCustomerType(visitCount));

        Integer serviceId = entity.getMaDichVu();
        DichVu service = serviceId == null ? null : services.get(serviceId);
        if (service != null) {
            dto.setServiceName(service.getTenDichVu());
            dto.setServiceDurationMinutes(service.getThoiLuongPhut());
            dto.setServicePrice(service.getGia());
        }

        Long orderId = entity.getOrderId();
        DonHang order = orderId == null ? null : orders.get(orderId);
        if (order != null) {
            dto.setOrderTotal(order.getTongTien());
        }

        dto.setRequestType(resolveRequestType(entity));
        dto.setCancelReason(entity.getLyDoHuy());
        dto.setEditReason(entity.getGhiChu());

        return dto;
    }

    private Long countVisitsForCustomer(Integer customerId) {
        return lichHenRepository.countByMaKhachHang(customerId);
    }

    private String determineCustomerType(Long visitCount) {
        if (visitCount == null) return "normal";
        return visitCount >= 10 ? "vip" : "normal";
    }

    private String resolveRequestType(LichHen entity) {
        if (entity == null) return null;
        String status = entity.getTrangThai();
        if (status != null && status.equalsIgnoreCase("pending")) {
            if (hasText(entity.getLyDoHuy())) {
                return "cancel";
            }
            if (entity.getThoiGianHenMoi() != null) {
                return "edit";
            }
        }
        return null;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    @Transactional(readOnly = true)
    public List<LichHenResponse> getMyAppointments() {
        // Assuming the security context holds the user's ID
        // This part needs a proper implementation of getting the current user.
        // For now, we'll hardcode a customer ID for demonstration purposes.
        // In a real application, you would get the customer ID from the authentication principal.
        long customerId = 1L; // Hardcoded for now
        List<LichHen> appointments = lichHenRepository.findByMaKhachHang((int) customerId);
        return mapToResponses(appointments);
    }

    @Transactional(readOnly = true)
    public List<LichHenResponse> getCompletedByCustomerId(Long customerId) {
        List<LichHen> appointments = lichHenRepository.findByMaKhachHangAndTrangThai(customerId.intValue(), "completed");
        return mapToResponses(appointments);
    }

    @Transactional
    public LichHenResponse updateLichHen(Integer id, LichHenRequest req) {
        LichHen entity = lichHenRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lịch hẹn không tồn tại"));

        String oldStatus = entity.getTrangThai();
        
        // Update the fields from the request
        entity.setMaNhanVien(req.getMaNhanVien());
        entity.setMaDichVu(req.getMaDichVu());
        entity.setThoiGianHen(req.getThoiGianHen());
        entity.setGhiChu(req.getGhiChu());
        
        // Update status if provided
        if (req.getTrangThai() != null) {
            entity.setTrangThai(req.getTrangThai());
        }

        LichHen saved = lichHenRepository.save(entity);
        
        // Auto-confirm payment if status changed to DA_XAC_NHAN
        if ("DA_XAC_NHAN".equals(saved.getTrangThai()) && !"DA_XAC_NHAN".equals(oldStatus)) {
            System.out.println("Status changed to DA_XAC_NHAN, auto-confirming payment...");
            autoConfirmPaymentForAppointment(saved);
        }
        
        return mapSingle(saved);
    }
    
    /**
     * Auto-confirm cash payment when staff confirms appointment
     */
    private void autoConfirmPaymentForAppointment(LichHen lichHen) {
        if (lichHen.getMaLichHen() == null) {
            System.out.println("No appointment ID to confirm payment");
            return;
        }
        
        // Find invoice for this appointment efficiently
        HoaDon invoice = hoaDonRepository.findByMaLichHen(lichHen.getMaLichHen()).orElse(null);
        
        if (invoice == null) {
            System.out.println("No invoice found for appointment " + lichHen.getMaLichHen());
            return;
        }
        
        System.out.println("Found invoice " + invoice.getMaHoaDon() + " for appointment " + lichHen.getMaLichHen());
        
        // Check if payment method is cash (case-insensitive)
        String paymentMethod = invoice.getPhuongThucThanhToan();
        if (paymentMethod == null || 
            (!paymentMethod.equalsIgnoreCase("cash") && 
             !paymentMethod.equalsIgnoreCase("TIEN_MAT"))) {
            System.out.println("Payment method is not cash: " + paymentMethod);
            return;
        }
        
        // Check if already paid
        if ("paid".equals(invoice.getTrangThai())) {
            System.out.println("Invoice already paid");
            return;
        }
        
        System.out.println("Auto-confirming cash payment for invoice " + invoice.getMaHoaDon());
        
        // Initialize payment if not exists
        thanhToanService.cashInit(invoice.getMaHoaDon());
        
        // Confirm payment (this will deduct products)
        thanhToanService.cashConfirm(invoice.getMaHoaDon());
        
        System.out.println("✓ Payment auto-confirmed for appointment " + lichHen.getMaLichHen());
    }
    
    /**
     * Refund (restore) products when an appointment is cancelled
     * Only refund if the invoice was already paid
     */
    private void refundProductsForCancelledAppointment(LichHen lichHen) {
        try {
            if (lichHen.getOrderId() == null) {
                System.out.println("No order found for appointment " + lichHen.getMaLichHen());
                return;
            }
            
            // Find the order
            DonHang donHang = donHangRepository.findById(lichHen.getOrderId()).orElse(null);
            if (donHang == null) {
                System.out.println("Order " + lichHen.getOrderId() + " not found for appointment " + lichHen.getMaLichHen());
                return;
            }
            
            // Check if there's a paid invoice for this order
            List<HoaDon> invoices = hoaDonRepository.findAll().stream()
                    .filter(hd -> lichHen.getOrderId().equals(hd.getOrderId()))
                    .filter(hd -> "paid".equals(hd.getTrangThai()))
                    .collect(Collectors.toList());
            
            if (invoices.isEmpty()) {
                System.out.println("No paid invoice found for order " + lichHen.getOrderId() + ". No refund needed.");
                return;
            }
            
            System.out.println("🔄 Refunding products for cancelled appointment " + lichHen.getMaLichHen() + ", order " + donHang.getId());
            
            // Process each item in the order
            for (DonHangMuc muc : donHang.getMuc()) {
                if ("service".equals(muc.getLoaiMuc())) {
                    // This is a service item, find associated products
                    Integer serviceId = muc.getDoiTuongId().intValue();
                    int serviceQuantity = muc.getSoLuong(); // Number of times this service was ordered
                    
                    System.out.println("Refunding products for service ID: " + serviceId + ", quantity: " + serviceQuantity);
                    
                    List<ServiceProduct> serviceProducts = serviceProductRepository.findByServiceId(serviceId);
                    
                    if (serviceProducts.isEmpty()) {
                        System.out.println("No products linked to service ID: " + serviceId);
                    }
                    
                    for (ServiceProduct sp : serviceProducts) {
                        Product product = productRepository.findById(sp.getProductId()).orElse(null);
                        if (product != null) {
                            // Refund quantity: (quantityPerUse per service) * (number of services ordered)
                            int quantityToRefund = sp.getQuantityPerUse() * serviceQuantity;
                            int currentQuantity = product.getQuantity();
                            int newQuantity = currentQuantity + quantityToRefund;
                            
                            // Update quantity and decrease usage count
                            product.setQuantity(newQuantity);
                            int currentUsageCount = product.getUsageCount() != null ? product.getUsageCount() : 0;
                            int newUsageCount = Math.max(0, currentUsageCount - serviceQuantity); // Don't go below 0
                            product.setUsageCount(newUsageCount);
                            productRepository.save(product);
                            
                            System.out.println("✓ Refunded " + quantityToRefund + " units of '" + 
                                product.getName() + "' (ID: " + product.getId() + 
                                "). Previous: " + currentQuantity + ", New: " + newQuantity + 
                                ", Usage count: " + currentUsageCount + " → " + newUsageCount);
                        } else {
                            System.err.println("⚠️ Product ID " + sp.getProductId() + " not found");
                        }
                    }
                }
            }
            
            System.out.println("✓ Product refund completed for appointment " + lichHen.getMaLichHen());
            
        } catch (Exception e) {
            System.err.println("❌ Error refunding products for appointment " + lichHen.getMaLichHen() + ": " + e.getMessage());
            e.printStackTrace();
            // Don't throw exception to avoid breaking cancellation flow
        }
    }
}
