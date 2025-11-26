package com.example.demo.repository;

import com.example.demo.model.StaffShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StaffShiftRepository extends JpaRepository<StaffShift, Integer> {

    @Query(value = """
        SELECT * FROM lichlamviec s
        WHERE (:employeeId IS NULL OR s.ma_nhan_vien = :employeeId)
          AND (:from::date IS NULL OR s.ngay_lam_viec >= :from::date)
          AND (:to::date IS NULL OR s.ngay_lam_viec <= :to::date)
          AND (:status IS NULL OR s.trang_thai = :status)
        ORDER BY s.ngay_lam_viec DESC, s.gio_bat_dau DESC
    """, nativeQuery = true)
    List<StaffShift> search(
            @Param("employeeId") Integer employeeId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("status") String status
    );
}
