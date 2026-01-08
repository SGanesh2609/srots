package com.srots.service;

import java.util.List;

import com.srots.dto.Student360Response;
import com.srots.dto.UserCreateRequest;
import com.srots.dto.UserFullProfileResponse;
import com.srots.model.College;
import com.srots.model.User;

public interface UserAccountService {
	
	public Object create(UserCreateRequest dto, String roleStr);
	void resendCredentials(String userId);
	
	
	public Object update(String id, UserCreateRequest dto);
	public void delete(String id);
	public User getById(String id);
	
	//TO Get the user details
//	public List<User> getAllUsers();
//	public List<User> getUsersByRole(User.Role role);
//	public List<User> getCollegeUsersByRole(String collegeId, User.Role role);
//	public List<User> getEntireCollegeData(String collegeId);
	public UserFullProfileResponse getFullUserProfile(String userId);
	public Student360Response getStudent360(String userId);
	
	
	public void updateAvatarOnly(String userId, String url);
	
	
	public List<User> getFilteredUsers(String collegeId, User.Role role, String branch, Integer batch, String gender, String search);
	
	//reports download
	public String getCollegeName(String collegeId);
	public byte[] exportUsersByRole(String collegeId, User.Role role, String branch, Integer batch, String gender, String format);
	

}
