package com.srots.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.srots.exception.PasswordValidationException;
import com.srots.model.User;
import com.srots.repository.UserRepository;

import jakarta.transaction.Transactional;


@Service
public class AuthenticateServiceImpl implements AuthenticateService {

	@Autowired
	UserRepository repo;

	@Autowired
	BCryptPasswordEncoder passwordEncoder;
	
//	@Autowired
//	PasswordEncoder passwordEncoder; // Generic, matches whatever bean is in SecurityConfig

	@Autowired
	EmailService emailService;

	@Override
	public User getUserDetails(String username) {

		Optional<User> user = repo.findByUsername(username);
		if (user.isPresent()) {
			return user.get();
		} else {
			return null;
		}

	}
	
	@Override
    public void initiateForgotPassword(String email) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User with this email not found"));

        // Generate Token
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusHours(1));
        repo.save(user);

        // Build HTML Email Body
        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        String htmlContent = "<h3>Password Reset Request</h3>" +
                             "<p>Click the button below to reset your password. This link expires in 1 hour.</p>" +
                             "<a href='" + resetLink + "' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Reset Password</a>" +
                             "<p>If you did not request this, please ignore this email.</p>";

        emailService.sendEmail(user.getEmail(), "Reset Your Password", htmlContent);
    }

	@Override
	@Transactional
	public void resetPassword(String token, String newPassword) {
	    // 1. Password Regex: 1 Capital, 1 Special, 1 Number, Min 8 chars
	    String passwordPattern = "^(?=.*[0-9])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$";
	    
	    if (newPassword == null || !newPassword.matches(passwordPattern)) {
	        // This is caught by GlobalExceptionHandler handleRuntimeException
	        throw new PasswordValidationException("Password policy violation: " +
	                "Must be at least 8 characters, include one uppercase letter, " +
	                "one number, and one special character (@#$%^&+=!).");
	    }

	    // 2. Token Check
	    User user = repo.findByResetToken(token)
	            .orElseThrow(() -> new PasswordValidationException("The reset link is invalid."));

	    // 3. Expiry Check
	    if (user.getTokenExpiry().isBefore(LocalDateTime.now())) {
	        throw new PasswordValidationException("The reset link has expired. Please request a new one.");
	    }

	    // 4. Update
	    user.setPasswordHash(passwordEncoder.encode(newPassword));
	    user.setResetToken(null);
	    user.setTokenExpiry(null);
	    repo.save(user);

	    // 5. Send Success Notification
	    sendConfirmationEmail(user);
	}

	private void sendConfirmationEmail(User user) {
	    String htmlContent = "<h3>Password Changed Successfully</h3>" +
	                         "<p>Hello " + user.getFullName() + ",</p>" +
	                         "<p>This is a confirmation that the password for your account <b>" + user.getUsername() + "</b> has just been changed.</p>" +
	                         "<p>If you did not perform this action, please contact our support team immediately as your account may be compromised.</p>" +
	                         "<br>" +
	                         "<p>Best Regards,<br>SROTS Team</p>";

	    emailService.sendEmail(user.getEmail(), "Security Alert: Password Changed", htmlContent);
	}

//	@Override
//	public User changeUserPassword(ChangePassword changePassword) {
//
//		Optional<User> optional = repo.getByUsername(changePassword.getUsername());
//
//		if (!optional.isPresent()) {
//			return null;
//		}
//
//		User user = optional.get();
//
//		if (passwordEncoder.matches(changePassword.getOldPassword(), user.getPassword())) {
//			user.setPassword(passwordEncoder.encode(changePassword.getNewPassword()));
//			return repo.save(user);
//		} else {
//			return null;
//		}
//
//	}

//	@Override
//	public boolean getTemporaryPassword(String username) {
//
//		Optional<User> optional = repo.getByUsername(username);
//
//		if (optional != null) {
//			User user = optional.get();
//			user.setPassword(passwordEncoder.encode("Temp@123"));
//			repo.save(user);
//			return true;
//		}
//
//		else {
//			return false;
//		}
//	}

////	public boolean handleForgotPassword(ForgetPasswordDTO forgotPasswordDTO) {
////        Optional<User> optional = repo.getByUsername(forgotPasswordDTO.getUsername());
////        if (!optional.isPresent()) {
////            return false;         }
////        User users = optional.get();
////                String tempPassword = "Temp@123";
////        users.setPassword(passwordEncoder.encode(tempPassword));
////        repo.save(users);
////        emailService.sendTemporaryPassword(forgotPasswordDTO.getEmail(), tempPassword);
////        return true;
////    }
//	
//	@Override
//	public String getUserEmail(String username) {
//		Optional<User> userOptional = repo.findByUsername(username);
//		User user = userOptional.get();
//		return user.getEmail();
//	}
//
//	@Override
//	public String getTemporaryPassword(String username) {
//	    Optional<User> optional = repo.getByUsername(username);
//	    String returnPassword = null;
//	    if (optional.isPresent()) {
//	        User user = optional.get();
//	        String tempPassword = generateRandomPassword();
//	        returnPassword = tempPassword;
//	        user.setPassword(passwordEncoder.encode(tempPassword));
//	        repo.save(user);
//	        String subject = "Your temporary Password";
//	        String body = "Your temporary password is: " + tempPassword;
//	        emailService.sendEmail(user.getEmail(), subject, body);
//	        return returnPassword;
//	    } else {
//	        return returnPassword;
//	    }
//	}
//	private String generateRandomPassword() {
//	    String upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//	    String lowerCase = "abcdefghijklmnopqrstuvwxyz";
//	    String digits = "0123456789";
//	    String specialChars = "!@#$%^&*()-_+=<>?";
//	    String allCharacters = upperCase + lowerCase + digits + specialChars;
//	    int passwordLength = 12;  
//	    SecureRandom random = new SecureRandom();
//	    StringBuilder password = new StringBuilder();
//	    for (int i = 0; i < passwordLength; i++) {
//	        int index = random.nextInt(allCharacters.length());
//	        password.append(allCharacters.charAt(index));
//	    }
////	    System.err.println(password.toString());
//	    return password.toString();
//	}

	
}

