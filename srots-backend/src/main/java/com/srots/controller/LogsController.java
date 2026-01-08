package com.srots.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/logs")
public class LogsController {
    private static final Logger logger = LoggerFactory.getLogger(LogsController.class);

    @PostMapping
    public ResponseEntity<String> receiveLog(@RequestBody Map<String, Object> payload) {
        try {
            Object level = payload.getOrDefault("level", "info");
            Object message = payload.getOrDefault("message", payload);
            String levelStr = String.valueOf(level).toLowerCase();
            switch (levelStr) {
                case "error":
                    logger.error("[frontend] {}", message);
                    break;
                case "warn":
                case "warning":
                    logger.warn("[frontend] {}", message);
                    break;
                case "debug":
                    logger.debug("[frontend] {}", message);
                    break;
                default:
                    logger.info("[frontend] {}", message);
            }
            return ResponseEntity.ok("logged");
        } catch (Exception e) {
            logger.error("Error processing log payload", e);
            return ResponseEntity.status(500).body("error");
        }
    }
}
