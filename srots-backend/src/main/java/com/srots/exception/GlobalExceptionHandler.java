package com.srots.exception;

import java.time.LocalDateTime;

import org.springframework.dao.QueryTimeoutException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.CannotGetJdbcConnectionException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.srots.dto.ErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Handle Database Struggle / Connection Pool Full (503 Service Unavailable)
    @ExceptionHandler({CannotGetJdbcConnectionException.class, QueryTimeoutException.class})
    public ResponseEntity<ErrorResponse> handleDatabaseStruggle(Exception ex) {
        // We use 503 Service Unavailable to tell the user/frontend the server is busy
        return new ResponseEntity<>(new ErrorResponse(
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "Server is currently busy handling high traffic. Please try again in a few seconds.",
                LocalDateTime.now()
        ), HttpStatus.SERVICE_UNAVAILABLE);
    }

    // 2. Handle Resource Not Found (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        return new ResponseEntity<>(new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                LocalDateTime.now()
        ), HttpStatus.NOT_FOUND);
    }

    // 3. Handle Validation & Bad Arguments (400)
    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> handleValidationErrors(Exception ex) {
        String message = (ex instanceof MethodArgumentTypeMismatchException) 
            ? "Invalid parameter type: " + ((MethodArgumentTypeMismatchException) ex).getName()
            : "Validation Error: " + ex.getMessage();
            
        return new ResponseEntity<>(new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                message,
                LocalDateTime.now()
        ), HttpStatus.BAD_REQUEST);
    }

    // 4. Handle Security Permission Errors (403)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return new ResponseEntity<>(new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                "Security Error: You do not have permission to perform this action.",
                LocalDateTime.now()
        ), HttpStatus.FORBIDDEN);
    }

    // 5. Handle Generic Runtime Errors (400 or 500 depending on logic)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        return new ResponseEntity<>(new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                LocalDateTime.now()
        ), HttpStatus.BAD_REQUEST);
    }

    // 6. Final Catch-All for unexpected System Errors (500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        return new ResponseEntity<>(new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected error occurred. Please contact support.",
                LocalDateTime.now()
        ), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}