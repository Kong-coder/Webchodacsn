package com.example.demo.service.impl;

import com.example.demo.dto.RevenueStatsDTO;
import com.example.demo.repository.HoaDonRepository;
import com.example.demo.service.RevenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
public class RevenueServiceImpl implements RevenueService {

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Override
    @Transactional(readOnly = true)
    public RevenueStatsDTO getRevenueStats(LocalDate startDate, LocalDate endDate) {
        RevenueStatsDTO stats = new RevenueStatsDTO();
        
        // Calculate total revenue
        BigDecimal totalRevenue = hoaDonRepository.getTotalRevenueByDateRange(startDate, endDate);
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        
        // Get total customers
        Long totalCustomers = hoaDonRepository.countDistinctCustomersByDateRange(startDate, endDate);
        stats.setTotalCustomers(totalCustomers != null ? totalCustomers.intValue() : 0);
        
        // Get total transactions
        Long totalTransactions = hoaDonRepository.countByDateRange(startDate, endDate);
        int totalOrdersCount = totalTransactions != null ? totalTransactions.intValue() : 0;
        stats.setTotalTransactions(totalOrdersCount);
        stats.setTotalBookings(totalOrdersCount); // Alias
        stats.setTotalOrders(totalOrdersCount); // Alias for frontend
        
        // Calculate average revenue per customer
        BigDecimal avgRevenue = BigDecimal.ZERO;
        if (totalCustomers != null && totalCustomers > 0 && totalRevenue != null) {
            avgRevenue = totalRevenue.divide(new BigDecimal(totalCustomers), 2, RoundingMode.HALF_UP);
            stats.setAverageRevenuePerCustomer(avgRevenue);
        } else {
            stats.setAverageRevenuePerCustomer(BigDecimal.ZERO);
        }
        stats.setAvgRevenuePerCustomer(avgRevenue); // Alias
        
        // Calculate average order value (revenue per order)
        BigDecimal avgOrderValue = BigDecimal.ZERO;
        if (totalOrdersCount > 0 && totalRevenue != null) {
            avgOrderValue = totalRevenue.divide(new BigDecimal(totalOrdersCount), 2, RoundingMode.HALF_UP);
        }
        stats.setAvgOrderValue(avgOrderValue);
        
        // Calculate growth rate
        LocalDate previousPeriodStart = startDate.minus(ChronoUnit.DAYS.between(startDate, endDate) + 1, ChronoUnit.DAYS);
        LocalDate previousPeriodEnd = startDate.minusDays(1);
        
        BigDecimal previousRevenue = hoaDonRepository.getTotalRevenueByDateRange(previousPeriodStart, previousPeriodEnd);
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }
        double growth = 0.0;
        if (previousRevenue != null && previousRevenue.compareTo(BigDecimal.ZERO) > 0) {
            growth = (totalRevenue.doubleValue() - previousRevenue.doubleValue()) / previousRevenue.doubleValue() * 100;
            stats.setGrowthRate(growth);
        } else {
            growth = totalRevenue.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
            stats.setGrowthRate(growth);
        }
        stats.setRevenueGrowthPercentage(growth); // Alias
        
        // Get revenue by service
        stats.setRevenueByService(getRevenueByService(startDate, endDate));
        
        // Get revenue by date
        stats.setRevenueByDate(getRevenueByDate(startDate, endDate));
        
        // Get top customers
        stats.setTopCustomers(getTopCustomers(startDate, endDate, 5));
        
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRevenueByService(LocalDate startDate, LocalDate endDate) {
        return hoaDonRepository.getRevenueByService(startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRevenueByDate(LocalDate startDate, LocalDate endDate) {
        return hoaDonRepository.getRevenueByDate(startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopCustomers(LocalDate startDate, LocalDate endDate, int limit) {
        return hoaDonRepository.getTopCustomers(startDate, endDate, limit);
    }
}
