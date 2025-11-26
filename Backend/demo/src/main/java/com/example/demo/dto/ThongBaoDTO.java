package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ThongBaoDTO {
    private Long id;
    private String tieuDe;
    private String noiDung;
    private String loai;
    private String bieuTuong;
    private LocalDateTime thoiGianTao;
    private LocalDateTime thoiGianDoc;
    private boolean daDoc;
    private boolean quanTrong;
}
