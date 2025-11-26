package com.example.demo.controller;

import com.example.demo.model.Product;
import com.example.demo.model.StockTransaction;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.StockTransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class StockTransactionController {

    private final StockTransactionRepository transactionRepository;
    private final ProductRepository productRepository;

    public StockTransactionController(StockTransactionRepository transactionRepository,
                                      ProductRepository productRepository) {
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
    }

    // Create transaction (alias paths)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','NHANVIEN')")
    @PostMapping({"/stock-transactions", "/transactions"})
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        Long productId = body.get("productId") == null ? null : Long.valueOf(String.valueOf(body.get("productId")));
        String action = body.get("action") == null ? null : String.valueOf(body.get("action")).toLowerCase();
        Integer quantity = body.get("quantity") == null ? null : Integer.valueOf(String.valueOf(body.get("quantity")));
        String note = body.get("note") == null ? null : String.valueOf(body.get("note"));

        if (productId == null || quantity == null || quantity <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid productId or quantity"));
        }
        if (!("in".equals(action) || "out".equals(action))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid action. Must be 'in' or 'out'"));
        }

        Optional<Product> opt = productRepository.findById(productId);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Product not found"));
        Product product = opt.get();

        int prev = product.getQuantity() != null ? product.getQuantity() : 0;
        int newQty = prev;
        if ("in".equals(action)) {
            newQty = prev + quantity;
        } else {
            newQty = Math.max(0, prev - quantity);
        }
        product.setQuantity(newQty);
        productRepository.save(product);

        StockTransaction tx = new StockTransaction();
        tx.setProduct(product);
        tx.setType(action);
        tx.setQuantity(quantity);
        tx.setPreviousQuantity(prev);
        tx.setNewQuantity(newQty);
        tx.setNote(note);
        tx.setCreatedAt(OffsetDateTime.now());
        StockTransaction saved = transactionRepository.save(tx);

        return ResponseEntity.ok(Map.of(
                "product", product,
                "transaction", saved
        ));
    }

    // List transactions with filters (alias paths)
    @GetMapping({"/stock-transactions", "/transactions"})
    public ResponseEntity<List<Map<String, Object>>> list(
            @RequestParam(name = "productId", required = false) Long productId,
            @RequestParam(name = "type", required = false) String type,
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate
    ) {
        List<StockTransaction> list = transactionRepository.findAllByProductId(productId);
        java.util.List<java.util.Map<String, Object>> out =
                list.stream()
                        .filter(t -> type == null || t.getType().equalsIgnoreCase(type))
                        .filter(t -> {
                            if (startDate == null && endDate == null) return true;
                            OffsetDateTime ts = t.getCreatedAt();
                            boolean ok = true;
                            if (startDate != null) ok &= ts.isAfter(OffsetDateTime.parse(startDate)) || ts.isEqual(OffsetDateTime.parse(startDate));
                            if (endDate != null) ok &= ts.isBefore(OffsetDateTime.parse(endDate)) || ts.isEqual(OffsetDateTime.parse(endDate));
                            return ok;
                        })
                        .map(t -> {
                            Map<String, Object> m = new HashMap<>();
                            m.put("id", t.getId());
                            m.put("productId", t.getProduct() != null ? t.getProduct().getId() : null);
                            m.put("productName", t.getProduct() != null ? t.getProduct().getName() : null);
                            m.put("type", t.getType());
                            m.put("quantity", t.getQuantity());
                            m.put("previousQuantity", t.getPreviousQuantity());
                            m.put("newQuantity", t.getNewQuantity());
                            m.put("note", t.getNote());
                            m.put("createdAt", t.getCreatedAt());
                            return m;
                        })
                        .collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }
}
