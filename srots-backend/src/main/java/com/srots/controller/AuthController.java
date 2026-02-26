//package com.srots.controller;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.AuthenticationException;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.srots.dto.LoginRequest;
//import com.srots.dto.LoginResponse;
//import com.srots.dto.ResetPasswordRequest;
//import com.srots.dto.premiumpaymentdto.PremiumAccessStatus;
//import com.srots.exception.BadCredentialsException;
//import com.srots.exception.LockedException;
//import com.srots.model.User;
//import com.srots.repository.UserRepository;
//import com.srots.service.AuthenticateService;
//import com.srots.service.EmailService;
//import com.srots.service.JwtService;
//import com.srots.service.PremiumPaymentService;
//
//import jakarta.servlet.http.HttpServletRequest;
//
//@RestController
//@RequestMapping("/api/v1/auth")
//public class AuthController {
//
//	@Autowired
//	private AuthenticationManager authenticationManager;
//
//	@Autowired
//	private JwtService jwtService;
//
//	@Autowired
//	private UserRepository userRepository;
//	
//	@Autowired
//	AuthenticateService authService;
//	
//	@Autowired
//    PremiumPaymentService premiumPaymentService;
//	
//	@Autowired
//	EmailService emailService;
//
////	@PostMapping("/login")
////    public ResponseEntity<?> authenticate(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
////        System.out.println("--- START AUTH DEBUG ---");
////        try {
////            // 1. Authenticate via AuthenticationManager
////            Authentication auth = authenticationManager.authenticate(
////                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
////            );
////           
////            // 2. Fetch User from DB
////            User user = userRepository.findByUsername(request.getUsername())
////                    .orElseThrow(() -> new RuntimeException("User profile not found in DB"));
////           
////         // 3. CAPTURE DEVICE INFO (With Fallback)
////            String rawUserAgent = httpRequest.getHeader("User-Agent");
////            String currentDevice;
////            if (rawUserAgent != null && !rawUserAgent.isEmpty()) {
////                currentDevice = parseUserAgent(rawUserAgent);
////            } else if (request.getDeviceInfo() != null && !request.getDeviceInfo().isEmpty()) {
////                currentDevice = request.getDeviceInfo(); // Use manual input if no header
////            } else {
////                currentDevice = "Unknown Device";
////            }
////            String clientIp = getClientIp(httpRequest);
////           
////            // 4. LOGIC: Check for New Device
////            // We only send the email if the device identity has changed
////            if (user.getLastDeviceInfo() == null || !currentDevice.equals(user.getLastDeviceInfo())) {
////                System.out.println("New device detected: " + currentDevice + " from IP: " + clientIp);
////               
////                // Send Alert Email with both Device and IP info
////                sendLoginAlertEmail(user, currentDevice, clientIp);
////               
////                // Update the database with the new device info
////                user.setLastDeviceInfo(currentDevice);
////                userRepository.save(user);
////            }
////            // 5. Generate Token
////    // String token = jwtService.generateToken(user.getUsername());
////            String token = jwtService.generateToken(user);
////            // 6. Build Response
////            LoginResponse response = new LoginResponse();
////            response.setToken(token);
////            response.setUserId(user.getId());
////            response.setFullName(user.getFullName());
////           
////            if (user.getRole() != null) {
////                response.setRole(user.getRole().name());
////            }
////            if (user.getCollege() != null) {
////                response.setCollegeId(user.getCollege().getId());
////            }
////            System.out.println("--- AUTH DEBUG COMPLETE: SUCCESS ---");
////            return ResponseEntity.ok(response);
////        } catch (LockedException e) {
////            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Account Locked");
////        } catch (BadCredentialsException e) {
////            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
////        } catch (AuthenticationException e) {
////            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication failed: " + e.getMessage());
////        } catch (Exception e) {
////            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
////        }
////    }
//	
//	@PostMapping("/login")
//  public ResponseEntity<?> authenticate(@RequestBody LoginRequest request,
//                                        HttpServletRequest httpRequest) {
//      System.out.println("--- START AUTH DEBUG ---");
//      try {
//          // 1. Authenticate credentials
//          Authentication auth = authenticationManager.authenticate(
//                  new UsernamePasswordAuthenticationToken(
//                          request.getUsername(), request.getPassword()));
//
//          // 2. Load user
//          User user = userRepository.findByUsername(request.getUsername())
//                  .orElseThrow(() -> new RuntimeException("User profile not found"));
//
//          // 3. isRestricted check
//          if (Boolean.TRUE.equals(user.getIsRestricted())) {
//              return ResponseEntity.status(HttpStatus.FORBIDDEN)
//                      .body("Your account has been restricted. Contact your administrator.");
//          }
//
//          // 4. Premium check — only for STUDENT role
//          if (user.getRole() == User.Role.STUDENT) {
//              PremiumAccessStatus premiumStatus =
//                      premiumPaymentService.checkPremiumAccess(user.getId());
//
//              if (!"ACTIVE".equals(premiumStatus.getAccessState())) {
//                  // Return 402 with premium status payload so frontend can
//                  // redirect to the correct page
//                  return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
//                          .body(premiumStatus);
//              }
//          }
//
//          // 5. Device / new-login email
//          String rawUserAgent = httpRequest.getHeader("User-Agent");
//          String currentDevice;
//          if (rawUserAgent != null && !rawUserAgent.isEmpty()) {
//              currentDevice = parseUserAgent(rawUserAgent);
//          } else if (request.getDeviceInfo() != null && !request.getDeviceInfo().isEmpty()) {
//              currentDevice = request.getDeviceInfo();
//          } else {
//              currentDevice = "Unknown Device";
//          }
//          String clientIp = getClientIp(httpRequest);
//          if (user.getLastDeviceInfo() == null ||
//                  !currentDevice.equals(user.getLastDeviceInfo())) {
//              sendLoginAlertEmail(user, currentDevice, clientIp);
//              user.setLastDeviceInfo(currentDevice);
//              userRepository.save(user);
//          }
//
//          // 6. Issue JWT
//          String token = jwtService.generateToken(user);
//
//          // 7. Build response
//          LoginResponse response = new LoginResponse();
//          response.setToken(token);
//          response.setUserId(user.getId());
//          response.setFullName(user.getFullName());
//          if (user.getRole() != null)    response.setRole(user.getRole().name());
//          if (user.getCollege() != null) response.setCollegeId(user.getCollege().getId());
//
//          System.out.println("--- AUTH DEBUG COMPLETE: SUCCESS ---");
//          return ResponseEntity.ok(response);
//
//      } catch (LockedException e) {
//          return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Account Locked");
//      } catch (BadCredentialsException e) {
//          return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
//      } catch (AuthenticationException e) {
//          return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                  .body("Authentication failed: " + e.getMessage());
//      } catch (Exception e) {
//          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                  .body("Error: " + e.getMessage());
//      }
//  }
//
//	/**
//	 * Helper to clean up the technical User-Agent string.
//	 * Example: Transforms a long string into "Chrome on Windows"
//	 */
//	/**
//	 * Helper to extract the real IP Address, even if behind a proxy/load balancer.
//	 */
//	private String getClientIp(HttpServletRequest request) {
//	    String remoteAddr = "";
//	    if (request != null) {
//	        remoteAddr = request.getHeader("X-Forwarded-For");
//	        if (remoteAddr == null || "".equals(remoteAddr)) {
//	            remoteAddr = request.getRemoteAddr();
//	        }
//	    }
//	    // If there are multiple IPs in X-Forwarded-For, take the first one
//	    return remoteAddr.contains(",") ? remoteAddr.split(",")[0] : remoteAddr;
//	}
//
//	/**
//	 * Helper to clean up technical User-Agent string.
//	 */
//	private String parseUserAgent(String userAgent) {
//	    if (userAgent == null || userAgent.isEmpty()) return "Unknown Device";
//	    String browser = "Unknown Browser";
//	    String os = "Unknown OS";
//
//	    // Detect OS
//	    if (userAgent.toLowerCase().contains("windows")) os = "Windows";
//	    else if (userAgent.toLowerCase().contains("mac")) os = "Macintosh";
//	    else if (userAgent.toLowerCase().contains("x11")) os = "Linux";
//	    else if (userAgent.toLowerCase().contains("android")) os = "Android";
//	    else if (userAgent.toLowerCase().contains("iphone")) os = "iPhone";
//
//	    // Detect Browser
//	    if (userAgent.toLowerCase().contains("edg")) browser = "Edge";
//	    else if (userAgent.toLowerCase().contains("chrome")) browser = "Chrome";
//	    else if (userAgent.toLowerCase().contains("safari") && !userAgent.toLowerCase().contains("chrome")) browser = "Safari";
//	    else if (userAgent.toLowerCase().contains("firefox")) browser = "Firefox";
//	    else if (userAgent.toLowerCase().contains("postman")) browser = "Postman";
//
//	    return browser + " on " + os;
//	}
//
//	private void sendLoginAlertEmail(User user, String deviceName, String ipAddress) {
//	    String currentTime = java.time.LocalDateTime.now()
//	            .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
//	    
//	    String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px;'>" +
//	                         "<h2 style='color: #d9534f;'>Security Alert: New Login</h2>" +
//	                         "<p>Hello <b>" + user.getFullName() + "</b>,</p>" +
//	                         "<p>Your SROTS account was just accessed from a new device/browser. Details are provided below:</p>" +
//	                         "<table style='width: 100%; background: #f9f9f9; padding: 15px; border-radius: 8px;'>" +
//	                         "<tr><td><b>Device:</b></td><td>" + deviceName + "</td></tr>" +
//	                         "<tr><td><b>IP Address:</b></td><td>" + ipAddress + "</td></tr>" +
//	                         "<tr><td><b>Time:</b></td><td>" + currentTime + "</td></tr>" +
//	                         "</table>" +
//	                         "<p style='margin-top: 20px;'>If this was you, you can safely ignore this email.</p>" +
//	                         "<p style='color: #d9534f;'><b>If you did not perform this login, please reset your password immediately to secure your account.</b></p>" +
//	                         "<br><p>Stay Secure,<br><b>SROTS Security Team</b></p>" +
//	                         "</div>";
//
//	    emailService.sendEmail(user.getEmail(), "Security Alert: New Login Detected", htmlContent);
//	}
//	
//	
//	@PostMapping("/forgot-password")
//	public ResponseEntity<?> forgotPassword(@RequestParam String email) {
//	    // No try-catch needed; RuntimeException handled by GlobalExceptionHandler
//	    authService.initiateForgotPassword(email);
//	    return ResponseEntity.ok(java.util.Map.of("message", "Reset link sent successfully"));
//	}
//
//	@PostMapping("/reset-password")
//	public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
//	    // If validation fails, GlobalExceptionHandler returns 400 Bad Request automatically
//	    authService.resetPassword(request.getToken(), request.getNewPassword());
//	    return ResponseEntity.ok(java.util.Map.of("message", "Password has been reset successfully"));
//	}
//	
//	
//	@GetMapping("/send-email")
//    public ResponseEntity<String> testAsyncEmail(@RequestParam String to) {
//        System.out.println("1. Controller Thread: " + Thread.currentThread().getName());
//        
//        // Trigger the async method
//        emailService.sendEmail(to, "Test Async Email", "<h1>It Works!</h1><p>This was sent asynchronously.</p>");
//        
//        System.out.println("2. Controller is returning response now...");
//        
//        return ResponseEntity.ok("Check your console! If this appeared instantly, @Async is working.");
//    }
//	
//}


package com.srots.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.srots.dto.LoginRequest;
import com.srots.dto.LoginResponse;
import com.srots.dto.ResetPasswordRequest;
import com.srots.dto.premiumpaymentdto.PremiumAccessStatus;
import com.srots.model.User;
import com.srots.repository.UserRepository;
import com.srots.service.AuthenticateService;
import com.srots.service.EmailService;
import com.srots.service.JwtService;
import com.srots.service.PremiumPaymentService;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Authentication Controller.
 *
 * IMPORTANT NOTES ON EXCEPTION IMPORTS:
 *
 * The original code imported:
 *   com.srots.exception.BadCredentialsException
 *   com.srots.exception.LockedException
 *
 * These are WRONG. Spring Security's AuthenticationManager throws:
 *   org.springframework.security.authentication.BadCredentialsException
 *   org.springframework.security.authentication.LockedException
 *   org.springframework.security.authentication.DisabledException
 *
 * Catching the wrong (custom) exception classes means the catch blocks
 * never fire — Spring Security exceptions pass through as uncaught
 * RuntimeExceptions and get swallowed by GlobalExceptionHandler as 400s.
 * Always import from org.springframework.security.authentication.*
 *
 * LockedException is thrown by Spring Security when
 * UserDetails.isAccountNonLocked() returns false — which in
 * UserInfoUserDetails happens when user.getIsRestricted() == true.
 * So the isRestricted check (step 3) is actually redundant with the
 * LockedException catch, but kept for explicit 403 response with a
 * clear message before the JWT is issued.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    // ── Explicit SLF4J logger — do NOT use @Slf4j Lombok ────────────────────
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticateService authService;

    @Autowired
    private PremiumPaymentService premiumPaymentService;

    @Autowired
    private EmailService emailService;

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/v1/auth/login
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody LoginRequest request,
                                          HttpServletRequest httpRequest) {

        logger.info("[Auth] Login attempt | username={}", request.getUsername());

        try {
            // 1. Authenticate credentials via Spring Security
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

            // 2. Load full User entity from DB
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("User profile not found after authentication."));

            logger.info("[Auth] Credentials valid | userId={} | role={}", user.getId(), user.getRole());

            // 3. isRestricted check — explicit 403 with readable message.
            //    Note: Spring Security also throws LockedException (caught below)
            //    when isAccountNonLocked() == false, but this gives a cleaner
            //    403 Forbidden instead of 401 Unauthorized.
            if (Boolean.TRUE.equals(user.getIsRestricted())) {
                logger.warn("[Auth] Blocked restricted account | userId={} | username={}", user.getId(), user.getUsername());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Your account has been restricted. Please contact your administrator.");
            }

            // 4. Premium check — STUDENT role only.
            //    Returns HTTP 402 Payment Required so the frontend can
            //    distinguish this from a 401 (wrong password) or 403 (restricted).
            //    The body is a PremiumAccessStatus JSON with accessState,
            //    message, and optionally rejectionReason.
            if (user.getRole() == User.Role.STUDENT) {
                PremiumAccessStatus premiumStatus = premiumPaymentService.checkPremiumAccess(user.getId());

                if (!"ACTIVE".equals(premiumStatus.getAccessState())) {
                    logger.info("[Auth] Student premium not ACTIVE | userId={} | state={}",
                            user.getId(), premiumStatus.getAccessState());
                    return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(premiumStatus);
                }

                logger.debug("[Auth] Student premium ACTIVE | userId={}", user.getId());
            }

            // 5. Device fingerprint — detect new device and send alert email.
            //    Wrapped in try/catch so an email failure can never break login.
            String rawUserAgent = httpRequest.getHeader("User-Agent");
            String currentDevice;
            if (rawUserAgent != null && !rawUserAgent.isEmpty()) {
                currentDevice = parseUserAgent(rawUserAgent);
            } else if (request.getDeviceInfo() != null && !request.getDeviceInfo().isEmpty()) {
                currentDevice = request.getDeviceInfo();
            } else {
                currentDevice = "Unknown Device";
            }
            String clientIp = getClientIp(httpRequest);

            if (user.getLastDeviceInfo() == null || !currentDevice.equals(user.getLastDeviceInfo())) {
                logger.info("[Auth] New device detected | userId={} | device={} | ip={}",
                        user.getId(), currentDevice, clientIp);
                try {
                    sendLoginAlertEmail(user, currentDevice, clientIp);
                } catch (Exception emailEx) {
                    // Email failure must NEVER break login
                    logger.error("[Auth] Login alert email FAILED (non-fatal) | userId={} | error={}",
                            user.getId(), emailEx.getMessage());
                }
                user.setLastDeviceInfo(currentDevice);
                userRepository.save(user);
            }

            // 6. Issue JWT
            String token = jwtService.generateToken(user);

            // 7. Build and return LoginResponse
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setUserId(user.getId());
            response.setFullName(user.getFullName());
            if (user.getRole()    != null) response.setRole(user.getRole().name());
            if (user.getCollege() != null) response.setCollegeId(user.getCollege().getId());

            logger.info("[Auth] Login SUCCESS | userId={} | role={} | device={}",
                    user.getId(), user.getRole(), currentDevice);

            return ResponseEntity.ok(response);

        } catch (LockedException e) {
            // Thrown by Spring Security when isAccountNonLocked() == false.
            // In UserInfoUserDetails this maps to user.getIsRestricted() == true.
            // Import: org.springframework.security.authentication.LockedException
            logger.warn("[Auth] Login BLOCKED — account locked | username={}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Account is locked. Please contact your administrator.");

        } catch (DisabledException e) {
            // Thrown by Spring Security when isEnabled() == false.
            // Import: org.springframework.security.authentication.DisabledException
            logger.warn("[Auth] Login BLOCKED — account disabled | username={}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Account is disabled. Please contact your administrator.");

        } catch (BadCredentialsException e) {
            // Thrown by Spring Security for wrong username or password.
            // Import: org.springframework.security.authentication.BadCredentialsException
            logger.warn("[Auth] Login FAILED — bad credentials | username={}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password.");

        } catch (AuthenticationException e) {
            // Catch-all for any other Spring Security authentication failure.
            logger.warn("[Auth] Login FAILED — AuthenticationException | username={} | message={}",
                    request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication failed: " + e.getMessage());

        } catch (Exception e) {
            // Unexpected server-side error
            logger.error("[Auth] Login ERROR — unexpected | username={} | error={}",
                    request.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred. Please try again.");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/v1/auth/forgot-password
    // GlobalExceptionHandler handles RuntimeException → 400 automatically
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        logger.info("[Auth] Forgot password request | email={}", email);
        authService.initiateForgotPassword(email);
        return ResponseEntity.ok(java.util.Map.of("message", "Reset link sent successfully"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/v1/auth/reset-password
    // GlobalExceptionHandler handles RuntimeException → 400 automatically
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        logger.info("[Auth] Reset password | tokenPrefix={}",
                request.getToken() != null
                        ? request.getToken().substring(0, Math.min(8, request.getToken().length())) + "..."
                        : "null");
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(java.util.Map.of("message", "Password has been reset successfully"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/v1/auth/send-email — dev/test endpoint
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/send-email")
    public ResponseEntity<String> testAsyncEmail(@RequestParam String to) {
        logger.info("[Auth] Test email triggered | to={}", to);
        emailService.sendEmail(to, "Test Async Email", "<h1>It Works!</h1><p>This was sent asynchronously.</p>");
        return ResponseEntity.ok("Email triggered — check your inbox.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Extracts the real client IP, accounting for reverse proxies.
     * X-Forwarded-For may be a comma-separated list; we take the first entry.
     */
    private String getClientIp(HttpServletRequest request) {
        if (request == null) return "unknown";
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Parses a raw User-Agent string into a readable "Browser on OS" label.
     */
    private String parseUserAgent(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) return "Unknown Device";
        String ua = userAgent.toLowerCase();

        String os;
        if      (ua.contains("android")) os = "Android";
        else if (ua.contains("iphone"))  os = "iPhone";
        else if (ua.contains("windows")) os = "Windows";
        else if (ua.contains("mac"))     os = "Macintosh";
        else if (ua.contains("x11"))     os = "Linux";
        else                             os = "Unknown OS";

        String browser;
        if      (ua.contains("postman")) browser = "Postman";
        else if (ua.contains("edg"))     browser = "Edge";
        else if (ua.contains("chrome"))  browser = "Chrome";
        else if (ua.contains("firefox")) browser = "Firefox";
        else if (ua.contains("safari") && !ua.contains("chrome")) browser = "Safari";
        else                             browser = "Unknown Browser";

        return browser + " on " + os;
    }

    /**
     * Sends an HTML security alert email when a new device is detected.
     */
    private void sendLoginAlertEmail(User user, String deviceName, String ipAddress) {
        String currentTime = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        String htmlContent =
                "<div style='font-family:Arial,sans-serif;color:#333;max-width:600px;border:1px solid #eee;padding:20px;border-radius:8px;'>"
              + "<h2 style='color:#d9534f;'>🔔 Security Alert: New Login Detected</h2>"
              + "<p>Hello <b>" + user.getFullName() + "</b>,</p>"
              + "<p>Your SROTS account was accessed from a new device or browser:</p>"
              + "<table style='width:100%;background:#f9f9f9;padding:15px;border-radius:8px;border-collapse:collapse;'>"
              + "<tr><td style='padding:6px;'><b>Device:</b></td><td style='padding:6px;'>" + deviceName + "</td></tr>"
              + "<tr><td style='padding:6px;'><b>IP Address:</b></td><td style='padding:6px;'>" + ipAddress + "</td></tr>"
              + "<tr><td style='padding:6px;'><b>Time:</b></td><td style='padding:6px;'>" + currentTime + "</td></tr>"
              + "</table>"
              + "<p style='margin-top:16px;'>If this was you, you can safely ignore this email.</p>"
              + "<p style='color:#d9534f;'><b>If this wasn't you, please reset your password immediately.</b></p>"
              + "<br><p>Stay Secure,<br><b>SROTS Security Team</b></p>"
              + "</div>";

        emailService.sendEmail(user.getEmail(), "Security Alert: New Login Detected on Your SROTS Account", htmlContent);
    }
}