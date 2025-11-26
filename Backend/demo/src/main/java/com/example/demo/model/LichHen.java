package com.example.demo.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "lichhen")
public class LichHen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_lich_hen")
    private Integer maLichHen;

    @Column(name = "ma_nhan_vien")
    private Integer maNhanVien;

    @Column(name = "ma_dich_vu")
    private Integer maDichVu;

    @Column(name = "ma_combo")
    private Long maCombo;

    @Column(name = "ma_khach_hang")
    private Integer maKhachHang;

    @Column(name = "thoi_gian_hen", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime thoiGianHen;

    @Column(name = "trang_thai", length = 50, nullable = false)
    private String trangThai;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "ngay_tao", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    private OffsetDateTime ngayTao;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "ly_do_huy", columnDefinition = "TEXT")
    private String lyDoHuy;

    @Column(name = "thoi_gian_hen_moi", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime thoiGianHenMoi;

    @Column(name = "ghi_chu_nhan_vien", columnDefinition = "TEXT")
    private String ghiChuNhanVien;

    @Column(name = "tong_tien", columnDefinition = "NUMERIC(10,2) DEFAULT 0")
    private Double tongTien = 0.0;

    @Column(name = "phuong_thuc_thanh_toan", length = 100)
    private String phuongThucThanhToan;

    @Column(name = "thoi_gian_bat_dau", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime thoiGianBatDau;

    @Column(name = "thoi_gian_ket_thuc", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime thoiGianKetThuc;

    @Column(name = "ngay_cap_nhat", columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    private OffsetDateTime ngayCapNhat;

    // Constructors
    public LichHen() {
    }

    // Getters and Setters
    public Integer getMaLichHen() { 
        return maLichHen; 
    }
    
    public void setMaLichHen(Integer maLichHen) { 
        this.maLichHen = maLichHen; 
    }
    
    public Integer getMaNhanVien() { 
        return maNhanVien; 
    }
    
    public void setMaNhanVien(Integer maNhanVien) { 
        this.maNhanVien = maNhanVien; 
    }
    
    public Integer getMaDichVu() { 
        return maDichVu; 
    }
    
    public void setMaDichVu(Integer maDichVu) { 
        this.maDichVu = maDichVu; 
    }
    
    public Long getMaCombo() { 
        return maCombo; 
    }
    
    public void setMaCombo(Long maCombo) { 
        this.maCombo = maCombo; 
    }
    
    public Integer getMaKhachHang() { 
        return maKhachHang; 
    }
    
    public void setMaKhachHang(Integer maKhachHang) { 
        this.maKhachHang = maKhachHang; 
    }
    
    public OffsetDateTime getThoiGianHen() { 
        return thoiGianHen; 
    }
    
    public void setThoiGianHen(OffsetDateTime thoiGianHen) { 
        this.thoiGianHen = thoiGianHen; 
    }
    
    public String getTrangThai() { 
        return trangThai; 
    }
    
    public void setTrangThai(String trangThai) { 
        this.trangThai = trangThai; 
    }
    
    public String getGhiChu() { 
        return ghiChu; 
    }
    
    public void setGhiChu(String ghiChu) { 
        this.ghiChu = ghiChu; 
    }
    
    public OffsetDateTime getNgayTao() { 
        return ngayTao; 
    }
    
    public void setNgayTao(OffsetDateTime ngayTao) { 
        this.ngayTao = ngayTao; 
    }
    
    public Long getOrderId() { 
        return orderId; 
    }
    
    public void setOrderId(Long orderId) { 
        this.orderId = orderId; 
    }
    
    public String getLyDoHuy() { 
        return lyDoHuy; 
    }
    
    public void setLyDoHuy(String lyDoHuy) { 
        this.lyDoHuy = lyDoHuy; 
    }
    
    public OffsetDateTime getThoiGianHenMoi() { 
        return thoiGianHenMoi; 
    }
    
    public void setThoiGianHenMoi(OffsetDateTime thoiGianHenMoi) { 
        this.thoiGianHenMoi = thoiGianHenMoi; 
    }
    
    public String getGhiChuNhanVien() { 
        return ghiChuNhanVien; 
    }
    
    public void setGhiChuNhanVien(String ghiChuNhanVien) { 
        this.ghiChuNhanVien = ghiChuNhanVien; 
    }
    
    public Double getTongTien() { 
        return tongTien; 
    }
    
    public void setTongTien(Double tongTien) { 
        this.tongTien = tongTien; 
    }
    
    public String getPhuongThucThanhToan() { 
        return phuongThucThanhToan; 
    }
    
    public void setPhuongThucThanhToan(String phuongThucThanhToan) { 
        this.phuongThucThanhToan = phuongThucThanhToan; 
    }
    
    public OffsetDateTime getThoiGianBatDau() { 
        return thoiGianBatDau; 
    }
    
    public void setThoiGianBatDau(OffsetDateTime thoiGianBatDau) { 
        this.thoiGianBatDau = thoiGianBatDau; 
    }
    
    public OffsetDateTime getThoiGianKetThuc() { 
        return thoiGianKetThuc; 
    }
    
    public void setThoiGianKetThuc(OffsetDateTime thoiGianKetThuc) { 
        this.thoiGianKetThuc = thoiGianKetThuc; 
    }
    
    public OffsetDateTime getNgayCapNhat() {
        return ngayCapNhat;
    }

    public void setNgayCapNhat(OffsetDateTime ngayCapNhat) {
        this.ngayCapNhat = ngayCapNhat;
    }
    
    // Alias for getMaLichHen to match the expected method name in DatLichServiceImpl
    public Integer getId() { return getMaLichHen(); }
}
