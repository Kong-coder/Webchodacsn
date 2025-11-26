package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueStatsDTO {
    private BigDecimal totalRevenue;
    private Integer totalCustomers;
    private Integer totalTransactions;
    private Integer totalBookings; // Alias for totalTransactions
    private BigDecimal averageRevenuePerCustomer;
    private BigDecimal avgRevenuePerCustomer; // Alias for averageRevenuePerCustomer
    private Double growthRate;
    private Double revenueGrowthPercentage; // Alias for growthRate
    private List<Map<String, Object>> revenueByService;
    private List<Map<String, Object>> revenueByDate;
    private List<Map<String, Object>> topCustomers;
}
