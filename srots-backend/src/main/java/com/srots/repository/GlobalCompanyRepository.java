package com.srots.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.srots.model.GlobalCompany;

@Repository
public interface GlobalCompanyRepository extends JpaRepository<GlobalCompany, String> {

    List<GlobalCompany> findByNameContainingIgnoreCase(String name);

    Page<GlobalCompany> findByNameContainingIgnoreCase(String name, Pageable pageable);

    boolean existsByNameIgnoreCase(String name);

    Optional<GlobalCompany> findByNameIgnoreCase(String name);
}
