package com.example.demo.controller;

import com.example.demo.dto.DichVuRequest;
import com.example.demo.dto.DichVuResponse;
import com.example.demo.service.DichVuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/dich-vu")
public class DichVuController {

    private final DichVuService dichVuService;

    public DichVuController(DichVuService dichVuService) {
        this.dichVuService = dichVuService;
    }

    @GetMapping
    public ResponseEntity<List<DichVuResponse>> list(@RequestParam(name = "onlyAvailable", required = false) Boolean onlyAvailable) {
        return ResponseEntity.ok(dichVuService.list(onlyAvailable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DichVuResponse> get(@PathVariable Integer id) {
        return ResponseEntity.ok(dichVuService.get(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping
    public ResponseEntity<DichVuResponse> create(@RequestBody DichVuRequest req) {
        return ResponseEntity.ok(dichVuService.create(req));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<DichVuResponse> update(@PathVariable Integer id, @RequestBody DichVuRequest req) {
        return ResponseEntity.ok(dichVuService.update(id, req));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        dichVuService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<List<DichVuResponse>> getServicesWithStats() {
        return ResponseEntity.ok(dichVuService.getServicesWithStats());
    }
}
