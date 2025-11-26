package com.example.demo.dto;

public class BookingAssignment {
    private Long orderId;
    private Integer lichHenId;
    private Integer maNhanVien;
    private String ghiChuNhanVien;

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Integer getLichHenId() {
        return lichHenId;
    }

    public void setLichHenId(Integer lichHenId) {
        this.lichHenId = lichHenId;
    }

    public Integer getMaNhanVien() {
        return maNhanVien;
    }

    public void setMaNhanVien(Integer maNhanVien) {
        this.maNhanVien = maNhanVien;
    }

    public String getGhiChuNhanVien() {
        return ghiChuNhanVien;
    }

    public void setGhiChuNhanVien(String ghiChuNhanVien) {
        this.ghiChuNhanVien = ghiChuNhanVien;
    }
}
