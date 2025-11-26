package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class HoaDonResponse {
    private Integer maHoaDon;
    private Long orderId;
    private Integer maKhachHang;
    private Integer maLichHen;
    private BigDecimal tongTien;
    private String trangThai;
    private String phuongThucThanhToan;
    private OffsetDateTime ngayXuat;

    public Integer getMaHoaDon() { return maHoaDon; }
    public void setMaHoaDon(Integer maHoaDon) { this.maHoaDon = maHoaDon; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Integer getMaKhachHang() { return maKhachHang; }
    public void setMaKhachHang(Integer maKhachHang) { this.maKhachHang = maKhachHang; }
    public Integer getMaLichHen() { return maLichHen; }
    public void setMaLichHen(Integer maLichHen) { this.maLichHen = maLichHen; }
    public BigDecimal getTongTien() { return tongTien; }
    public void setTongTien(BigDecimal tongTien) { this.tongTien = tongTien; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
    public String getPhuongThucThanhToan() { return phuongThucThanhToan; }
    public void setPhuongThucThanhToan(String phuongThucThanhToan) { this.phuongThucThanhToan = phuongThucThanhToan; }
    public OffsetDateTime getNgayXuat() { return ngayXuat; }
    public void setNgayXuat(OffsetDateTime ngayXuat) { this.ngayXuat = ngayXuat; }
}
