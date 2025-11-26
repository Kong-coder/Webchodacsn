package com.example.demo.repository;

import com.example.demo.model.DichVu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DichVuRepository extends JpaRepository<DichVu, Integer> {
    List<DichVu> findByCoSanTrueOrderByMaDichVuAsc();
    List<DichVu> findAllByOrderByMaDichVuAsc();
    
    @Query(value = """
        SELECT 
            lh.ma_dich_vu as serviceId,
            COUNT(lh.ma_lich_hen) as bookings,
            COALESCE(SUM(hd.tong_tien), 0) as revenue
        FROM lichhen lh
        LEFT JOIN hoadon hd ON lh.ma_lich_hen = hd.ma_lich_hen AND hd.trang_thai = 'paid'
        WHERE lh.trang_thai = 'DA_XAC_NHAN'
        GROUP BY lh.ma_dich_vu
    """, nativeQuery = true)
    List<Object[]> getServiceStats();
}
