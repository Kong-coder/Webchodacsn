package com.example.demo.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "quick_notes")
public class QuickNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Match SpaCalendarService param type (string id acceptable)
    @Column(nullable = false)
    private String employeeId;

    @Column(length = 50)
    private String type;

    @Column(length = 2000)
    private String content;
    
    // Additional fields for calendar integration
    private String date; // Format: YYYY-MM-DD
    
    @Column(name = "start_time")
    private String startTime; // Format: HH:MM
    
    @Column(name = "end_time")
    private String endTime; // Format: HH:MM
    
    private String note; // Detailed note text
    
    private String color; // Hex color code for UI

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
