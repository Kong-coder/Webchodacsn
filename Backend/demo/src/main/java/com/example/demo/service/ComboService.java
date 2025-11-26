package com.example.demo.service;

import com.example.demo.dto.ComboRequest;
import com.example.demo.dto.ComboResponse;
import com.example.demo.dto.DichVuResponse;
import com.example.demo.model.Combo;
import com.example.demo.model.DichVu;
import com.example.demo.repository.ComboRepository;
import com.example.demo.repository.DichVuRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ComboService {

    private final ComboRepository comboRepository;
    private final DichVuRepository dichVuRepository;

    public ComboService(ComboRepository comboRepository, DichVuRepository dichVuRepository) {
        this.comboRepository = comboRepository;
        this.dichVuRepository = dichVuRepository;
    }

    @Transactional(readOnly = true)
    public List<ComboResponse> list(String status) {
        List<Combo> combos = status == null || status.isBlank()
                ? comboRepository.findAll()
                : comboRepository.findByTrangThaiIgnoreCase(status);
        return combos.stream().map(this::map).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComboResponse get(Long id) {
        return map(comboRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Combo không tồn tại")));
    }

    @Transactional
    public ComboResponse create(ComboRequest request) {
        Combo combo = new Combo();
        apply(combo, request);
        combo = comboRepository.save(combo);
        return map(combo);
    }

    @Transactional
    public ComboResponse update(Long id, ComboRequest request) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Combo không tồn tại"));
        apply(combo, request);
        combo = comboRepository.save(combo);
        return map(combo);
    }

    @Transactional
    public void delete(Long id) {
        comboRepository.deleteById(id);
    }

    private void apply(Combo combo, ComboRequest request) {
        if (request.getTenCombo() != null) combo.setTenCombo(request.getTenCombo());
        if (request.getMoTa() != null) combo.setMoTa(request.getMoTa());
        if (request.getGia() != null) combo.setGia(request.getGia());
        if (request.getGiamGia() != null) combo.setGiamGia(request.getGiamGia());
        if (request.getTrangThai() != null) combo.setTrangThai(request.getTrangThai());

        if (request.getDichVuIds() != null) {
            Set<DichVu> dichVus = request.getDichVuIds().isEmpty()
                    ? Set.of()
                    : request.getDichVuIds().stream()
                        .map(id -> dichVuRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Dịch vụ " + id + " không tồn tại")))
                        .collect(Collectors.toSet());
            combo.getDichVus().clear();
            combo.getDichVus().addAll(dichVus);
        }
    }

    private ComboResponse map(Combo combo) {
        ComboResponse response = new ComboResponse();
        response.setId(combo.getId());
        response.setTenCombo(combo.getTenCombo());
        response.setMoTa(combo.getMoTa());
        response.setGia(combo.getGia());
        response.setGiamGia(combo.getGiamGia());
        response.setTrangThai(combo.getTrangThai());

        List<DichVuResponse> dichVuResponses = combo.getDichVus().stream()
                .map(dv -> {
                    DichVuResponse r = new DichVuResponse();
                    r.setId(dv.getMaDichVu());
                    r.setTen(dv.getTenDichVu());
                    r.setMoTa(dv.getMoTa());
                    r.setThoiLuongPhut(dv.getThoiLuongPhut());
                    r.setGia(dv.getGia() == null ? BigDecimal.ZERO : dv.getGia());
                    r.setCoSan(dv.getCoSan());
                    r.setHinhAnh(dv.getHinhAnh());
                    r.setLoai(dv.getLoai());
                    return r;
                })
                .collect(Collectors.toList());

        response.setDichVus(dichVuResponses);
        response.setDichVuIds(dichVuResponses.stream().map(DichVuResponse::getId).collect(Collectors.toList()));
        return response;
    }
}
