package com.ai.roleplay;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.ai.roleplay.mapper")
public class AiRoleplayApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiRoleplayApplication.class, args);
    }
}

