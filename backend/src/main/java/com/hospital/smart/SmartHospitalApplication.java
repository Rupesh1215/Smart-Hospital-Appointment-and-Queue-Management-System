package com.hospital.smart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartHospitalApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartHospitalApplication.class, args);
    }
}
