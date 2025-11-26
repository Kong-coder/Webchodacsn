package com.example.demo.controller;

import com.example.demo.dto.RevenueStatsDTO;
import com.example.demo.service.RevenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/revenue")
@PreAuthorize("hasRole('QUANLY')")
public class RevenueController {

    @Autowired
    private RevenueService revenueService;

    @GetMapping("/stats")
    public ResponseEntity<RevenueStatsDTO> getRevenueStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        RevenueStatsDTO stats = revenueService.getRevenueStats(
            startDate != null ? startDate : LocalDate.now().minusDays(30),
            endDate != null ? endDate : LocalDate.now()
        );
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/by-service")
    public ResponseEntity<List<Map<String, Object>>> getRevenueByService(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<Map<String, Object>> revenueByService = revenueService.getRevenueByService(
            startDate != null ? startDate : LocalDate.now().minusDays(30),
            endDate != null ? endDate : LocalDate.now()
        );
        return ResponseEntity.ok(revenueByService);
    }

    @GetMapping("/by-date")
    public ResponseEntity<List<Map<String, Object>>> getRevenueByDate(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<Map<String, Object>> revenueByDate = revenueService.getRevenueByDate(
            startDate != null ? startDate : LocalDate.now().minusDays(30),
            endDate != null ? endDate : LocalDate.now()
        );
        return ResponseEntity.ok(revenueByDate);
    }

    @GetMapping("/top-customers")
    public ResponseEntity<List<Map<String, Object>>> getTopCustomers(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "5") int limit) {
        
        List<Map<String, Object>> topCustomers = revenueService.getTopCustomers(
            startDate != null ? startDate : LocalDate.now().minusDays(30),
            endDate != null ? endDate : LocalDate.now(),
            limit
        );
        return ResponseEntity.ok(topCustomers);
    }
}
