package com.example.demo.service;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.ProfileUpdateRequest;
import com.example.demo.model.NguoiDung;
import com.example.demo.repository.NguoiDungRepository;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Transactional(readOnly = true)
    public NguoiDung getUserProfile(String username) {
        return nguoiDungRepository.findByTenDangNhap(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    @Transactional
    public NguoiDung updateUserProfile(String username, ProfileUpdateRequest updateRequest) {
        logger.info("Attempting to update profile for user: {}", username);
        try {
            NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhap(username)
                    .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

            logger.debug("User found: {}", nguoiDung.getTenDangNhap());

            if (updateRequest.getFullName() != null && !updateRequest.getFullName().isEmpty()) {
                nguoiDung.setHoTen(updateRequest.getFullName());
            }
            if (updateRequest.getPhone() != null && !updateRequest.getPhone().isEmpty()) {
                nguoiDung.setSoDienThoai(updateRequest.getPhone());
            }
            if (updateRequest.getAddress() != null && !updateRequest.getAddress().isEmpty()) {
                nguoiDung.setDiaChi(updateRequest.getAddress());
            }
            if (updateRequest.getGender() != null && !updateRequest.getGender().isEmpty()) {
                nguoiDung.setGioiTinh(updateRequest.getGender());
            }

            // Check if email is being changed and if the new email is already taken by another user
            if (updateRequest.getEmail() != null && !updateRequest.getEmail().isEmpty() && !nguoiDung.getEmail().equals(updateRequest.getEmail())) {
                logger.debug("Email changed from {} to {}", nguoiDung.getEmail(), updateRequest.getEmail());
                if (nguoiDungRepository.findByEmail(updateRequest.getEmail()).isPresent()) {
                    logger.warn("Attempted to update with duplicate email: {}", updateRequest.getEmail());
                    throw new RuntimeException("Email đã tồn tại. Vui lòng sử dụng email khác.");
                }
                nguoiDung.setEmail(updateRequest.getEmail());
            }

            if (updateRequest.getBirthDate() != null && !updateRequest.getBirthDate().isEmpty()) {
                // Assuming frontend sends date in YYYY-MM-DD format (standard for input type="date")
                logger.debug("Parsing birthDate: {}", updateRequest.getBirthDate());
                nguoiDung.setNgaySinh(LocalDate.parse(updateRequest.getBirthDate()));
            }

            NguoiDung updatedNguoiDung = nguoiDungRepository.saveAndFlush(nguoiDung);
            logger.info("User profile updated successfully for user: {}", username);
            return updatedNguoiDung;
        } catch (Exception e) {
            logger.error("Error updating user profile for {}: {}", username, e.getMessage(), e);
            throw e; // Re-throw the exception to ensure transaction rollback and error propagation
        }
    }
}
