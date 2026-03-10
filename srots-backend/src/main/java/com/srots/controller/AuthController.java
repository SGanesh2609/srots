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


@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;
    @Autowired private AuthenticateService authService;
    @Autowired private PremiumPaymentService premiumPaymentService;
    @Autowired private EmailService emailService;

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
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(), request.getPassword()));

            // 2. Load full User entity from DB
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException(
                            "User profile not found after authentication."));

            logger.info("[Auth] Credentials valid | userId={} | role={}",
                    user.getId(), user.getRole());

            // 3. isRestricted check — explicit 403 before JWT is issued
            if (Boolean.TRUE.equals(user.getIsRestricted())) {
                logger.warn("[Auth] Blocked restricted account | userId={}", user.getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Your account has been restricted. Please contact your administrator.");
            }

            // 4. Premium check — STUDENT role only.
            //
            // ── CHANGE FROM ORIGINAL ─────────────────────────────────────────
            // Use 4-arg constructor to include user.getId() in the 402 body.
            // The frontend (App.tsx) stores this in premiumUserId state and
            // passes it to PremiumPaymentPage → PremiumService.submitPaymentPublic().
            // ─────────────────────────────────────────────────────────────────
            if (user.getRole() == User.Role.STUDENT) {
                PremiumAccessStatus premiumStatus =
                        premiumPaymentService.checkPremiumAccess(user.getId());

                if (!"ACTIVE".equals(premiumStatus.getAccessState())) {
                    logger.info("[Auth] Student premium not ACTIVE | userId={} | state={}",
                            user.getId(), premiumStatus.getAccessState());

                    // Include userId so frontend can call POST /public/submit
                    PremiumAccessStatus withUserId = new PremiumAccessStatus(
                            premiumStatus.getAccessState(),
                            premiumStatus.getMessage(),
                            premiumStatus.getRejectionReason(),
                            user.getId()   // ← the only addition
                    );
                    return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(withUserId);
                }

                logger.debug("[Auth] Student premium ACTIVE | userId={}", user.getId());
            }

            // 5. Device fingerprint — detect new device and send alert email
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

            if (user.getLastDeviceInfo() == null
                    || !currentDevice.equals(user.getLastDeviceInfo())) {
                logger.info("[Auth] New device | userId={} | device={} | ip={}",
                        user.getId(), currentDevice, clientIp);
                try {
                    sendLoginAlertEmail(user, currentDevice, clientIp);
                } catch (Exception emailEx) {
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
            logger.warn("[Auth] Login BLOCKED — account locked | username={}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Account is locked. Please contact your administrator.");

        } catch (DisabledException e) {
            logger.warn("[Auth] Login BLOCKED — account disabled | username={}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Account is disabled. Please contact your administrator.");

        } catch (BadCredentialsException e) {
            logger.warn("[Auth] Login FAILED — bad credentials | username={}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password.");

        } catch (AuthenticationException e) {
            logger.warn("[Auth] Login FAILED — AuthenticationException | username={} | msg={}",
                    request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication failed: " + e.getMessage());

        } catch (Exception e) {
            logger.error("[Auth] Login ERROR — unexpected | username={} | error={}",
                    request.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred. Please try again.");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/v1/auth/forgot-password
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        logger.info("[Auth] Forgot password request | email={}", email);
        authService.initiateForgotPassword(email);
        return ResponseEntity.ok(java.util.Map.of("message", "Reset link sent successfully"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/v1/auth/reset-password
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
    // GET /api/v1/auth/send-email — dev/test
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/send-email")
    public ResponseEntity<String> testAsyncEmail(@RequestParam String to) {
        logger.info("[Auth] Test email triggered | to={}", to);
        emailService.sendEmail(to, "Test Async Email",
                "<h1>It Works!</h1><p>This was sent asynchronously.</p>");
        return ResponseEntity.ok("Email triggered — check your inbox.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers — identical to original
    // ─────────────────────────────────────────────────────────────────────────

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return "unknown";
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank())
            return forwarded.split(",")[0].trim();
        return request.getRemoteAddr();
    }

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
        if      (ua.contains("postman"))                          browser = "Postman";
        else if (ua.contains("edg"))                              browser = "Edge";
        else if (ua.contains("chrome"))                           browser = "Chrome";
        else if (ua.contains("firefox"))                          browser = "Firefox";
        else if (ua.contains("safari") && !ua.contains("chrome")) browser = "Safari";
        else                                                       browser = "Unknown Browser";
        return browser + " on " + os;
    }

    private void sendLoginAlertEmail(User user, String deviceName, String ipAddress) {
        String currentTime = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        String html =
                "<div style='font-family:Arial,sans-serif;color:#333;max-width:600px;"
              + "border:1px solid #eee;padding:20px;border-radius:8px;'>"
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
              + "<br><p>Stay Secure,<br><b>SROTS Security Team</b></p></div>";
        emailService.sendEmail(user.getEmail(),
                "Security Alert: New Login Detected on Your SROTS Account", html);
    }
}