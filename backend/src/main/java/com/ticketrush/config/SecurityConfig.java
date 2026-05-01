package com.ticketrush.config; // Đổi lại package cho đúng với thư mục của bạn

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // Tắt chống tấn công CSRF (thường làm khi code REST API)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // Cho phép TẤT CẢ các request đi qua mà không cần hỏi mật khẩu
            );
        return http.build();
    }
}