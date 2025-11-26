package com.example.demo.repository.custom;

import com.example.demo.model.NguoiDung;
import com.example.demo.model.VaiTro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NguoiDungRepositoryCustom {
    Page<NguoiDung> findByVaiTroAndSearch(VaiTro vaiTro, String search, Pageable pageable);
}
