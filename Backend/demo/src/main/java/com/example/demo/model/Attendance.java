package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Duration;

@Entity
@Table(name = "cham_cong")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_cham_cong")
    private Integer id;

    @Column(name = "ma_nhan_vien", nullable = false)
    private Integer employeeId;

    @Column(name = "ngay_cham_cong", nullable = false)
    private LocalDate date;

    @Column(name = "gio_vao")
    private LocalTime checkInTime;

    @Column(name = "gio_ra")
    private LocalTime checkOutTime;

    @Column(name = "tong_gio")
    private Double totalHours;

    @Column(name = "ghi_chu")
    private String notes;

    // Constructors
    public Attendance() {
    }

    public Attendance(Integer employeeId, LocalDate date, LocalTime checkInTime) {
        this.employeeId = employeeId;
        this.date = date;
        this.checkInTime = checkInTime;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Integer employeeId) {
        this.employeeId = employeeId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalTime checkOutTime) {
        this.checkOutTime = checkOutTime;
        // Auto-calculate total hours when check-out is set
        if (this.checkInTime != null && checkOutTime != null) {
            this.totalHours = calculateHours(this.checkInTime, checkOutTime);
        }
    }

    public Double getTotalHours() {
        return totalHours;
    }

    public void setTotalHours(Double totalHours) {
        this.totalHours = totalHours;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Helper method to calculate hours
    private Double calculateHours(LocalTime checkIn, LocalTime checkOut) {
        if (checkIn == null || checkOut == null) {
            return null;
        }
        Duration duration = Duration.between(checkIn, checkOut);
        return duration.toMinutes() / 60.0;
    }

    public boolean hasCheckedOut() {
        return this.checkOutTime != null;
    }
}
