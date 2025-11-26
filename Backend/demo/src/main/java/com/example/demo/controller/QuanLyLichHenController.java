package com.example.demo.controller;

import com.example.demo.dto.LichHenActionRequest;
import com.example.demo.dto.LichHenResponse;
import com.example.demo.dto.LichHenSearchRequest;
import com.example.demo.dto.LichHenRequest;
import com.example.demo.service.LichHenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lich-hen")
public class QuanLyLichHenController {

    private final LichHenService lichHenService;

    public QuanLyLichHenController(LichHenService lichHenService) {
        this.lichHenService = lichHenService;
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @PostMapping("/search")
    public ResponseEntity<List<LichHenResponse>> search(@RequestBody LichHenSearchRequest req) {
        return ResponseEntity.ok(lichHenService.search(req));
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @GetMapping("/{id}")
    public ResponseEntity<LichHenResponse> getById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(lichHenService.getById(id));
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @PatchMapping("/{id}/actions")
    public ResponseEntity<LichHenResponse> applyAction(
            @PathVariable("id") Integer id,
            @RequestBody LichHenActionRequest req
    ) {
        return ResponseEntity.ok(lichHenService.applyAction(id, req));
    }

    @GetMapping("/completed-by-customer/{customerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LichHenResponse>> getCompletedByCustomerId(@PathVariable Long customerId) {
        // Assuming LichHenService has a method to get completed appointments by customer ID
        return ResponseEntity.ok(lichHenService.getCompletedByCustomerId(customerId));
    }

    @GetMapping("/my-appointments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LichHenResponse>> getMyAppointments() {
        // This needs to be implemented in the service layer to get appointments for the logged-in user
        // For now, we'll assume the service can fetch appointments based on the authenticated user
        return ResponseEntity.ok(lichHenService.getMyAppointments());
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LichHenResponse> updateLichHen(@PathVariable("id") Integer id, @RequestBody LichHenRequest req) {
        return ResponseEntity.ok(lichHenService.updateLichHen(id, req));
    }
}
