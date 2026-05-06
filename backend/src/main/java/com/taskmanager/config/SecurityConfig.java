package com.taskmanager.config;

import com.taskmanager.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
    @EnableWebSecurity
    public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
            private final UserDetailsService userDetailsService;

    @Value("${cors.origins:http://localhost:5173}")
            private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, UserDetailsService userDetailsService) {
                this.jwtAuthFilter = jwtAuthFilter;
                this.userDetailsService = userDetailsService;
    }

    @Bean
            public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                        http
                                        .csrf(AbstractHttpConfigurer::disable)
                                        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                        .authorizeHttpRequests(auth -> auth
                                                                               .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                                               .requestMatchers("/auth/**", "/api/auth/**", "/error", "/favicon.ico").permitAll()
                                                                               .anyRequest().authenticated()
                                                                           )
                                        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
                        return http.build();
            }

    @Bean
            public CorsConfigurationSource corsConfigurationSource() {
                        U
