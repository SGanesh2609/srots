package com.srots.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI springShopOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("SROTS Backend API")
                        .description("SROTS Spring Boot API documentation")
                        .version("v1.0.0")
                        .contact(new Contact().name("Srots Team").email("support@srots.com")))
                .externalDocs(new ExternalDocumentation().description("Repository").url("https://github.com/your-repo/srots"));
    }
}