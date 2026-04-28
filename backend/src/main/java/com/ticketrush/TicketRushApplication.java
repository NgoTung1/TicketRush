package com.ticketrush;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication
public class TicketRushApplication {
    public static void main(String[] args) {
        SpringApplication.run(TicketRushApplication.class, args);
    }
}
