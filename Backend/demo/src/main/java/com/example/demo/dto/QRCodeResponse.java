package com.example.demo.dto;

public class QRCodeResponse {
    private String token;
    private String qrCodeImage; // Base64 encoded image
    private String createdDate;
    private String expiresAt;

    public QRCodeResponse() {
    }

    public QRCodeResponse(String token, String qrCodeImage, String createdDate, String expiresAt) {
        this.token = token;
        this.qrCodeImage = qrCodeImage;
        this.createdDate = createdDate;
        this.expiresAt = expiresAt;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getQrCodeImage() {
        return qrCodeImage;
    }

    public void setQrCodeImage(String qrCodeImage) {
        this.qrCodeImage = qrCodeImage;
    }

    public String getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(String createdDate) {
        this.createdDate = createdDate;
    }

    public String getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(String expiresAt) {
        this.expiresAt = expiresAt;
    }
}
