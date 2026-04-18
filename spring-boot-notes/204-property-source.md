# Loading Custom Property Files — `@PropertySource`

## Introduction

So far, every property we've defined has lived inside `application.properties`. But as your application grows, cramming **everything** into one file becomes a maintenance nightmare. Database settings, cache configs, JWT secrets, CORS rules, feature flags — all in one giant file? That's asking for trouble.

In real enterprise applications, developers split properties into **separate files** for easier maintenance and tracking. But `@Value`, `Environment`, and `@ConfigurationProperties` only look at `application.properties` (or `.yml`) by default. How do you tell Spring to also read from a custom file like `jwt.properties`?

Enter **`@PropertySource`** — the annotation that teaches Spring where to find your custom property files.

---

## Why Separate Property Files?

### 🧠 The Problem with One Big File

Imagine `application.properties` has 200+ lines covering:
- Database credentials
- Cache configurations
- JWT settings
- CORS rules
- Mail server configs
- Feature toggles

Finding and editing the right property becomes a treasure hunt. Different team members editing the same file causes merge conflicts. And some properties (like secrets) shouldn't even be checked into version control.

### ❓ The Solution

Split properties into focused, purpose-specific files:
- `application.properties` — framework and common settings
- `jwt.properties` — JWT token configuration
- `mail.properties` — email server settings
- `cache.properties` — caching rules

Each file is small, focused, and easy to manage.

---

## How `@PropertySource` Works

### ⚙️ Step-by-Step Setup

**Step 1:** Create a custom property file under `src/main/resources`

```properties
# jwt.properties
jwt.issuer=Easy Job Portal
jwt.subject=JWTToken
jwt.expiration.hours=24
```

**Step 2:** Tell Spring about this file using `@PropertySource`

```java
@Component
@PropertySource("classpath:jwt.properties")
public class JwtUtil {

    @Value("${jwt.issuer:JobPortal}")
    private String jwtIssuer;

    @Value("${jwt.subject:JWTToken}")
    private String jwtSubject;

    @Value("${jwt.expiration.hours:1}")
    private int jwtExpirationHours;
}
```

**Step 3:** Use the injected values in your business logic

```java
public String generateJwtToken(Authentication authentication) {
    return Jwts.builder()
        .setIssuer(jwtIssuer)         // instead of hardcoded "Easy Job Portal"
        .setSubject(jwtSubject)       // instead of hardcoded "JWTToken"
        .setExpiration(/* use jwtExpirationHours */)
        .compact();
}
```

---

## Understanding `classpath:` vs `file:`

### 🧠 Two Ways to Load Property Files

| Prefix | Location | Use Case |
|--------|----------|----------|
| `classpath:` | Inside your project (`src/main/resources`) | Properties bundled with the application |
| `file:` | External file system path | Properties stored on the server, outside the codebase |

```java
// From inside the project (classpath)
@PropertySource("classpath:jwt.properties")

// From an external location (file system)
@PropertySource("file:/opt/config/jwt.properties")
```

### 💡 Why Would You Use `file:`?

The `file:` prefix opens up powerful possibilities:
- Store sensitive properties (secrets, credentials) **outside your Git repository**
- Let operations teams maintain config files on the server without access to source code
- Different servers can have different property files at the same path

---

## Loading Multiple Custom Files

If you have multiple property files, use array syntax:

```java
@PropertySource({
    "classpath:jwt.properties",
    "classpath:mail.properties",
    "classpath:cache.properties"
})
public class AppConfigService {
    // ...
}
```

Each file listed will be loaded and its properties made available for `@Value` or `Environment` to read.

---

## Handling Missing Files Gracefully

### ⚠️ The Default Behavior

By default, if the specified property file doesn't exist, **Spring throws an error and the application fails to start**.

### 🛡️ The Fix: `ignoreResourceNotFound`

```java
@PropertySource(
    value = "classpath:optional-config.properties",
    ignoreResourceNotFound = true
)
```

With `ignoreResourceNotFound = true`, Spring will silently skip the file if it's not found and continue startup normally.

### ❓ When to Use This?

| Scenario | Use `ignoreResourceNotFound`? |
|----------|-------------------------------|
| JWT properties (app won't work without them) | **No** — let it fail fast |
| Optional feature-flag file | **Yes** — app should still start |
| Environment-specific overrides that may not exist | **Yes** |

---

## Reading Properties from Custom Files

Once `@PropertySource` is declared, you can read the properties using any of the approaches you already know:

```java
// Approach 1: @Value
@Value("${jwt.issuer:DefaultIssuer}")
private String issuer;

// Approach 2: Environment
@Autowired
private Environment env;

String issuer = env.getProperty("jwt.issuer", "DefaultIssuer");
```

Both work identically — `@PropertySource` simply adds the custom file to the pool of property sources that Spring searches through.

---

## ✅ Key Takeaways

1. **`@PropertySource`** tells Spring Boot to load properties from a custom file beyond `application.properties`
2. Use **`classpath:`** for files inside your project and **`file:`** for external server locations
3. Multiple files can be loaded using array syntax: `@PropertySource({"file1", "file2"})`
4. Set **`ignoreResourceNotFound = true`** for optional files that might not always exist
5. Once loaded, properties are readable via `@Value` or `Environment` — same as `application.properties`

## ⚠️ Common Mistakes

- Forgetting `classpath:` prefix — Spring won't know where to look for the file
- Placing the property file outside `src/main/resources` but using `classpath:` — file won't be found
- Not providing default values in `@Value` when using `@PropertySource` — if the file or property is missing, the app crashes

## 💡 Pro Tips

- Use `file:` prefix for **sensitive configuration** like API keys, database passwords, or JWT secrets that shouldn't live in your source code repository
- For mandatory configuration files (e.g., JWT settings), let the app fail fast — don't use `ignoreResourceNotFound`
- Combine `@PropertySource` with `@ConfigurationProperties` for the cleanest architecture — custom file + POJO binding
