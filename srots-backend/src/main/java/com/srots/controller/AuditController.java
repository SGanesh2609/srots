package com.srots.controller;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.srots.model.AuditLog;
import com.srots.repository.AuditLogRepository;

@RestController
@RequestMapping("/api/v1/admin/audit")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {
    
    @Autowired private AuditLogRepository auditRepo;

    @GetMapping
    public ResponseEntity<List<AuditLog>> getLogs() {
        // Return all logs sorted by newest first
        return ResponseEntity.ok(auditRepo.findAll(Sort.by(Sort.Direction.DESC, "timestamp")));
    }
}