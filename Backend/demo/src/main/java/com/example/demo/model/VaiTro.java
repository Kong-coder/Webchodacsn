package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "vai_tro")
public class VaiTro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_vai_tro")
    private Integer maVaiTro;

    @Column(name = "ten_vai_tro", unique = true, nullable = false)
    private String tenVaiTro;

    // Getters and Setters
    public Integer getMaVaiTro() {
        return maVaiTro;
    }

    public void setMaVaiTro(Integer maVaiTro) {
        this.maVaiTro = maVaiTro;
    }

    public String getTenVaiTro() {
        return tenVaiTro;
    }

    public void setTenVaiTro(String tenVaiTro) {
        this.tenVaiTro = tenVaiTro;
    }
}
