package com.example.demo.service;

import com.example.demo.model.NguoiDung;
import com.example.demo.repository.NguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhap(username)
                .orElseGet(() -> nguoiDungRepository.findByEmail(username)
                        .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username/email: " + username)));

        return UserDetailsImpl.build(nguoiDung);
    }
}
