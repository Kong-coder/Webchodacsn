package com.example.demo.controller;

import com.example.demo.dto.AttendanceRequest;
import com.example.demo.dto.AttendanceResponse;
import com.example.demo.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public ResponseEntity<List<AttendanceResponse>> search(
            @RequestParam(value = "employeeId", required = false) Integer employeeId,
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "to", required = false) String to
    ) {
        return ResponseEntity.ok(attendanceService.search(employeeId, from, to));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(attendanceService.get(id));
    }

    @PostMapping
    public ResponseEntity<AttendanceResponse> create(@RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceResponse> update(@PathVariable Integer id, @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        attendanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
