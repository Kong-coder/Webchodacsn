package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionsController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(
            @RequestParam(value = "dateRange", required = false) String dateRange,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate
    ) {
        return ResponseEntity.ok(List.of());
    }
}
