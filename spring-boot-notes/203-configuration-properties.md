# Grouping Properties the Right Way — `@ConfigurationProperties`

## Introduction

We've seen how `@Value` and `Environment` let you read individual properties. They work great for a handful of values, but what happens when you need to read **20 or 30 related properties**? You'd end up repeating `@Value` annotations 20 times or calling `getProperty()` 20 times — making your business logic messy and hard to maintain.

This is where `@ConfigurationProperties` comes in. It lets you **map a group of related properties directly into a Java POJO**, which can then be injected as a bean. It's the cleanest, most enterprise-grade approach for reading configuration in Spring Boot.

---

## The Problem with `@Value` and `Environment` at Scale

### 🧠 Why They Fall Short

Both `@Value` and `Environment` require you to **hardcode property key names** in your business logic and **repeat the pattern** for every property:

```java
// Repeating @Value for 6 properties — imagine doing this for 20+
@Value("${cache.jobs.ttl-minutes}")
private int jobsTtl;

@Value("${cache.jobs.max-size}")
private int jobsMaxSize;

@Value("${cache.companies.ttl-minutes}")
private int companiesTtl;
// ... and on and on
```

With `Environment`, it's no better — 20 `getProperty()` calls scattered in your code.

### ❓ Is There a Cleaner Way?

Yes — `@ConfigurationProperties` reads an **entire group of properties** into a single POJO object. That POJO becomes a Spring bean you can inject anywhere.

---

## How `@ConfigurationProperties` Works

### ⚙️ The Three-Step Process

**Step 1:** Define properties with a **common prefix** in `application.properties`

```properties
app.cors.allowed-origins=http://localhost:5173,https://dev.jobportal.eazybytes.com
app.cors.allowed-methods=*
app.cors.allowed-headers=*
app.cors.allowed-credentials=true
app.cors.max-age=3600
```

Notice all properties share the prefix `app.cors`.

**Step 2:** Create a POJO class annotated with `@ConfigurationProperties`

```java
@Getter
@Setter
@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

    private List<String> allowedOrigins;
    private List<String> allowedMethods;
    private List<String> allowedHeaders;
    private boolean allowedCredentials;
    private long maxAge;
}
```

**Step 3:** Enable it in your main application class

```java
@SpringBootApplication
@EnableConfigurationProperties(CorsProperties.class)
public class JobportalApplication {
    // ...
}
```

That's it. Spring Boot now creates a bean of `CorsProperties` with all the values populated from the properties file.

---

## Understanding the Mapping Rules

### 🧠 How Property Names Map to Java Fields

Spring Boot uses **relaxed binding** to match property names to field names:

| Property Key | Java Field Name | Rule |
|--------------|-----------------|------|
| `allowed-origins` | `allowedOrigins` | Remove hyphens, capitalize next letter |
| `allowed-methods` | `allowedMethods` | Same pattern |
| `max-age` | `maxAge` | Same pattern |
| `allowed-credentials` | `allowedCredentials` | Same pattern |

You ignore special characters like hyphens, and each subsequent word starts with a capital letter (camelCase).

### 🧠 How Data Types Get Resolved

| Property Value | Java Data Type | Why |
|----------------|---------------|-----|
| `http://localhost:5173,https://dev.jobportal.eazybytes.com` | `List<String>` | Comma-separated → List |
| `*` | `List<String>` | Single value works in a List too |
| `true` | `boolean` | Boolean property |
| `3600` | `long` | Numeric property |

Spring Boot is smart enough to automatically convert property values into the appropriate Java types.

---

## Using the Bean in Business Logic

### 🧪 Before — Hardcoded CORS Config

```java
configuration.setAllowedOrigins(List.of("http://localhost:5173"));
configuration.setAllowedMethods(List.of("*"));
configuration.setAllowedHeaders(List.of("*"));
configuration.setAllowCredentials(true);
configuration.setMaxAge(3600L);
```

### 🧪 After — Clean, Property-Driven CORS Config

```java
@Configuration
public class JobPortalSecurityConfig {

    private final CorsProperties corsProperties;

    public JobPortalSecurityConfig(CorsProperties corsProperties) {
        this.corsProperties = corsProperties;
    }

    // Inside the CORS configuration method:
    configuration.setAllowedOrigins(corsProperties.getAllowedOrigins());
    configuration.setAllowedMethods(corsProperties.getAllowedMethods());
    configuration.setAllowedHeaders(corsProperties.getAllowedHeaders());
    configuration.setAllowCredentials(corsProperties.getAllowedCredentials());
    configuration.setMaxAge(corsProperties.getMaxAge());
}
```

No hardcoded values. No repeated `@Value` annotations. Just clean, injectable configuration.

---

## Multiple POJO Classes for Different Prefixes

If your project has properties with different prefixes, you can create multiple POJO classes and register all of them:

```java
@EnableConfigurationProperties({
    CorsProperties.class,
    CacheProperties.class,
    JwtProperties.class
})
```

Each class maps to its own prefix, keeping configuration organized and modular.

---

## The Prerequisite: Common Prefix

⚠️ **Important:** All properties that you want to map into a single POJO **must share a common prefix**.

```properties
# ✅ Good — shared prefix "app.cors"
app.cors.allowed-origins=...
app.cors.allowed-methods=...
app.cors.max-age=...

# ❌ Bad — no common prefix
cors.allowed-origins=...
app.methods=...
config.max-age=...
```

Without a shared prefix, `@ConfigurationProperties` can't bind the properties to your POJO.

---

## When to Use Which Approach?

| Scenario | Best Approach |
|----------|---------------|
| Reading 1-3 individual properties | `@Value` |
| Reading properties + env variables dynamically | `Environment` |
| Reading a **group** of related properties | `@ConfigurationProperties` |
| Production-grade, maintainable configuration | `@ConfigurationProperties` |

---

## ✅ Key Takeaways

1. **`@ConfigurationProperties`** maps a group of related properties (with a common prefix) into a Java POJO
2. The POJO needs `@Getter` and `@Setter` (or standard getters/setters) for Spring to populate the fields
3. You must enable it with **`@EnableConfigurationProperties`** on the main class
4. Property names use **relaxed binding** — `allowed-origins` maps to `allowedOrigins`
5. The POJO automatically becomes a Spring **bean** — inject it anywhere via constructor injection

## ⚠️ Common Mistakes

- Forgetting `@EnableConfigurationProperties` — the POJO won't be created as a bean
- Not adding `@Getter` and `@Setter` — Spring can't populate the fields without setters
- Properties without a common prefix — `@ConfigurationProperties` won't know what to bind
- Using `@ConfigurationProperties` for a single property — overkill; use `@Value` instead

## 💡 Pro Tips

- Use `@ConfigurationProperties` for anything that has 3+ related properties — it keeps your code clean and maintainable
- Operations teams love this approach because they just update properties, and everything flows into the POJO automatically
- In production, you can change CORS origins or cache settings without touching a single line of Java code
