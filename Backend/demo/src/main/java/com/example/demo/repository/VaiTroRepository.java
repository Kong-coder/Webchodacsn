package com.example.demo.repository;

import com.example.demo.model.VaiTro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VaiTroRepository extends JpaRepository<VaiTro, Integer> {
    Optional<VaiTro> findByTenVaiTro(String tenVaiTro);
}
