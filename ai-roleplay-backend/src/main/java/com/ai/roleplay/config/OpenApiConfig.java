package com.ai.roleplay.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AI角色扮演聊天系统 API")
                        .version("1.0.0")
                        .description("基于Spring Boot的AI角色扮演聊天系统API文档")
                        .contact(new Contact()
                                .name("AI Roleplay Team")
                                .email("support@ai-roleplay.com")));
    }
}