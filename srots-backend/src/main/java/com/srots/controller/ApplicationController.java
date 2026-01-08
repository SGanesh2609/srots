//package com.srots.controller;
//
//import com.srots.model.Application;
////import com.srots.service.ApplicationService; // Add service
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/v1/applications")
//public class ApplicationController {
//    private final ApplicationService service;
//
//    public ApplicationController(ApplicationService service) {
//        this.service = service;
//    }
//
//    @GetMapping("/student/{studentId}")
//    public List<Application> listByStudent(@PathVariable String studentId) {
//        return service.findByStudentId(studentId);
//    }
//
//    @PostMapping
//    public ResponseEntity<Application> create(@RequestBody Application payload) {
//        return ResponseEntity.ok(service.create(payload));
//    }
//
//    // Add more
//}