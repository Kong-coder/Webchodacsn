package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list() {
        // Chưa có dữ liệu thực, trả về rỗng để frontend vẫn hoạt động
        return ResponseEntity.ok(List.of());
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validate(@RequestBody Map<String, Object> body) {
        // Tạm thời luôn không hợp lệ nếu chưa có nghiệp vụ thực
        return ResponseEntity.ok(Map.of(
                "valid", false,
                "message", "Voucher không hợp lệ hoặc chưa được cấu hình"
        ));
    }

    @PatchMapping("/{code}/usage")
    public ResponseEntity<Map<String, Object>> increment(@PathVariable String code) {
        // Tạm thời trả OK
        return ResponseEntity.ok(Map.of("code", code, "updated", true));
    }
}
