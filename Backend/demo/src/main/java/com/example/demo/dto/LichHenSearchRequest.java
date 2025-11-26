package com.example.demo.dto;

import java.time.OffsetDateTime;
import java.util.List;

public class LichHenSearchRequest {
    private OffsetDateTime from;
    private OffsetDateTime to;
    private List<String> trangThais;
    private Integer maNhanVien;
    private Integer maKhachHang;

    public OffsetDateTime getFrom() {
        return from;
    }

    public void setFrom(OffsetDateTime from) {
        this.from = from;
    }

    public OffsetDateTime getTo() {
        return to;
    }

    public void setTo(OffsetDateTime to) {
        this.to = to;
    }

    public List<String> getTrangThais() {
        return trangThais;
    }

    public void setTrangThais(List<String> trangThais) {
        this.trangThais = trangThais;
    }

    public Integer getMaNhanVien() {
        return maNhanVien;
    }

    public void setMaNhanVien(Integer maNhanVien) {
        this.maNhanVien = maNhanVien;
    }

    public Integer getMaKhachHang() {
        return maKhachHang;
    }

    public void setMaKhachHang(Integer maKhachHang) {
        this.maKhachHang = maKhachHang;
    }
}
