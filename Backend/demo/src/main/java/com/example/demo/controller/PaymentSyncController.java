package com.example.demo.controller;

import com.example.demo.service.PaymentSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment-sync")
public class PaymentSyncController {

    private final PaymentSyncService paymentSyncService;

    public PaymentSyncController(PaymentSyncService paymentSyncService) {
        this.paymentSyncService = paymentSyncService;
    }

    /**
     * Sync payments for all confirmed appointments that haven't been paid yet
     */
    @PostMapping("/sync-all")
    public ResponseEntity<Map<String, Object>> syncAll() {
        System.out.println("=== Manual sync triggered via API ===");
        return ResponseEntity.ok(paymentSyncService.syncAllPendingPayments());
    }
    
    /**
     * Test endpoint to check if controller is working
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("PaymentSync API is working!");
    }

    /**
     * Sync payment for a specific appointment
     */
    @PostMapping("/sync-appointment/{appointmentId}")
    public ResponseEntity<Map<String, Object>> syncAppointment(@PathVariable Integer appointmentId) {
        return ResponseEntity.ok(paymentSyncService.syncPaymentForAppointment(appointmentId));
    }
}
