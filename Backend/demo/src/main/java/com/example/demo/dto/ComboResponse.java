package com.example.demo.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ComboResponse {
    private Long id;
    private String tenCombo;
    private String moTa;
    private BigDecimal gia;
    private Integer giamGia;
    private String trangThai;
    private List<Integer> dichVuIds = new ArrayList<>();
    private List<DichVuResponse> dichVus = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public List<Integer> getDichVuIds() {
        return dichVuIds;
    }

    public void setDichVuIds(List<Integer> dichVuIds) {
        this.dichVuIds = dichVuIds;
    }

    public List<DichVuResponse> getDichVus() {
        return dichVus;
    }

    public void setDichVus(List<DichVuResponse> dichVus) {
        this.dichVus = dichVus;
    }
}
