//package com.srots.repository;
//
//import java.util.List;
//import java.util.Optional;
//import java.util.Set;
//
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import com.srots.model.College;
//import com.srots.model.User;
//import com.srots.model.User.Role;
//
//
//@Repository
//public interface UserRepository extends JpaRepository<User, String> {
//	Optional<User> findByEmailOrUsername(String email, String username);
//
//	Optional<User> findByUsername(String username);
//	
//	Optional<User> findByEmail(String email);
//
//	boolean existsByUsername(String username);
//
//	boolean existsByEmail(String email);
//
//	List<User> findByRole(User.Role role);
//
//	// Find CP Admins (Heads) or CP Staff specifically
//	List<User> findByCollegeIdAndRoleAndIsCollegeHead(String collegeId, User.Role role, boolean isHead);
//
//	// Find all users in a specific college
//	List<User> findByCollegeId(String collegeId);
//	
//	List<User> findByCollegeIdAndRole(String collegeId, User.Role role);
//	
////	long countByCollegeIdAndRole(String collegeId, User.Role role);
//	
//	long countByCollegeIdAndRole(String collegeId, User.Role role);
//
//	Optional<User> findByResetToken(String token);
//
//	boolean existsByAadhaarNumber(String aadhaar);
//
//	Optional<User> findByAadhaarNumber(String aadhaar);
//
////	boolean existsByAadhaar(String aadhaar);
//
//	@Query("SELECT u.email FROM User u WHERE u.email IN :emails")
//    Set<String> findAllEmails(@Param("emails") List<String> emails);
//
//    // FIX: Changed u.aadhaar to u.aadhaarNumber
//    @Query("SELECT u.aadhaarNumber FROM User u WHERE u.aadhaarNumber IN :aadhaars")
//    Set<String> findAllAadhaars(@Param("aadhaars") List<String> aadhaars);
//
//    @Query("SELECT u.username FROM User u WHERE u.username IN :usernames")
//    Set<String> findAllUsernames(@Param("usernames") List<String> usernames);
//    
//    
//    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.college.id = :collegeId AND u.studentProfile.rollNumber = :rollNumber")
//    boolean existsByCollegeIdAndRollNumber(@Param("collegeId") String collegeId, @Param("rollNumber") String rollNumber);
//
//    // This helps during Update: find a student with this roll in this college who is NOT the current user
//    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.college.id = :collegeId AND u.studentProfile.rollNumber = :rollNumber AND u.id != :currentUserId")
//    boolean existsByCollegeIdAndRollNumberAndIdNot(@Param("collegeId") String collegeId, @Param("rollNumber") String rollNumber, @Param("currentUserId") String currentUserId);
//    
// // Filter soft-deleted users from standard queries
//    List<User> findByCollegeIdAndRoleAndIsDeletedFalse(String collegeId, User.Role role);
//      // Paginated version
//    Page<User> findByCollegeIdAndRoleAndIsDeletedFalse(
//    String collegeId, User.Role role, Pageable pageable);
//    
//    // For restore operations (admin only)
//    Optional<User> findByIdAndIsDeletedTrue(String id);
//
//	List<User> findByCollegeIdAndIsDeletedFalse(String collegeId);
//
//	List<User> findByRoleAndIsDeletedFalse(Role role);
//
//	List<User> findByIsDeletedFalse();
//
////	Optional<College> findByIdAndIsDeletedTrue(String userId);
//
//	
//}

package com.srots.repository;

import com.srots.model.User;
import com.srots.model.User.Role;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * UserRepository — add these methods to your existing UserRepository interface.
 * The existing methods are preserved. New methods are clearly marked.
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    // ── Existing methods (kept for backward compat) ──────────────────────────

//    boolean existsByEmail(String email);
//    boolean existsByAadhaarNumber(String aadhaar);
////    boolean existsByCollegeIdAndRollNumber(String collegeId, String rollNumber);
////    boolean existsByCollegeIdAndRollNumberAndIdNot(String collegeId, String rollNumber, String id);
//    
//    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.college.id = :collegeId AND u.studentProfile.rollNumber = :rollNumber")
//  boolean existsByCollegeIdAndRollNumber(@Param("collegeId") String collegeId, @Param("rollNumber") String rollNumber);
//
//  // This helps during Update: find a student with this roll in this college who is NOT the current user
//  @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.college.id = :collegeId AND u.studentProfile.rollNumber = :rollNumber AND u.id != :currentUserId")
//  boolean existsByCollegeIdAndRollNumberAndIdNot(@Param("collegeId") String collegeId, @Param("rollNumber") String rollNumber, @Param("currentUserId") String currentUserId);

//    Optional<User> findByEmail(String email);
//    Optional<User> findByAadhaarNumber(String aadhaar);
//    Optional<User> findByUsername(String username);
//
//    List<User> findByCollegeIdAndRole(String collegeId, User.Role role);
//    List<User> findByCollegeId(String collegeId);
//    List<User> findByRole(User.Role role);

    @Query("SELECT u.email FROM User u WHERE u.email IN :emails")
    Set<String> findAllEmails(@Param("emails") List<String> emails);

    @Query("SELECT u.aadhaarNumber FROM User u WHERE u.aadhaarNumber IN :aadhaars")
    Set<String> findAllAadhaars(@Param("aadhaars") List<String> aadhaars);

    @Query("SELECT u.username FROM User u WHERE u.username IN :usernames")
    Set<String> findAllUsernames(@Param("usernames") List<String> usernames);

    // ── NEW: Soft-delete aware queries ───────────────────────────────────────

    /** Find only non-deleted users by college + role */
//    List<User> findByCollegeIdAndRoleAndIsDeletedFalse(String collegeId, User.Role role);

    /** Paginated version for API responses */
    Page<User> findByCollegeIdAndRoleAndIsDeletedFalse(String collegeId, User.Role role, Pageable pageable);

    /** Find all non-deleted users for a college */
//    List<User> findByCollegeIdAndIsDeletedFalse(String collegeId);
    Page<User> findByCollegeIdAndIsDeletedFalse(String collegeId, Pageable pageable);

    /** Find all non-deleted users by role (global) */
//    List<User> findByRoleAndIsDeletedFalse(User.Role role);
    Page<User> findByRoleAndIsDeletedFalse(User.Role role, Pageable pageable);

    /** All non-deleted users (admin view) */
//    List<User> findByIsDeletedFalse();
    Page<User> findByIsDeletedFalse(Pageable pageable);

    /** Find a specific soft-deleted user (for restore operations) */
//    Optional<User> findByIdAndIsDeletedTrue(String id);

    /** Find a user by roll number within a college (for bulk operations) */
    @Query("SELECT u FROM User u WHERE u.college.id = :collegeId " +
           "AND u.studentProfile.rollNumber = :rollNumber AND u.isDeleted = false")
    Optional<User> findActiveByCollegeAndRollNumber(
            @Param("collegeId") String collegeId,
            @Param("rollNumber") String rollNumber);

    /** Full-text search across name, email, roll number (non-deleted only) */
    @Query("SELECT u FROM User u " +
           "LEFT JOIN u.studentProfile sp " +
           "WHERE u.isDeleted = false " +
           "AND u.college.id = :collegeId " +
           "AND u.role = :role " +
           "AND (" +
           "  LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "  LOWER(u.email)    LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "  (sp IS NOT NULL AND LOWER(sp.rollNumber) LIKE LOWER(CONCAT('%', :search, '%')))" +
           ")")
    Page<User> searchByCollegeAndRole(
            @Param("collegeId") String collegeId,
            @Param("role") User.Role role,
            @Param("search") String search,
            Pageable pageable);

    /** Existing: find by college+role (includes soft-deleted — used only by admin restore views) */
    @Query("SELECT u FROM User u WHERE u.college.id = :collegeId AND u.role = :role AND u.isDeleted = true")
    List<User> findSoftDeletedByCollegeAndRole(
            @Param("collegeId") String collegeId,
            @Param("role") User.Role role);

    /** Check if a roll number exists (active students only) */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u " +
           "JOIN u.studentProfile sp " +
           "WHERE u.college.id = :collegeId AND sp.rollNumber = :rollNumber AND u.isDeleted = false")
    boolean existsActiveStudentByRollNumber(
            @Param("collegeId") String collegeId,
            @Param("rollNumber") String rollNumber);
    
	long countByCollegeIdAndRole(String id, Role student);
//	Optional<User> findByResetToken(String token);
	long countByRole(Role student);
//	Long countByRoleAndCollegeId(Role student, String collegeId);
	@Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.college.id = :collegeId")
    long countByRoleAndCollegeId(@Param("role") User.Role role, @Param("collegeId") String collegeId);
	
	
	// ─── Existence checks ─────────────────────────────────────────────────────

    boolean existsByEmail(String email);
    boolean existsByAadhaarNumber(String aadhaarNumber);

    /**
     * Check if a roll number is already used in a college.
     * Used on CREATE to prevent duplicates.
     */
//    boolean existsByCollegeIdAndRollNumber(String collegeId, String rollNumber);

    /**
     * Check if a roll number is already used in a college by a DIFFERENT user.
     * Used on UPDATE to allow keeping the same roll number.
     */
//    boolean existsByCollegeIdAndRollNumberAndIdNot(String collegeId, String rollNumber, String id);
    
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.college.id = :collegeId AND u.studentProfile.rollNumber = :rollNumber")
  boolean existsByCollegeIdAndRollNumber(@Param("collegeId") String collegeId, @Param("rollNumber") String rollNumber);

  // This helps during Update: find a student with this roll in this college who is NOT the current user
  @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.college.id = :collegeId AND u.studentProfile.rollNumber = :rollNumber AND u.id != :currentUserId")
  boolean existsByCollegeIdAndRollNumberAndIdNot(@Param("collegeId") String collegeId, @Param("rollNumber") String rollNumber, @Param("currentUserId") String currentUserId);


    // ─── Single lookups ───────────────────────────────────────────────────────

    Optional<User> findByEmail(String email);
    Optional<User> findByAadhaarNumber(String aadhaarNumber);
    Optional<User> findByUsername(String username);
    Optional<User> findByResetToken(String resetToken);

    /**
     * Used by restoreSoftDeleted() to fetch a user only if it is currently soft-deleted.
     * Throws if the user was not soft-deleted (prevents accidental restore).
     */
    Optional<User> findByIdAndIsDeletedTrue(String id);

    // ─── List by role ──────────────────────────────────────────────────────────

    List<User> findByRole(User.Role role);

    // ─── Active (isDeleted = false) ────────────────────────────────────────────

    List<User> findByIsDeletedFalse();

    List<User> findByRoleAndIsDeletedFalse(User.Role role);

    List<User> findByCollegeIdAndIsDeletedFalse(String collegeId);

    List<User> findByCollegeIdAndRoleAndIsDeletedFalse(String collegeId, User.Role role);

    // ─── Soft-deleted (isDeleted = true) ── NEW ────────────────────────────────

    /**
     * Returns all users where isDeleted = true — used when the admin selects
     * the "Soft Deleted" filter tab in the student directory.
     */
    List<User> findByIsDeletedTrue();

    /**
     * Returns soft-deleted users filtered by role.
     */
    List<User> findByRoleAndIsDeletedTrue(User.Role role);

    /**
     * Returns soft-deleted users in a specific college.
     */
    List<User> findByCollegeIdAndIsDeletedTrue(String collegeId);

    /**
     * Returns soft-deleted users in a specific college with a specific role.
     * Used for the student directory "Soft Deleted" tab filtered by college.
     */
    List<User> findByCollegeIdAndRoleAndIsDeletedTrue(String collegeId, User.Role role);

    // ─── Legacy (no isDeleted filter — includes both active and soft-deleted) ──

    /**
     * Used by export reports and legacy bulk operations that intentionally
     * fetch all users regardless of deletion status.
     */
    List<User> findByCollegeIdAndRole(String collegeId, User.Role role);

    List<User> findByCollegeId(String collegeId);

	boolean existsByUsername(String username);

    // ── Scheduler: soft-deleted users past retention period ───────────────────

    /**
     * Returns users that are soft-deleted AND whose deletedAt timestamp is
     * older than the given cutoff (i.e. soft-deleted more than N days ago).
     * Used by CleanupScheduler to permanently delete stale soft-deleted accounts.
     */
    @Query("SELECT u FROM User u WHERE u.isDeleted = true AND u.deletedAt IS NOT NULL AND u.deletedAt < :cutoff")
    List<User> findSoftDeletedBefore(@Param("cutoff") java.time.LocalDateTime cutoff);
}