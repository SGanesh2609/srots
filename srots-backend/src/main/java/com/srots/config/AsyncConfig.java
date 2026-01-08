package com.srots.config;

import java.util.concurrent.Executor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync; // Added
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableAsync // CRITICAL: This enables the @Async functionality
public class AsyncConfig {
    
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2); 
        executor.setMaxPoolSize(5);  
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("EmailThread-");
        executor.initialize();
        return executor;
    }
}