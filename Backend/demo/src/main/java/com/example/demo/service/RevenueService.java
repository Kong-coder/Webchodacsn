package com.example.demo.service;

import com.example.demo.dto.RevenueStatsDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface RevenueService {
    RevenueStatsDTO getRevenueStats(LocalDate startDate, LocalDate endDate);
    List<Map<String, Object>> getRevenueByService(LocalDate startDate, LocalDate endDate);
    List<Map<String, Object>> getRevenueByDate(LocalDate startDate, LocalDate endDate);
    List<Map<String, Object>> getTopCustomers(LocalDate startDate, LocalDate endDate, int limit);
}
