package com.adprod.inventar.services.implementations;

import com.adprod.inventar.services.SecurityContextService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class SecurityContextServiceImpl implements SecurityContextService {
    @Override
    public String username() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
