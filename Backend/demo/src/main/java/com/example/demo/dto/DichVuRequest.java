package com.example.demo.dto;

import java.math.BigDecimal;

public class DichVuRequest {
    private String tenDichVu;
    private String moTa;
    private Integer thoiLuongPhut;
    private BigDecimal gia;
    private Boolean coSan;
    private String hinhAnh;
    private String loai;

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
