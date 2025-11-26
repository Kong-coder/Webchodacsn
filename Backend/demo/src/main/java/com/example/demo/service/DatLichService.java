package com.example.demo.service;

import com.example.demo.dto.DatLichRequest;
import com.example.demo.dto.DatLichResponse;
import com.example.demo.dto.KhungGioKhaDungDTO;

import java.time.LocalDate;
import java.util.List;

public interface DatLichService {
    
    /**
     * Tạo mới một lịch hẹn
     */
    DatLichResponse datLich(DatLichRequest request);
    
    /**
     * Lấy danh sách các khung giờ khả dụng trong ngày
     * @param ngay Ngày cần kiểm tra
     * @param dichVuId ID dịch vụ
     * @param thoiGianThucHien Thời gian thực hiện ước tính (phút)
     * @return Danh sách các khung giờ khả dụng
     */
    List<KhungGioKhaDungDTO> getKhungGioKhaDung(LocalDate ngay, Long dichVuId, int thoiGianThucHien);
    
    /**
     * Lấy thông tin chi tiết lịch hẹn
     */
    DatLichResponse getChiTietDatLich(Long id);
    
    /**
     * Hủy lịch hẹn
     */
    void huyDatLich(Long id, String lyDo);
    
    /**
     * Lấy danh sách lịch hẹn của khách hàng hiện tại
     */
    java.util.List<DatLichResponse> getMyAppointments();
    
    /**
     * Lấy tất cả lịch hẹn (cho nhân viên)
     */
    java.util.List<DatLichResponse> getAllAppointments();
    
    /**
     * Xác nhận lịch hẹn (cho nhân viên)
     */
    DatLichResponse xacNhanLichHen(Long id);
    
    /**
     * Từ chối lịch hẹn (cho nhân viên)
     */
    void tuChoiLichHen(Long id, String lyDo);
    
    /**
     * Cập nhật lịch hẹn (cho khách hàng)
     * Sau khi cập nhật, trạng thái sẽ quay về CHO_XAC_NHAN để nhân viên duyệt lại
     */
    DatLichResponse capNhatLichHen(Long id, DatLichRequest request);
    
    /**
     * Hoàn thành lịch hẹn và tự động trừ sản phẩm
     */
    DatLichResponse hoanThanhLichHen(Long id);
}
