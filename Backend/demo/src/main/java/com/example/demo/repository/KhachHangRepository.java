package com.example.demo.repository;

import com.example.demo.model.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, Long> {
    
    // Existing methods with updated ID type
    List<KhachHang> findByHoTenContainingIgnoreCase(String hoTen);
    List<KhachHang> findBySoDienThoaiContaining(String soDienThoai);
    boolean existsBySoDienThoai(String soDienThoai);
    boolean existsBySoDienThoaiAndIdNot(String soDienThoai, Long id);
    
    // New methods needed for the service implementation
    List<KhachHang> findByTrangThai(boolean trangThai);
    
    @Query("SELECT k FROM KhachHang k WHERE LOWER(k.hoTen) LIKE LOWER(concat('%', :search, '%')) OR " +
           "LOWER(k.soDienThoai) LIKE LOWER(concat('%', :search, '%'))")
    List<KhachHang> findByHoTenContainingIgnoreCaseOrSoDienThoaiContaining(
        @Param("search") String search, @Param("search") String search2);
    
    @Query("SELECT k FROM KhachHang k WHERE (LOWER(k.hoTen) LIKE LOWER(concat('%', :search, '%')) OR " +
           "LOWER(k.soDienThoai) LIKE LOWER(concat('%', :search, '%'))) AND k.trangThai = :trangThai")
    List<KhachHang> findByHoTenContainingIgnoreCaseOrSoDienThoaiContainingAndTrangThai(
        @Param("search") String search, @Param("search") String search2, @Param("trangThai") boolean trangThai);
    
    @Query("SELECT COUNT(k) FROM KhachHang k WHERE k.ngayTao BETWEEN :startDate AND :endDate")
    long countByNgayTaoBetween(@Param("startDate") LocalDateTime startDate, 
                             @Param("endDate") LocalDateTime endDate);
    
    // Find customer by NguoiDung ID
    KhachHang findByMaNguoiDung(Integer maNguoiDung);
}
