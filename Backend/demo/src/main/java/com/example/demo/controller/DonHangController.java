package com.example.demo.controller;

import com.example.demo.dto.CreateDonHangRequest;
import com.example.demo.dto.DonHangResponse;
import com.example.demo.service.DonHangService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/don-hang")
public class DonHangController {

    private final DonHangService donHangService;

    public DonHangController(DonHangService donHangService) {
        this.donHangService = donHangService;
    }

    @PostMapping
    public ResponseEntity<DonHangResponse> create(@RequestBody CreateDonHangRequest req) {
        return ResponseEntity.ok(donHangService.createDonHang(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonHangResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(donHangService.getById(id));
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(donHangService.getAll());
    }
}
