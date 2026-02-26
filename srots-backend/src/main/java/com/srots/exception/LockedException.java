package com.srots.exception; // Adjust the package name as per your project structure

import org.springframework.security.core.AuthenticationException;

/**
 * Custom exception for locked accounts.
 * Extends AuthenticationException to match Spring Security's exception hierarchy.
 */
public class LockedException extends AuthenticationException {

    /**
     * Constructs a LockedException with the specified message.
     *
     * @param message the detail message
     */
    public LockedException(String message) {
        super(message);
    }

    /**
     * Constructs a LockedException with the specified message and root cause.
     *
     * @param message the detail message
     * @param cause the root cause
     */
    public LockedException(String message, Throwable cause) {
        super(message, cause);
    }
}