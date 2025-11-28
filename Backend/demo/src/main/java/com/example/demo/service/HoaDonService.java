package com.example.demo.service;

import com.example.demo.dto.HoaDonResponse;
import com.example.demo.model.DonHang;
import com.example.demo.model.HoaDon;
import com.example.demo.repository.DonHangRepository;
import com.example.demo.repository.HoaDonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class HoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final DonHangRepository donHangRepository;

    public HoaDonService(HoaDonRepository hoaDonRepository, DonHangRepository donHangRepository) {
        this.hoaDonRepository = hoaDonRepository;
        this.donHangRepository = donHangRepository;
    }

    @Transactional
    public HoaDonResponse createByOrderId(Long orderId) {
        // If already exists, return existing
        HoaDon existing = hoaDonRepository.findByOrderId(orderId).orElse(null);
        if (existing != null) return map(existing);

        DonHang dh = donHangRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Đơn hàng không tồn tại"));

        HoaDon hd = new HoaDon();
        hd.setOrderId(orderId);
        // If you have lichhen id, set via other service later
        hd.setMaKhachHang(dh.getKhachHangId() == null ? null : dh.getKhachHangId().intValue());
        hd.setTongTien(dh.getTongTien());
        hd.setTrangThai("unpaid");
        hd.setPhuongThucThanhToan(null); // set when initiating payment
        hd.setNgayXuat(OffsetDateTime.now());

        hd = hoaDonRepository.save(hd);
        return map(hd);
    }

    @Transactional(readOnly = true)
    public HoaDonResponse getByOrderId(Long orderId) {
        HoaDon hd = hoaDonRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Hóa đơn không tồn tại cho đơn hàng"));
        return map(hd);
    }

    @Transactional
    public HoaDonResponse confirmPayment(Long orderId) {
        HoaDon hd = hoaDonRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Hóa đơn không tồn tại cho đơn hàng"));
        
        // Only confirm payment for CASH payments
        if (!"CASH".equalsIgnoreCase(hd.getPhuongThucThanhToan())) {
            throw new IllegalArgumentException("Chỉ có thể xác nhận thanh toán tiền mặt");
        }
        
        hd.setTrangThai("paid");
        hd = hoaDonRepository.save(hd);
        return map(hd);
    }

    private HoaDonResponse map(HoaDon e) {
        HoaDonResponse d = new HoaDonResponse();
        d.setMaHoaDon(e.getMaHoaDon());
        d.setOrderId(e.getOrderId());
        d.setMaKhachHang(e.getMaKhachHang());
        d.setMaLichHen(e.getMaLichHen());
        d.setTongTien(e.getTongTien());
        d.setTrangThai(e.getTrangThai());
        d.setPhuongThucThanhToan(e.getPhuongThucThanhToan());
        d.setNgayXuat(e.getNgayXuat());
        return d;
    }
}
