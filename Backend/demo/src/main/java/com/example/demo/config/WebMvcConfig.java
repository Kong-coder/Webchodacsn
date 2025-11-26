package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve files saved under the working directory "uploads" at URL path "/uploads/**"
        // e.g., http://localhost:8080/uploads/<filename>
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/", "file:uploads/")
                .setCachePeriod(3600);
    }
}
