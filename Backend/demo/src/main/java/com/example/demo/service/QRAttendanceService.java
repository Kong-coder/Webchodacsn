package com.example.demo.service;

import com.example.demo.dto.AttendanceResponse;
import com.example.demo.dto.QRCodeResponse;
import com.example.demo.model.Attendance;
import com.example.demo.model.NguoiDung;
import com.example.demo.model.QRAttendanceToken;
import com.example.demo.repository.AttendanceRepository;
import com.example.demo.repository.NguoiDungRepository;
import com.example.demo.repository.QRAttendanceTokenRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QRAttendanceService {

    private final QRAttendanceTokenRepository tokenRepository;
    private final AttendanceRepository attendanceRepository;
    private final NguoiDungRepository nguoiDungRepository;

    @Value("${app.frontend.url:http://localhost:3001}")
    private String frontendUrl;

    public QRAttendanceService(QRAttendanceTokenRepository tokenRepository,
                              AttendanceRepository attendanceRepository,
                              NguoiDungRepository nguoiDungRepository) {
        this.tokenRepository = tokenRepository;
        this.attendanceRepository = attendanceRepository;
        this.nguoiDungRepository = nguoiDungRepository;
    }

    @Transactional
    public QRCodeResponse generateQRCode(Integer managerId) {
        LocalDate today = LocalDate.now();
        
        // Check if token already exists for today
        Optional<QRAttendanceToken> existingToken = tokenRepository
            .findByCreatedDateAndIsActive(today, true);
        
        if (existingToken.isPresent()) {
            return convertToQRCodeResponse(existingToken.get());
        }
        
        // Generate new token
        String token = generateToken();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusHours(24);
        
        QRAttendanceToken qrToken = new QRAttendanceToken(
            token, today, now, expiresAt, managerId
        );
        
        qrToken = tokenRepository.save(qrToken);
        
        return convertToQRCodeResponse(qrToken);
    }

    public QRCodeResponse getTodayQRCode() {
        LocalDate today = LocalDate.now();
        Optional<QRAttendanceToken> token = tokenRepository
            .findByCreatedDateAndIsActive(today, true);
        
        if (token.isEmpty()) {
            throw new IllegalStateException("Chưa có mã QR cho hôm nay. Vui lòng tạo mã mới.");
        }
        
        return convertToQRCodeResponse(token.get());
    }

    public boolean validateToken(String token) {
        Optional<QRAttendanceToken> qrToken = tokenRepository.findByToken(token);
        
        if (qrToken.isEmpty()) {
            return false;
        }
        
        return qrToken.get().isValidForToday();
    }

    @Transactional
    public AttendanceResponse checkIn(String token, Integer employeeId) {
        // Validate token
        if (!validateToken(token)) {
            throw new IllegalArgumentException("Mã QR không hợp lệ hoặc đã hết hạn");
        }
        
        LocalDate today = LocalDate.now();
        
        // Check if already checked in today
        if (attendanceRepository.existsByEmployeeIdAndDate(employeeId, today)) {
            throw new IllegalStateException("Bạn đã chấm công vào hôm nay");
        }
        
        // Create attendance record
        Attendance attendance = new Attendance(employeeId, today, LocalTime.now());
        attendance = attendanceRepository.save(attendance);
        
        return convertToAttendanceResponse(attendance);
    }

    @Transactional
    public AttendanceResponse checkOut(Integer attendanceId, Integer employeeId) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bản ghi chấm công"));
        
        // Verify employee owns this attendance record
        if (!attendance.getEmployeeId().equals(employeeId)) {
            throw new IllegalArgumentException("Bạn không có quyền cập nhật bản ghi này");
        }
        
        // Check if already checked out
        if (attendance.hasCheckedOut()) {
            throw new IllegalStateException("Bạn đã chấm công ra rồi");
        }
        
        // Update check-out time
        attendance.setCheckOutTime(LocalTime.now());
        attendance = attendanceRepository.save(attendance);
        
        return convertToAttendanceResponse(attendance);
    }

    public List<AttendanceResponse> getTodayAttendance() {
        LocalDate today = LocalDate.now();
        List<Attendance> attendances = attendanceRepository.findByDate(today);
        
        return attendances.stream()
            .map(this::convertToAttendanceResponse)
            .collect(Collectors.toList());
    }

    public List<AttendanceResponse> getAttendanceByDate(LocalDate date) {
        List<Attendance> attendances = attendanceRepository.findByDate(date);
        
        return attendances.stream()
            .map(this::convertToAttendanceResponse)
            .collect(Collectors.toList());
    }

    public Optional<AttendanceResponse> getTodayAttendanceForEmployee(Integer employeeId) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> attendance = attendanceRepository
            .findByEmployeeIdAndDate(employeeId, today);
        
        return attendance.map(this::convertToAttendanceResponse);
    }

    public List<AttendanceResponse> getAttendanceByEmployeeAndDateRange(
            Integer employeeId, LocalDate fromDate, LocalDate toDate) {
        List<Attendance> attendances = attendanceRepository
            .findByEmployeeIdAndDateBetween(employeeId, fromDate, toDate);
        
        return attendances.stream()
            .map(this::convertToAttendanceResponse)
            .collect(Collectors.toList());
    }

    private String generateToken() {
        LocalDate today = LocalDate.now();
        String uuid = UUID.randomUUID().toString();
        return today.toString().replace("-", "") + "_" + uuid;
    }

    private QRCodeResponse convertToQRCodeResponse(QRAttendanceToken token) {
        String checkInUrl = frontendUrl + "/attendance/checkin?token=" + token.getToken();
        String qrCodeImage = generateQRCodeImage(checkInUrl);
        
        return new QRCodeResponse(
            token.getToken(),
            qrCodeImage,
            token.getCreatedDate().toString(),
            token.getExpiresAt().toString()
        );
    }

    private String generateQRCodeImage(String text) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 300, 300);
            
            BufferedImage image = MatrixToImageWriter.toBufferedImage(bitMatrix);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", baos);
            
            byte[] imageBytes = baos.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(imageBytes);
            
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Không thể tạo mã QR", e);
        }
    }

    private AttendanceResponse convertToAttendanceResponse(Attendance attendance) {
        AttendanceResponse response = new AttendanceResponse();
        response.setId(attendance.getId());
        response.setEmployeeId(attendance.getEmployeeId());
        response.setDate(attendance.getDate().toString());
        response.setCheckInTime(attendance.getCheckInTime() != null ? 
            attendance.getCheckInTime().toString() : null);
        response.setCheckOutTime(attendance.getCheckOutTime() != null ? 
            attendance.getCheckOutTime().toString() : null);
        response.setTotalHours(attendance.getTotalHours());
        response.setNotes(attendance.getNotes());
        response.setStatus(attendance.hasCheckedOut() ? "checked_out" : "checked_in");
        
        // Get employee name
        nguoiDungRepository.findById(attendance.getEmployeeId()).ifPresent(employee -> {
            response.setEmployeeName(employee.getHoTen());
        });
        
        return response;
    }
}
