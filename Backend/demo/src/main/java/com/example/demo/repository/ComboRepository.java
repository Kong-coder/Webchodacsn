package com.example.demo.repository;

import com.example.demo.model.Combo;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ComboRepository extends JpaRepository<Combo, Long> {

    @EntityGraph(attributePaths = "dichVus")
    List<Combo> findAll();

    @EntityGraph(attributePaths = "dichVus")
    Optional<Combo> findById(Long id);

    @EntityGraph(attributePaths = "dichVus")
    List<Combo> findByTrangThaiIgnoreCase(String trangThai);
}
