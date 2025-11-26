package com.example.demo.dto;

import java.time.OffsetDateTime;

public class LichHenActionRequest {
    private String action;
    private String lyDoHuy;
    private OffsetDateTime thoiGianHenMoi;
    private String ghiChuNhanVien;
    private String ghiChu;

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
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

    public String getGhiChu() {
        return ghiChu;
    }

    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }
}
