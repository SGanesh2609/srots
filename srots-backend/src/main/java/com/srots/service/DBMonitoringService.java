package com.srots.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;

@Service
public class DBMonitoringService {

    @Autowired
    private HikariDataSource dataSource;

    public Map<String, Object> getConnectionPoolStatus() {
        HikariPoolMXBean poolBean = dataSource.getHikariPoolMXBean();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("ActiveConnections", poolBean.getActiveConnections()); // Currently in use
        stats.put("IdleConnections", poolBean.getIdleConnections());     // Waiting for work
        stats.put("ThreadsAwaitingConnection", poolBean.getThreadsAwaitingConnection()); // STUCK USERS
        stats.put("TotalConnections", poolBean.getTotalConnections());
        
        // Critical Alert: If users are waiting, the DB is struggling
        stats.put("IsStruggling", poolBean.getThreadsAwaitingConnection() > 0);
        
        return stats;
    }
}
