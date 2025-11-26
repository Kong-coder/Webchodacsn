package com.example.demo.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "don_hang")
public class DonHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "khach_hang_id", nullable = false)
    private Long khachHangId; // FK -> nguoi_dung.ma_nguoi_dung

    @Column(name = "tong_tien", nullable = false)
    private java.math.BigDecimal tongTien;

    @Column(name = "trang_thai", nullable = false)
    private String trangThai;

    @Column(name = "tao_luc")
    private OffsetDateTime taoLuc;

    @Column(name = "cap_nhat_luc")
    private OffsetDateTime capNhatLuc;

    @OneToMany(mappedBy = "donHang", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DonHangMuc> muc = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getKhachHangId() { return khachHangId; }
    public void setKhachHangId(Long khachHangId) { this.khachHangId = khachHangId; }

    public java.math.BigDecimal getTongTien() { return tongTien; }
    public void setTongTien(java.math.BigDecimal tongTien) { this.tongTien = tongTien; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public OffsetDateTime getTaoLuc() { return taoLuc; }
    public void setTaoLuc(OffsetDateTime taoLuc) { this.taoLuc = taoLuc; }

    public OffsetDateTime getCapNhatLuc() { return capNhatLuc; }
    public void setCapNhatLuc(OffsetDateTime capNhatLuc) { this.capNhatLuc = capNhatLuc; }

    public List<DonHangMuc> getMuc() { return muc; }
    public void setMuc(List<DonHangMuc> muc) { this.muc = muc; }
}
