package com.adprod.inventar.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class JwtFilter extends OncePerRequestFilter {

    private final JwtManager jwtManager;
    public JwtFilter(JwtManager jwtManager) {
        this.jwtManager = jwtManager;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = httpServletRequest.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                if (jwtManager.validateToken(token)) {
                    jwtManager.username = jwtManager.extractUsername(token);
                    Authentication auth = jwtManager.getAuthentication(token);
                    System.out.println(auth.getName());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }catch(Exception e){
            SecurityContextHolder.clearContext();
            System.out.println(e.getMessage());
            return;
        }
        filterChain.doFilter(httpServletRequest, httpServletResponse);
    }
}