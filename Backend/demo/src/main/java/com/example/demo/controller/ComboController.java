package com.example.demo.controller;

import com.example.demo.dto.ComboRequest;
import com.example.demo.dto.ComboResponse;
import com.example.demo.service.ComboService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/combos")
public class ComboController {

    private final ComboService comboService;

    public ComboController(ComboService comboService) {
        this.comboService = comboService;
    }

    @GetMapping
    public ResponseEntity<List<ComboResponse>> list(@RequestParam(name = "status", required = false) String status) {
        return ResponseEntity.ok(comboService.list(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComboResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(comboService.get(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping
    public ResponseEntity<ComboResponse> create(@RequestBody ComboRequest request) {
        return ResponseEntity.ok(comboService.create(request));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ComboResponse> update(@PathVariable Long id, @RequestBody ComboRequest request) {
        return ResponseEntity.ok(comboService.update(id, request));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        comboService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
