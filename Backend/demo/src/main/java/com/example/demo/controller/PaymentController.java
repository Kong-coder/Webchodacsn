package com.example.demo.controller;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.dto.PaymentResponse;
import com.example.demo.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-payment")
    public ResponseEntity<PaymentResponse> createPayment(@RequestBody PaymentRequest request) {
        // Force MOMO as the only payment method
        request.setPaymentMethod("MOMO");
        PaymentResponse response = paymentService.createPayment(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{paymentId}/status")
    public ResponseEntity<PaymentResponse> getPaymentStatus(@PathVariable String paymentId) {
        PaymentResponse response = paymentService.getPaymentStatus(paymentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<PaymentResponse> refundPayment(@PathVariable String paymentId) {
        PaymentResponse response = paymentService.processRefund(paymentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook/momo")
    public ResponseEntity<Void> momoWebhook(@RequestBody Map<String, Object> payload) {
        paymentService.handleMomoWebhook(payload);
        return ResponseEntity.ok().build();
    }
}
