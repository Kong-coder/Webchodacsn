package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "khung_gio_lam_viec")
public class KhungGioLamViec {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "thoi_gian_bat_dau")
    private LocalTime thoiGianBatDau;

    @Column(name = "thoi_gian_ket_thuc")
    private LocalTime thoiGianKetThuc;
    
    @Column(name = "active")
    private Boolean active = true;

    // Getters and Setters
    
    public Boolean getActive() {
        return active;
    }
    
    public void setActive(Boolean active) {
        this.active = active;
    }
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public LocalTime getThoiGianBatDau() {
        return thoiGianBatDau;
    }

    public void setThoiGianBatDau(LocalTime thoiGianBatDau) {
        this.thoiGianBatDau = thoiGianBatDau;
    }

    public LocalTime getThoiGianKetThuc() {
        return thoiGianKetThuc;
    }

    public void setThoiGianKetThuc(LocalTime thoiGianKetThuc) {
        this.thoiGianKetThuc = thoiGianKetThuc;
    }

    // Additional methods needed by DatLichServiceImpl
    public LocalTime getGioMoCua() {
        return this.thoiGianBatDau;
    }

    public LocalTime getGioDongCua() {
        return this.thoiGianKetThuc;
    }

    public int getKhoangThoiGianMotLich() {
        // Default to 30 minutes if not specified
        return 30;
    }
}
