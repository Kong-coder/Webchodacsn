package com.example.demo.dto;

import com.example.demo.model.LoaiSanPham;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamDTO {
    private Long id;
    private String maSanPham;
    private String tenSanPham;
    private LoaiSanPham loaiSanPham;
    private Integer soLuongTon;
    private String donViTinh;
    private Integer tonKhoToiThieu;
    private BigDecimal giaNhap;
    private BigDecimal giaBan;
    private String moTa;
    private String hinhAnh;
    private Boolean trangThai;
    
    // Các trường thống kê (nếu cần)
    private Long soLuongDaBan;
    private BigDecimal doanhThu;
}
