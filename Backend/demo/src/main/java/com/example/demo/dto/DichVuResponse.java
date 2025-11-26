package com.example.demo.dto;

import java.math.BigDecimal;

public class DichVuResponse {
    private Integer id;
    private String ten;
    private String moTa;
    private Integer thoiLuongPhut;
    private BigDecimal gia;
    private Boolean coSan;
    private String hinhAnh;
    private String loai;
    private Long bookings;  // Số lượt đặt
    private BigDecimal revenue;  // Doanh thu

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getTen() { return ten; }
    public void setTen(String ten) { this.ten = ten; }
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
    public Long getBookings() { return bookings; }
    public void setBookings(Long bookings) { this.bookings = bookings; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
}
