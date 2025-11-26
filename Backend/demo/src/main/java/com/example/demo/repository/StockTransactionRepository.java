package com.example.demo.repository;

import com.example.demo.model.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    @Query("select t from StockTransaction t where (:productId is null or t.product.id = :productId) order by t.createdAt desc")
    List<StockTransaction> findAllByProductId(@Param("productId") Long productId);
}
