package com.example.demo.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private String orderId;
    private String orderInfo;
    private BigDecimal amount;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String returnUrl;
    private String notifyUrl;
    private String paymentMethod; // MOMO, VNPAY, CASH
    private Long appointmentId; // Optional: for appointment payment
}
