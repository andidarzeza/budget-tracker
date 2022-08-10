package com.adprod.inventar.services.implementations;

import com.adprod.inventar.models.*;
import static com.adprod.inventar.models.enums.EntityAction.*;
import static com.adprod.inventar.models.enums.EntityType.*;
import com.adprod.inventar.models.enums.Role;
import com.adprod.inventar.repositories.UserRepository;
import com.adprod.inventar.security.JwtManager;
import com.adprod.inventar.services.AccountService;
import com.adprod.inventar.services.ConfigurationService;
import com.adprod.inventar.services.HistoryService;
import com.adprod.inventar.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Optional;


@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository repository;
    private final JwtManager jwtManager;
    private final AuthenticationManager authenticationManager;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ConfigurationService configurationService;
    private final AccountService accountService;
    private final HistoryService historyService;

    @Override
    public ResponseEntity register(UserRequest request) {
        Optional<User> userOptional = repository.findByUsername(request.getUsername());
        if(userOptional.isEmpty()) {
            User user = new User(
                    request.getUsername(),
                    passwordEncoder.encode(request.getPassword()),
                    Role.USER,
                    request.getFirstName(),
                    request.getLastName()
            );
            repository.save(user);
            accountService.save(new Account(null, user.getUsername(), new HashMap<>()));
            configurationService.save(new Configuration(null, false, true, user.getUsername(), "ALL"));
            historyService.save(historyService.from(REGISTRATION, USER));
            return ResponseEntity.ok(new ResponseMessage("Registration Successful"));
        }
        return new ResponseEntity(new ResponseMessage("Username already in use"), HttpStatus.CONFLICT);
    }

    @Override
    public ResponseEntity login(UserRequest userRequest) {
        Optional<User> userOptional = repository.findByUsername(userRequest.getUsername());
        if(userOptional.isPresent()) {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(userRequest.getUsername(), userRequest.getPassword()));
            final String jwt = jwtManager.createToken(userOptional.get());
            historyService.save(
                    new History(
                            AUTHENTICATION,
                            userRequest.getUsername(),
                            "User " + userRequest.getUsername() + " has logged in.",
                            USER
                    )
            );
            return new ResponseEntity(new LoginResponse(userOptional.get().getUsername(), jwt, userOptional.get().getFirstName(), userOptional.get().getLastName()), HttpStatus.OK);
        } else {
            return new ResponseEntity(new ResponseMessage("Authentication Failed"), HttpStatus.FORBIDDEN);
        }
    }

    @Override
    public ResponseEntity findAll() {
        return null;
    }

    @Override
    public ResponseEntity delete(String userID) {
        return null;
    }

    @Override
    public ResponseEntity<Object> update(String newUsername, String username) {
        return null;
    }
}
