package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "lichlamviec")
public class StaffShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_lich_lam_viec")
    private Integer id;

    @Column(name = "ma_nhan_vien", nullable = false)
    private Integer employeeId;

    @Column(name = "ngay_lam_viec", nullable = false)
    private LocalDate date;

    @Column(name = "gio_bat_dau", nullable = false)
    private LocalTime startTime;

    @Column(name = "gio_ket_thuc", nullable = false)
    private LocalTime endTime;

    @Column(name = "ma_dich_vu")
    private Integer serviceId;

    @Column(name = "ten_khach_hang")
    private String customerName;

    @Column(name = "so_dien_thoai")
    private String phone;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String note;

    @Column(name = "thoi_luong")
    private Integer duration;

    @Column(name = "gia_dich_vu")
    private Double price;

    @Column(name = "hoa_hong")
    private Double commission;

    @Column(name = "trang_thai", length = 50)
    private String status;

    @Column(name = "mau_sac", length = 20)
    private String color;

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

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Integer getServiceId() {
        return serviceId;
    }

    public void setServiceId(Integer serviceId) {
        this.serviceId = serviceId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getCommission() {
        return commission;
    }

    public void setCommission(Double commission) {
        this.commission = commission;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
