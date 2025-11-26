package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public class DonHangResponse {
    private Long donHangId;
    private BigDecimal tongTien;
    private String trangThai;
    private OffsetDateTime taoLuc;
    private List<Item> muc;

    public static class Item {
        private String loaiMuc;
        private Long doiTuongId;
        private Integer soLuong;
        private BigDecimal donGia;
        private BigDecimal thanhTien;

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

    public Long getDonHangId() { return donHangId; }
    public void setDonHangId(Long donHangId) { this.donHangId = donHangId; }
    public BigDecimal getTongTien() { return tongTien; }
    public void setTongTien(BigDecimal tongTien) { this.tongTien = tongTien; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
    public OffsetDateTime getTaoLuc() { return taoLuc; }
    public void setTaoLuc(OffsetDateTime taoLuc) { this.taoLuc = taoLuc; }
    public List<Item> getMuc() { return muc; }
    public void setMuc(List<Item> muc) { this.muc = muc; }
}
