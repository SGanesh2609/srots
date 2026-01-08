package com.srots.exception;

// This will be caught by your existing handleRuntimeException method
public class PasswordValidationException extends RuntimeException {
    public PasswordValidationException(String message) {
        super(message);
    }
}