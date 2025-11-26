package com.example.demo.controller;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class InventoryStatsController {

    private final ProductRepository productRepository;

    public InventoryStatsController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping({"/inventory/statistics", "/dashboard/stats"})
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Product> all = productRepository.findAll();
        int totalProducts = all.size();
        int lowStockCount = (int) all.stream()
                .filter(p -> p.getQuantity() != null && p.getMinStock() != null && p.getQuantity() <= p.getMinStock())
                .count();
        int expiringCount = (int) all.stream()
                .filter(p -> p.getExpiryDate() != null && !p.getExpiryDate().isAfter(LocalDate.now().plusDays(30)))
                .count();

        BigDecimal totalValue = all.stream()
                .map(p -> (p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO)
                        .multiply(BigDecimal.valueOf(p.getQuantity() != null ? p.getQuantity() : 0)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCost = all.stream()
                .map(p -> (p.getCost() != null ? p.getCost() : BigDecimal.ZERO)
                        .multiply(BigDecimal.valueOf(p.getQuantity() != null ? p.getQuantity() : 0)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> data = new HashMap<>();
        data.put("totalProducts", totalProducts);
        data.put("lowStockCount", lowStockCount);
        data.put("expiringCount", expiringCount);
        data.put("totalValue", totalValue);
        data.put("totalCost", totalCost);
        data.put("profit", totalValue.subtract(totalCost));

        return ResponseEntity.ok(data);
    }
}
