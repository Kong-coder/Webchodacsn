package com.example.demo.service;

import com.example.demo.model.NguoiDung;
import com.example.demo.model.PasswordResetToken;
import com.example.demo.repository.NguoiDungRepository;
import com.example.demo.repository.PasswordResetTokenRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final NguoiDungRepository nguoiDungRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(NguoiDungRepository nguoiDungRepository, PasswordResetTokenRepository tokenRepository, PasswordEncoder passwordEncoder) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void requestPasswordReset(String email) {
        NguoiDung user = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User with this email not found"));

        String token = UUID.randomUUID().toString();
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(token);
        passwordResetToken.setUser(user);
        passwordResetToken.setExpiryDate(OffsetDateTime.now().plusHours(1));
        tokenRepository.save(passwordResetToken);

        // In a real application, you would send an email with the token.
        // For now, we'll just print it to the console.
        System.out.println("Password reset token for " + email + ": " + token);
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken passwordResetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (passwordResetToken.getExpiryDate().isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Token has expired");
        }

        NguoiDung user = passwordResetToken.getUser();
        user.setMatKhauBam(passwordEncoder.encode(newPassword));
        nguoiDungRepository.save(user);

        tokenRepository.delete(passwordResetToken);
    }
}
