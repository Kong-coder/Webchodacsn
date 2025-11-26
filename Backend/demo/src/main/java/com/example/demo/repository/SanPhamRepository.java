package com.example.demo.repository;

import com.example.demo.model.SanPham;
import com.example.demo.model.LoaiSanPham;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

public interface SanPhamRepository extends JpaRepository<SanPham, Long> {
    
    // Tìm kiếm sản phẩm theo tên (không phân biệt hoa thường)
    Page<SanPham> findByTenSanPhamContainingIgnoreCase(String tenSanPham, Pageable pageable);
    
    // Tìm kiếm sản phẩm theo loại sản phẩm
    Page<SanPham> findByLoaiSanPham(LoaiSanPham loaiSanPham, Pageable pageable);
    
    // Tìm kiếm sản phẩm theo trạng thái
    Page<SanPham> findByTrangThai(Boolean trangThai, Pageable pageable);
    
    // Tìm kiếm sản phẩm theo tên và loại sản phẩm
    Page<SanPham> findByTenSanPhamContainingIgnoreCaseAndLoaiSanPham(
        String tenSanPham, LoaiSanPham loaiSanPham, Pageable pageable);
    
    // Lấy sản phẩm theo mã sản phẩm
    Optional<SanPham> findByMaSanPham(String maSanPham);
    
    // Kiểm tra tồn tại sản phẩm theo mã sản phẩm
    boolean existsByMaSanPham(String maSanPham);
    
    // Lấy danh sách sản phẩm sắp hết hàng (số lượng tồn <= mức tối thiểu)
    @Query("SELECT s FROM SanPham s WHERE s.soLuongTon <= s.tonKhoToiThieu AND s.trangThai = true")
    List<SanPham> findSanPhamSapHetHang();
    
    // Đếm số lượng sản phẩm sắp hết hàng
    @Query("SELECT COUNT(s) FROM SanPham s WHERE s.soLuongTon <= s.tonKhoToiThieu AND s.trangThai = true")
    long countSanPhamSapHetHang();
    
    // Lấy top sản phẩm bán chạy
    @Query(value = "SELECT s.* FROM san_pham s " +
                 "LEFT JOIN chi_tiet_hoa_don cthd ON s.id = cthd.san_pham_id " +
                 "WHERE s.trang_thai = true " +
                 "GROUP BY s.id " +
                 "ORDER BY COALESCE(SUM(cthd.so_luong), 0) DESC, s.ten_san_pham ASC " +
                 "LIMIT :limit", nativeQuery = true)
    List<SanPham> findTopSanPhamBanChay(@Param("limit") int limit);
    
    // Lấy sản phẩm còn hàng (số lượng > 0)
    Page<SanPham> findBySoLuongTonGreaterThan(Integer soLuong, Pageable pageable);
    
    // Lấy sản phẩm hết hàng (số lượng = 0)
    Page<SanPham> findBySoLuongTonEquals(Integer soLuong, Pageable pageable);
    
    // Lấy sản phẩm theo khoảng giá
    Page<SanPham> findByGiaBanBetween(BigDecimal minGia, BigDecimal maxGia, Pageable pageable);
}
