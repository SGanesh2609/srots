package com.srots.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.srots.model.User;

import java.util.Collection;
import java.util.Collections;

public class UserInfoUserDetails implements UserDetails {

    private static final Logger log = LoggerFactory.getLogger(UserInfoUserDetails.class);

    private final String userId;
    private final String username;
    private final String password;
    private final String collegeId;
    private final boolean isRestricted;
    private final boolean isDeleted;
    private final boolean isCollegeHead;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserInfoUserDetails(User user) {
        this.userId       = user.getId();
        this.username     = user.getUsername();
        this.password     = user.getPasswordHash();
        this.collegeId    = (user.getCollege() != null) ? user.getCollege().getId() : null;
        this.isRestricted = user.getIsRestricted() != null && user.getIsRestricted();
        this.isDeleted    = user.getIsDeleted()    != null && user.getIsDeleted();
        this.isCollegeHead = user.getIsCollegeHead() != null && user.getIsCollegeHead();

        String roleWithPrefix = "ROLE_" + (user.getRole() != null ? user.getRole().name() : "GUEST");
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(roleWithPrefix));

        log.debug("[Auth] UserDetails loaded | user={} | role={} | isDeleted={} | isRestricted={} | isHead={}",
                username, roleWithPrefix, isDeleted, isRestricted, isCollegeHead);
    }

    // Allows @PreAuthorize("principal.isCollegeHead") to work
    public boolean isCollegeHead() { return isCollegeHead; }

    // Allows @PreAuthorize("principal.userId == #id") to work
    public String getUserId() { return userId; }

    // Allows @PreAuthorize("principal.collegeId == #collegeId") to work
    public String getCollegeId() { return collegeId; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override
    public String getPassword() { return password; }
    @Override
    public String getUsername() { return username; }

    // isEnabled() = false → Spring Security throws DisabledException → 401 "Account is disabled"
    // This is the primary gate for soft-deleted accounts.
    @Override
    public boolean isEnabled() { return !isDeleted; }

    // isAccountNonLocked() = false → Spring Security throws LockedException → 401 "Account is locked"
    @Override
    public boolean isAccountNonLocked() { return !isRestricted; }

    @Override public boolean isAccountNonExpired()    { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
}