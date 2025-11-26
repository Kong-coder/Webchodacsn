package com.example.demo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "don_hang_muc")
public class DonHangMuc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "don_hang_id", nullable = false)
    private DonHang donHang;

    @Column(name = "loai_muc", nullable = false)
    private String loaiMuc; // product | service

    @Column(name = "doi_tuong_id", nullable = false)
    private Long doiTuongId; // id của sanpham/dichvu

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "don_gia", nullable = false)
    private BigDecimal donGia;

    @Column(name = "thanh_tien", nullable = false)
    private BigDecimal thanhTien;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DonHang getDonHang() { return donHang; }
    public void setDonHang(DonHang donHang) { this.donHang = donHang; }

    public String getLoaiMuc() { return loaiMuc; }
    public void setLoaiMuc(String loaiMuc) { this.loaiMuc = loaiMuc; }

    public Long getDoiTuongId() { return doiTuongId; }
    public void setDoiTuongId(Long doiTuongId) { this.doiTuongId = doiTuongId; }

    public Integer getSoLuong() { return soLuong; }
    public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }

    public BigDecimal getDonGia() { return donGia; }
    public void setDonGia(BigDecimal donGia) { this.donGia = donGia; }

    public BigDecimal getThanhTien() { return thanhTien; }
    public void setThanhTien(BigDecimal thanhTien) { this.thanhTien = thanhTien; }
}
