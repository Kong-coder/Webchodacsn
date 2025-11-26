package com.example.demo.controller;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<List<Product>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String filterType,
            @RequestParam(required = false, defaultValue = "30") Integer days
    ) {
        List<Product> result;
        if (search != null && !search.isBlank()) {
            result = productRepository.search(search.trim());
        } else if (category != null && !category.isBlank()) {
            result = productRepository.findByCategory(category);
        } else {
            result = productRepository.findAll();
        }

        if (filterType != null) {
            String ft = filterType.trim().toLowerCase();
            if (ft.equals("lowstock") || ft.equals("low_stock")) {
                result = result.stream().filter(p -> p.getQuantity() != null && p.getMinStock() != null && p.getQuantity() <= p.getMinStock()).collect(Collectors.toList());
            } else if (ft.equals("expiring")) {
                LocalDate threshold = LocalDate.now().plusDays(days != null ? days : 30);
                result = result.stream().filter(p -> p.getExpiryDate() != null && !p.getExpiryDate().isAfter(threshold)).collect(Collectors.toList());
            }
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> get(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','NHANVIEN')")
    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product req) {
        Product saved = productRepository.save(req);
        return ResponseEntity.ok(saved);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','NHANVIEN')")
    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product req) {
        return productRepository.findById(id)
                .map(p -> {
                    p.setName(req.getName());
                    p.setCategory(req.getCategory());
                    p.setPrice(req.getPrice() != null ? req.getPrice() : BigDecimal.ZERO);
                    p.setCost(req.getCost() != null ? req.getCost() : BigDecimal.ZERO);
                    p.setQuantity(req.getQuantity() != null ? req.getQuantity() : 0);
                    p.setMinStock(req.getMinStock() != null ? req.getMinStock() : 0);
                    p.setUnit(req.getUnit());
                    p.setUsageCount(req.getUsageCount() != null ? req.getUsageCount() : 0);
                    p.setExpiryDate(req.getExpiryDate());
                    p.setSupplier(req.getSupplier());
                    p.setImage(req.getImage());
                    return ResponseEntity.ok(productRepository.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','NHANVIEN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!productRepository.existsById(id)) return ResponseEntity.notFound().build();
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> lowStock() {
        return ResponseEntity.ok(productRepository.findLowStock());
    }

    @PutMapping({"/batch", "/bulk-update"})
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Map<String, Object>> batchUpdate(@RequestBody Map<String, Object> body) {
        Object updatesObj = body.get("updates");
        if (!(updatesObj instanceof List)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid updates array"));
        }
        List<?> updates = (List<?>) updatesObj;
        int updated = 0;
        for (Object u : updates) {
            if (u instanceof Map) {
                Map<?, ?> m = (Map<?, ?>) u;
                Object idObj = m.get("id");
                Object dataObj = m.get("data");
                if (idObj == null) continue;
                Long id = Long.valueOf(String.valueOf(idObj));
                Optional<Product> opt = productRepository.findById(id);
                if (opt.isEmpty()) continue;
                Product p = opt.get();
                if (dataObj instanceof Map<?, ?> dm) {
                    if (dm.get("name") != null) p.setName(String.valueOf(dm.get("name")));
                    if (dm.get("category") != null) p.setCategory(String.valueOf(dm.get("category")));
                    if (dm.get("price") != null) p.setPrice(new BigDecimal(String.valueOf(dm.get("price"))));
                    if (dm.get("cost") != null) p.setCost(new BigDecimal(String.valueOf(dm.get("cost"))));
                    if (dm.get("quantity") != null) p.setQuantity(Integer.valueOf(String.valueOf(dm.get("quantity"))));
                    if (dm.get("minStock") != null) p.setMinStock(Integer.valueOf(String.valueOf(dm.get("minStock"))));
                    if (dm.get("supplier") != null) p.setSupplier(String.valueOf(dm.get("supplier")));
                    if (dm.get("image") != null) p.setImage(String.valueOf(dm.get("image")));
                }
                productRepository.save(p);
                updated++;
            }
        }
        return ResponseEntity.ok(Map.of("success", true, "updated", updated));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportCsv(@RequestParam(name = "ids", required = false) String ids) {
        List<Product> list;
        if (ids != null && !ids.isBlank()) {
            List<Long> idList = Arrays.stream(ids.split(",")).map(String::trim).filter(s -> !s.isEmpty()).map(Long::valueOf).collect(Collectors.toList());
            list = productRepository.findAllById(idList);
        } else {
            list = productRepository.findAll();
        }
        List<String> lines = new ArrayList<>();
        lines.add("ID,Tên sản phẩm,Danh mục,Giá bán,Giá vốn,Tồn kho,Tồn kho tối thiểu,Hạn dùng,Nhà cung cấp");
        for (Product p : list) {
            lines.add(String.join(",",
                    String.valueOf(p.getId()),
                    quote(p.getName()),
                    quote(p.getCategory()),
                    String.valueOf(p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO),
                    String.valueOf(p.getCost() != null ? p.getCost() : BigDecimal.ZERO),
                    String.valueOf(p.getQuantity() != null ? p.getQuantity() : 0),
                    String.valueOf(p.getMinStock() != null ? p.getMinStock() : 0),
                    p.getExpiryDate() != null ? p.getExpiryDate().toString() : "",
                    quote(p.getSupplier())
            ));
        }
        String content = "\uFEFF" + String.join("\n", lines);
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=products-" + System.currentTimeMillis() + ".csv")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(bytes);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> search(@RequestParam("q") String q) {
        return ResponseEntity.ok(productRepository.search(q));
    }

    private String quote(String s) {
        if (s == null) return "";
        return '"' + s.replace("\"", "\"\"") + '"';
    }
}
