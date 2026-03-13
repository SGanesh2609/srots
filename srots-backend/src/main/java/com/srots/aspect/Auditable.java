package com.srots.aspect;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a controller or service method for automatic audit logging via AuditAspect.
 *
 * Usage:
 *   @Auditable(event = "CREATE_JOB")
 *   public ResponseEntity<?> createJob(@RequestBody JobRequest req) { ... }
 *
 *   @Auditable(event = "DELETE_USER", logArgs = true)
 *   public void deleteUser(String userId) { ... }
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {

    /** SCREAMING_SNAKE_CASE event name stored in the audit log. */
    String event();

    /** Whether to include method argument summary in the details field (default: false). */
    boolean logArgs() default false;
}
