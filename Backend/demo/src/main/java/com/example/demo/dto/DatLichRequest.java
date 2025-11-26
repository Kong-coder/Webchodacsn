package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

public class DatLichRequest {
    private Long dichVuId;
    private Long goiDichVuId;
    private Long comboId; // Alias for goiDichVuId
    private LocalDateTime thoiGianBatDau;
    private LocalDateTime thoiGianKetThuc;
    private String ghiChu;
    private String phuongThucThanhToan;
    private Double tongTien;
    private Double giamGia;
    private Double thanhTien;
    private List<Long> danhSachDichVuId;

    public Long getDichVuId() {
        return dichVuId;
    }

    public void setDichVuId(Long dichVuId) {
        this.dichVuId = dichVuId;
    }

    public Long getGoiDichVuId() {
        return goiDichVuId;
    }

    public void setGoiDichVuId(Long goiDichVuId) {
        this.goiDichVuId = goiDichVuId;
    }

    public LocalDateTime getThoiGianBatDau() {
        return thoiGianBatDau;
    }

    public void setThoiGianBatDau(LocalDateTime thoiGianBatDau) {
        this.thoiGianBatDau = thoiGianBatDau;
    }

    public LocalDateTime getThoiGianKetThuc() {
        return thoiGianKetThuc;
    }

    public void setThoiGianKetThuc(LocalDateTime thoiGianKetThuc) {
        this.thoiGianKetThuc = thoiGianKetThuc;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public String getPhuongThucThanhToan() {
        return phuongThucThanhToan;
    }

    public void setPhuongThucThanhToan(String phuongThucThanhToan) {
        this.phuongThucThanhToan = phuongThucThanhToan;
    }

    public Double getTongTien() {
        return tongTien;
    }

    public void setTongTien(Double tongTien) {
        this.tongTien = tongTien;
    }

    public Double getGiamGia() {
        return giamGia;
    }

    public void setGiamGia(Double giamGia) {
        this.giamGia = giamGia;
    }

    public Double getThanhTien() {
        return thanhTien;
    }

    public void setThanhTien(Double thanhTien) {
        this.thanhTien = thanhTien;
    }

    public List<Long> getDanhSachDichVuId() {
        return danhSachDichVuId;
    }

    public void setDanhSachDichVuId(List<Long> danhSachDichVuId) {
        this.danhSachDichVuId = danhSachDichVuId;
    }

    public Long getComboId() {
        return comboId;
    }

    public void setComboId(Long comboId) {
        this.comboId = comboId;
        // Also set goiDichVuId for backward compatibility
        if (comboId != null) {
            this.goiDichVuId = comboId;
        }
    }
}