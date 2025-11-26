package com.example.demo.service;

import com.example.demo.dto.DanhGiaRequest;
import com.example.demo.dto.DanhGiaResponse;
import com.example.demo.model.DanhGia;
import com.example.demo.model.DichVu;
import com.example.demo.model.NguoiDung;
import com.example.demo.repository.DanhGiaRepository;
import com.example.demo.repository.DichVuRepository;
import com.example.demo.repository.NguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class DanhGiaService {

    @Autowired
    private DanhGiaRepository danhGiaRepository;
    
    @Autowired
    private DichVuRepository dichVuRepository;
    
    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Transactional(readOnly = true)
    public Page<DanhGiaResponse> getDanhGiaByDichVuId(Long dichVuId, Pageable pageable) {
        return danhGiaRepository.findByDichVu_MaDichVuOrderByThoiGianTaoDesc(dichVuId, pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public Double getAverageRating(Long dichVuId) {
        return danhGiaRepository.findAverageRatingByDichVuId(dichVuId);
    }

    @Transactional(readOnly = true)
    public Long getTotalReviews(Long dichVuId) {
        return danhGiaRepository.countByDichVuId(dichVuId);
    }

    @Transactional
    public DanhGiaResponse createDanhGia(DanhGiaRequest request) {
        // Lấy thông tin người dùng hiện tại
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhap(username)
                .orElseThrow(() -> new UsernameNotFoundException("Người dùng không tồn tại"));
        
        // Convert dichVuId to Integer for the repository
        DichVu dichVu = dichVuRepository.findById(request.getDichVuId().intValue())
                .orElseThrow(() -> new IllegalArgumentException("Dịch vụ không tồn tại"));
        
        // Kiểm tra xem người dùng đã đánh giá dịch vụ này chưa
        if (danhGiaRepository.existsByDichVu_MaDichVuAndNguoiDung_MaNguoiDung(
                dichVu.getMaDichVu().longValue(), 
                nguoiDung.getMaNguoiDung().longValue())) {
            throw new IllegalStateException("Bạn đã đánh giá dịch vụ này rồi");
        }
        
        DanhGia danhGia = new DanhGia();
        danhGia.setDichVu(dichVu);
        danhGia.setNguoiDung(nguoiDung);
        danhGia.setDiem(request.getDiem());
        danhGia.setNoiDung(request.getNoiDung());
        
        return convertToDto(danhGiaRepository.save(danhGia));
    }

    private DanhGiaResponse convertToDto(DanhGia danhGia) {
        DanhGiaResponse dto = new DanhGiaResponse();
        dto.setId(danhGia.getId());
        dto.setDichVuId(danhGia.getDichVu().getMaDichVu().longValue());
        dto.setNguoiDungId(danhGia.getNguoiDung().getMaNguoiDung().longValue());
        dto.setTenNguoiDung(danhGia.getNguoiDung().getHoTen());
        dto.setAvatarNguoiDung(danhGia.getNguoiDung().getAvatar());
        dto.setDiem(danhGia.getDiem());
        dto.setNoiDung(danhGia.getNoiDung());
        dto.setThoiGianTao(danhGia.getThoiGianTao());
        return dto;
    }

    @Transactional(readOnly = true)
    public Page<DanhGiaResponse> getDanhGiaByCustomerId(Long customerId, Pageable pageable) {
        return danhGiaRepository.findByNguoiDung_MaNguoiDung(customerId, pageable)
                .map(this::convertToDto);
    }

    @Transactional(readOnly = true)
    public DanhGiaResponse getFeaturedDanhGia() {
        // In a real application, you would have logic to select a featured review.
        // For now, we'll find the one with the highest rating.
        return danhGiaRepository.findTopByOrderByDiemDesc().map(this::convertToDto).orElse(null);
    }

    @Transactional(readOnly = true)
    public java.util.List<java.util.Map<String, Object>> getMyRatings() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhap(username)
                .orElseThrow(() -> new UsernameNotFoundException("Người dùng không tồn tại"));
        
        java.util.List<DanhGia> ratings = danhGiaRepository.findByNguoiDung_MaNguoiDungOrderByThoiGianTaoDesc(
            nguoiDung.getMaNguoiDung().longValue()
        );
        
        return ratings.stream().map(rating -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", rating.getId());
            map.put("dichVuId", rating.getDichVu().getMaDichVu());
            map.put("tenDichVu", rating.getDichVu().getTenDichVu());
            map.put("diem", rating.getDiem());
            map.put("noiDung", rating.getNoiDung());
            map.put("thoiGianTao", rating.getThoiGianTao());
            return map;
        }).collect(java.util.stream.Collectors.toList());
    }
}
