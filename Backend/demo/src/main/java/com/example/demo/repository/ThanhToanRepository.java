package com.example.demo.repository;

import com.example.demo.model.ThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThanhToanRepository extends JpaRepository<ThanhToan, Long> {
    Optional<ThanhToan> findTopByHoaDonIdOrderByTaoLucDesc(Integer hoaDonId);
}
