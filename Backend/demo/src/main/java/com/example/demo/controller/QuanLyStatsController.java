package com.example.demo.controller;

import com.example.demo.dto.QuanLyStatsResponse;
import com.example.demo.service.QuanLyStatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quan-ly/stats")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public class QuanLyStatsController {

    private final QuanLyStatsService statsService;

    public QuanLyStatsController(QuanLyStatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping
    public ResponseEntity<QuanLyStatsResponse> getStats() {
        return ResponseEntity.ok(statsService.getStats());
    }
}
