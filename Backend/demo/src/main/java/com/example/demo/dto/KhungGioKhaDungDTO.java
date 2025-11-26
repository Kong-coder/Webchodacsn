package com.example.demo.dto;

import java.time.LocalTime;

public class KhungGioKhaDungDTO {
    private LocalTime gioBatDau;
    private LocalTime gioKetThuc;
    private boolean khaDung;
    private String lyDoKhongKhaDung;

    // Getters and Setters
    public LocalTime getGioBatDau() {
        return gioBatDau;
    }

    public void setGioBatDau(LocalTime gioBatDau) {
        this.gioBatDau = gioBatDau;
    }

    public LocalTime getGioKetThuc() {
        return gioKetThuc;
    }

    public void setGioKetThuc(LocalTime gioKetThuc) {
        this.gioKetThuc = gioKetThuc;
    }

    public boolean isKhaDung() {
        return khaDung;
    }

    public void setKhaDung(boolean khaDung) {
        this.khaDung = khaDung;
    }

    public String getLyDoKhongKhaDung() {
        return lyDoKhongKhaDung;
    }

    public void setLyDoKhongKhaDung(String lyDoKhongKhaDung) {
        this.lyDoKhongKhaDung = lyDoKhongKhaDung;
    }
}
