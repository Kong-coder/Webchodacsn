package com.example.demo.repository;

import com.example.demo.model.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ThongBaoRepository extends JpaRepository<ThongBao, Long> {
    @Query("SELECT t FROM ThongBao t WHERE t.nguoiDung.maNguoiDung = :maNguoiDung ORDER BY t.thoiGianTao DESC")
    List<ThongBao> findByNguoiDungMaNguoiDungOrderByThoiGianTaoDesc(@Param("maNguoiDung") Integer maNguoiDung);
    
    @Query("SELECT t FROM ThongBao t WHERE t.nguoiDung.maNguoiDung = :maNguoiDung AND t.daDoc = false ORDER BY t.thoiGianTao DESC")
    List<ThongBao> findByNguoiDungMaNguoiDungAndDaDocFalseOrderByThoiGianTaoDesc(@Param("maNguoiDung") Integer maNguoiDung);
    
    @Query("SELECT COUNT(t) FROM ThongBao t WHERE t.nguoiDung.maNguoiDung = :maNguoiDung AND t.daDoc = false")
    int countByNguoiDungMaNguoiDungAndDaDocFalse(@Param("maNguoiDung") Integer maNguoiDung);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM ThongBao t WHERE t.nguoiDung.maNguoiDung = :maNguoiDung")
    void deleteByNguoiDungMaNguoiDung(@Param("maNguoiDung") Integer maNguoiDung);
    
    @Query("SELECT t FROM ThongBao t WHERE t.nguoiDungId = :nguoiDungId ORDER BY t.thoiGianTao DESC")
    List<ThongBao> findByNguoiDungIdOrderByThoiGianTaoDesc(@Param("nguoiDungId") Integer nguoiDungId);
}
