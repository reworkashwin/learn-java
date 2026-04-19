# Implementing Redis RateLimiter in Gateway Server

## Introduction

Theory done. Now let's wire up the Redis-backed Rate Limiter in our Spring Cloud Gateway for the **Cards microservice**. This involves adding a Redis dependency, creating two beans (KeyResolver + RedisRateLimiter), configuring the route filter, and spinning up a Redis container.

---

## Step 1: Add the Redis Dependency

Add this to the Gateway Server's `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis-reactive</artifactId>
</dependency>
```

The `reactive` part is important — Spring Cloud Gateway is built on Project Reactor (reactive stack), so it needs the reactive Redis client.

---

## Step 2: Create the KeyResolver Bean

The KeyResolver determines **who** gets rate-limited. In this example, we resolve based on a `user` header:

```java
@Bean
public KeyResolver userKeyResolver() {
    return exchange -> Mono.justOrEmpty(exchange.getRequest().getHeaders().getFirst("user"))
            .defaultIfEmpty("anonymous");
}
```

How it works:
- Look for a `user` header in the incoming request
- If found, use its value as the rate-limiting key
- If not found, default to `"anonymous"` — all unauthenticated users share one bucket

In production, you'd likely resolve this from an authenticated principal, JWT claim, or IP address.

---

## Step 3: Create the RedisRateLimiter Bean

```java
@Bean
public RedisRateLimiter redisRateLimiter() {
    return new RedisRateLimiter(1, 1, 1);
}
```

The three constructor parameters:
1. **replenishRate = 1** → 1 token added per second
2. **burstCapacity = 1** → bucket holds max 1 token
3. **requestedTokens = 1** → each request costs 1 token

Result: Each user can make **exactly 1 request per second**. (Very restrictive — for demo purposes.)

---

## Step 4: Add the Filter to the Cards Route

In the route configuration for Cards:

```java
.route(p -> p
    .path("/eazybank/cards/**")
    .filters(f -> f
        .rewritePath(...)
        .addResponseHeader(...)
        .requestRateLimiter(config -> config
            .setRateLimiter(redisRateLimiter())
            .setKeyResolver(userKeyResolver())
        )
    )
    .uri("lb://CARDS")
)
```

The filter chains together the rate limiter bean and the key resolver bean.

---

## Step 5: Start Redis

Run a Redis container:

```bash
docker run -p 6379:6379 --name eazyredis -d redis
```

---

## Step 6: Configure Redis Connection

In the Gateway Server's `application.yml`:

```yaml
spring:
  data:
    redis:
      connect-timeout: 2s
      host: localhost
      port: 6379
      timeout: 1s
```

For Docker Compose environments, replace `localhost` with the Redis service name (e.g., `redis`).

---

## Testing with Apache Benchmark

Sending 10 rapid requests using Apache Benchmark:

```bash
ab -n 10 -c 2 -v 3 http://localhost:8072/eazybank/cards/api/contact-info
```

| Flag | Meaning |
|------|---------|
| `-n 10` | Send 10 total requests |
| `-c 2` | 2 concurrent requests at a time |
| `-v 3` | Verbose output — show response details |

### Results

All 10 requests complete in ~0.5 seconds:
- **1 request** → HTTP 200 (success)
- **9 requests** → HTTP 429 (Too Many Requests)

The very first request gets through. All subsequent requests within the same second are rejected with 429. This confirms the rate limiter is working — only 1 request per second allowed per user.

Since no `user` header was sent, all requests shared the `"anonymous"` bucket, which had a capacity of just 1 token.

---

## The Full Picture

```
Client → Gateway (RequestRateLimiter filter)
              ↓
         Check Redis: Does "anonymous" bucket have tokens?
              ↓
         YES → Forward to Cards microservice
         NO  → Return HTTP 429
```

Redis stores the token counts per key, ensuring distributed rate limiting works even across multiple Gateway instances.

---

## ✅ Key Takeaways

- The implementation requires **3 components**: Redis dependency, KeyResolver bean, RedisRateLimiter bean
- The KeyResolver determines the rate-limiting key (user, IP, session, etc.)
- Redis stores the token buckets — enabling distributed rate limiting
- Requests exceeding the limit get **HTTP 429 (Too Many Requests)**
- Use Apache Benchmark (`ab`) for quick load testing
- For Docker Compose, use the Redis service name as the host (not `localhost`)

⚠️ **Common Mistake:** Forgetting to start Redis. Without a running Redis instance, the Gateway will fail to apply rate limiting and may throw connection errors.
