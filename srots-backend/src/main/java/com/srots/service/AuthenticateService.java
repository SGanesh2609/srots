package com.srots.service;

//import com.cardiac.authenticate.model.ChangePassword;
import com.srots.model.User;

public interface AuthenticateService {
	
	public User getUserDetails(String username);
	
    void initiateForgotPassword(String email);
    void resetPassword(String token, String newPassword);

}
