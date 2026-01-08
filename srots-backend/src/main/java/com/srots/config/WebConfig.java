//package com.srots.config;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//@Configuration
//public class WebConfig implements WebMvcConfigurer {
////    @Override
////    public void addCorsMappings(CorsRegistry registry) {
////        registry.addMapping("/**") 
////                .allowedOrigins("http://localhost:3000")
////                .allowedMethods("GET", "POST", "PUT", "DELETE") 
////                .allowedHeaders("*") 
////                .allowCredentials(true); 
////    }
//}



package com.srots.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Path to your physical uploads folder
        Path uploadDir = Paths.get("./uploads");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        // This maps the URL "/api/v1/files/**" to the physical "uploads" folder
        registry.addResourceHandler("/api/v1/files/**")
                .addResourceLocations("file:/" + uploadPath + "/");
    }
}