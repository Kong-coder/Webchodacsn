package com.example.demo.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "nguoi_dung")
public class NguoiDung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_nguoi_dung")
    private Integer maNguoiDung;

    @ManyToOne(fetch = jakarta.persistence.FetchType.EAGER)
    @JoinColumn(name = "ma_vai_tro", nullable = false)
    private VaiTro vaiTro;

    @Column(name = "ten_dang_nhap", unique = true, nullable = false)
    private String tenDangNhap;

    @Column(name = "mat_khau_bam", nullable = false)
    private String matKhauBam;

    @Column(name = "ho_ten", nullable = false)
    private String hoTen;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "so_dien_thoai")
    private String soDienThoai;

    @Column(name = "dia_chi")
    private String diaChi;

    @Column(name = "ngay_tao", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime ngayTao;

    @Column(name = "dang_hoat_dong")
    private boolean dangHoatDong;

    @Column(name = "ngay_sinh")
    private java.time.LocalDate ngaySinh;

    @Column(name = "gioi_tinh")
    private String gioiTinh;

    @Column(name = "avatar")
    private String avatar;
    
    @Column(name = "vip")
    private boolean vip = false;
    
    @Column(name = "diem_tich_luy", nullable = false, columnDefinition = "NUMERIC(10,2) DEFAULT 0")
    private BigDecimal diemTichLuy = BigDecimal.ZERO;
    
    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;
    
    @Column(name = "so_lan_den")
    private Integer soLanDen = 0;
    
    @Column(name = "tong_tien_chi_tieu", nullable = false, columnDefinition = "NUMERIC(15,2) DEFAULT 0")
    private BigDecimal tongTienChiTieu = BigDecimal.ZERO;
    
    @Column(name = "dich_vu_yeu_thich")
    private String dichVuYeuThich;
    
    @Column(name = "chuc_vu")
    private String chucVu;
    
    @Column(name = "loai_hop_dong")
    private String loaiHopDong;
    
    @Column(name = "ngay_bat_dau")
    private LocalDate ngayBatDau;
    
    @Column(name = "luong_co_ban", columnDefinition = "NUMERIC(15,2) DEFAULT 0")
    private BigDecimal luongCoBan = BigDecimal.ZERO;
    
    @Column(name = "thuong", columnDefinition = "NUMERIC(15,2) DEFAULT 0")
    private BigDecimal thuong = BigDecimal.ZERO;
    
    @Column(name = "luong_gio", columnDefinition = "NUMERIC(10,2) DEFAULT 0")
    private BigDecimal luongGio = BigDecimal.ZERO;
    
    @Column(name = "nhan_vien_yeu_thich")
    private String nhanVienYeuThich;
    
    @Column(name = "lan_cuoi_den")
    private LocalDate lanCuoiDen;
    
    @Column(name = "anh_dai_dien")
    private String anhDaiDien;

    // Getters and Setters
    public boolean isVip() {
        return vip;
    }
    
    public void setVip(boolean vip) {
        this.vip = vip;
    }
    
    public BigDecimal getDiemTichLuy() {
        return diemTichLuy;
    }
    
    public void setDiemTichLuy(BigDecimal diemTichLuy) {
        this.diemTichLuy = diemTichLuy;
    }
    
    public String getGhiChu() {
        return ghiChu;
    }
    
    public void setGhiChu(String ghiChu) {
        this.ghiChu = ghiChu;
    }
    
    public Integer getSoLanDen() {
        return soLanDen;
    }
    
    public void setSoLanDen(Integer soLanDen) {
        this.soLanDen = soLanDen;
    }
    
    public BigDecimal getTongTienChiTieu() {
        return tongTienChiTieu;
    }
    
    public void setTongTienChiTieu(BigDecimal tongTienChiTieu) {
        this.tongTienChiTieu = tongTienChiTieu;
    }
    
    public String getDichVuYeuThich() {
        return dichVuYeuThich;
    }
    
    public void setDichVuYeuThich(String dichVuYeuThich) {
        this.dichVuYeuThich = dichVuYeuThich;
    }
    
    public String getNhanVienYeuThich() {
        return nhanVienYeuThich;
    }
    
    public void setNhanVienYeuThich(String nhanVienYeuThich) {
        this.nhanVienYeuThich = nhanVienYeuThich;
    }
    
    public LocalDate getLanCuoiDen() {
        return lanCuoiDen;
    }
    
    public void setLanCuoiDen(LocalDate lanCuoiDen) {
        this.lanCuoiDen = lanCuoiDen;
    }
    
    public String getAnhDaiDien() {
        return anhDaiDien;
    }
    
    public void setAnhDaiDien(String anhDaiDien) {
        this.anhDaiDien = anhDaiDien;
    }

    public String getChucVu() {
        return chucVu;
    }

    public void setChucVu(String chucVu) {
        this.chucVu = chucVu;
    }

    public String getLoaiHopDong() {
        return loaiHopDong;
    }

    public void setLoaiHopDong(String loaiHopDong) {
        this.loaiHopDong = loaiHopDong;
    }

    public LocalDate getNgayBatDau() {
        return ngayBatDau;
    }

    public void setNgayBatDau(LocalDate ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }

    public BigDecimal getLuongCoBan() {
        return luongCoBan;
    }

    public void setLuongCoBan(BigDecimal luongCoBan) {
        this.luongCoBan = luongCoBan;
    }

    public BigDecimal getThuong() {
        return thuong;
    }

    public void setThuong(BigDecimal thuong) {
        this.thuong = thuong;
    }

    public BigDecimal getLuongGio() {
        return luongGio;
    }

    public void setLuongGio(BigDecimal luongGio) {
        this.luongGio = luongGio;
    }

    @JsonProperty("role")
    public String getRoleName() {
        if (vaiTro == null) return null;
        Integer code = vaiTro.getMaVaiTro();
        if (Integer.valueOf(3).equals(code)) {
            return "QuanLy";
        } else if (Integer.valueOf(2).equals(code)) {
            return "NhanVien";
        }
        return "KhachHang";
    }

    @JsonProperty("birthDate")
    public java.time.LocalDate getNgaySinh() {
        return ngaySinh;
    }

    public void setNgaySinh(java.time.LocalDate ngaySinh) {
        this.ngaySinh = ngaySinh;
    }

    @JsonProperty("gender")
    public String getGioiTinh() {
        return gioiTinh;
    }

    public void setGioiTinh(String gioiTinh) {
        this.gioiTinh = gioiTinh;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Integer getMaNguoiDung() {
        return maNguoiDung;
    }

    public void setMaNguoiDung(Integer maNguoiDung) {
        this.maNguoiDung = maNguoiDung;
    }

    @JsonIgnore
    public VaiTro getVaiTro() {
        return vaiTro;
    }

    public void setVaiTro(VaiTro vaiTro) {
        this.vaiTro = vaiTro;
    }

    public String getTenDangNhap() {
        return tenDangNhap;
    }

    public void setTenDangNhap(String tenDangNhap) {
        this.tenDangNhap = tenDangNhap;
    }

    public String getMatKhauBam() {
        return matKhauBam;
    }

    public void setMatKhauBam(String matKhauBam) {
        this.matKhauBam = matKhauBam;
    }

    @JsonProperty("fullName")
    public String getHoTen() {
        return hoTen;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @JsonProperty("phone")
    public String getSoDienThoai() {
        return soDienThoai;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }

    @JsonProperty("address")
    public String getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
    }

    public OffsetDateTime getNgayTao() {
        return ngayTao;
    }

    public void setNgayTao(OffsetDateTime ngayTao) {
        this.ngayTao = ngayTao;
    }

    public boolean isDangHoatDong() {
        return dangHoatDong;
    }

    public void setDangHoatDong(boolean dangHoatDong) {
        this.dangHoatDong = dangHoatDong;
    }
}
