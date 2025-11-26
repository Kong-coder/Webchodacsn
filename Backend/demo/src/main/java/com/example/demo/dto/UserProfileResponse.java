package com.example.demo.dto;

import java.time.OffsetDateTime;
import java.util.List;

public class UserProfileResponse {
    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String birthDate; // ISO date string or null
    private Boolean active;
    private OffsetDateTime createdAt;

    private List<String> roles; // e.g., ["ROLE_ADMIN"]
    private String role;        // convenience: first role or derived

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getBirthDate() { return birthDate; }
    public void setBirthDate(String birthDate) { this.birthDate = birthDate; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
