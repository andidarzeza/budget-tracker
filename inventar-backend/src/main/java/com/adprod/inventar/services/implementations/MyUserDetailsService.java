package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.User;
import com.adprod.inventar.models.UserPrincipal;
import com.adprod.inventar.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MyUserDetailsService implements UserDetailsService {

    private final UserRepository repository;

    public MyUserDetailsService(UserRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOptional = repository.findByUsername(username);
        if(userOptional.isEmpty())
            throw new UsernameNotFoundException("Error 404");
        return new UserPrincipal(userOptional.get());
    }
}