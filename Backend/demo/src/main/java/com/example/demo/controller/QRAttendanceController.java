package com.example.demo.controller;

import com.example.demo.dto.AttendanceResponse;
import com.example.demo.dto.QRCodeResponse;
import com.example.demo.service.QRAttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/attendance/qr")
public class QRAttendanceController {

    private final QRAttendanceService qrAttendanceService;

    public QRAttendanceController(QRAttendanceService qrAttendanceService) {
        this.qrAttendanceService = qrAttendanceService;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'QUANLY')")
    public ResponseEntity<?> generateQRCode() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer managerId = getUserIdFromAuth(auth);
            
            QRCodeResponse response = qrAttendanceService.generateQRCode(managerId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/today")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'QUANLY')")
    public ResponseEntity<?> getTodayQRCode() {
        try {
            QRCodeResponse response = qrAttendanceService.getTodayQRCode();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/checkin")
    public ResponseEntity<?> checkIn(@RequestParam String token) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            if (auth == null || !auth.isAuthenticated() || 
                auth.getPrincipal().equals("anonymousUser")) {
                return ResponseEntity.status(401)
                    .body(Map.of("error", "Vui lòng đăng nhập để chấm công"));
            }
            
            Integer employeeId = getUserIdFromAuth(auth);
            AttendanceResponse response = qrAttendanceService.checkIn(token, employeeId);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Có lỗi xảy ra: " + e.getMessage()));
        }
    }

    @PostMapping("/checkout/{attendanceId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'NHANVIEN', 'QUANLY')")
    public ResponseEntity<?> checkOut(@PathVariable Integer attendanceId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer employeeId = getUserIdFromAuth(auth);
            
            AttendanceResponse response = qrAttendanceService.checkOut(attendanceId, employeeId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Có lỗi xảy ra: " + e.getMessage()));
        }
    }

    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'QUANLY')")
    public ResponseEntity<?> getTodayAttendance() {
        try {
            List<AttendanceResponse> attendances = qrAttendanceService.getTodayAttendance();
            return ResponseEntity.ok(attendances);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/list/{date}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'QUANLY')")
    public ResponseEntity<?> getAttendanceByDate(@PathVariable String date) {
        try {
            LocalDate localDate = LocalDate.parse(date);
            List<AttendanceResponse> attendances = qrAttendanceService.getAttendanceByDate(localDate);
            return ResponseEntity.ok(attendances);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-attendance")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'NHANVIEN', 'QUANLY')")
    public ResponseEntity<?> getMyTodayAttendance() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer employeeId = getUserIdFromAuth(auth);
            
            Optional<AttendanceResponse> attendance = qrAttendanceService
                .getTodayAttendanceForEmployee(employeeId);
            
            if (attendance.isPresent()) {
                return ResponseEntity.ok(attendance.get());
            } else {
                return ResponseEntity.ok(Map.of("message", "Chưa chấm công hôm nay"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'NHANVIEN', 'QUANLY')")
    public ResponseEntity<?> getEmployeeAttendance(
            @PathVariable Integer employeeId,
            @RequestParam String from,
            @RequestParam String to) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Integer currentUserId = getUserIdFromAuth(auth);
            
            // Only allow users to view their own attendance unless they're a manager
            boolean isManager = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_QUANLY") || 
                              a.getAuthority().equals("ROLE_MANAGER"));
            
            if (!currentUserId.equals(employeeId) && !isManager) {
                return ResponseEntity.status(403)
                    .body(Map.of("error", "Bạn không có quyền xem chấm công của người khác"));
            }
            
            LocalDate fromDate = LocalDate.parse(from);
            LocalDate toDate = LocalDate.parse(to);
            
            List<AttendanceResponse> attendances = qrAttendanceService
                .getAttendanceByEmployeeAndDateRange(employeeId, fromDate, toDate);
            
            return ResponseEntity.ok(attendances);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    private Integer getUserIdFromAuth(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            String username = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            // This is a simplified approach - you might need to adjust based on your UserDetails implementation
            if (principal instanceof com.example.demo.service.UserDetailsImpl) {
                return ((com.example.demo.service.UserDetailsImpl) principal).getId();
            }
        }
        throw new IllegalStateException("Không thể xác định user ID");
    }
}
