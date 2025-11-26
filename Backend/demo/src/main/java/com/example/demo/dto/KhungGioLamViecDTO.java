package com.example.demo.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class KhungGioLamViecDTO {
    private Long id;
    private String tenCuaHang;
    private LocalTime gioMoCua;
    private LocalTime gioDongCua;
    private int khoangThoiGianMotLich; // phút
    private boolean active;
}
