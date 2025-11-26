package com.example.demo.controller;

import com.example.demo.dto.ThongBaoDTO;
import com.example.demo.service.ThongBaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/thong-bao")
public class ThongBaoController {

    private final ThongBaoService thongBaoService;

    @Autowired
    public ThongBaoController(ThongBaoService thongBaoService) {
        this.thongBaoService = thongBaoService;
    }

    @GetMapping
    public ResponseEntity<List<ThongBaoDTO>> getTatCaThongBao() {
        return ResponseEntity.ok(thongBaoService.getTatCaThongBao());
    }
    
    @GetMapping("/chua-doc")
    public ResponseEntity<List<ThongBaoDTO>> getThongBaoChuaDoc() {
        return ResponseEntity.ok(thongBaoService.getThongBaoChuaDoc());
    }
    
    @PutMapping("/{id}/da-doc")
    public ResponseEntity<ThongBaoDTO> danhDauDaDoc(@PathVariable Long id) {
        return ResponseEntity.ok(thongBaoService.danhDauDaDoc(id));
    }
    
    @PutMapping("/da-doc-tat-ca")
    public ResponseEntity<Map<String, Integer>> danhDauTatCaDaDoc() {
        int soLuong = thongBaoService.danhDauTatCaDaDoc();
        Map<String, Integer> response = new HashMap<>();
        response.put("soLuongDaCapNhat", soLuong);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoaThongBao(@PathVariable Long id) {
        thongBaoService.xoaThongBao(id);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping
    public ResponseEntity<Void> xoaTatCaThongBao() {
        thongBaoService.xoaTatCaThongBao();
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/so-luong-chua-doc")
    public ResponseEntity<Map<String, Integer>> demSoLuongChuaDoc() {
        int soLuong = thongBaoService.demSoLuongChuaDoc();
        Map<String, Integer> response = new HashMap<>();
        response.put("soLuong", soLuong);
        return ResponseEntity.ok(response);
    }
}
