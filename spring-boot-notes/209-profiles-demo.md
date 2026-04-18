# Running the Same App Across Environments — Profiles in Practice

## Introduction

We understand the theory of Spring Boot Profiles. Now let's see them in action — creating profile-specific property files, activating them, testing the behavior, and understanding what happens when multiple profiles collide.

---

## Setting Up Profile Files

### 📁 Files Created

For a typical three-environment setup:

| File | Purpose | Profile Name |
|------|---------|-------------|
| `application.properties` | Default/dev settings | `default` (always loaded) |
| `application-qa.properties` | QA environment overrides | `qa` |
| `application-prod.properties` | Production environment overrides | `prod` |

### 🧠 What Goes in Profile Files?

Only **properties that differ** from the default. Don't copy everything — just the overrides.

**`application-qa.properties`:**
```properties
# QA database (different host in real apps)
spring.datasource.url=jdbc:mysql://qa-db-host:3306/jobportal
spring.datasource.username=qa_user
spring.datasource.password=qa_pass

# Longer cache for QA
cache.jobs.ttl-minutes=15

# QA domain for CORS
app.cors.allowed-origins=http://localhost:5173,https://qa.jobportal.eazybytes.com
```

**`application-prod.properties`:**
```properties
# Production database
spring.datasource.url=jdbc:mysql://prod-db-host:3306/jobportal
spring.datasource.username=prod_user
spring.datasource.password=prod_pass

# Shorter cache for production (fresher data)
cache.jobs.ttl-minutes=5

# Disable SQL logging in production
spring.jpa.show-sql=false

# Production domain for CORS
app.cors.allowed-origins=https://jobportal.eazybytes.com
```

### 💡 Key Insight

Notice that `spring.jpa.show-sql=false` only appears in the **prod** file. In QA, the default `true` value from `application.properties` is fine. You only override what needs to change.

---

## Activating a Profile — Production

### ⚙️ Activation via Environment Variable

```bash
SPRING_PROFILES_ACTIVE=prod
```

### 🧪 What Happens at Startup?

Spring Boot logs which profiles are active:

```
The following 1 profile is active: "prod"
```

**Result:**
- SQL logging is **disabled** (from prod properties)
- Cache TTL is **5 minutes** (from prod properties)
- CORS allows only `jobportal.eazybytes.com` (from prod properties)
- All other properties use **default values** from `application.properties`

---

## Multiple Profiles: Understanding Precedence

### 🧪 Scenario: `SPRING_PROFILES_ACTIVE=prod,qa`

Both profiles are activated. What happens to `cache.jobs.ttl-minutes`?

- `application.properties` → `10`
- `application-prod.properties` → `5`
- `application-qa.properties` → `15`

**Result:** `15` — because `qa` is the **last profile listed**, it overrides everything before it.

### 🧪 Scenario: `SPRING_PROFILES_ACTIVE=qa,prod`

Same profiles, reversed order.

**Result:** `5` — now `prod` is last, so its values win.

### 🧠 The Rule

```
Loading order: application.properties → first profile → second profile → ...
Each subsequent profile overrides conflicting values from earlier ones.
The LAST profile in the list has the HIGHEST priority.
```

---

## Conditional Logic Based on Active Profile

### 🧠 Use Case: Different JWT Expiration per Environment

```properties
# jwt.properties
jwt.expiration.hours=24
jwt.prod.expiration.hours=1
```

```java
@Value("${jwt.expiration.hours:24}")
private int jwtExpirationHours;

@Value("${jwt.prod.expiration.hours:1}")
private int jwtProdExpirationHours;

public String generateJwtToken(Authentication auth) {
    List<String> profiles = Arrays.asList(env.getActiveProfiles());

    int expirationHours = jwtExpirationHours;
    if (profiles.contains("prod")) {
        expirationHours = jwtProdExpirationHours;
    }

    return Jwts.builder()
        .setExpiration(new Date(System.currentTimeMillis() + expirationHours * 3600000))
        .compact();
}
```

### 🧪 Testing

**With `SPRING_PROFILES_ACTIVE=qa,prod`:**
- `profiles` list contains `["qa", "prod"]`
- `profiles.contains("prod")` → `true`
- `expirationHours` = `1` (production value)

**With `SPRING_PROFILES_ACTIVE=qa`:**
- `profiles` list contains `["qa"]`
- `profiles.contains("prod")` → `false`
- `expirationHours` = `24` (default value)

---

## IntelliJ Shortcut for Profiles

Instead of manually setting environment variables, IntelliJ provides an **Active Profiles** field in the run configuration:

```
Active profiles: prod,qa
```

This is equivalent to setting `SPRING_PROFILES_ACTIVE=prod,qa` — IntelliJ handles it behind the scenes.

---

## What the Operations Team Gets

Before profiles:
- Manually inject 40+ properties using env vars/CLI args
- Risk of typos and missing properties
- Different setup scripts for each environment

After profiles:
- **One command:** `--spring.profiles.active=prod`
- All production-specific configs are automatically loaded
- No risk of forgotten properties
- Clean, maintainable property files

---

## ✅ Key Takeaways

1. Profile files should only contain **properties that differ** from the default — don't duplicate everything
2. When **multiple profiles** are active, the **last one in the comma-separated list** has the highest priority
3. Use `env.getActiveProfiles()` to write **conditional business logic** based on the current environment
4. The startup logs always show which profiles are active — use this for verification
5. IntelliJ's **Active Profiles** field is the easiest way to test profiles locally

## ⚠️ Common Mistakes

- Copying all properties into every profile file — only override what changes
- Activating `prod,qa` and expecting `prod` to win — it's `qa` that wins because it's listed last
- Forgetting that `application.properties` is always loaded alongside any active profile

## 💡 Pro Tips

- For local development, use the **default profile** (no profile activated) — it gives you all the developer-friendly settings
- Keep production property files locked down — only authorized team members should modify them
- Test profile switching locally before deployment — activate `prod` in your IDE and verify the behavior matches expectations
