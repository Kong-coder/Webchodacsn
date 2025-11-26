package com.example.demo.repository;

import com.example.demo.model.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NhanVienRepository extends JpaRepository<NguoiDung, Integer> {
    // Custom query methods can be added here if needed
}
