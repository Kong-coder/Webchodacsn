package com.example.demo.dto;

import java.math.BigDecimal;
import java.util.List;

public class CreateDonHangRequest {
    private Long khachHangId;
    private List<Muc> muc;
    private String ghiChu;

    public static class Muc {
        private String loaiMuc;
        private Long doiTuongId;
        private Integer soLuong;
        private BigDecimal donGia;

        public String getLoaiMuc() { return loaiMuc; }
        public void setLoaiMuc(String loaiMuc) { this.loaiMuc = loaiMuc; }
        public Long getDoiTuongId() { return doiTuongId; }
        public void setDoiTuongId(Long doiTuongId) { this.doiTuongId = doiTuongId; }
        public Integer getSoLuong() { return soLuong; }
        public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }
        public BigDecimal getDonGia() { return donGia; }
        public void setDonGia(BigDecimal donGia) { this.donGia = donGia; }
    }

    public Long getKhachHangId() { return khachHangId; }
    public void setKhachHangId(Long khachHangId) { this.khachHangId = khachHangId; }
    public List<Muc> getMuc() { return muc; }
    public void setMuc(List<Muc> muc) { this.muc = muc; }
    public String getGhiChu() { return ghiChu; }
    public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
}
