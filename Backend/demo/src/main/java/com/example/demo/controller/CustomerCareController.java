package com.example.demo.controller;

import com.example.demo.dto.BulkMessageRequest;
import com.example.demo.dto.SendMessageRequest;
import com.example.demo.model.KhachHang;
import com.example.demo.service.KhachHangService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer-care")
@CrossOrigin(origins = "*")
@org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('NHANVIEN', 'QUANLY')")
public class CustomerCareController {

    @Autowired
    private KhachHangService khachHangService;

    @GetMapping("/customers")
    public ResponseEntity<List<KhachHang>> getAllCustomers(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(khachHangService.findAllWithFilters(searchTerm, status));
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<KhachHang> getCustomerById(@PathVariable Long id) {
        return khachHangService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/customers")
    public ResponseEntity<KhachHang> createCustomer(@RequestBody KhachHang khachHang) {
        return ResponseEntity.ok(khachHangService.save(khachHang));
    }

    @PutMapping("/customers/{id}")
    public ResponseEntity<KhachHang> updateCustomer(
            @PathVariable Long id, 
            @RequestBody KhachHang khachHang) {
        if (!khachHangService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        khachHang.setId(id);
        return ResponseEntity.ok(khachHangService.save(khachHang));
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        if (!khachHangService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        khachHangService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/customers/statistics")
    public ResponseEntity<Map<String, Object>> getCustomerStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(khachHangService.getCustomerStatistics(startDate, endDate));
    }

    @PostMapping("/send-message")
    public ResponseEntity<String> sendMessage(@RequestBody SendMessageRequest request) {
        khachHangService.sendMessageToCustomer(request.getCustomerId(), request.getMessageType(), request.getContent(), request.isSendSMS(), request.isSendEmail());
        return ResponseEntity.ok("Message sent successfully!");
    }

    @PostMapping("/bulk-message")
    public ResponseEntity<String> sendBulkMessage(@RequestBody BulkMessageRequest request) {
        khachHangService.sendBulkMessageToCustomers(request.getCustomerIds(), request.getFilterStatus(), request.getMessageType(), request.getContent(), request.isSendSMS(), request.isSendEmail());
        return ResponseEntity.ok("Bulk message sent successfully!");
    }
    
    @PostMapping("/sync-customers")
    public ResponseEntity<String> syncCustomers(@RequestParam(required = false, defaultValue = "false") boolean reset) {
        if (reset) {
            // Clear all existing customers before sync
            khachHangService.deleteAll();
        }
        khachHangService.syncCustomersFromNguoiDung();
        return ResponseEntity.ok("Customers synced successfully!");
    }
    
    @PostMapping("/sync-customer/{maNguoiDung}")
    public ResponseEntity<KhachHang> syncCustomer(@PathVariable Integer maNguoiDung) {
        KhachHang khachHang = khachHangService.syncCustomerFromNguoiDung(maNguoiDung);
        if (khachHang == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(khachHang);
    }
}
