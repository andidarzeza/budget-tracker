package com.adprod.inventar.configuration;

import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@AllArgsConstructor
public class SpringConfiguration implements WebMvcConfigurer {

    private final Environment environment;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(environment.getProperty("cors_origin"))
                .allowedMethods("*")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
