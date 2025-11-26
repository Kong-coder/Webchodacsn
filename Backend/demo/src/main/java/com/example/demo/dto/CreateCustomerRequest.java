package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.util.Date;

public class CreateCustomerRequest {
    @NotBlank(message = "Tên không được để trống")
    private String name;
    
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @Pattern(regexp = "\\d{10,11}", message = "Số điện thoại không hợp lệ")
    private String phone;
    
    private String address;
    private Date birthDate;
    private Boolean vip = false;
    private Integer points = 0;
    private String note;
    private String username;
    
    // Mật khẩu mặc định là số điện thoại nếu không cung cấp
    public String getPassword() {
        return this.phone != null ? this.phone : "123456";
    }
    
    // Tạo tên đăng nhập tự động nếu không cung cấp
    public String getUsername() {
        return this.username != null ? this.username : 
            "user" + (this.phone != null ? this.phone : System.currentTimeMillis());
    }

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

    public Boolean getVip() {
        return vip;
    }

    public void setVip(Boolean vip) {
        this.vip = vip;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}