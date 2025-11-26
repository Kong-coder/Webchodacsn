package com.example.demo.repository;

import com.example.demo.model.DonHangMuc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DonHangMucRepository extends JpaRepository<DonHangMuc, Long> {
}
