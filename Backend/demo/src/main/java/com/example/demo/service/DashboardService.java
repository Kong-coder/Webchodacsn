package com.example.demo.service;

import com.example.demo.dto.RecentActivityResponse;
import com.example.demo.dto.HomeStatsResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;

@Service
public class DashboardService {

    public List<RecentActivityResponse> getRecentActivities() {
        // In a real application, you would fetch this data from the database.
        // For now, we'll return a mock list.
        List<RecentActivityResponse> activities = new ArrayList<>();

        RecentActivityResponse activity1 = new RecentActivityResponse();
        activity1.setIcon("✅");
        activity1.setColor("success");
        activity1.setTitle("Chấm công hoàn tất");
        activity1.setSub("Nguyễn Văn An - 29/09/2025");
        activities.add(activity1);

        RecentActivityResponse activity2 = new RecentActivityResponse();
        activity2.setIcon("➕");
        activity2.setColor("info");
        activity2.setTitle("Ca mới được tạo");
        activity2.setSub("Trần Thị Bình - Ca Chiều");
        activities.add(activity2);

        RecentActivityResponse activity3 = new RecentActivityResponse();
        activity3.setIcon("⚠️");
        activity3.setColor("warning");
        activity3.setTitle("Đi muộn");
        activity3.setSub("Trần Thị Bình - 10 phút");
        activities.add(activity3);

        return activities;
    }

    public HomeStatsResponse getHomeStats() {
        // In a real application, you would fetch this data from the database.
        // For now, we'll return a mock response.
        HomeStatsResponse stats = new HomeStatsResponse();
        stats.setHappyClients("5000+");
        stats.setAverageRating("4.9★");
        stats.setProServices("50+");
        return stats;
    }
}
