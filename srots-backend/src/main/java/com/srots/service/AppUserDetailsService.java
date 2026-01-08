//// AppUserDetailsService.java
//package com.srots.service;
//
//import java.util.Collection;
//import java.util.Collections;
//
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//import com.srots.model.User;
//import com.srots.repository.UserRepository;
//
//@Service
//public class AppUserDetailsService implements UserDetailsService {
//
//    private final UserRepository userRepository;
//
//    public AppUserDetailsService(UserRepository userRepository) {
//        this.userRepository = userRepository;
//    }
//
//    @Override
//    public UserDetails loadUserByUsername(String loginInput) throws UsernameNotFoundException {
//        // Use the flexible repository method we created earlier
//        User user = userRepository.findByEmailOrUsername(loginInput, loginInput)
//                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or username: " + loginInput));
//
//        Collection<? extends GrantedAuthority> authorities =
//                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
//
//        return new org.springframework.security.core.userdetails.User(
//                user.getUsername(), // Using username as the principal
//                user.getPasswordHash(), 
//                authorities);
//    }
//}