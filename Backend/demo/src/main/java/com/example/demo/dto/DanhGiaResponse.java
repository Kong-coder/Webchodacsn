package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DanhGiaResponse {
    private Long id;
    private Long dichVuId;
    private Long nguoiDungId;
    private String tenNguoiDung;
    private String avatarNguoiDung;
    private Integer diem;
    private String noiDung;
    private LocalDateTime thoiGianTao;
}
