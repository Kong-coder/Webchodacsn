package com.example.demo.scheduler;

import com.example.demo.service.PaymentSyncService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class PaymentSyncScheduler {

    private final PaymentSyncService paymentSyncService;

    public PaymentSyncScheduler(PaymentSyncService paymentSyncService) {
        this.paymentSyncService = paymentSyncService;
        System.out.println("✓ PaymentSyncScheduler initialized - Auto-sync will run every 60 seconds");
    }

    /**
     * Auto-sync payments every minute for confirmed appointments
     * This runs automatically in the background
     */
    @Scheduled(fixedRate = 60000) // Run every 60 seconds (1 minute)
    public void autoSyncPayments() {
        try {
            Map<String, Object> result = paymentSyncService.syncAllPendingPayments();
            
            int synced = (int) result.get("synced");
            if (synced > 0) {
                System.out.println("⏰ Auto-sync: " + synced + " payments processed");
            }
        } catch (Exception e) {
            System.err.println("❌ Error in auto-sync: " + e.getMessage());
        }
    }
}
