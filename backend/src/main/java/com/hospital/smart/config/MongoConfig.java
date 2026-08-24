package com.hospital.smart.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableMongoAuditing
public class MongoConfig {
    // Enables @CreatedDate and @LastModifiedDate annotations on MongoDB documents.
    // Additional MongoDB configuration (converters, indexes) will be added in later phases.
}
