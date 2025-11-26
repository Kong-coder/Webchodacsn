package com.example.demo.dto;

import java.time.OffsetDateTime;

public class LichHenRequest {
    private Integer maNhanVien;
    private Integer maDichVu;
    private Integer maKhachHang;
    private OffsetDateTime thoiGianHen;
    private String trangThai;
    private String ghiChu;
    private String lyDoHuy;
    private OffsetDateTime thoiGianHenMoi;
    private String ghiChuNhanVien;

    public Integer getMaNhanVien() {
        return maNhanVien;
    }

    public void setMaNhanVien(Integer maNhanVien) {
        this.maNhanVien = maNhanVien;
    }

    public Integer getMaDichVu() {
        return maDichVu;
    }

    public void setMaDichVu(Integer maDichVu) {
        this.maDichVu = maDichVu;
    }

    public Integer getMaKhachHang() {
        return maKhachHang;
    }

    public void setMaKhachHang(Integer maKhachHang) {
        this.maKhachHang = maKhachHang;
    }

    public OffsetDateTime getThoiGianHen() {
        return thoiGianHen;
    }

    public void setThoiGianHen(OffsetDateTime thoiGianHen) {
        this.thoiGianHen = thoiGianHen;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }

    public String getLyDoHuy() {
        return lyDoHuy;
    }

    public void setLyDoHuy(String lyDoHuy) {
        this.lyDoHuy = lyDoHuy;
    }

    public OffsetDateTime getThoiGianHenMoi() {
        return thoiGianHenMoi;
    }

    public void setThoiGianHenMoi(OffsetDateTime thoiGianHenMoi) {
        this.thoiGianHenMoi = thoiGianHenMoi;
    }

    public String getGhiChuNhanVien() {
        return ghiChuNhanVien;
    }

    public void setGhiChuNhanVien(String ghiChuNhanVien) {
        this.ghiChuNhanVien = ghiChuNhanVien;
    }
}