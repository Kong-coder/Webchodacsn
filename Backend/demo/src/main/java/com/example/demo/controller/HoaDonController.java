package com.example.demo.controller;

import com.example.demo.dto.HoaDonResponse;
import com.example.demo.service.HoaDonService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/don-hang/{orderId}/hoa-don")
public class HoaDonController {

    private final HoaDonService hoaDonService;

    public HoaDonController(HoaDonService hoaDonService) {
        this.hoaDonService = hoaDonService;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<HoaDonResponse> get(@PathVariable Long orderId) {
        return ResponseEntity.ok(hoaDonService.getByOrderId(orderId));
    }

    @PostMapping
    public ResponseEntity<HoaDonResponse> create(@PathVariable Long orderId) {
        return ResponseEntity.ok(hoaDonService.createByOrderId(orderId));
    }
}
