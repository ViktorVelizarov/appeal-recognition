package com.appealfinder.backend;

import com.appealfinder.backend.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
@EnableMongoAuditing
public class AppealFinderBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppealFinderBackendApplication.class, args);
	}

}
