package com.ahz.libsqlbackend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI libraryOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("图书馆管理系统 API")
                        .description("AhzLib-backend 接口文档，用于查看和调试后端 API")
                        .version("v1.0")
                        .contact(new Contact()
                                .name("AhzLib")
                                .email("")));
    }
}


