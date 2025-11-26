package com.example.demo.dto;

import java.math.BigDecimal;
import java.util.Set;

public class ComboRequest {
    private String tenCombo;
    private String moTa;
    private BigDecimal gia;
    private Integer giamGia;
    private String trangThai;
    private Set<Integer> dichVuIds;

    public String getTenCombo() {
        return tenCombo;
    }

    public void setTenCombo(String tenCombo) {
        this.tenCombo = tenCombo;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }

    public BigDecimal getGia() {
        return gia;
    }

    public void setGia(BigDecimal gia) {
        this.gia = gia;
    }

    public Integer getGiamGia() {
        return giamGia;
    }

    public void setGiamGia(Integer giamGia) {
        this.giamGia = giamGia;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public Set<Integer> getDichVuIds() {
        return dichVuIds;
    }

    public void setDichVuIds(Set<Integer> dichVuIds) {
        this.dichVuIds = dichVuIds;
    }
}
