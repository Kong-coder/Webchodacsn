package com.example.demo.controller;

import com.example.demo.model.QuickNote;
import com.example.demo.repository.QuickNoteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/quick-notes")
public class QuickNoteController {

    private final QuickNoteRepository repo;

    public QuickNoteController(QuickNoteRepository repo) {
        this.repo = repo;
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @GetMapping
    public ResponseEntity<List<QuickNote>> list(@RequestParam(name = "employeeId", required = false) String employeeId) {
        if (employeeId == null || employeeId.isBlank()) {
            return ResponseEntity.ok(repo.findAll());
        }
        return ResponseEntity.ok(repo.findByEmployeeIdOrderByCreatedAtDesc(employeeId));
    }

    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER')")
    @GetMapping("/{id}")
    public ResponseEntity<QuickNote> get(@PathVariable Long id) {
        Optional<QuickNote> opt = repo.findById(id);
        return opt.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping
    public ResponseEntity<QuickNote> create(@RequestBody QuickNote note) {
        // Set created timestamp if not provided
        if (note.getCreatedAt() == null) {
            note.setCreatedAt(java.time.OffsetDateTime.now());
        }
        return ResponseEntity.ok(repo.save(note));
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<QuickNote> update(@PathVariable Long id, @RequestBody QuickNote note) {
        return repo.findById(id)
                .map(n -> {
                    n.setEmployeeId(note.getEmployeeId());
                    n.setType(note.getType());
                    n.setContent(note.getContent());
                    n.setDate(note.getDate());
                    n.setStartTime(note.getStartTime());
                    n.setEndTime(note.getEndTime());
                    n.setNote(note.getNote());
                    n.setColor(note.getColor());
                    return ResponseEntity.ok(repo.save(n));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
