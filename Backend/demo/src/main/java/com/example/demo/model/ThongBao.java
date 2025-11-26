package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "thong_bao")
public class ThongBao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tieuDe;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String noiDung;

    @Column(nullable = false)
    private String loai; // appointment, promotion, system, etc.

    @Column(nullable = false)
    private String bieuTuong; // calendar, check, gift, star, info

    @Column(nullable = false)
    private LocalDateTime thoiGianTao;

    private LocalDateTime thoiGianDoc;

    @Column(nullable = false)
    private boolean daDoc = false;

    @Column(nullable = false)
    private boolean quanTrong = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id", referencedColumnName = "ma_nguoi_dung", nullable = false)
    private NguoiDung nguoiDung;
    
    @Column(name = "nguoi_dung_id", insertable = false, updatable = false)
    private Integer nguoiDungId;

    @PrePersist
    protected void onCreate() {
        thoiGianTao = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTieuDe() {
        return tieuDe;
    }

    public void setTieuDe(String tieuDe) {
        this.tieuDe = tieuDe;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }

    public String getLoai() {
        return loai;
    }

    public void setLoai(String loai) {
        this.loai = loai;
    }

    public String getBieuTuong() {
        return bieuTuong;
    }

    public void setBieuTuong(String bieuTuong) {
        this.bieuTuong = bieuTuong;
    }

    public LocalDateTime getThoiGianTao() {
        return thoiGianTao;
    }

    public void setThoiGianTao(LocalDateTime thoiGianTao) {
        this.thoiGianTao = thoiGianTao;
    }

    public LocalDateTime getThoiGianDoc() {
        return thoiGianDoc;
    }

    public void setThoiGianDoc(LocalDateTime thoiGianDoc) {
        this.thoiGianDoc = thoiGianDoc;
    }

    public boolean isDaDoc() {
        return daDoc;
    }

    public void setDaDoc(boolean daDoc) {
        this.daDoc = daDoc;
    }

    public boolean isQuanTrong() {
        return quanTrong;
    }

    public void setQuanTrong(boolean quanTrong) {
        this.quanTrong = quanTrong;
    }

    public NguoiDung getNguoiDung() {
        return nguoiDung;
    }

    public void setNguoiDung(NguoiDung nguoiDung) {
        this.nguoiDung = nguoiDung;
    }
}