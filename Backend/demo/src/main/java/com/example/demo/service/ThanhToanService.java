package com.example.demo.service;

import com.example.demo.model.HoaDon;
import com.example.demo.model.ThanhToan;
import com.example.demo.model.DonHang;
import com.example.demo.model.DonHangMuc;
import com.example.demo.model.ServiceProduct;
import com.example.demo.model.Product;
import com.example.demo.model.LichHen;
import com.example.demo.repository.HoaDonRepository;
import com.example.demo.repository.ThanhToanRepository;
import com.example.demo.repository.DonHangRepository;
import com.example.demo.repository.ServiceProductRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.LichHenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
public class ThanhToanService {

    private final ThanhToanRepository thanhToanRepository;
    private final HoaDonRepository hoaDonRepository;
    private final DonHangRepository donHangRepository;
    private final ServiceProductRepository serviceProductRepository;
    private final ProductRepository productRepository;
    private final LichHenRepository lichHenRepository;
    private final RestTemplate http = new RestTemplate();

    @Value("${momo.partnerCode}")
    private String partnerCode;
    @Value("${momo.accessKey}")
    private String accessKey;
    @Value("${momo.secretKey}")
    private String secretKey;
    @Value("${momo.endpointCreate}")
    private String endpointCreate;
    @Value("${momo.redirectUrl}")
    private String redirectUrl;
    @Value("${momo.ipnUrl}")
    private String ipnUrl;
    @Value("${momo.requestType:captureWallet}")
    private String requestType;

    public ThanhToanService(ThanhToanRepository thanhToanRepository, HoaDonRepository hoaDonRepository,
                            DonHangRepository donHangRepository, ServiceProductRepository serviceProductRepository,
                            ProductRepository productRepository, LichHenRepository lichHenRepository) {
        this.thanhToanRepository = thanhToanRepository;
        this.hoaDonRepository = hoaDonRepository;
        this.donHangRepository = donHangRepository;
        this.serviceProductRepository = serviceProductRepository;
        this.productRepository = productRepository;
        this.lichHenRepository = lichHenRepository;
    }

    @Transactional
    public Map<String, Object> createMomoPayment(Integer hoaDonId) {
        HoaDon hd = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new IllegalArgumentException("Hóa đơn không tồn tại"));
        BigDecimal amount = Objects.requireNonNullElse(hd.getTongTien(), BigDecimal.ZERO);
        String amt = amount.setScale(0, java.math.RoundingMode.HALF_UP).toPlainString();
        String orderId = "HD-" + hoaDonId + "-" + System.currentTimeMillis();
        String requestId = "REQ-" + hoaDonId + "-" + System.currentTimeMillis();
        String orderInfo = "Thanh toan hoa don " + hoaDonId;
        String extraData = ""; // base64 optional

        // signature raw per MoMo spec V2 (create)
        String raw = "accessKey=" + accessKey
                + "&amount=" + amt
                + "&extraData=" + extraData
                + "&ipnUrl=" + ipnUrl
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + partnerCode
                + "&redirectUrl=" + redirectUrl
                + "&requestId=" + requestId
                + "&requestType=" + requestType;
        String signature = hmacSHA256(raw, secretKey);

        Map<String, Object> req = new HashMap<>();
        req.put("partnerCode", partnerCode);
        req.put("accessKey", accessKey);
        req.put("requestId", requestId);
        req.put("amount", amt);
        req.put("orderId", orderId);
        req.put("orderInfo", orderInfo);
        req.put("redirectUrl", redirectUrl);
        req.put("ipnUrl", ipnUrl);
        req.put("requestType", requestType);
        req.put("extraData", extraData);
        req.put("lang", "vi");
        req.put("signature", signature);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> httpReq = new HttpEntity<>(req, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> momoResp = http.postForObject(endpointCreate, httpReq, Map.class);
        String payUrl = momoResp == null ? null : (String) momoResp.get("payUrl");

        // Create a payment record in init state
        ThanhToan tt = new ThanhToan();
        tt.setHoaDonId(hoaDonId);
        tt.setNhaCungCap("MOMO");
        tt.setSoTien(amount);
        tt.setTienTe("VND");
        tt.setTrangThai("init");
        tt.setRequestId(requestId);
        tt.setMaGiaoDichNcc(orderId);
        tt.setTaoLuc(OffsetDateTime.now());
        tt.setCapNhatLuc(OffsetDateTime.now());
        thanhToanRepository.save(tt);

        Map<String, Object> resp = new HashMap<>();
        resp.put("payUrl", payUrl);
        resp.put("orderId", orderId);
        resp.put("requestId", requestId);
        return resp;
    }

    @Transactional
    public void cashInit(Integer hoaDonId) {
        HoaDon hd = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new IllegalArgumentException("Hóa đơn không tồn tại"));
        ThanhToan tt = new ThanhToan();
        tt.setHoaDonId(hoaDonId);
        tt.setNhaCungCap("CASH");
        tt.setSoTien(hd.getTongTien());
        tt.setTienTe("VND");
        tt.setTrangThai("init");
        tt.setTaoLuc(OffsetDateTime.now());
        tt.setCapNhatLuc(OffsetDateTime.now());
        thanhToanRepository.save(tt);
    }

    @Transactional
    public void cashConfirm(Integer hoaDonId) {
        System.out.println("--> [ThanhToanService] === CASH CONFIRM STARTED for invoice " + hoaDonId + " ===");
        HoaDon hd = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new IllegalArgumentException("Hóa đơn không tồn tại"));
        System.out.println("--> [ThanhToanService] Invoice found: " + hoaDonId + ", current status: " + hd.getTrangThai() + ", orderId: " + hd.getOrderId());
        
        // update latest payment to success
        ThanhToan tt = thanhToanRepository.findTopByHoaDonIdOrderByTaoLucDesc(hoaDonId)
                .orElseThrow(() -> new IllegalArgumentException("Chưa khởi tạo thanh toán tiền mặt"));
        tt.setTrangThai("success");
        tt.setCapNhatLuc(OffsetDateTime.now());
        thanhToanRepository.save(tt);
        System.out.println("--> [ThanhToanService] Payment record " + tt.getId() + " status updated to success.");

        // mark invoice paid
        hd.setTrangThai("paid");
        hoaDonRepository.save(hd);
        System.out.println("--> [ThanhToanService] Invoice " + hd.getMaHoaDon() + " status updated to PAID.");
        
        // Deduct products for services in this invoice
        System.out.println("--> [ThanhToanService] Calling deductProductsForInvoice...");
        deductProductsForInvoice(hoaDonId);
        System.out.println("--> [ThanhToanService] === CASH CONFIRM COMPLETED ===");
    }

    @Transactional(readOnly = true)
    public Map<String, Object> status(Integer hoaDonId) {
        Map<String, Object> resp = new HashMap<>();
        HoaDon hd = hoaDonRepository.findById(hoaDonId)
                .orElseThrow(() -> new IllegalArgumentException("Hóa đơn không tồn tại"));
        resp.put("hoadon_status", hd.getTrangThai());
        thanhToanRepository.findTopByHoaDonIdOrderByTaoLucDesc(hoaDonId).ifPresent(tt -> {
            resp.put("trang_thai", tt.getTrangThai());
            resp.put("nha_cung_cap", tt.getNhaCungCap());
        });
        return resp;
    }

    @Transactional
    public void handleMomoWebhook(Map<String, Object> payload) {
        // Extract fields as strings
        String partnerCodeP = asString(payload.get("partnerCode"));
        String accessKeyP = asString(payload.get("accessKey"));
        String amount = asString(payload.get("amount"));
        String extraData = asString(payload.get("extraData"));
        String message = asString(payload.get("message"));
        String orderId = asString(payload.get("orderId"));
        String orderInfo = asString(payload.get("orderInfo"));
        String orderType = asString(payload.get("orderType"));
        String payType = asString(payload.get("payType"));
        String requestId = asString(payload.get("requestId"));
        String responseTime = asString(payload.get("responseTime"));
        String resultCode = String.valueOf(payload.get("resultCode"));
        String transId = asString(payload.get("transId"));
        String signature = asString(payload.get("signature"));

        // Build raw string per MoMo IPN spec
        String raw = "accessKey=" + accessKey
                + "&amount=" + amount
                + "&extraData=" + (extraData == null ? "" : extraData)
                + "&message=" + message
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&orderType=" + orderType
                + "&partnerCode=" + partnerCodeP
                + "&payType=" + payType
                + "&requestId=" + requestId
                + "&responseTime=" + responseTime
                + "&resultCode=" + resultCode
                + "&transId=" + transId;
        String expectedSig = hmacSHA256(raw, secretKey);
        if (!expectedSig.equals(signature)) {
            // signature invalid: ignore
            return;
        }

        // Our orderId format: HD-{hoaDonId}-{ts}
        Integer hoaDonId = null;
        try {
            String[] parts = orderId.split("-");
            if (parts.length >= 3) hoaDonId = Integer.valueOf(parts[1]);
        } catch (Exception ignored) {}
        if (hoaDonId == null) return;

        HoaDon hd = hoaDonRepository.findById(hoaDonId).orElse(null);
        if (hd == null) return;

        // Update latest payment
        ThanhToan tt = thanhToanRepository.findTopByHoaDonIdOrderByTaoLucDesc(hoaDonId).orElse(new ThanhToan());
        tt.setHoaDonId(hoaDonId);
        tt.setNhaCungCap("MOMO");
        tt.setTienTe("VND");
        tt.setTransId(transId);
        tt.setRequestId(requestId);
        tt.setMaGiaoDichNcc(orderId);
        tt.setSoTien(hd.getTongTien());
        tt.setCapNhatLuc(OffsetDateTime.now());

        if ("0".equals(resultCode)) {
            tt.setTrangThai("success");
            hd.setTrangThai("paid");
            hoaDonRepository.save(hd);
            
            // Deduct products for services in this invoice
            deductProductsForInvoice(hoaDonId);
        } else {
            tt.setTrangThai("failed");
        }
        thanhToanRepository.save(tt);
    }
    
    /**
     * Deduct products associated with services when payment is successful
     */
    private void deductProductsForInvoice(Integer hoaDonId) {
        System.out.println("--> [ThanhToanService] Starting product deduction for invoice " + hoaDonId);
        // Find the invoice
        HoaDon hd = hoaDonRepository.findById(hoaDonId).orElse(null);
        if (hd == null) {
            System.err.println("--> [ThanhToanService] CRITICAL: Invoice " + hoaDonId + " not found during product deduction. Aborting deduction.");
            return;
        }
        
        System.out.println("--> [ThanhToanService] Processing product deduction for invoice " + hoaDonId);
        System.out.println("--> [ThanhToanService] Invoice details -> orderId: " + hd.getOrderId() + ", maLichHen: " + hd.getMaLichHen());
        
        // Try to get service ID from order first, then from appointment
        Integer serviceId = null;
        int serviceQuantity = 1; // Default to 1
        
        // Option 1: Try to get from don_hang if orderId exists
        if (hd.getOrderId() != null) {
            DonHang donHang = donHangRepository.findById(hd.getOrderId()).orElse(null);
            if (donHang != null) {
                System.out.println("--> [ThanhToanService] Found order " + donHang.getId() + " linked to invoice.");
                for (DonHangMuc muc : donHang.getMuc()) {
                    if ("service".equals(muc.getLoaiMuc())) {
                        serviceId = muc.getDoiTuongId().intValue();
                        serviceQuantity = muc.getSoLuong();
                        System.out.println("--> [ThanhToanService] Found service " + serviceId + " (quantity: " + serviceQuantity + ") in order.");
                        break; // Take first service for now
                    }
                }
            }
        }
        
        // Option 2: Get from lich_hen if no order or no service found
        if (serviceId == null && hd.getMaLichHen() != null) {
            System.out.println("--> [ThanhToanService] No service found in order, trying to get from appointment " + hd.getMaLichHen());
            try {
                LichHen lichHen = lichHenRepository.findById(hd.getMaLichHen()).orElse(null);
                if (lichHen != null && lichHen.getMaDichVu() != null) {
                    serviceId = lichHen.getMaDichVu();
                    serviceQuantity = 1; // Appointments are typically for 1 service
                    System.out.println("--> [ThanhToanService] Found service " + serviceId + " from appointment.");
                } else {
                    System.out.println("--> [ThanhToanService] Appointment found, but it has no service ID (maDichVu).");
                }
            } catch (Exception e) {
                System.err.println("--> [ThanhToanService] Error getting appointment by ID " + hd.getMaLichHen() + ": " + e.getMessage());
            }
        }
        
        if (serviceId == null) {
            System.out.println("--> [ThanhToanService] No service ID could be determined for invoice " + hoaDonId + ". Aborting deduction.");
            return;
        }
        
        System.out.println("--> [ThanhToanService] Processing deduction for service ID: " + serviceId + ", quantity: " + serviceQuantity);
        
        List<ServiceProduct> serviceProducts = serviceProductRepository.findByServiceId(serviceId);
        
        if (serviceProducts.isEmpty()) {
            System.out.println("--> [ThanhToanService] No products linked to service ID: " + serviceId + ". Nothing to deduct.");
            return;
        }
        
        for (ServiceProduct sp : serviceProducts) {
            Product product = productRepository.findById(sp.getProductId()).orElseThrow(
                () -> new IllegalArgumentException("Product not found for ID: " + sp.getProductId()));
            
            int quantityToDeduct = sp.getQuantityPerUse() * serviceQuantity;
            int currentQuantity = product.getQuantity();
            int newQuantity = currentQuantity - quantityToDeduct;
            
            System.out.println("--> [ThanhToanService] Deducting " + quantityToDeduct + " of product '" + product.getName() + "' (ID: " + product.getId() + "). Current stock: " + currentQuantity);

            if (newQuantity < 0) {
                System.err.println("--> [ThanhToanService] INSUFFICIENT STOCK for product '" + product.getName() + "'. Required: " + quantityToDeduct + ", Available: " + currentQuantity);
                throw new IllegalStateException("Product '" + product.getName() + 
                    "' (ID: " + product.getId() + ") has insufficient stock. " +
                    "Current: " + currentQuantity + ", Required: " + quantityToDeduct);
            }
            
            // Update quantity and usage count
            product.setQuantity(newQuantity);
            int currentUsageCount = product.getUsageCount() != null ? product.getUsageCount() : 0;
            product.setUsageCount(currentUsageCount + serviceQuantity);
            productRepository.save(product);
            
            System.out.println("--> [ThanhToanService] ✓ Deducted " + quantityToDeduct + " units of '" + 
                product.getName() + "'. New stock: " + newQuantity + ", Usage count: " + 
                (currentUsageCount + serviceQuantity));
        }
        
        System.out.println("--> [ThanhToanService] ✓ Product deduction completed for invoice " + hoaDonId);
    }

    private static String asString(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    private static String hmacSHA256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] bytes = mac.doFinal(data.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
