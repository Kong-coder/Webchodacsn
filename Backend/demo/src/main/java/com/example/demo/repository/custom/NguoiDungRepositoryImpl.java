package com.example.demo.repository.custom;

import com.example.demo.model.NguoiDung;
import com.example.demo.model.VaiTro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class NguoiDungRepositoryImpl implements NguoiDungRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<NguoiDung> findByVaiTroAndSearch(VaiTro vaiTro, String search, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<NguoiDung> query = cb.createQuery(NguoiDung.class);
        Root<NguoiDung> nguoiDung = query.from(NguoiDung.class);
        
        // Create conditions
        List<Predicate> predicates = new ArrayList<>();
        
        // Filter by role
        if (vaiTro != null) {
            predicates.add(cb.equal(nguoiDung.get("vaiTro"), vaiTro));
        }
        
        // Add search conditions if search term is provided
        if (search != null && !search.trim().isEmpty()) {
            String searchTerm = "%" + search.toLowerCase() + "%";
            predicates.add(
                cb.or(
                    cb.like(cb.lower(nguoiDung.get("hoTen")), searchTerm),
                    cb.like(cb.lower(nguoiDung.get("email")), searchTerm),
                    cb.like(nguoiDung.get("soDienThoai"), "%" + search + "%")
                )
            );
        }
        
        // Apply all predicates
        query.where(predicates.toArray(new Predicate[0]));
        
        // Execute query for results
        TypedQuery<NguoiDung> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());
        
        // Execute count query for pagination
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<NguoiDung> countRoot = countQuery.from(NguoiDung.class);
        countQuery.select(cb.count(countRoot)).where(predicates.toArray(new Predicate[0]));
        Long count = entityManager.createQuery(countQuery).getSingleResult();
        
        List<NguoiDung> result = typedQuery.getResultList();
        return new PageImpl<>(result, pageable, count);
    }
}
