package com.example.demo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "dichvu")
public class DichVu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_dich_vu")
    private Integer maDichVu;

    @Column(name = "ten_dich_vu", length = 200, nullable = false)
    private String tenDichVu;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "thoi_luong_phut")
    private Integer thoiLuongPhut;

    @Column(name = "gia", precision = 10, scale = 2)
    private BigDecimal gia;

    @Column(name = "co_san")
    private Boolean coSan;

    @Column(name = "hinh_anh", columnDefinition = "TEXT")
    private String hinhAnh;

    @Column(name = "loai")
    private String loai;

    public Integer getMaDichVu() { return maDichVu; }
    public void setMaDichVu(Integer maDichVu) { this.maDichVu = maDichVu; }
    public String getTenDichVu() { return tenDichVu; }
    public void setTenDichVu(String tenDichVu) { this.tenDichVu = tenDichVu; }
    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }
    public Integer getThoiLuongPhut() { return thoiLuongPhut; }
    public void setThoiLuongPhut(Integer thoiLuongPhut) { this.thoiLuongPhut = thoiLuongPhut; }
    public BigDecimal getGia() { return gia; }
    public void setGia(BigDecimal gia) { this.gia = gia; }
    public Boolean getCoSan() { return coSan; }
    public void setCoSan(Boolean coSan) { this.coSan = coSan; }
    public String getHinhAnh() { return hinhAnh; }
    public void setHinhAnh(String hinhAnh) { this.hinhAnh = hinhAnh; }

    public String getLoai() { return loai; }
    public void setLoai(String loai) { this.loai = loai; }
}
