package com.example.demo.service;

import com.example.demo.dto.AttendanceRequest;
import com.example.demo.dto.AttendanceResponse;
import com.example.demo.model.AttendanceRecord;
import com.example.demo.model.NguoiDung;
import com.example.demo.repository.AttendanceRecordRepository;
import com.example.demo.repository.NguoiDungRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final NguoiDungRepository nguoiDungRepository;

    public AttendanceService(AttendanceRecordRepository attendanceRecordRepository,
                             NguoiDungRepository nguoiDungRepository) {
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.nguoiDungRepository = nguoiDungRepository;
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> search(Integer employeeId, String from, String to) {
        LocalDate fromDate = parseDate(from);
        LocalDate toDate = parseDate(to);
        List<AttendanceRecord> records = attendanceRecordRepository.search(employeeId, fromDate, toDate);

        Map<Integer, NguoiDung> employees = loadEmployees(records);
        return records.stream()
                .map(record -> toResponse(record, employees.get(record.getEmployeeId())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AttendanceResponse get(Integer id) {
        AttendanceRecord entity = attendanceRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bản ghi chấm công không tồn tại"));
        NguoiDung employee = loadEmployee(entity.getEmployeeId()).orElse(null);
        return toResponse(entity, employee);
    }

    @Transactional
    public AttendanceResponse create(AttendanceRequest request) {
        validateRequest(request);
        AttendanceRecord entity = new AttendanceRecord();
        applyRequest(entity, request);
        entity.setCreatedAt(OffsetDateTime.now());
        entity.setUpdatedAt(OffsetDateTime.now());
        AttendanceRecord saved = attendanceRecordRepository.save(entity);
        NguoiDung employee = loadEmployee(saved.getEmployeeId()).orElse(null);
        return toResponse(saved, employee);
    }

    @Transactional
    public AttendanceResponse update(Integer id, AttendanceRequest request) {
        AttendanceRecord entity = attendanceRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bản ghi chấm công không tồn tại"));
        validateRequest(request);
        applyRequest(entity, request);
        entity.setUpdatedAt(OffsetDateTime.now());
        AttendanceRecord saved = attendanceRecordRepository.save(entity);
        NguoiDung employee = loadEmployee(saved.getEmployeeId()).orElse(null);
        return toResponse(saved, employee);
    }

    @Transactional
    public void delete(Integer id) {
        AttendanceRecord entity = attendanceRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Bản ghi chấm công không tồn tại"));
        attendanceRecordRepository.delete(entity);
    }

    private void applyRequest(AttendanceRecord entity, AttendanceRequest request) {
        entity.setEmployeeId(request.getEmployeeId());
        entity.setAttendanceDate(parseRequiredDate(request.getDate()));
        entity.setCheckIn(parseTime(request.getCheckIn()));
        entity.setCheckOut(parseTime(request.getCheckOut()));
        entity.setStatus(normalizeText(request.getStatus()));
        entity.setNote(request.getNote());
        entity.setTotalHours(calculateTotalHours(entity.getCheckIn(), entity.getCheckOut()));
    }

    private void validateRequest(AttendanceRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dữ liệu chấm công không hợp lệ");
        }
        if (request.getEmployeeId() == null) {
            throw new IllegalArgumentException("Thiếu thông tin nhân viên");
        }
        ensureEmployeeExists(request.getEmployeeId());
        if (request.getDate() == null || request.getDate().isBlank()) {
            throw new IllegalArgumentException("Ngày chấm công không được để trống");
        }
        if (request.getCheckIn() == null || request.getCheckIn().isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập giờ vào");
        }
        if (request.getCheckOut() == null || request.getCheckOut().isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập giờ ra");
        }
        LocalTime in = parseTime(request.getCheckIn());
        LocalTime out = parseTime(request.getCheckOut());
        if (!out.isAfter(in)) {
            throw new IllegalArgumentException("Giờ ra phải sau giờ vào");
        }
    }

    private void ensureEmployeeExists(Integer employeeId) {
        if (employeeId == null) return;
        boolean exists = nguoiDungRepository.existsById(employeeId);
        if (!exists) {
            throw new IllegalArgumentException("Nhân viên không tồn tại");
        }
    }

    private Map<Integer, NguoiDung> loadEmployees(List<AttendanceRecord> records) {
        Set<Integer> ids = records.stream()
                .map(AttendanceRecord::getEmployeeId)
                .filter(id -> id != null && id > 0)
                .collect(Collectors.toSet());
        if (ids.isEmpty()) {
            return Map.of();
        }
        return nguoiDungRepository.findByMaNguoiDungIn(ids).stream()
                .collect(Collectors.toMap(NguoiDung::getMaNguoiDung, nd -> nd));
    }

    private Optional<NguoiDung> loadEmployee(Integer employeeId) {
        if (employeeId == null) {
            return Optional.empty();
        }
        return nguoiDungRepository.findById(employeeId);
    }

    private AttendanceResponse toResponse(AttendanceRecord entity, NguoiDung employee) {
        AttendanceResponse dto = new AttendanceResponse();
        dto.setId(entity.getId());
        dto.setEmployeeId(entity.getEmployeeId());
        if (employee != null) {
            dto.setEmployeeName(employee.getHoTen());
        }
        dto.setDate(entity.getAttendanceDate() != null ? entity.getAttendanceDate().toString() : null);
        dto.setCheckIn(entity.getCheckIn() != null ? entity.getCheckIn().toString() : null);
        dto.setCheckOut(entity.getCheckOut() != null ? entity.getCheckOut().toString() : null);
        dto.setTotalHours(entity.getTotalHours() != null ? entity.getTotalHours().doubleValue() : null);
        dto.setStatus(entity.getStatus());
        dto.setNote(entity.getNote());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private BigDecimal calculateTotalHours(LocalTime checkIn, LocalTime checkOut) {
        if (checkIn == null || checkOut == null) {
            return BigDecimal.ZERO;
        }
        Duration duration = Duration.between(checkIn, checkOut);
        long minutes = Math.max(0, duration.toMinutes());
        BigDecimal hours = BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        return hours;
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        return LocalDate.parse(value);
    }

    private LocalDate parseRequiredDate(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Ngày chấm công không hợp lệ");
        }
        return LocalDate.parse(value);
    }

    private LocalTime parseTime(String value) {
        if (value == null || value.isBlank()) return null;
        return LocalTime.parse(value);
    }

    private String normalizeText(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
