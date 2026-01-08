package com.srots.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {
    @Bean
    public com.fasterxml.jackson.databind.Module hibernateModule() {
        return new com.fasterxml.jackson.datatype.hibernate5.jakarta.Hibernate5JakartaModule();
    }
}
