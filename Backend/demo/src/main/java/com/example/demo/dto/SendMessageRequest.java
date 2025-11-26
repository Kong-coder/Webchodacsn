package com.example.demo.dto;

import lombok.Data;

@Data
public class SendMessageRequest {
    private Long customerId;
    private String messageType;
    private String content;
    private boolean sendSMS;
    private boolean sendEmail;
}
