package com.srots.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.srots.model.User;


@Repository
public interface UserRepository extends JpaRepository<User, String> {
	Optional<User> findByEmailOrUsername(String email, String username);

	Optional<User> findByUsername(String username);
	
	Optional<User> findByEmail(String email);

	boolean existsByUsername(String username);

	boolean existsByEmail(String email);

	List<User> findByRole(User.Role role);

	// Find CP Admins (Heads) or CP Staff specifically
	List<User> findByCollegeIdAndRoleAndIsCollegeHead(String collegeId, User.Role role, boolean isHead);

	// Find all users in a specific college
	List<User> findByCollegeId(String collegeId);
	
	List<User> findByCollegeIdAndRole(String collegeId, User.Role role);
	
//	long countByCollegeIdAndRole(String collegeId, User.Role role);
	
	long countByCollegeIdAndRole(String collegeId, User.Role role);

	Optional<User> findByResetToken(String token);

	boolean existsByAadhaarNumber(String aadhaar);

	Optional<User> findByAadhaarNumber(String aadhaar);

//	boolean existsByAadhaar(String aadhaar);

	@Query("SELECT u.email FROM User u WHERE u.email IN :emails")
    Set<String> findAllEmails(@Param("emails") List<String> emails);

    // FIX: Changed u.aadhaar to u.aadhaarNumber
    @Query("SELECT u.aadhaarNumber FROM User u WHERE u.aadhaarNumber IN :aadhaars")
    Set<String> findAllAadhaars(@Param("aadhaars") List<String> aadhaars);

    @Query("SELECT u.username FROM User u WHERE u.username IN :usernames")
    Set<String> findAllUsernames(@Param("usernames") List<String> usernames);
    
    
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.college.id = :collegeId AND u.studentProfile.rollNumber = :rollNumber")
    boolean existsByCollegeIdAndRollNumber(@Param("collegeId") String collegeId, @Param("rollNumber") String rollNumber);

    // This helps during Update: find a student with this roll in this college who is NOT the current user
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.college.id = :collegeId AND u.studentProfile.rollNumber = :rollNumber AND u.id != :currentUserId")
    boolean existsByCollegeIdAndRollNumberAndIdNot(@Param("collegeId") String collegeId, @Param("rollNumber") String rollNumber, @Param("currentUserId") String currentUserId);
	
}