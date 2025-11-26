package com.example.demo.dto;

public class HomeStatsResponse {
    private String happyClients;
    private String averageRating;
    private String proServices;

    public String getHappyClients() {
        return happyClients;
    }

    public void setHappyClients(String happyClients) {
        this.happyClients = happyClients;
    }

    public String getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(String averageRating) {
        this.averageRating = averageRating;
    }

    public String getProServices() {
        return proServices;
    }

    public void setProServices(String proServices) {
        this.proServices = proServices;
    }
}
