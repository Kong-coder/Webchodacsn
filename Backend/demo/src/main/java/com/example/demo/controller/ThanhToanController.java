package com.example.demo.controller;

import com.example.demo.model.HoaDon;
import com.example.demo.repository.HoaDonRepository;
import com.example.demo.service.ThanhToanService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/thanh-toan")
public class ThanhToanController {

    private final ThanhToanService thanhToanService;
    private final HoaDonRepository hoaDonRepository;

    public ThanhToanController(ThanhToanService thanhToanService, HoaDonRepository hoaDonRepository) {
        this.thanhToanService = thanhToanService;
        this.hoaDonRepository = hoaDonRepository;
    }

    // Online MoMo: tạo giao dịch, trả payUrl
    @PostMapping("/momo/create")
    public ResponseEntity<Map<String, Object>> createMomo(@RequestParam("hoa_don_id") Integer hoaDonId) {
        return ResponseEntity.ok(thanhToanService.createMomoPayment(hoaDonId));
    }

    // Webhook: mở public (đã permitAll trong SecurityConfig) — TODO: verify signature
    @PostMapping("/momo/webhook")
    public ResponseEntity<Void> momoWebhook(@RequestBody(required = false) String payload) {
        // TODO: verify signature, idempotency, update invoice/payment status
        return ResponseEntity.ok().build();
    }

    // Cash flow
    @PostMapping("/cash/init")
    public ResponseEntity<Void> cashInit(@RequestParam("hoa_don_id") Integer hoaDonId) {
        thanhToanService.cashInit(hoaDonId);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @PostMapping("/cash/confirm")
    public ResponseEntity<Void> cashConfirm(@RequestParam("hoa_don_id") Integer hoaDonId) {
        thanhToanService.cashConfirm(hoaDonId);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @PostMapping("/cash/confirm-by-don-hang")
    public ResponseEntity<Void> cashConfirmByDonHangId(@RequestParam("donHangId") Long donHangId) {
        HoaDon hoaDon = hoaDonRepository.findByOrderId(donHangId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hóa đơn cho đơn hàng ID: " + donHangId));
        thanhToanService.cashConfirm(hoaDon.getMaHoaDon());
        return ResponseEntity.ok().build();
    }

    // Query status for FE result page/polling
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/trang-thai")
    public ResponseEntity<Map<String, Object>> status(@RequestParam("hoa_don_id") Integer hoaDonId) {
        return ResponseEntity.ok(thanhToanService.status(hoaDonId));
    }
}
