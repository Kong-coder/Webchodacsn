package com.example.demo.controller;

import com.example.demo.dto.LichHenRequest;
import com.example.demo.dto.LichHenResponse;
import com.example.demo.service.LichHenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/don-hang/{orderId}/lich-hen")
public class LichHenController {

    private final LichHenService lichHenService;

    public LichHenController(LichHenService lichHenService) {
        this.lichHenService = lichHenService;
    }

    @GetMapping
    public ResponseEntity<LichHenResponse> get(@PathVariable Long orderId) {
        return ResponseEntity.ok(lichHenService.getByOrderId(orderId));
    }

    @PutMapping
    public ResponseEntity<LichHenResponse> upsert(@PathVariable Long orderId, @RequestBody LichHenRequest req) {
        return ResponseEntity.ok(lichHenService.upsertByOrderId(orderId, req));
    }

}
