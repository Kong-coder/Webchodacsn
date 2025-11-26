package com.example.demo.repository;

import com.example.demo.model.LichHen;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LichHenRepository extends JpaRepository<LichHen, Integer> {
    Optional<LichHen> findByOrderId(Long orderId);
    boolean existsByOrderId(Long orderId);

    @Query("""
        SELECT l FROM LichHen l
        WHERE (:from IS NULL OR l.thoiGianHen >= :from)
          AND (:to IS NULL OR l.thoiGianHen <= :to)
          AND (:statusesEmpty = TRUE OR l.trangThai IN :statuses)
          AND (:employeeId IS NULL OR l.maNhanVien = :employeeId)
          AND (:customerId IS NULL OR l.maKhachHang = :customerId)
        ORDER BY l.thoiGianHen ASC
    """)
    List<LichHen> search(
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to,
            @Param("statuses") List<String> statuses,
            @Param("statusesEmpty") boolean statusesEmpty,
            @Param("employeeId") Integer employeeId,
            @Param("customerId") Integer customerId
    );

    long countByMaKhachHang(Integer maKhachHang);

    @Query("SELECT l.maDichVu, COUNT(l) FROM LichHen l WHERE l.maDichVu IS NOT NULL GROUP BY l.maDichVu ORDER BY COUNT(l) DESC")
    List<Object[]> findTopServices(Pageable pageable);
    
    @Query("""
        SELECT COUNT(l) FROM LichHen l 
        WHERE l.maDichVu = :dichVuId 
        AND l.thoiGianHen <= :endTime 
        AND (l.thoiGianKetThuc IS NOT NULL AND l.thoiGianKetThuc >= :startTime)
        AND l.trangThai <> :trangThai
    """)
    long countByDichVu_MaDichVuAndThoiGianBetweenAndTrangThaiNot(
        @Param("dichVuId") Integer dichVuId,
        @Param("startTime") OffsetDateTime startTime,
        @Param("endTime") OffsetDateTime endTime,
        @Param("trangThai") String trangThai
    );

    List<LichHen> findByMaKhachHang(int customerId);

    List<LichHen> findByMaKhachHangAndTrangThai(int customerId, String trangThai);
    
    List<LichHen> findByMaKhachHangOrderByThoiGianHenDesc(int customerId);
    
    List<LichHen> findByMaKhachHangOrderByThoiGianBatDauDesc(int customerId);
}
