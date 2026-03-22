package com.prajaconnect.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String rawUrl;

    @Bean
    @Primary
    public DataSource dataSource() {
        if (rawUrl == null || rawUrl.isBlank()) {
            throw new IllegalStateException("DATABASE_URL / SPRING_DATASOURCE_URL is not set");
        }

        HikariDataSource ds = new HikariDataSource();
        ds.setDriverClassName("org.postgresql.Driver");
        ds.setMaximumPoolSize(5);
        ds.setConnectionTimeout(30_000);

        if (rawUrl.startsWith("jdbc:")) {
            ds.setJdbcUrl(rawUrl);
        } else {
            String normalized = rawUrl;
            if (normalized.startsWith("postgres://")) {
                normalized = "postgresql" + normalized.substring("postgres".length());
            }
            URI uri = URI.create(normalized);
            String host = uri.getHost();
            int port = uri.getPort();
            String path = uri.getPath();
            String query = uri.getRawQuery();

            String jdbcUrl = "jdbc:postgresql://" + host + (port > 0 ? ":" + port : "") + path;
            if (query != null && !query.isEmpty()) {
                jdbcUrl += "?" + query;
            }
            ds.setJdbcUrl(jdbcUrl);

            String userInfo = uri.getUserInfo();
            if (userInfo != null) {
                String[] parts = userInfo.split(":", 2);
                ds.setUsername(parts[0]);
                if (parts.length > 1) {
                    ds.setPassword(parts[1]);
                }
            }
        }

        return ds;
    }
}
