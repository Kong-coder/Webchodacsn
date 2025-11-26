package com.example.demo.repository;

import com.example.demo.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

    Optional<Attendance> findByEmployeeIdAndDate(Integer employeeId, LocalDate date);

    List<Attendance> findByDate(LocalDate date);

    List<Attendance> findByEmployeeIdAndDateBetween(Integer employeeId, LocalDate startDate, LocalDate endDate);

    boolean existsByEmployeeIdAndDate(Integer employeeId, LocalDate date);
}
