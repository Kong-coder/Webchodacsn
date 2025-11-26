package com.example.demo.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    @PostMapping("/export")
    public ResponseEntity<byte[]> export(@RequestBody Map<String, Object> body,
                                         @RequestParam(value = "type", defaultValue = "excel") String type,
                                         @RequestParam(value = "month", required = false) Integer month,
                                         @RequestParam(value = "year", required = false) Integer year) {
        String content = "Empty report";
        byte[] data = content.getBytes(StandardCharsets.UTF_8);
        String filename = "report.txt";
        MediaType mediaType = MediaType.TEXT_PLAIN;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(mediaType)
                .body(data);
    }
}
