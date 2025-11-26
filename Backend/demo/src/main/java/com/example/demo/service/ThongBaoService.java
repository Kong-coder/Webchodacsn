package com.example.demo.service;

import com.example.demo.dto.ThongBaoDTO;
import com.example.demo.model.NguoiDung;
import com.example.demo.model.ThongBao;
import com.example.demo.repository.NguoiDungRepository;
import com.example.demo.repository.ThongBaoRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ThongBaoService {

    private final ThongBaoRepository thongBaoRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public ThongBaoService(ThongBaoRepository thongBaoRepository,
                          NguoiDungRepository nguoiDungRepository,
                          ModelMapper modelMapper) {
        this.thongBaoRepository = thongBaoRepository;
        this.nguoiDungRepository = nguoiDungRepository;
        this.modelMapper = modelMapper;
    }

    private Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return nguoiDungRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getMaNguoiDung();
    }

    public List<ThongBaoDTO> getTatCaThongBao() {
        Integer userId = getCurrentUserId();
        return thongBaoRepository.findByNguoiDungMaNguoiDungOrderByThoiGianTaoDesc(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ThongBaoDTO> getThongBaoChuaDoc() {
        Integer userId = getCurrentUserId();
        return thongBaoRepository.findByNguoiDungMaNguoiDungAndDaDocFalseOrderByThoiGianTaoDesc(userId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ThongBaoDTO danhDauDaDoc(Long id) {
        ThongBao thongBao = thongBaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));
        
        if (!thongBao.isDaDoc()) {
            thongBao.setDaDoc(true);
            thongBao.setThoiGianDoc(LocalDateTime.now());
            thongBao = thongBaoRepository.save(thongBao);
        }
        
        return convertToDto(thongBao);
    }

    @Transactional
    public int danhDauTatCaDaDoc() {
        Integer userId = getCurrentUserId();
        List<ThongBao> thongBaos = thongBaoRepository.findByNguoiDungMaNguoiDungAndDaDocFalseOrderByThoiGianTaoDesc(userId);
        thongBaos.forEach(tb -> {
            tb.setDaDoc(true);
            tb.setThoiGianDoc(LocalDateTime.now());
        });
        thongBaoRepository.saveAll(thongBaos);
        return thongBaos.size();
    }
    
    // Alias for demThongBaoChuaDoc for backward compatibility
    public int demSoLuongChuaDoc() {
        return demThongBaoChuaDoc();
    }

    public void xoaThongBao(Long id) {
        thongBaoRepository.deleteById(id);
    }

    @Transactional
    public void xoaTatCaThongBao() {
        Integer userId = getCurrentUserId();
        thongBaoRepository.deleteByNguoiDungMaNguoiDung(userId);
    }

    public int demThongBaoChuaDoc() {
        Integer userId = getCurrentUserId();
        return thongBaoRepository.countByNguoiDungMaNguoiDungAndDaDocFalse(userId);
    }

    public ThongBao taoThongBao(Integer nguoiDungId, String tieuDe, String noiDung, String loai, String bieuTuong, boolean quanTrong) {
        NguoiDung nguoiDung = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        ThongBao thongBao = new ThongBao();
        thongBao.setNguoiDung(nguoiDung);
        thongBao.setTieuDe(tieuDe);
        thongBao.setNoiDung(noiDung);
        thongBao.setLoai(loai);
        thongBao.setBieuTuong(bieuTuong);
        thongBao.setQuanTrong(quanTrong);
        
        return thongBaoRepository.save(thongBao);
    }

    private ThongBaoDTO convertToDto(ThongBao thongBao) {
        return modelMapper.map(thongBao, ThongBaoDTO.class);
    }
}
