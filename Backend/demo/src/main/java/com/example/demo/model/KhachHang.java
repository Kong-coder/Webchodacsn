package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "khach_hang")
public class KhachHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Reference to NguoiDung - this links to the user account
    @Column(name = "ma_nguoi_dung", unique = true)
    private Integer maNguoiDung;
    
    @Column(name = "ho_ten", nullable = false)
    private String hoTen;
    
    @Column(name = "so_dien_thoai")
    private String soDienThoai;
    
    @Column
    private String email;
    
    private String diaChi;
    private LocalDate ngaySinh;
    private boolean gioiTinh;
    private String avatar;
    private Integer diemTichLuy = 0;
    private BigDecimal tongChiTieu = BigDecimal.ZERO;
    private Integer soLanDen = 0;
    
    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;
    
    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;
    
    @Column(name = "trang_thai")
    private boolean trangThai = true;
    
    @Column(name = "ghi_chu")
    private String ghiChu;
    
    @PrePersist
    protected void onCreate() {
        this.ngayTao = LocalDateTime.now();
        this.ngayCapNhat = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.ngayCapNhat = LocalDateTime.now();
    }
    
    // Additional methods for business logic
    public void tangDiemTichLuy(int diem) {
        this.diemTichLuy += diem;
    }
    
    public void giamDiemTichLuy(int diem) {
        this.diemTichLuy = Math.max(0, this.diemTichLuy - diem);
    }
    
    public void capNhatChiTieu(BigDecimal soTien) {
        this.tongChiTieu = this.tongChiTieu.add(soTien);
    }
    
    public void tangSoLanDen() {
        this.soLanDen++;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    // Calculate customer status based on spending and visits
    @Transient
    public String getStatus() {
        if (tongChiTieu == null) {
            return "New";
        }
        // VIP: > 10 million VND or > 10 visits
        if (tongChiTieu.compareTo(new BigDecimal("10000000")) > 0 || soLanDen > 10) {
            return "VIP";
        }
        // Regular: > 1 million VND or > 3 visits
        if (tongChiTieu.compareTo(new BigDecimal("1000000")) > 0 || soLanDen > 3) {
            return "Regular";
        }
        // New: everyone else
        return "New";
    }
    
    // Transient fields for frontend (will be populated by service layer if needed)
    @Transient
    private String nextAppointment;
    
    @Transient
    private String lastVisit;
    
    @Transient
    private String favoriteService;
}
