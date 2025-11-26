package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

import java.util.Date;

public class UpdateCustomerRequest {
    private String name;
    
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @Pattern(regexp = "^$|\\d{9,11}", message = "Số điện thoại phải có 9-11 chữ số")
    private String phone;
    
    private String address;
    private Date birthDate;
    private String note;
    private Boolean active;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Date getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}