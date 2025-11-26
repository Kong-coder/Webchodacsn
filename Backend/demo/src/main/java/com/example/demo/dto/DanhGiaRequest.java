package com.example.demo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class DanhGiaRequest {
    @NotNull(message = "Mã dịch vụ không được để trống")
    private Long dichVuId;
    
    @NotNull(message = "Điểm đánh giá không được để trống")
    @Min(value = 1, message = "Điểm đánh giá tối thiểu là 1")
    @Max(value = 5, message = "Điểm đánh giá tối đa là 5")
    private Integer diem;
    
    @Size(max = 500, message = "Nội dung đánh giá không vượt quá 500 ký tự")
    private String noiDung;

    public Long getDichVuId() {
        return dichVuId;
    }

    public void setDichVuId(Long dichVuId) {
        this.dichVuId = dichVuId;
    }

    public Integer getDiem() {
        return diem;
    }

    public void setDiem(Integer diem) {
        this.diem = diem;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }
}