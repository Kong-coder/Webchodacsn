package com.example.demo.service;

import com.example.demo.model.NguoiDung;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private java.time.LocalDate birthDate;

    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Integer id, String username, String email, String password,
                           String fullName, String phone, String address, java.time.LocalDate birthDate,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.phone = phone;
        this.address = address;
        this.birthDate = birthDate;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(NguoiDung user) {
        Set<String> authorityNames = new LinkedHashSet<>();
        Integer code = (user.getVaiTro() != null) ? user.getVaiTro().getMaVaiTro() : null;
        String ten = (user.getVaiTro() != null) ? user.getVaiTro().getTenVaiTro() : null;

        if (code != null) {
            if (Integer.valueOf(3).equals(code)) {
                // ma_vai_tro = 3 -> QuanLy (Admin/Manager)
                authorityNames.add("ROLE_ADMIN");
                authorityNames.add("ROLE_MANAGER");
                authorityNames.add("ROLE_QUANLY");
            } else if (Integer.valueOf(2).equals(code)) {
                // ma_vai_tro = 2 -> NhanVien (Staff/Employee)
                authorityNames.add("ROLE_EMPLOYEE");
                authorityNames.add("ROLE_STAFF");
                authorityNames.add("ROLE_NHANVIEN");
            } else {
                // ma_vai_tro = 1 -> KhachHang (Customer)
                authorityNames.add("ROLE_CUSTOMER");
                authorityNames.add("ROLE_KHACHHANG");
            }
        }

        if (ten != null && !ten.isBlank()) {
            String key = ten.trim().toUpperCase().replace(" ", "_");
            if (!key.startsWith("ROLE_")) {
                key = "ROLE_" + key;
            }
            authorityNames.add(key);

            if (key.contains("QUAN") || key.contains("ADMIN") || key.contains("MANAGER")) {
                authorityNames.add("ROLE_ADMIN");
                authorityNames.add("ROLE_MANAGER");
                authorityNames.add("ROLE_QUANLY");
            } else if (key.contains("NHAN") || key.contains("STAFF") || key.contains("EMPLOYEE")) {
                authorityNames.add("ROLE_EMPLOYEE");
                authorityNames.add("ROLE_STAFF");
                authorityNames.add("ROLE_NHANVIEN");
            } else if (key.contains("KHACH") || key.contains("CUSTOMER")) {
                authorityNames.add("ROLE_CUSTOMER");
                authorityNames.add("ROLE_KHACHHANG");
            }
        }

        if (authorityNames.isEmpty()) {
            authorityNames.add("ROLE_CUSTOMER");
            authorityNames.add("ROLE_KHACHHANG");
        }

        List<GrantedAuthority> authorities = authorityNames.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toCollection(ArrayList::new));

        return new UserDetailsImpl(
                user.getMaNguoiDung(),
                user.getTenDangNhap(),
                user.getEmail(),
                user.getMatKhauBam(),
                user.getHoTen(),
                user.getSoDienThoai(),
                user.getDiaChi(),
                user.getNgaySinh(),
                authorities);
    }

    // Getters for new fields
    public String getFullName() {
        return fullName;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public java.time.LocalDate getBirthDate() {
        return birthDate;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public Integer getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}