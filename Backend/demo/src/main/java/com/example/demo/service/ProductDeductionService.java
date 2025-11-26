package com.example.demo.service;

import com.example.demo.model.Product;
import com.example.demo.model.ServiceProduct;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.ServiceProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductDeductionService {

    private final ServiceProductRepository serviceProductRepository;
    private final ProductRepository productRepository;

    public ProductDeductionService(ServiceProductRepository serviceProductRepository,
                                  ProductRepository productRepository) {
        this.serviceProductRepository = serviceProductRepository;
        this.productRepository = productRepository;
    }

    /**
     * Tự động trừ sản phẩm khi hoàn thành dịch vụ
     * @param serviceId ID của dịch vụ đã hoàn thành
     */
    @Transactional
    public void deductProductsForService(Integer serviceId) {
        // Lấy danh sách sản phẩm liên kết với dịch vụ
        List<ServiceProduct> serviceProducts = serviceProductRepository.findByServiceId(serviceId);
        
        for (ServiceProduct sp : serviceProducts) {
            Product product = productRepository.findById(sp.getProductId()).orElse(null);
            if (product != null) {
                int currentQty = product.getQuantity() != null ? product.getQuantity() : 0;
                int deductQty = sp.getQuantityPerUse() != null ? sp.getQuantityPerUse() : 1;
                
                // Trừ số lượng (không cho âm)
                int newQty = Math.max(0, currentQty - deductQty);
                product.setQuantity(newQty);
                
                // Tăng usage count
                int usageCount = product.getUsageCount() != null ? product.getUsageCount() : 0;
                product.setUsageCount(usageCount + 1);
                
                productRepository.save(product);
                
                System.out.println("Deducted " + deductQty + " of product " + product.getName() + 
                                 " for service ID " + serviceId + ". New quantity: " + newQty);
            }
        }
    }
}
