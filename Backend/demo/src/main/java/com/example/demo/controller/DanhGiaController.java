package com.example.demo.controller;

import com.example.demo.dto.DanhGiaRequest;
import com.example.demo.dto.DanhGiaResponse;
import com.example.demo.service.DanhGiaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/danh-gia")
public class DanhGiaController {

    @Autowired
    private DanhGiaService danhGiaService;

    @GetMapping("/dich-vu/{dichVuId}")
    public ResponseEntity<Page<DanhGiaResponse>> getDanhGiaByDichVuId(
            @PathVariable Long dichVuId,
            @PageableDefault(size = 5) Pageable pageable) {
        return ResponseEntity.ok(danhGiaService.getDanhGiaByDichVuId(dichVuId, pageable));
    }

    @GetMapping("/dich-vu/{dichVuId}/trung-binh")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long dichVuId) {
        Double average = danhGiaService.getAverageRating(dichVuId);
        return ResponseEntity.ok(average != null ? average : 0.0);
    }

    @GetMapping("/dich-vu/{dichVuId}/tong-so")
    public ResponseEntity<Long> getTotalReviews(@PathVariable Long dichVuId) {
        return ResponseEntity.ok(danhGiaService.getTotalReviews(dichVuId));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DanhGiaResponse> createDanhGia(@RequestBody DanhGiaRequest request) {
        return ResponseEntity.ok(danhGiaService.createDanhGia(request));
    }

    @GetMapping("/by-customer/{customerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<DanhGiaResponse>> getDanhGiaByCustomerId(
            @PathVariable Long customerId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(danhGiaService.getDanhGiaByCustomerId(customerId, pageable));
    }

    @GetMapping("/my-ratings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyRatings() {
        return ResponseEntity.ok(danhGiaService.getMyRatings());
    }

    @GetMapping("/featured")
    public ResponseEntity<DanhGiaResponse> getFeaturedDanhGia() {
        return ResponseEntity.ok(danhGiaService.getFeaturedDanhGia());
    }
}
