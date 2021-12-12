package com.adprod.inventar.resources;
import com.adprod.inventar.models.User;
import com.adprod.inventar.repositories.UserRepository;
import com.adprod.inventar.services.StatisticsService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class StatisticsResource {
    private final StatisticsService statisticsService;
    private final UserRepository userRepository;
    public StatisticsResource(StatisticsService statisticsService, UserRepository userRepository) {
        this.statisticsService = statisticsService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity getRankingTable(Pageable pageable) {
        return statisticsService.getRankingTable(pageable);
    }

    @GetMapping("/all")
    public ResponseEntity getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/add")
    public ResponseEntity addUser(@RequestBody User user) {
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity deleteUser(@PathVariable String id) {
        User user = userRepository.findById(id).get();
        userRepository.delete(user);
        return ResponseEntity.ok(user);
    }


}
