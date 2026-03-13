package com.srots.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.dao.QueryTimeoutException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.CannotGetJdbcConnectionException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.srots.dto.ErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Database overload / connection pool exhausted (503)
    @ExceptionHandler({CannotGetJdbcConnectionException.class, QueryTimeoutException.class})
    public ResponseEntity<ErrorResponse> handleDatabaseStruggle(Exception ex) {
        return new ResponseEntity<>(new ErrorResponse(
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "Server is currently busy handling high traffic. Please try again in a few seconds.",
                LocalDateTime.now()
        ), HttpStatus.SERVICE_UNAVAILABLE);
    }

    // 2. @Valid bean validation failures (400) — returns field-level errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException ex) {

        List<Map<String, String>> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fe -> {
                    Map<String, String> err = new LinkedHashMap<>();
                    err.put("field",   fe.getField());
                    err.put("message", fe.getDefaultMessage());
                    if (fe.getRejectedValue() != null) {
                        err.put("rejectedValue", String.valueOf(fe.getRejectedValue()));
                    }
                    return err;
                })
                .collect(Collectors.toList());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status",    400);
        body.put("error",     "Validation Failed");
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("errors",    fieldErrors);

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // 3. Resource Not Found (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        return new ResponseEntity<>(new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                LocalDateTime.now()
        ), HttpStatus.NOT_FOUND);
    }

    // 4. Validation & Bad Arguments (400)
    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> handleValidationErrors(Exception ex) {
        String message = (ex instanceof MethodArgumentTypeMismatchException mte)
            ? "Invalid parameter type: " + mte.getName()
            : "Validation Error: " + ex.getMessage();

        return new ResponseEntity<>(new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                message,
                LocalDateTime.now()
        ), HttpStatus.BAD_REQUEST);
    }

    // 5. Security / Permission errors (403)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return new ResponseEntity<>(new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                "You do not have permission to perform this action.",
                LocalDateTime.now()
        ), HttpStatus.FORBIDDEN);
    }

    // 6. Generic Runtime errors (400)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        return new ResponseEntity<>(new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                LocalDateTime.now()
        ), HttpStatus.BAD_REQUEST);
    }

    // 7. Catch-all for unexpected system errors (500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        return new ResponseEntity<>(new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected error occurred. Please contact support.",
                LocalDateTime.now()
        ), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
