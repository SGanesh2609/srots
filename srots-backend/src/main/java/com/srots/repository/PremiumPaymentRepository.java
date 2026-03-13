package com.srots.repository;

import com.srots.model.PremiumPayment;
import com.srots.model.PremiumPayment.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface PremiumPaymentRepository extends JpaRepository<PremiumPayment, String> {

    /**
     * Find the most recent payment for a user, regardless of status.
     * Used in login flow to determine premium access state.
     */
    Optional<PremiumPayment> findTopByUser_IdOrderBySubmittedAtDesc(String userId);

    /**
     * Find latest PENDING payment for a user — used to prevent duplicate submissions.
     */
    Optional<PremiumPayment> findTopByUser_IdAndStatusOrderBySubmittedAtDesc(
            String userId, PaymentStatus status);

    /**
     * Paginated list of all payments for a specific college (for CMS tab).
     */
    Page<PremiumPayment> findByCollege_IdOrderBySubmittedAtDesc(String collegeId, Pageable pageable);

    /**
     * Paginated list filtered by college + status.
     */
    Page<PremiumPayment> findByCollege_IdAndStatusOrderBySubmittedAtDesc(
            String collegeId, PaymentStatus status, Pageable pageable);

    /**
     * Paginated list of all payments (SROTS-wide view, no college filter).
     */
    Page<PremiumPayment> findAllByOrderBySubmittedAtDesc(Pageable pageable);

    /**
     * Search within a college by username or UTR number.
     */
    @Query("""
        SELECT p FROM PremiumPayment p
        WHERE p.college.id = :collegeId
          AND (LOWER(p.username) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(p.utrNumber) LIKE LOWER(CONCAT('%', :query, '%')))
        ORDER BY p.submittedAt DESC
        """)
    Page<PremiumPayment> searchByCollegeId(
            @Param("collegeId") String collegeId,
            @Param("query") String query,
            Pageable pageable);

    /**
     * Check if a UTR number already exists (prevent duplicate submissions).
     */
    boolean existsByUtrNumber(String utrNumber);

    // ── Hard Delete Support ────────────────────────────────────────────────────

    /** Delete all payments submitted by a specific user (for student hard delete) */
    @Modifying
    @Transactional
    @Query("DELETE FROM PremiumPayment p WHERE p.user.id = :userId")
    void deleteByUserId(@Param("userId") String userId);

    /** Delete all payments for a college (for college hard delete) */
    @Modifying
    @Transactional
    @Query("DELETE FROM PremiumPayment p WHERE p.college.id = :collegeId")
    void deleteByCollegeId(@Param("collegeId") String collegeId);

    /** Nullify verifiedByAdmin reference when an admin/dev user is deleted */
    @Modifying
    @Transactional
    @Query("UPDATE PremiumPayment p SET p.verifiedByAdmin = null WHERE p.verifiedByAdmin.id = :adminId")
    void clearVerifiedByAdmin(@Param("adminId") String adminId);
}