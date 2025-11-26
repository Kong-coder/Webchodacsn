package com.example.demo.repository;

import com.example.demo.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(String category);

    @Query("select p from Product p where lower(p.name) like lower(concat('%', :term, '%')) " +
           "or lower(p.category) like lower(concat('%', :term, '%')) " +
           "or lower(p.supplier) like lower(concat('%', :term, '%'))")
    List<Product> search(@Param("term") String term);

    @Query("select p from Product p where p.quantity <= p.minStock")
    List<Product> findLowStock();

    @Query("select p from Product p where p.expiryDate is not null and p.expiryDate <= :toDate")
    List<Product> findExpiringBefore(@Param("toDate") LocalDate toDate);

    @Query("select distinct p.category from Product p where p.category is not null")
    List<String> findDistinctCategories();
}
