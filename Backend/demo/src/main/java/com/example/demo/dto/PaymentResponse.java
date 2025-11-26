package com.example.demo.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentResponse {
    private boolean success;
    private String message;
    private String paymentId;
    private String orderId;
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentStatus; // PENDING, COMPLETED, FAILED, REFUNDED
    private String paymentUrl; // For redirecting to payment gateway
    private String qrCode; // For QR code payment
    private String errorCode;
    private String errorMessage;
}
