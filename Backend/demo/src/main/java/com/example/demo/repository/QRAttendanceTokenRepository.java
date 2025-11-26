package com.example.demo.repository;

import com.example.demo.model.QRAttendanceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface QRAttendanceTokenRepository extends JpaRepository<QRAttendanceToken, Integer> {

    Optional<QRAttendanceToken> findByToken(String token);

    Optional<QRAttendanceToken> findByCreatedDateAndIsActive(LocalDate createdDate, Boolean isActive);

    boolean existsByCreatedDateAndIsActive(LocalDate createdDate, Boolean isActive);
}
