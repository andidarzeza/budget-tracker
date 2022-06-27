package com.adprod.inventar.security;


import com.adprod.inventar.security.interfaces.ITokenValidator;
import lombok.AllArgsConstructor;
import org.springframework.security.config.annotation.SecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@AllArgsConstructor
public class TokenFilterConfig extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {

    private final JwtManager jwtManager;
    private final ITokenValidator iTokenValidator;

    @Override
    public void configure(HttpSecurity http) {
        JwtFilter customFilter = new JwtFilter(jwtManager, iTokenValidator);
        http.addFilterBefore(customFilter, UsernamePasswordAuthenticationFilter.class);
    }

}