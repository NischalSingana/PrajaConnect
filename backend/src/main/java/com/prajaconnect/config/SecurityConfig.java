package com.prajaconnect.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Base64;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOriginsRaw;

    @Value("${clerk.jwks-uri:}")
    private String clerkJwksUri;

    @Value("${clerk.publishable-key:}")
    private String clerkPublishableKey;

    @Bean
    public JwtDecoder jwtDecoder() {
        String uri = clerkJwksUri;
        if (uri == null || uri.isBlank()) {
            uri = deriveJwksUri(clerkPublishableKey);
        }
        return NimbusJwtDecoder.withJwkSetUri(uri).build();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET,  "/api/health").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/issues").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/issues/*").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/stats").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/proxy-image").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/analyze-issue").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {}));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = Arrays.asList(allowedOriginsRaw.split(","));
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Clerk publishable keys are formatted as:  pk_test_BASE64  or  pk_live_BASE64
     * The BASE64 part decodes to "clerk.your-domain.com$" — strip the trailing "$"
     * to get the Clerk Frontend API domain, then append the JWKS path.
     */
    private static String deriveJwksUri(String publishableKey) {
        if (publishableKey == null || publishableKey.isBlank()) {
            throw new IllegalStateException(
                "Neither CLERK_JWKS_URI nor CLERK_PUBLISHABLE_KEY is set. " +
                "Set at least one of these environment variables.");
        }
        try {
            String[] parts = publishableKey.split("_", 3);
            if (parts.length < 3) throw new IllegalArgumentException("Unexpected format");
            String encoded = parts[2];
            // Re-pad to valid Base64 length
            int pad = (4 - encoded.length() % 4) % 4;
            encoded = encoded + "=".repeat(pad);
            String domain = new String(Base64.getDecoder().decode(encoded))
                .replace("$", "").trim();
            return "https://" + domain + "/.well-known/jwks.json";
        } catch (Exception e) {
            throw new IllegalStateException(
                "Could not derive Clerk JWKS URI from CLERK_PUBLISHABLE_KEY: " + e.getMessage());
        }
    }
}
