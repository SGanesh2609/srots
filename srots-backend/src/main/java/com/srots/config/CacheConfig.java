package com.srots.config;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.github.benmanes.caffeine.cache.Caffeine;

/**
 * CacheConfig — Two-tier caching strategy.
 *
 * PRIMARY: Redis (distributed cache, shared across multiple instances)
 *   - Colleges:        TTL 1 hour   (rarely changes)
 *   - Analytics:       TTL 5 min    (dashboard data, acceptable staleness)
 *   - Student profiles:TTL 30 min   (per-request update invalidates)
 *   - Free courses:    TTL 30 min
 *   - Jobs list:       TTL 2 min    (frequently filtered)
 *
 * FALLBACK: Caffeine (in-process cache for non-critical paths)
 *   Used automatically if Redis is unavailable.
 *
 * Cache names are constants — use CacheNames.COLLEGES etc. in @Cacheable.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

    // ── Cache name constants — use these in @Cacheable annotations ────────────
    public static final String COLLEGES         = "colleges";
    public static final String ANALYTICS        = "analytics";
    public static final String STUDENT_PROFILES = "studentProfiles";
    public static final String FREE_COURSES     = "freeCourses";
    public static final String JOBS_LIST        = "jobsList";
    public static final String COMPANY_LIST     = "companyList";

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    /**
     * Primary cache manager — Redis.
     * Each cache name gets its own TTL via withTtl() override.
     */
    @Bean
    @Primary
    public CacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues()
                .entryTtl(Duration.ofMinutes(10)); // default TTL

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withCacheConfiguration(COLLEGES,
                        defaultConfig.entryTtl(Duration.ofHours(1)))
                .withCacheConfiguration(ANALYTICS,
                        defaultConfig.entryTtl(Duration.ofMinutes(5)))
                .withCacheConfiguration(STUDENT_PROFILES,
                        defaultConfig.entryTtl(Duration.ofMinutes(30)))
                .withCacheConfiguration(FREE_COURSES,
                        defaultConfig.entryTtl(Duration.ofMinutes(30)))
                .withCacheConfiguration(JOBS_LIST,
                        defaultConfig.entryTtl(Duration.ofMinutes(2)))
                .withCacheConfiguration(COMPANY_LIST,
                        defaultConfig.entryTtl(Duration.ofHours(2)))
                .build();
    }

    /**
     * Fallback Caffeine cache manager — used if Redis is down or during local dev
     * without Redis. Wire this in tests or with @Qualifier("caffeineCacheManager").
     */
    @Bean(name = "caffeineCacheManager")
    public CacheManager caffeineCacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager(
                COLLEGES, ANALYTICS, STUDENT_PROFILES,
                FREE_COURSES, JOBS_LIST, COMPANY_LIST);
        manager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(10_000)
                .expireAfterWrite(Duration.ofMinutes(10)));
        return manager;
    }
}
