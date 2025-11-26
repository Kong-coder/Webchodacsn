package com.example.demo.repository;

import com.example.demo.model.ServiceProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceProductRepository extends JpaRepository<ServiceProduct, Long> {
    
    List<ServiceProduct> findByServiceId(Integer serviceId);
    
    List<ServiceProduct> findByProductId(Long productId);
    
    Optional<ServiceProduct> findByServiceIdAndProductId(Integer serviceId, Long productId);
    
    void deleteByServiceIdAndProductId(Integer serviceId, Long productId);
}
