package com.prajaconnect.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String rawUrl;

    @Bean
    @Primary
    public DataSource dataSource() {
        String jdbcUrl = toJdbcUrl(rawUrl);

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(jdbcUrl);
        ds.setDriverClassName("org.postgresql.Driver");
        ds.setMaximumPoolSize(5);
        ds.setConnectionTimeout(30_000);
        return ds;
    }

    private static String toJdbcUrl(String url) {
        if (url == null) throw new IllegalStateException("DATABASE_URL / SPRING_DATASOURCE_URL is not set");
        if (url.startsWith("postgresql://"))  return "jdbc:" + url;
        if (url.startsWith("postgres://"))    return "jdbc:postgresql" + url.substring("postgres".length());
        return url; // already jdbc:postgresql://...
    }
}
