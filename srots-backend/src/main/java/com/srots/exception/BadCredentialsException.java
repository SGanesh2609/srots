package com.srots.exception; // Adjust the package name as per your project structure

import org.springframework.security.core.AuthenticationException;

/**
 * Custom exception for bad credentials (invalid username or password).
 * Extends AuthenticationException to match Spring Security's exception hierarchy.
 */
public class BadCredentialsException extends AuthenticationException {

    /**
     * Constructs a BadCredentialsException with the specified message.
     *
     * @param message the detail message
     */
    public BadCredentialsException(String message) {
        super(message);
    }

    /**
     * Constructs a BadCredentialsException with the specified message and root cause.
     *
     * @param message the detail message
     * @param cause the root cause
     */
    public BadCredentialsException(String message, Throwable cause) {
        super(message, cause);
    }
}