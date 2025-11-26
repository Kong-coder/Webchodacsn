package com.example.demo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "combo")
public class Combo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_combo")
    private Long id;

    @Column(name = "ten_combo", nullable = false, length = 200)
    private String tenCombo;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "gia", precision = 12, scale = 2, nullable = false)
    private BigDecimal gia;

    @Column(name = "giam_gia")
    private Integer giamGia;

    @Column(name = "trang_thai", length = 50)
    private String trangThai;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "combo_dichvu",
            joinColumns = @JoinColumn(name = "ma_combo", referencedColumnName = "ma_combo"),
            inverseJoinColumns = @JoinColumn(name = "ma_dich_vu", referencedColumnName = "ma_dich_vu")
    )
    private Set<DichVu> dichVus = new HashSet<>();

    public Combo() {
        this.trangThai = "active";
    }

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

    public Set<DichVu> getDichVus() {
        return dichVus;
    }

    public void setDichVus(Set<DichVu> dichVus) {
        this.dichVus = dichVus;
    }
}
