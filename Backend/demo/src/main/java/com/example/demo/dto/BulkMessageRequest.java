package com.example.demo.dto;

import lombok.Data;

import java.util.List;

@Data
public class BulkMessageRequest {
    private String messageType;
    private String content;
    private boolean sendSMS;
    private boolean sendEmail;
    private List<Long> customerIds;
    private String filterStatus;
}
