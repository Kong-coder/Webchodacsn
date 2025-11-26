package com.example.demo.service;

import com.example.demo.dto.QuanLyStatsResponse;
import com.example.demo.dto.QuanLyStatsResponse.TopService;
import com.example.demo.model.DichVu;
import com.example.demo.repository.DichVuRepository;
import com.example.demo.repository.HoaDonRepository;
import com.example.demo.repository.LichHenRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QuanLyStatsService {

    private final HoaDonRepository hoaDonRepository;
    private final DichVuRepository dichVuRepository;
    private final LichHenRepository lichHenRepository;

    public QuanLyStatsService(
            HoaDonRepository hoaDonRepository,
            DichVuRepository dichVuRepository,
            LichHenRepository lichHenRepository
    ) {
        this.hoaDonRepository = hoaDonRepository;
        this.dichVuRepository = dichVuRepository;
        this.lichHenRepository = lichHenRepository;
    }

    @Transactional(readOnly = true)
    public QuanLyStatsResponse getStats() {
        QuanLyStatsResponse stats = new QuanLyStatsResponse();

        // Tổng doanh thu (chỉ tính hóa đơn đã thanh toán)
        BigDecimal revenue = hoaDonRepository.sumTongTienByTrangThai("paid");
        stats.setTotalRevenue(revenue == null ? BigDecimal.ZERO : revenue);

        // Tổng dịch vụ đang hoạt động
        long totalServices = dichVuRepository.findByCoSanTrueOrderByMaDichVuAsc().size();
        stats.setTotalServices(totalServices);

        // Tổng lượt đặt (count lịch hẹn)
        long totalBookings = lichHenRepository.count();
        stats.setTotalBookings(totalBookings);

        // Top dịch vụ đặt nhiều nhất (top 5)
        List<Object[]> topServiceRows = lichHenRepository.findTopServices(PageRequest.of(0, 5));
        Map<Integer, DichVu> dichVuMap = new HashMap<>();
        List<TopService> topServices = new ArrayList<>();

        for (Object[] row : topServiceRows) {
            Integer serviceId = (Integer) row[0];
            long bookings = ((Number) row[1]).longValue();
            DichVu service = dichVuMap.computeIfAbsent(serviceId, id ->
                    dichVuRepository.findById(id).orElse(null));
            if (service == null) continue;

            TopService ts = new TopService();
            ts.setServiceId(service.getMaDichVu());
            ts.setServiceName(service.getTenDichVu());
            ts.setCategory(service.getLoai());
            ts.setPrice(service.getGia());
            ts.setBookings(bookings);

            // tính doanh thu giả định: giá * bookings (không trừ combo/discount do chưa có dữ liệu)
            BigDecimal price = service.getGia() == null ? BigDecimal.ZERO : service.getGia();
            ts.setRevenue(price.multiply(BigDecimal.valueOf(bookings)).setScale(0, RoundingMode.HALF_UP));

            topServices.add(ts);
        }

        stats.setTopServices(topServices);
        return stats;
    }
}
