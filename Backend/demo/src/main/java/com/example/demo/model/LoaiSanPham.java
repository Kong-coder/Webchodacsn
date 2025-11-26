package com.example.demo.model;

public enum LoaiSanPham {
    MY_PHAM("Mỹ phẩm"),
    TINH_DAU("Tinh dầu"),
    DUNG_CU("Dụng cụ");

    private final String displayName;

    LoaiSanPham(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
