package com.example.demo.service;

import com.example.demo.model.HoaDon;
import com.example.demo.model.LichHen;
import com.example.demo.repository.HoaDonRepository;
import com.example.demo.repository.LichHenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PaymentSyncService {

    private final LichHenRepository lichHenRepository;
    private final HoaDonRepository hoaDonRepository;
    private final ThanhToanService thanhToanService;

    public PaymentSyncService(LichHenRepository lichHenRepository,
                              HoaDonRepository hoaDonRepository,
                              ThanhToanService thanhToanService) {
        this.lichHenRepository = lichHenRepository;
        this.hoaDonRepository = hoaDonRepository;
        this.thanhToanService = thanhToanService;
    }

    @Transactional
    public Map<String, Object> syncAllPendingPayments() {
        System.out.println("=== SYNCING ALL PENDING PAYMENTS ===");
        
        // Find all confirmed appointments
        List<LichHen> confirmedAppointments = lichHenRepository.findAll().stream()
                .filter(lh -> "DA_XAC_NHAN".equals(lh.getTrangThai()))
                .collect(Collectors.toList());
        
        System.out.println("Found " + confirmedAppointments.size() + " confirmed appointments");
        
        int synced = 0;
        int skipped = 0;
        int errors = 0;
        
        for (LichHen appointment : confirmedAppointments) {
            try {
                boolean result = syncPaymentForAppointmentInternal(appointment);
                if (result) {
                    synced++;
                } else {
                    skipped++;
                }
            } catch (Exception e) {
                System.err.println("Error syncing appointment " + appointment.getMaLichHen() + ": " + e.getMessage());
                errors++;
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("total", confirmedAppointments.size());
        result.put("synced", synced);
        result.put("skipped", skipped);
        result.put("errors", errors);
        
        System.out.println("=== SYNC COMPLETED: " + synced + " synced, " + skipped + " skipped, " + errors + " errors ===");
        
        return result;
    }

    @Transactional
    public Map<String, Object> syncPaymentForAppointment(Integer appointmentId) {
        LichHen appointment = lichHenRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        
        boolean synced = syncPaymentForAppointmentInternal(appointment);
        
        Map<String, Object> result = new HashMap<>();
        result.put("appointmentId", appointmentId);
        result.put("synced", synced);
        
        return result;
    }

    private boolean syncPaymentForAppointmentInternal(LichHen appointment) {
        System.out.println("=== syncPaymentForAppointmentInternal START for appointment " + appointment.getMaLichHen() + " ===");
        
        if (!"DA_XAC_NHAN".equals(appointment.getTrangThai())) {
            System.out.println("Appointment " + appointment.getMaLichHen() + " is not confirmed (status: " + appointment.getTrangThai() + "), skipping");
            return false;
        }
        
        System.out.println("Appointment confirmed, finding invoice...");
        
        // Find invoice for this appointment
        List<HoaDon> invoices = hoaDonRepository.findAll().stream()
                .filter(hd -> appointment.getMaLichHen().equals(hd.getMaLichHen()))
                .collect(Collectors.toList());
        
        if (invoices.isEmpty()) {
            System.out.println("No invoice found for appointment " + appointment.getMaLichHen());
            return false;
        }
        
        HoaDon invoice = invoices.get(0);
        System.out.println("Found invoice " + invoice.getMaHoaDon() + ", payment method: " + invoice.getPhuongThucThanhToan() + ", status: " + invoice.getTrangThai());
        
        // Check if payment method is cash
        String paymentMethod = invoice.getPhuongThucThanhToan() != null ? invoice.getPhuongThucThanhToan().trim() : "";
        if (!"TIEN_MAT".equalsIgnoreCase(paymentMethod) && !"cash".equalsIgnoreCase(paymentMethod)) {
            System.out.println("--> Payment method is not cash (" + paymentMethod + "). Skipping sync for appointment " + appointment.getMaLichHen());
            return false;
        }
        System.out.println("--> Payment method check PASSED. Proceeding with sync.");

        // Check if already paid
        if ("paid".equals(invoice.getTrangThai())) {
            System.out.println("Invoice " + invoice.getMaHoaDon() + " already paid, skipping");
            return false;
        }
        
        System.out.println("Starting payment sync for appointment " + appointment.getMaLichHen() + ", invoice " + invoice.getMaHoaDon());
        
        try {
            // Initialize and confirm payment
            System.out.println("--> Calling ThanhToanService.cashInit...");
            thanhToanService.cashInit(invoice.getMaHoaDon());
            System.out.println("--> cashInit completed. Calling ThanhToanService.cashConfirm...");
            thanhToanService.cashConfirm(invoice.getMaHoaDon());
            System.out.println("--> cashConfirm completed.");
            
            System.out.println("✓ Payment synced successfully for appointment " + appointment.getMaLichHen());
            return true;
        } catch (Exception e) {
            System.err.println("❌ ERROR syncing payment for appointment " + appointment.getMaLichHen() + ": " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw to see the error
        }
    }
}
