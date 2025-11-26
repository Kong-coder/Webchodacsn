package com.example.demo.controller;

import com.example.demo.dto.StaffShiftRequest;
import com.example.demo.dto.StaffShiftResponse;
import com.example.demo.dto.StaffShiftSearchRequest;
import com.example.demo.service.StaffShiftService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff-shifts")
public class StaffShiftController {

    private final StaffShiftService staffShiftService;

    public StaffShiftController(StaffShiftService staffShiftService) {
        this.staffShiftService = staffShiftService;
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @PostMapping("/search")
    public ResponseEntity<List<StaffShiftResponse>> search(@RequestBody StaffShiftSearchRequest request) {
        return ResponseEntity.ok(staffShiftService.search(request));
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @GetMapping("/{id}")
    public ResponseEntity<StaffShiftResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(staffShiftService.getById(id));
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @PostMapping
    public ResponseEntity<StaffShiftResponse> create(@RequestBody StaffShiftRequest request) {
        return ResponseEntity.ok(staffShiftService.create(request));
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<StaffShiftResponse> update(@PathVariable Integer id, @RequestBody StaffShiftRequest request) {
        return ResponseEntity.ok(staffShiftService.update(id, request));
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        staffShiftService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
