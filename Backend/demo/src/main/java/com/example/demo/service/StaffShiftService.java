package com.example.demo.service;

import com.example.demo.dto.StaffShiftRequest;
import com.example.demo.dto.StaffShiftResponse;
import com.example.demo.dto.StaffShiftSearchRequest;
import com.example.demo.model.NguoiDung;
import com.example.demo.model.StaffShift;
import com.example.demo.repository.NguoiDungRepository;
import com.example.demo.repository.StaffShiftRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StaffShiftService {

    private final StaffShiftRepository staffShiftRepository;
    private final NguoiDungRepository nguoiDungRepository;

    public StaffShiftService(StaffShiftRepository staffShiftRepository, NguoiDungRepository nguoiDungRepository) {
        this.staffShiftRepository = staffShiftRepository;
        this.nguoiDungRepository = nguoiDungRepository;
    }

    @Transactional(readOnly = true)
    public List<StaffShiftResponse> search(StaffShiftSearchRequest request) {
        LocalDate from = request != null && request.getFrom() != null && !request.getFrom().isEmpty() ? LocalDate.parse(request.getFrom()) : null;
        LocalDate to = request != null && request.getTo() != null && !request.getTo().isEmpty() ? LocalDate.parse(request.getTo()) : null;
        Integer employeeId = request != null ? request.getEmployeeId() : null;
        String status = request != null && request.getStatus() != null && !request.getStatus().isEmpty() ? request.getStatus() : null;

        // Get all shifts and filter in Java to avoid PostgreSQL type issues
        List<StaffShift> allShifts = staffShiftRepository.findAll();
        
        List<StaffShift> shifts = allShifts.stream()
            .filter(shift -> employeeId == null || shift.getEmployeeId().equals(employeeId))
            .filter(shift -> from == null || !shift.getDate().isBefore(from))
            .filter(shift -> to == null || !shift.getDate().isAfter(to))
            .filter(shift -> status == null || status.equals(shift.getStatus()))
            .sorted((s1, s2) -> {
                int dateCompare = s2.getDate().compareTo(s1.getDate());
                if (dateCompare != 0) return dateCompare;
                return s2.getStartTime().compareTo(s1.getStartTime());
            })
            .collect(Collectors.toList());
            
        return shifts.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StaffShiftResponse getById(Integer id) {
        StaffShift shift = staffShiftRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ca làm không tồn tại"));
        return toResponse(shift);
    }

    @Transactional
    public StaffShiftResponse create(StaffShiftRequest request) {
        validateRequest(request);
        StaffShift entity = new StaffShift();
        applyRequest(entity, request);
        StaffShift saved = staffShiftRepository.save(entity);
        return toResponse(saved);
    }

    @Transactional
    public StaffShiftResponse update(Integer id, StaffShiftRequest request) {
        validateRequest(request);
        StaffShift entity = staffShiftRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ca làm không tồn tại"));
        applyRequest(entity, request);
        StaffShift saved = staffShiftRepository.save(entity);
        return toResponse(saved);
    }

    @Transactional
    public void delete(Integer id) {
        if (!staffShiftRepository.existsById(id)) {
            throw new IllegalArgumentException("Ca làm không tồn tại");
        }
        staffShiftRepository.deleteById(id);
    }

    private void validateRequest(StaffShiftRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dữ liệu ca làm không hợp lệ");
        }
        if (request.getEmployeeId() == null) {
            throw new IllegalArgumentException("Thiếu thông tin nhân viên");
        }
        Optional<NguoiDung> employee = nguoiDungRepository.findById(request.getEmployeeId());
        if (employee.isEmpty()) {
            throw new IllegalArgumentException("Nhân viên không tồn tại");
        }
        if (request.getDate() == null || request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Thiếu thông tin ngày hoặc thời gian");
        }
    }

    private void applyRequest(StaffShift entity, StaffShiftRequest request) {
        entity.setEmployeeId(request.getEmployeeId());
        entity.setDate(LocalDate.parse(request.getDate()));
        entity.setStartTime(LocalTime.parse(request.getStartTime()));
        entity.setEndTime(LocalTime.parse(request.getEndTime()));
        entity.setServiceId(request.getServiceId());
        entity.setCustomerName(request.getCustomerName());
        entity.setPhone(request.getPhone());
        entity.setNote(request.getNote());
        entity.setDuration(request.getDuration());
        entity.setPrice(request.getPrice());
        entity.setCommission(request.getCommission());
        entity.setStatus(request.getStatus() != null ? request.getStatus() : "pending");
        entity.setColor(request.getColor());
    }

    private StaffShiftResponse toResponse(StaffShift entity) {
        StaffShiftResponse dto = new StaffShiftResponse();
        dto.setId(entity.getId());
        dto.setEmployeeId(entity.getEmployeeId());
        
        // Get employee name
        nguoiDungRepository.findById(entity.getEmployeeId()).ifPresent(employee -> {
            dto.setEmployeeName(employee.getHoTen());
        });
        
        dto.setDate(entity.getDate() != null ? entity.getDate().toString() : null);
        dto.setStartTime(entity.getStartTime() != null ? entity.getStartTime().toString() : null);
        dto.setEndTime(entity.getEndTime() != null ? entity.getEndTime().toString() : null);
        dto.setServiceId(entity.getServiceId());
        dto.setServiceName(null); // TODO: Add service repository if needed
        dto.setCustomerName(entity.getCustomerName());
        dto.setPhone(entity.getPhone());
        dto.setNote(entity.getNote());
        dto.setDuration(entity.getDuration());
        dto.setPrice(entity.getPrice());
        dto.setCommission(entity.getCommission());
        dto.setStatus(entity.getStatus());
        dto.setColor(entity.getColor());
        return dto;
    }

}
