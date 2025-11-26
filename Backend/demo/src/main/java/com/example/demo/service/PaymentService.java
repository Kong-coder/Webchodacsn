package com.example.demo.service;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.dto.PaymentResponse;
import java.util.Map;

public interface PaymentService {
    PaymentResponse createPayment(PaymentRequest request);
    PaymentResponse getPaymentStatus(String paymentId);
    PaymentResponse processRefund(String paymentId);
    void handleMomoWebhook(Map<String, Object> payload);
}
