package com.example.demo.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.model.HoaDon;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Integer> {
    Optional<HoaDon> findByOrderId(Long orderId);
    Optional<HoaDon> findByMaLichHen(Integer maLichHen);
    boolean existsByOrderId(Long orderId);

    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE (:status IS NULL OR h.trangThai = :status)")
    BigDecimal sumTongTienByTrangThai(@Param("status") String status);

    @Query("SELECT COALESCE(SUM(h.tongTien), 0) FROM HoaDon h WHERE CAST(h.ngayXuat AS date) BETWEEN :startDate AND :endDate AND h.trangThai = 'paid'")
    BigDecimal getTotalRevenueByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(DISTINCT h.maKhachHang) FROM HoaDon h WHERE CAST(h.ngayXuat AS date) BETWEEN :startDate AND :endDate AND h.trangThai = 'paid'")
    Long countDistinctCustomersByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(h) FROM HoaDon h WHERE CAST(h.ngayXuat AS date) BETWEEN :startDate AND :endDate AND h.trangThai = 'paid'")
    Long countByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query(value = """
        SELECT 
            dv.ten_dich_vu AS serviceName,
            COUNT(lh.ma_lich_hen) AS bookingCount,
            COALESCE(SUM(hd.tong_tien), 0) AS totalRevenue
        FROM lichhen lh
        JOIN dichvu dv ON lh.ma_dich_vu = dv.ma_dich_vu
        JOIN hoadon hd ON lh.ma_lich_hen = hd.ma_lich_hen
        WHERE CAST(hd.ngay_xuat AS DATE) BETWEEN :startDate AND :endDate 
        AND hd.trang_thai = 'paid'
        GROUP BY dv.ma_dich_vu, dv.ten_dich_vu
        ORDER BY totalRevenue DESC
    """, nativeQuery = true)
    List<Map<String, Object>> getRevenueByService(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    @Query(value = """
        SELECT 
            CAST(hd.ngay_xuat AS DATE) AS date,
            COALESCE(SUM(hd.tong_tien), 0) AS totalRevenue,
            COUNT(DISTINCT hd.ma_hoa_don) AS totalOrders
        FROM hoadon hd
        WHERE CAST(hd.ngay_xuat AS DATE) BETWEEN :startDate AND :endDate 
        AND hd.trang_thai = 'paid'
        GROUP BY CAST(hd.ngay_xuat AS DATE)
        ORDER BY CAST(hd.ngay_xuat AS DATE)
    """, nativeQuery = true)
    List<Map<String, Object>> getRevenueByDate(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate
    );

    @Query(value = """
        SELECT 
            kh.id AS customerId,
            kh.ho_ten AS customerName,
            COUNT(DISTINCT hd.ma_hoa_don) AS bookingCount,
            COALESCE(SUM(hd.tong_tien), 0) AS totalSpent
        FROM hoadon hd
        JOIN lichhen lh ON hd.ma_lich_hen = lh.ma_lich_hen
        JOIN khach_hang kh ON lh.ma_khach_hang = kh.id
        WHERE CAST(hd.ngay_xuat AS DATE) BETWEEN :startDate AND :endDate 
        AND hd.trang_thai = 'paid'
        GROUP BY kh.id, kh.ho_ten
        ORDER BY totalSpent DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<Map<String, Object>> getTopCustomers(
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate,
        @Param("limit") int limit
    );
}
