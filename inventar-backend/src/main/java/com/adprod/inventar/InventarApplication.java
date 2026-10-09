package com.adprod.inventar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InventarApplication {

	public static void main(String[] args) {
		SpringApplication.run(InventarApplication.class, args);
	}

}
