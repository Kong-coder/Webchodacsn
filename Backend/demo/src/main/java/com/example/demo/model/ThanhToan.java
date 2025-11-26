package com.example.demo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "thanh_toan")
public class ThanhToan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hoa_don_id", nullable = false)
    private Integer hoaDonId; // FK -> hoadon.ma_hoa_don

    @Column(name = "nha_cung_cap", length = 16, nullable = false)
    private String nhaCungCap; // MOMO, CASH

    @Column(name = "so_tien", precision = 18, scale = 2)
    private BigDecimal soTien;

    @Column(name = "tien_te", length = 8)
    private String tienTe;

    @Column(name = "trang_thai", length = 16)
    private String trangThai; // init, success, failed, refunded

    @Column(name = "ma_giao_dich_ncc", length = 64)
    private String maGiaoDichNcc;

    @Column(name = "request_id", length = 64)
    private String requestId;

    @Column(name = "trans_id", length = 64)
    private String transId;

    @Column(name = "loai_thanh_toan", length = 32)
    private String loaiThanhToan;

    @Column(name = "thong_diep", length = 255)
    private String thongDiep;

    @Column(name = "tao_luc")
    private OffsetDateTime taoLuc;

    @Column(name = "cap_nhat_luc")
    private OffsetDateTime capNhatLuc;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getHoaDonId() { return hoaDonId; }
    public void setHoaDonId(Integer hoaDonId) { this.hoaDonId = hoaDonId; }
    public String getNhaCungCap() { return nhaCungCap; }
    public void setNhaCungCap(String nhaCungCap) { this.nhaCungCap = nhaCungCap; }
    public BigDecimal getSoTien() { return soTien; }
    public void setSoTien(BigDecimal soTien) { this.soTien = soTien; }
    public String getTienTe() { return tienTe; }
    public void setTienTe(String tienTe) { this.tienTe = tienTe; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
    public String getMaGiaoDichNcc() { return maGiaoDichNcc; }
    public void setMaGiaoDichNcc(String maGiaoDichNcc) { this.maGiaoDichNcc = maGiaoDichNcc; }
    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
    public String getTransId() { return transId; }
    public void setTransId(String transId) { this.transId = transId; }
    public String getLoaiThanhToan() { return loaiThanhToan; }
    public void setLoaiThanhToan(String loaiThanhToan) { this.loaiThanhToan = loaiThanhToan; }
    public String getThongDiep() { return thongDiep; }
    public void setThongDiep(String thongDiep) { this.thongDiep = thongDiep; }
    public OffsetDateTime getTaoLuc() { return taoLuc; }
    public void setTaoLuc(OffsetDateTime taoLuc) { this.taoLuc = taoLuc; }
    public OffsetDateTime getCapNhatLuc() { return capNhatLuc; }
    public void setCapNhatLuc(OffsetDateTime capNhatLuc) { this.capNhatLuc = capNhatLuc; }
}
