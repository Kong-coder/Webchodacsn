package com.example.demo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "hoadon")
public class HoaDon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_hoa_don")
    private Integer maHoaDon;

    @Column(name = "ma_lich_hen")
    private Integer maLichHen;

    @Column(name = "ma_khach_hang")
    private Integer maKhachHang;

    @Column(name = "tong_tien", precision = 10, scale = 2)
    private BigDecimal tongTien;

    @Column(name = "phuong_thuc_thanh_toan", length = 10)
    private String phuongThucThanhToan; // MOMO, CASH, ...

    @Column(name = "trang_thai", length = 50)
    private String trangThai; // unpaid, paid, void

    @Column(name = "ngay_xuat")
    private OffsetDateTime ngayXuat;

    @Column(name = "order_id")
    private Long orderId; // unique 1:1 to don_hang.id

    public Integer getMaHoaDon() { return maHoaDon; }
    public void setMaHoaDon(Integer maHoaDon) { this.maHoaDon = maHoaDon; }
    public Integer getMaLichHen() { return maLichHen; }
    public void setMaLichHen(Integer maLichHen) { this.maLichHen = maLichHen; }
    public Integer getMaKhachHang() { return maKhachHang; }
    public void setMaKhachHang(Integer maKhachHang) { this.maKhachHang = maKhachHang; }
    public BigDecimal getTongTien() { return tongTien; }
    public void setTongTien(BigDecimal tongTien) { this.tongTien = tongTien; }
    public String getPhuongThucThanhToan() { return phuongThucThanhToan; }
    public void setPhuongThucThanhToan(String phuongThucThanhToan) { this.phuongThucThanhToan = phuongThucThanhToan; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
    public OffsetDateTime getNgayXuat() { return ngayXuat; }
    public void setNgayXuat(OffsetDateTime ngayXuat) { this.ngayXuat = ngayXuat; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
}
