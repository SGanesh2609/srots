package com.srots.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
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
import com.srots.model.User;
import com.srots.repository.UserRepository;
import com.srots.service.AuthenticateService;
import com.srots.service.EmailService;
import com.srots.service.JwtService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	AuthenticateService authService;
	
	@Autowired
	EmailService emailService;

	@PostMapping("/login")
	public ResponseEntity<?> authenticate(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
	    System.out.println("--- START AUTH DEBUG ---");
	    try {
	        // 1. Authenticate via AuthenticationManager
	        Authentication auth = authenticationManager.authenticate(
	                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
	        );
	        
	        // 2. Fetch User from DB
	        User user = userRepository.findByUsername(request.getUsername())
	                .orElseThrow(() -> new RuntimeException("User profile not found in DB"));

	        
	     // 3. CAPTURE DEVICE INFO (With Fallback)
	        String rawUserAgent = httpRequest.getHeader("User-Agent");
	        String currentDevice;

	        if (rawUserAgent != null && !rawUserAgent.isEmpty()) {
	            currentDevice = parseUserAgent(rawUserAgent); 
	        } else if (request.getDeviceInfo() != null && !request.getDeviceInfo().isEmpty()) {
	            currentDevice = request.getDeviceInfo(); // Use manual input if no header
	        } else {
	            currentDevice = "Unknown Device";
	        }
	        String clientIp = getClientIp(httpRequest);
	        

	        // 4. LOGIC: Check for New Device
	        // We only send the email if the device identity has changed
	        if (user.getLastDeviceInfo() == null || !currentDevice.equals(user.getLastDeviceInfo())) {
	            System.out.println("New device detected: " + currentDevice + " from IP: " + clientIp);
	            
	            // Send Alert Email with both Device and IP info
	            sendLoginAlertEmail(user, currentDevice, clientIp);
	            
	            // Update the database with the new device info
	            user.setLastDeviceInfo(currentDevice);
	            userRepository.save(user);
	        }

	        // 5. Generate Token
	        String token = jwtService.generateToken(user.getUsername());

	        // 6. Build Response
	        LoginResponse response = new LoginResponse();
	        response.setToken(token);
	        response.setUserId(user.getId());
	        response.setFullName(user.getFullName());
	        
	        if (user.getRole() != null) {
	            response.setRole(user.getRole().name());
	        }

	        if (user.getCollege() != null) {
	            response.setCollegeId(user.getCollege().getId());
	        }

	        System.out.println("--- AUTH DEBUG COMPLETE: SUCCESS ---");
	        return ResponseEntity.ok(response);

	    } catch (AuthenticationException e) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
	    }
	}

	/**
	 * Helper to clean up the technical User-Agent string.
	 * Example: Transforms a long string into "Chrome on Windows"
	 */
	/**
	 * Helper to extract the real IP Address, even if behind a proxy/load balancer.
	 */
	private String getClientIp(HttpServletRequest request) {
	    String remoteAddr = "";
	    if (request != null) {
	        remoteAddr = request.getHeader("X-Forwarded-For");
	        if (remoteAddr == null || "".equals(remoteAddr)) {
	            remoteAddr = request.getRemoteAddr();
	        }
	    }
	    // If there are multiple IPs in X-Forwarded-For, take the first one
	    return remoteAddr.contains(",") ? remoteAddr.split(",")[0] : remoteAddr;
	}

	/**
	 * Helper to clean up technical User-Agent string.
	 */
	private String parseUserAgent(String userAgent) {
	    if (userAgent == null || userAgent.isEmpty()) return "Unknown Device";
	    String browser = "Unknown Browser";
	    String os = "Unknown OS";

	    // Detect OS
	    if (userAgent.toLowerCase().contains("windows")) os = "Windows";
	    else if (userAgent.toLowerCase().contains("mac")) os = "Macintosh";
	    else if (userAgent.toLowerCase().contains("x11")) os = "Linux";
	    else if (userAgent.toLowerCase().contains("android")) os = "Android";
	    else if (userAgent.toLowerCase().contains("iphone")) os = "iPhone";

	    // Detect Browser
	    if (userAgent.toLowerCase().contains("edg")) browser = "Edge";
	    else if (userAgent.toLowerCase().contains("chrome")) browser = "Chrome";
	    else if (userAgent.toLowerCase().contains("safari") && !userAgent.toLowerCase().contains("chrome")) browser = "Safari";
	    else if (userAgent.toLowerCase().contains("firefox")) browser = "Firefox";
	    else if (userAgent.toLowerCase().contains("postman")) browser = "Postman";

	    return browser + " on " + os;
	}

	private void sendLoginAlertEmail(User user, String deviceName, String ipAddress) {
	    String currentTime = java.time.LocalDateTime.now()
	            .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
	    
	    String htmlContent = "<div style='font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px;'>" +
	                         "<h2 style='color: #d9534f;'>Security Alert: New Login</h2>" +
	                         "<p>Hello <b>" + user.getFullName() + "</b>,</p>" +
	                         "<p>Your SROTS account was just accessed from a new device/browser. Details are provided below:</p>" +
	                         "<table style='width: 100%; background: #f9f9f9; padding: 15px; border-radius: 8px;'>" +
	                         "<tr><td><b>Device:</b></td><td>" + deviceName + "</td></tr>" +
	                         "<tr><td><b>IP Address:</b></td><td>" + ipAddress + "</td></tr>" +
	                         "<tr><td><b>Time:</b></td><td>" + currentTime + "</td></tr>" +
	                         "</table>" +
	                         "<p style='margin-top: 20px;'>If this was you, you can safely ignore this email.</p>" +
	                         "<p style='color: #d9534f;'><b>If you did not perform this login, please reset your password immediately to secure your account.</b></p>" +
	                         "<br><p>Stay Secure,<br><b>SROTS Security Team</b></p>" +
	                         "</div>";

	    emailService.sendEmail(user.getEmail(), "Security Alert: New Login Detected", htmlContent);
	}
	
	
	@PostMapping("/forgot-password")
	public ResponseEntity<?> forgotPassword(@RequestParam String email) {
	    // No try-catch needed; RuntimeException handled by GlobalExceptionHandler
	    authService.initiateForgotPassword(email);
	    return ResponseEntity.ok(java.util.Map.of("message", "Reset link sent successfully"));
	}

	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
	    // If validation fails, GlobalExceptionHandler returns 400 Bad Request automatically
	    authService.resetPassword(request.getToken(), request.getNewPassword());
	    return ResponseEntity.ok(java.util.Map.of("message", "Password has been reset successfully"));
	}
	
	
	@GetMapping("/send-email")
    public ResponseEntity<String> testAsyncEmail(@RequestParam String to) {
        System.out.println("1. Controller Thread: " + Thread.currentThread().getName());
        
        // Trigger the async method
        emailService.sendEmail(to, "Test Async Email", "<h1>It Works!</h1><p>This was sent asynchronously.</p>");
        
        System.out.println("2. Controller is returning response now...");
        
        return ResponseEntity.ok("Check your console! If this appeared instantly, @Async is working.");
    }
	
}