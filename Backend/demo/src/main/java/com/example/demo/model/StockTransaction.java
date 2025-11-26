package com.example.demo.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "stock_transactions")
public class StockTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    // "in" or "out"
    @Column(length = 8, nullable = false)
    private String type;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer previousQuantity;

    @Column(nullable = false)
    private Integer newQuantity;

    private String note;

    private String createdBy;

    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
        if (createdBy == null) createdBy = "System";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Integer getPreviousQuantity() { return previousQuantity; }
    public void setPreviousQuantity(Integer previousQuantity) { this.previousQuantity = previousQuantity; }
    public Integer getNewQuantity() { return newQuantity; }
    public void setNewQuantity(Integer newQuantity) { this.newQuantity = newQuantity; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
