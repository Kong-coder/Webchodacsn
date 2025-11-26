package com.example.demo.config;

import com.example.demo.repository.KhachHangRepository;
import com.example.demo.service.KhachHangService;
import com.example.demo.service.impl.KhachHangServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ServiceConfig {

    @Bean
    public KhachHangService khachHangService(KhachHangRepository khachHangRepository) {
        return new KhachHangServiceImpl(khachHangRepository);
    }
}
