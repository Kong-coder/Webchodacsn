package com.example.demo.service;

import com.example.demo.dto.CreateDonHangRequest;
import com.example.demo.dto.DonHangResponse;
import com.example.demo.model.DonHang;
import com.example.demo.model.DonHangMuc;
import com.example.demo.repository.DonHangMucRepository;
import com.example.demo.repository.DonHangRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DonHangService {

    private final DonHangRepository donHangRepository;
    private final DonHangMucRepository donHangMucRepository;

    public DonHangService(DonHangRepository donHangRepository, DonHangMucRepository donHangMucRepository) {
        this.donHangRepository = donHangRepository;
        this.donHangMucRepository = donHangMucRepository;
    }

    @Transactional
    public DonHangResponse createDonHang(CreateDonHangRequest req) {
        DonHang dh = new DonHang();
        dh.setKhachHangId(req.getKhachHangId());
        dh.setTrangThai("draft");
        dh.setTaoLuc(OffsetDateTime.now());
        dh.setCapNhatLuc(OffsetDateTime.now());
        dh.setTongTien(BigDecimal.ZERO);
        dh = donHangRepository.save(dh);

        BigDecimal tong = BigDecimal.ZERO;
        if (req.getMuc() != null) {
            for (CreateDonHangRequest.Muc m : req.getMuc()) {
                DonHangMuc muc = new DonHangMuc();
                muc.setDonHang(dh);
                muc.setLoaiMuc(m.getLoaiMuc());
                muc.setDoiTuongId(m.getDoiTuongId());
                muc.setSoLuong(m.getSoLuong());
                muc.setDonGia(m.getDonGia());
                BigDecimal thanhTien = m.getDonGia().multiply(BigDecimal.valueOf(m.getSoLuong()));
                muc.setThanhTien(thanhTien);
                donHangMucRepository.save(muc);
                tong = tong.add(thanhTien);
            }
        }
        dh.setTongTien(tong);
        dh.setCapNhatLuc(OffsetDateTime.now());
        donHangRepository.save(dh);

        return mapToResponse(dh);
    }

    @Transactional(readOnly = true)
    public DonHangResponse getById(Long id) {
        DonHang dh = donHangRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Đơn hàng không tồn tại"));
        return mapToResponse(dh);
    }

    @Transactional(readOnly = true)
    public List<DonHangResponse> getAll() {
        List<DonHang> donHangs = donHangRepository.findAll();
        return donHangs.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    private DonHangResponse mapToResponse(DonHang dh) {
        DonHangResponse res = new DonHangResponse();
        res.setDonHangId(dh.getId());
        res.setTongTien(dh.getTongTien());
        res.setTrangThai(dh.getTrangThai());
        res.setTaoLuc(dh.getTaoLuc());

        List<DonHangResponse.Item> items = dh.getMuc() == null ? List.of() : dh.getMuc().stream().map(m -> {
            DonHangResponse.Item it = new DonHangResponse.Item();
            it.setLoaiMuc(m.getLoaiMuc());
            it.setDoiTuongId(m.getDoiTuongId());
            it.setSoLuong(m.getSoLuong());
            it.setDonGia(m.getDonGia());
            it.setThanhTien(m.getThanhTien());
            return it;
        }).collect(Collectors.toList());
        res.setMuc(items);
        return res;
    }
}
