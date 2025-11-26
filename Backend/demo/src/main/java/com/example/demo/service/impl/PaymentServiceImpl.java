package com.example.demo.service.impl;

import com.example.demo.dto.PaymentRequest;
import com.example.demo.dto.PaymentResponse;
import com.example.demo.service.PaymentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Value("${payment.momo.partner-code}")
    private String momoPartnerCode;
    
    @Value("${payment.momo.access-key}")
    private String momoAccessKey;
    
    @Value("${payment.momo.secret-key}")
    private String momoSecretKey;

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        PaymentResponse response = new PaymentResponse();
        response.setOrderId(request.getOrderId());
        response.setAmount(request.getAmount());
        response.setPaymentMethod("MOMO"); // Chỉ sử dụng MOMO
        
        try {
            return processMomoPayment(request);
        } catch (Exception e) {
            response.setSuccess(false);
            response.setPaymentStatus("FAILED");
            response.setErrorMessage(e.getMessage());
            return response;
        }
    }

    private PaymentResponse processMomoPayment(PaymentRequest request) {
        // Implement MOMO payment integration
        PaymentResponse response = new PaymentResponse();
        response.setOrderId(request.getOrderId());
        response.setPaymentId(UUID.randomUUID().toString());
        response.setAmount(request.getAmount());
        response.setPaymentMethod("MOMO");
        response.setPaymentStatus("PENDING");
        response.setSuccess(true);
        
        // TODO: Implement actual MOMO payment integration
        // This is just a mock implementation
        String paymentUrl = String.format(
            "%s?partnerCode=%s&accessKey=%s&requestId=%s&amount=%s&orderId=%s&orderInfo=%s&returnUrl=%s¬ifyUrl=%s&requestType=captureWallet",
            "https://test-payment.momo.vn/v2/gateway/api/create",
            momoPartnerCode,
            momoAccessKey,
            response.getPaymentId(),
            request.getAmount().intValue(),
            request.getOrderId(),
            "Thanh toan don hang " + request.getOrderId(),
            "http://localhost:3001/client/payment-result",
            "http://localhost:8080/api/payments/webhook/momo"
        );
        
        response.setPaymentUrl(paymentUrl);
        
        return response;
    }

    @Override
    public PaymentResponse getPaymentStatus(String paymentId) {
        // TODO: Implement actual payment status check from MOMO
        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(paymentId);
        response.setPaymentStatus("COMPLETED");
        response.setSuccess(true);
        return response;
    }

    @Override
    public PaymentResponse processRefund(String paymentId) {
        // TODO: Implement actual MOMO refund logic
        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(paymentId);
        response.setPaymentStatus("REFUNDED");
        response.setSuccess(true);
        return response;
    }

    @Override
    public void handleMomoWebhook(Map<String, Object> payload) {
        // Process MOMO webhook
        // TODO: Verify signature and update payment status in database
        System.out.println("Received MOMO webhook: " + payload);
        
        // Example of processing webhook
        String orderId = (String) payload.get("orderId");
        String resultCode = (String) payload.get("resultCode");
        
        if ("0".equals(resultCode)) {
            // Payment successful
            System.out.println("Payment successful for order: " + orderId);
            // Update order status in database
        } else {
            // Payment failed
            System.out.println("Payment failed for order: " + orderId);
            // Update order status in database
        }
    }
}
