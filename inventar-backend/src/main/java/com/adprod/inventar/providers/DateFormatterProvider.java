package com.adprod.inventar.providers;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.text.SimpleDateFormat;

@Configuration
public class DateFormatterProvider {

    @Bean
    public SimpleDateFormat dateFormatter() {
        return new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");
    }

}
