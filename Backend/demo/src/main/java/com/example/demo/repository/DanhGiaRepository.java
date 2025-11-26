package com.example.demo.repository;

import com.example.demo.model.DanhGia;
import com.example.demo.model.DichVu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface DanhGiaRepository extends JpaRepository<DanhGia, Long> {
    
    @Query("SELECT AVG(d.diem) FROM DanhGia d WHERE d.dichVu.maDichVu = :dichVuId")
    Double findAverageRatingByDichVuId(@Param("dichVuId") Long dichVuId);
    
    @Query("SELECT COUNT(d) FROM DanhGia d WHERE d.dichVu.maDichVu = :dichVuId")
    Long countByDichVuId(@Param("dichVuId") Long dichVuId);
    
    Page<DanhGia> findByDichVu_MaDichVuOrderByThoiGianTaoDesc(Long dichVuId, Pageable pageable);
    
    @Query("SELECT d FROM DanhGia d WHERE d.dichVu = :dichVu ORDER BY d.thoiGianTao DESC")
    List<DanhGia> findTop5ByDichVuOrderByThoiGianTaoDesc(@Param("dichVu") DichVu dichVu, Pageable pageable);
    
    boolean existsByDichVu_MaDichVuAndNguoiDung_MaNguoiDung(Long dichVuId, Long nguoiDungId);

    Page<DanhGia> findByNguoiDung_MaNguoiDung(Long customerId, Pageable pageable);
    
    List<DanhGia> findByNguoiDung_MaNguoiDungOrderByThoiGianTaoDesc(Long nguoiDungId);

    Optional<DanhGia> findTopByOrderByDiemDesc();
}
