package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.*;
import com.adprod.inventar.models.enums.Role;
import com.adprod.inventar.repositories.UserRepository;
import com.adprod.inventar.security.JwtManager;
import com.adprod.inventar.security.LoginThrottle;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.ConfigurationService;
import com.adprod.inventar.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;


@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private static final int MIN_PASSWORD_LENGTH = 8;
    /** BCrypt only reads the first 72 bytes. */
    private static final int MAX_PASSWORD_BYTES = 72;

    private final UserRepository repository;
    private final JwtManager jwtManager;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final ConfigurationService configurationService;
    private final AccountService accountService;
    private final LoginThrottle loginThrottle;

    @Override
    public ResponseEntity register(UserRequest request, String clientAddress) {
        loginThrottle.checkSignUp(clientAddress);
        String username = request.getUsername() == null ? "" : request.getUsername().trim();
        validate(username, request.getPassword());
        if (repository.findByUsername(username).isPresent()) {
            return new ResponseEntity(new ResponseMessage("Username already in use"), HttpStatus.CONFLICT);
        }
        User user = new User(
                username,
                passwordEncoder.encode(request.getPassword()),
                Role.USER,
                request.getFirstName(),
                request.getLastName()
        );
        repository.save(user);
        accountService.save(new Account(null, "titl", user.getUsername()));
        configurationService.save(new Configuration(null, false, user.getUsername(), "ALL", null, null));
        return ResponseEntity.ok(new ResponseMessage("Registration Successful"));
    }

    @Override
    public ResponseEntity login(UserRequest request, String clientAddress) {
        loginThrottle.checkLogin(request.getUsername(), clientAddress);
        try {
            // Unknown usernames fail the same way (and take as long) as wrong passwords.
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (AuthenticationException e) {
            loginThrottle.loginFailed(request.getUsername(), clientAddress);
            return new ResponseEntity(new ResponseMessage("Authentication Failed"), HttpStatus.FORBIDDEN);
        }
        loginThrottle.loginSucceeded(request.getUsername());
        User user = repository.findByUsername(request.getUsername()).orElseThrow();
        return ResponseEntity.ok(new LoginResponse(user.getUsername(), jwtManager.createToken(user), user.getFirstName(), user.getLastName()));
    }

    private static void validate(String username, String password) {
        if (username.length() < 3 || username.length() > 50 || username.chars().anyMatch(Character::isWhitespace)) {
            throw new IllegalArgumentException("Username must be 3–50 characters, without spaces.");
        }
        if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalArgumentException("Password must be at least " + MIN_PASSWORD_LENGTH + " characters.");
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > MAX_PASSWORD_BYTES) {
            throw new IllegalArgumentException("Password is too long.");
        }
    }
}
