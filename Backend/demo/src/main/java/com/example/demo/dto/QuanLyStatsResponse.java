package com.example.demo.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class QuanLyStatsResponse {

    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private long totalServices;
    private long totalBookings;
    private List<TopService> topServices = new ArrayList<>();

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getTotalServices() {
        return totalServices;
    }

    public void setTotalServices(long totalServices) {
        this.totalServices = totalServices;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public List<TopService> getTopServices() {
        return topServices;
    }

    public void setTopServices(List<TopService> topServices) {
        this.topServices = topServices;
    }

    public static class TopService {
        private Integer serviceId;
        private String serviceName;
        private String category;
        private BigDecimal price = BigDecimal.ZERO;
        private long bookings;
        private Integer discount = 0;
        private BigDecimal revenue = BigDecimal.ZERO;

        public Integer getServiceId() {
            return serviceId;
        }

        public void setServiceId(Integer serviceId) {
            this.serviceId = serviceId;
        }

        public String getServiceName() {
            return serviceName;
        }

        public void setServiceName(String serviceName) {
            this.serviceName = serviceName;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public void setPrice(BigDecimal price) {
            this.price = price;
        }

        public long getBookings() {
            return bookings;
        }

        public void setBookings(long bookings) {
            this.bookings = bookings;
        }

        public Integer getDiscount() {
            return discount;
        }

        public void setDiscount(Integer discount) {
            this.discount = discount;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }
    }
}
