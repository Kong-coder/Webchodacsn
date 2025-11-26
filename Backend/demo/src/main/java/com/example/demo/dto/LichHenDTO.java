package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LichHenDTO {
    private Integer maLichHen;
    private Integer maNhanVien;
    private Integer maDichVu;
    private Integer maKhachHang;
    private String tenKhachHang;
    private String soDienThoai;
    private String email;
    private String tenDichVu;
    private String tenNhanVien;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime thoiGianHen;
    
    private String trangThai;
    private String ghiChu;
    private Double giaTien;
    private Integer thoiGianThucHien; // in minutes
    private String hinhAnh;
    private String danhMuc;
}
