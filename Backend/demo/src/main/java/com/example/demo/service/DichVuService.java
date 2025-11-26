package com.example.demo.service;

import com.example.demo.dto.DichVuRequest;
import com.example.demo.dto.DichVuResponse;
import com.example.demo.model.DichVu;
import com.example.demo.repository.DichVuRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DichVuService {

    private final DichVuRepository dichVuRepository;

    public DichVuService(DichVuRepository dichVuRepository) {
        this.dichVuRepository = dichVuRepository;
    }

    @Transactional(readOnly = true)
    public List<DichVuResponse> list(Boolean onlyAvailable) {
        List<DichVu> list = (onlyAvailable != null && onlyAvailable)
                ? dichVuRepository.findByCoSanTrueOrderByMaDichVuAsc()
                : dichVuRepository.findAllByOrderByMaDichVuAsc();
        return list.stream().map(this::map).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DichVuResponse get(Integer id) {
        return map(dichVuRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Dịch vụ không tồn tại")));
    }

    @Transactional
    public DichVuResponse create(DichVuRequest r) {
        DichVu e = new DichVu();
        e.setTenDichVu(r.getTenDichVu());
        e.setMoTa(r.getMoTa());
        e.setThoiLuongPhut(r.getThoiLuongPhut());
        e.setGia(r.getGia());
        e.setCoSan(Boolean.TRUE.equals(r.getCoSan()));
        e.setHinhAnh(r.getHinhAnh());
        e.setLoai(r.getLoai() == null || r.getLoai().isBlank() ? "massage" : r.getLoai());
        e = dichVuRepository.save(e);
        return map(e);
    }

    @Transactional
    public DichVuResponse update(Integer id, DichVuRequest r) {
        DichVu e = dichVuRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Dịch vụ không tồn tại"));
        if (r.getTenDichVu() != null) e.setTenDichVu(r.getTenDichVu());
        if (r.getMoTa() != null) e.setMoTa(r.getMoTa());
        if (r.getThoiLuongPhut() != null) e.setThoiLuongPhut(r.getThoiLuongPhut());
        if (r.getGia() != null) e.setGia(r.getGia());
        if (r.getCoSan() != null) e.setCoSan(r.getCoSan());
        if (r.getHinhAnh() != null) e.setHinhAnh(r.getHinhAnh());
        if (r.getLoai() != null) e.setLoai(r.getLoai().isBlank() ? "massage" : r.getLoai());
        e = dichVuRepository.save(e);
        return map(e);
    }

    @Transactional
    public void delete(Integer id) {
        dichVuRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<DichVuResponse> getServicesWithStats() {
        List<DichVu> allServices = dichVuRepository.findAllByOrderByMaDichVuAsc();
        List<Object[]> stats = dichVuRepository.getServiceStats();
        
        // Create a map of service stats for quick lookup
        java.util.Map<Integer, Object[]> statsMap = new java.util.HashMap<>();
        for (Object[] stat : stats) {
            Integer serviceId = (Integer) stat[0];
            statsMap.put(serviceId, stat);
        }
        
        return allServices.stream().map(service -> {
            DichVuResponse response = map(service);
            Object[] stat = statsMap.get(service.getMaDichVu());
            if (stat != null) {
                response.setBookings((Long) stat[1]);
                response.setRevenue((java.math.BigDecimal) stat[2]);
            } else {
                response.setBookings(0L);
                response.setRevenue(java.math.BigDecimal.ZERO);
            }
            return response;
        }).collect(Collectors.toList());
    }

    private DichVuResponse map(DichVu e) {
        DichVuResponse d = new DichVuResponse();
        d.setId(e.getMaDichVu());
        d.setTen(e.getTenDichVu());
        d.setMoTa(e.getMoTa());
        d.setThoiLuongPhut(e.getThoiLuongPhut());
        d.setGia(e.getGia());
        d.setCoSan(e.getCoSan());
        d.setHinhAnh(e.getHinhAnh());
        d.setLoai(e.getLoai());
        return d;
    }
}
