package com.example.demo.repository;

import com.example.demo.model.KhungGioLamViec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KhungGioLamViecRepository extends JpaRepository<KhungGioLamViec, Integer> {
    // Find the first active working time slot
    KhungGioLamViec findFirstByActiveTrue();
}
