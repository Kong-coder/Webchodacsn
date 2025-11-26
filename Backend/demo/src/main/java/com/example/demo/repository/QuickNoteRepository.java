package com.example.demo.repository;

import com.example.demo.model.QuickNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuickNoteRepository extends JpaRepository<QuickNote, Long> {
    List<QuickNote> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);
}
