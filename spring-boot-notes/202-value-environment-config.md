# Reading Config Values the Classic Way — `@Value` & `Environment`

## Introduction

So far, Spring Boot has been reading properties from `application.properties` behind the scenes — database URLs, server ports, JPA settings. The framework uses these values to auto-configure things like database connections, hibernate behavior, and more. But here's the question: **what if *you* need to read a property value in your Java code?**

Maybe you want to control cache expiration times, toggle a feature, or inject a secret key — all from configuration. In this note, we'll explore two classic approaches for reading properties in Spring Boot: the `@Value` annotation and the `Environment` interface.

---

## Why Would a Developer Need to Read Properties?

### 🧠 The Problem

Imagine you have a class that configures caching for your application. Inside it, you've hardcoded values like `10` minutes for TTL and `5000` for max cache size:

```java
.expireAfterWrite(10, TimeUnit.MINUTES)
.maximumSize(5000)
```

This works, but what happens when the operations team says: *"We need to change the cache TTL from 10 minutes to 20 minutes."*?

The developer has to:
1. Open the Java file
2. Change the value
3. Rebuild the application
4. Redeploy

That's a **code change for a configuration change** — and in enterprise environments, that's unacceptable.

### ❓ What's the better approach?

Expose those values as **properties** in `application.properties`. The operations team can then update them without touching Java code.

```properties
cache.jobs.ttl-minutes=10
cache.jobs.max-size=5000
cache.companies.ttl-minutes=10
cache.companies.max-size=500
cache.roles.ttl-days=1
cache.roles.max-size=100
```

Now the question is: **how do you read these values in your Java code?**

---

## Approach 1: The `@Value` Annotation

### 🧠 What is it?

`@Value` is a Spring annotation that lets you inject a property value directly into a Java field. Think of it as a bridge between your config file and your code.

### ⚙️ How Does It Work?

The syntax uses a special placeholder format:

```java
@Value("${cache.jobs.ttl-minutes}")
private int jobsCacheTtlMinutes;
```

**Breaking down the syntax:**
- `"${...}"` — This is the property placeholder syntax
- Inside the `${}`, you put the exact **property key** from `application.properties`
- The framework reads the value and assigns it to the field during bean creation

### 🧪 Full Example

```java
@Configuration
public class CaffeineCacheConfig {

    @Value("${cache.jobs.ttl-minutes}")
    private int jobsCacheTtlMinutes;

    @Value("${cache.jobs.max-size}")
    private int jobsCacheMaxSize;

    @Value("${cache.companies.ttl-minutes}")
    private int companiesCacheTtlMinutes;

    @Value("${cache.companies.max-size}")
    private int companiesCacheMaxSize;

    @Value("${cache.roles.ttl-days}")
    private int rolesCacheTtlDays;

    @Value("${cache.roles.max-size}")
    private int rolesCacheMaxSize;

    @Bean
    public CacheManager cacheManager() {
        // Use the injected fields instead of hardcoded values
        // jobsCacheTtlMinutes instead of 10
        // jobsCacheMaxSize instead of 5000
    }
}
```

During startup, Spring reads the properties, matches the keys, and injects the corresponding values into the fields. If you debug, you'll see `jobsCacheTtlMinutes = 10` and `rolesCacheMaxSize = 100` — exactly what's in the properties file.

### ⚠️ What Happens If a Property Is Missing?

If a property key referenced by `@Value` doesn't exist in `application.properties`, **the application will fail to start**. Spring throws an exception like:

```
Could not resolve placeholder 'cache.jobs.ttl-minutes' in value "${cache.jobs.ttl-minutes}"
```

This is dangerous in enterprise environments where properties might vary across dev, QA, and production.

### 🛡️ The Fix: Default Values

You can provide a fallback value using colon syntax:

```java
@Value("${cache.jobs.ttl-minutes:5}")
private int jobsCacheTtlMinutes;

@Value("${cache.jobs.max-size:2000}")
private int jobsCacheMaxSize;
```

**How this works:**
- If the property `cache.jobs.ttl-minutes` exists → use its value
- If it's missing → use the default value `5`

💡 **Pro Tip:** Always define default values as a backup plan, but also ensure all required properties are present in `application.properties`. Think of defaults as a safety net, not a replacement.

---

## Approach 2: The `Environment` Interface

### 🧠 What is it?

The `Environment` interface is a Spring-provided bean that gives you programmatic access to properties. Instead of annotation-based injection, you call a method to fetch a property value at runtime.

### ⚙️ How Does It Work?

Spring Boot automatically creates a bean of type `Environment`. You inject it using `@Autowired` and call `getProperty()`:

```java
@Autowired
private Environment env;

public void someMethod() {
    String ttlTime = env.getProperty("cache.jobs.ttl-minutes", "5");
    String secret = env.getProperty("JWT_SECRET", ApplicationConstants.DEFAULT_SECRET);
}
```

### 🔑 Key Capabilities

The `Environment` interface can read from **two sources**:

| Source | Example |
|--------|---------|
| `application.properties` | `cache.jobs.ttl-minutes=10` |
| OS environment variables | `JWT_SECRET=mySecretKey123` |

This dual capability makes `Environment` very powerful — it's a one-stop shop for reading configuration from anywhere.

### 🧪 Example with Default Value

```java
String ttlTime = env.getProperty("cache.jobs.ttl-minutes", "5");
```

- First argument: the property key
- Second argument (optional): default value if the property isn't found

### 💡 When to Use `Environment` Over `@Value`

Use `Environment` when you need to:
- Read properties **dynamically at runtime** (not just at startup)
- Read **OS environment variables** alongside application properties
- Decide which property to read based on **conditional logic**

---

## `@Value` vs `Environment` — Quick Comparison

| Feature | `@Value` | `Environment` |
|---------|----------|---------------|
| Injection style | Declarative (on field) | Programmatic (method call) |
| When value is resolved | At bean creation (startup) | At method invocation (runtime) |
| Default value | `${key:default}` | `getProperty("key", "default")` |
| Reads env variables? | No (only properties files) | Yes |
| Best for | Fixed configuration values | Dynamic property lookups |

---

## ✅ Key Takeaways

1. **`@Value("${property.key}")`** injects a property value into a Java field at startup time
2. **Always provide default values** with the colon syntax: `@Value("${key:default}")` — it prevents startup failures
3. **`Environment` interface** reads both `application.properties` and OS environment variables
4. Both approaches serve the same purpose but differ in **when** and **how** values are resolved
5. Moving hardcoded values to properties **empowers operations teams** to control application behavior without touching code

## ⚠️ Common Mistakes

- Forgetting to use `${}` syntax — writing `@Value("cache.jobs.ttl-minutes")` instead of `@Value("${cache.jobs.ttl-minutes}")`
- Not importing `@Value` from the correct package — it must be `org.springframework.beans.factory.annotation.Value`
- Missing properties without defaults — causes the entire application to crash at startup

## 💡 Pro Tips

- Use `@Value` for simple, static property injection where you just need a value wired into a field
- Use `Environment` when you need flexibility — reading env vars, conditionally choosing properties, or working inside utility methods
- In the next lecture, we'll explore a **third approach** (`@ConfigurationProperties`) that handles groups of related properties elegantly — it's the enterprise-grade solution
