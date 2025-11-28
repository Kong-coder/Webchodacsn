package com.example.demo.dto;

import lombok.Data;

@Data
public class CustomerPreferencesUpdate {
    private String favoriteService;
    private String preferredStaff;
    private String notes;
}
