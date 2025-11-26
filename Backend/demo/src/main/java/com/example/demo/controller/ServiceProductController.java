package com.example.demo.controller;

import com.example.demo.model.ServiceProduct;
import com.example.demo.repository.ServiceProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/service-products")
public class ServiceProductController {

    private final ServiceProductRepository serviceProductRepository;

    public ServiceProductController(ServiceProductRepository serviceProductRepository) {
        this.serviceProductRepository = serviceProductRepository;
    }

    // Lấy danh sách sản phẩm của một dịch vụ
    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<ServiceProduct>> getProductsByService(@PathVariable Integer serviceId) {
        return ResponseEntity.ok(serviceProductRepository.findByServiceId(serviceId));
    }

    // Lấy danh sách dịch vụ sử dụng một sản phẩm
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ServiceProduct>> getServicesByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(serviceProductRepository.findByProductId(productId));
    }

    // Thêm hoặc cập nhật liên kết dịch vụ-sản phẩm
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','QUANLY')")
    @PostMapping
    public ResponseEntity<?> createOrUpdate(@RequestBody ServiceProduct serviceProduct) {
        try {
            // Kiểm tra xem đã tồn tại chưa
            var existing = serviceProductRepository.findByServiceIdAndProductId(
                serviceProduct.getServiceId(), 
                serviceProduct.getProductId()
            );
            
            if (existing.isPresent()) {
                // Cập nhật
                ServiceProduct sp = existing.get();
                sp.setQuantityPerUse(serviceProduct.getQuantityPerUse());
                return ResponseEntity.ok(serviceProductRepository.save(sp));
            } else {
                // Tạo mới
                return ResponseEntity.ok(serviceProductRepository.save(serviceProduct));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    // Xóa liên kết
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','QUANLY')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!serviceProductRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        serviceProductRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Xóa liên kết theo serviceId và productId
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','QUANLY')")
    @DeleteMapping("/service/{serviceId}/product/{productId}")
    public ResponseEntity<Void> deleteByServiceAndProduct(
            @PathVariable Integer serviceId,
            @PathVariable Long productId) {
        serviceProductRepository.deleteByServiceIdAndProductId(serviceId, productId);
        return ResponseEntity.noContent().build();
    }
}
