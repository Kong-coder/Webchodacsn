package com.example.demo.dto;

import lombok.Data;

@Data
public class PasswordResetTokenRequest {
    private String token;
    private String newPassword;
}
