package com.srots.service;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.srots.dto.Student360Response;
import com.srots.dto.UserCreateRequest;
import com.srots.dto.UserFullProfileResponse;
import com.srots.model.User;

/**
 * UserAccountService
 * Path: src/main/java/com/srots/service/UserAccountService.java
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGES IN THIS VERSION
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. `getFilteredUsers` — added `String status` parameter
 *    Values: "active" | "soft_deleted" | "hard_deleted"
 *
 * 2. `getFilteredUsersPaginated` — added `String status` parameter
 *    Same value set. The controller passes whichever tab the user has selected.
 *
 * 3. Added `restoreSoftDeleted(id, restoredByUsername)` — called by the new
 *    POST /accounts/{id}/restore endpoint.
 *
 * All other signatures are unchanged.
 * ─────────────────────────────────────────────────────────────────────────────
 */
public interface UserAccountService {

    // ─── Create / Update / Delete ──────────────────────────────────────────────

    Object create(String roleStr, UserCreateRequest dto);

    default Object create(UserCreateRequest dto, String roleStr) {
        return create(roleStr, dto);
    }

    Object update(String id, com.srots.dto.UserCreateRequest dto);

    void delete(String id);

    void softDelete(String userId, String deletedByUsername);

    void restoreSoftDeleted(String userId, String restoredByUsername);

    // ─── Read ──────────────────────────────────────────────────────────────────

    User getById(String id);

    UserFullProfileResponse getFullUserProfile(String userId);

    Student360Response getStudent360(String userId);

    /**
     * Returns a filtered + paginated list of users.
     *
     * @param status "active" | "soft_deleted" | "hard_deleted"
     *               Controls which isDeleted state is queried.
     */
    Page<User> getFilteredUsersPaginated(
            String collegeId,
            User.Role role,
            String branch,
            Integer batch,
            String gender,
            String search,
            String status,
            Pageable pageable);

    /**
     * Returns a filtered flat list of users (non-paginated).
     *
     * @param status "active" | "soft_deleted" | "hard_deleted"
     */
    List<User> getFilteredUsers(
            String collegeId,
            User.Role role,
            String branch,
            Integer batch,
            String gender,
            String search,
            String status);

    // ─── Misc ──────────────────────────────────────────────────────────────────

    void updateAvatarOnly(String userId, String url);

    void resendCredentials(String userId);

    void toggleUserRestriction(String userId, boolean restrict);

    String getCollegeName(String collegeId);

    byte[] exportUsersByRole(
            String collegeId,
            User.Role role,
            String branch,
            Integer batch,
            String gender,
            String format);
    
    public void renewAccount(String userId, int months);
    public void bulkRenewAccounts(List<Map<String, Object>> updates);
}