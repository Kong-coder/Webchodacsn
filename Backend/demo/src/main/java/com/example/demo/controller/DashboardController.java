package com.example.demo.controller;

import com.example.demo.dto.RecentActivityResponse;
import com.example.demo.dto.HomeStatsResponse;
import com.example.demo.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<List<RecentActivityResponse>> getRecentActivities() {
        return ResponseEntity.ok(dashboardService.getRecentActivities());
    }

    @GetMapping("/home-stats")
    public ResponseEntity<HomeStatsResponse> getHomeStats() {
        return ResponseEntity.ok(dashboardService.getHomeStats());
    }
}
