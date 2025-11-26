package com.example.demo.repository;

import com.example.demo.model.NguoiDung;
import com.example.demo.model.VaiTro;
import com.example.demo.repository.custom.NguoiDungRepositoryCustom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Integer>, NguoiDungRepositoryCustom {
    
    @Query("""
        SELECT n FROM NguoiDung n 
        JOIN n.vaiTro v 
        WHERE v = :vaiTro 
        AND (LOWER(n.hoTen) LIKE LOWER(CONCAT('%', :search, '%')) 
             OR LOWER(n.soDienThoai) LIKE LOWER(CONCAT('%', :search, '%')) 
             OR LOWER(n.email) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<NguoiDung> findByVaiTroAndSearch(
        @Param("vaiTro") VaiTro vaiTro,
        @Param("search") String search,
        Pageable pageable
    );
    
    Page<NguoiDung> findByVaiTro(VaiTro vaiTro, Pageable pageable);
    
    boolean existsBySoDienThoaiAndMaNguoiDungNot(String soDienThoai, Integer maNguoiDung);
    @EntityGraph(attributePaths = "vaiTro")
    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);

    @EntityGraph(attributePaths = "vaiTro")
    Optional<NguoiDung> findByEmail(String email);

    @EntityGraph(attributePaths = "vaiTro")
    List<NguoiDung> findByMaNguoiDungIn(Collection<Integer> ids);

    @Query("""
        SELECT n FROM NguoiDung n
        JOIN FETCH n.vaiTro v
        WHERE (:includeCustomers = true OR UPPER(v.tenVaiTro) <> 'KHACHHANG')
          AND (:role IS NULL OR UPPER(v.tenVaiTro) = UPPER(:role))
          AND (:active IS NULL OR n.dangHoatDong = :active)
          AND (
                :search IS NULL
             OR LOWER(n.hoTen) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(n.email) LIKE LOWER(CONCAT('%', :search, '%'))
             OR n.soDienThoai LIKE CONCAT('%', :search, '%')
          )
        ORDER BY n.hoTen ASC
    """)
    List<NguoiDung> searchEmployees(
            @Param("role") String role,
            @Param("active") Boolean active,
            @Param("search") String search,
            @Param("includeCustomers") boolean includeCustomers
    );

    @Query("SELECT n FROM NguoiDung n WHERE n.vaiTro.maVaiTro = :roleId")
    List<NguoiDung> findByRoleId(@Param("roleId") Integer roleId);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Check if phone number exists
    boolean existsBySoDienThoai(String soDienThoai);
    
    // Check if email exists (excluding a specific user)
    @Query("SELECT COUNT(n) > 0 FROM NguoiDung n WHERE n.email = :email AND n.maNguoiDung != :excludeId")
    boolean existsByEmailAndIdNot(@Param("email") String email, @Param("excludeId") Integer excludeId);
    
    // Check if phone number exists (excluding a specific user)
    @Query("SELECT COUNT(n) > 0 FROM NguoiDung n WHERE n.soDienThoai = :phone AND n.maNguoiDung != :excludeId")
    boolean existsByPhoneAndIdNot(@Param("phone") String phone, @Param("excludeId") Integer excludeId);
    
    // Find customers by role
    List<NguoiDung> findByVaiTro(VaiTro vaiTro);
    
    // Find users by role ID
    List<NguoiDung> findByVaiTro_MaVaiTro(Integer maVaiTro);
}
