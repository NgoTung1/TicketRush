package com.ticketrush.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "supabase")
public record SupabaseProperties(
    String url,
    String key,
    String bucket) {
}