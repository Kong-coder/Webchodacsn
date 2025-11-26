package com.example.demo.repository;

import com.example.demo.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Integer> {

    @Query("""
        SELECT a FROM AttendanceRecord a
        WHERE (:employeeId IS NULL OR a.employeeId = :employeeId)
          AND (:fromDate IS NULL OR a.attendanceDate >= :fromDate)
          AND (:toDate IS NULL OR a.attendanceDate <= :toDate)
        ORDER BY a.attendanceDate DESC, a.checkIn ASC
    """)
    List<AttendanceRecord> search(
            @Param("employeeId") Integer employeeId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );
}
