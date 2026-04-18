# Environment-Specific Configuration — Spring Boot Profiles

## Introduction

The operations team is back with another complaint: *"We have 40+ properties to manage differently across dev, QA, and production. Manually injecting each one through environment variables or CLI arguments is a nightmare. Is there a better way?"*

This is a completely valid concern. Setting 40 environment variables before every deployment is error-prone and exhausting. What we need is a way to **group environment-specific configurations together** and switch between them with a single command.

Enter **Spring Boot Profiles** — one of the most powerful and elegant features in the entire Spring Boot ecosystem.

---

## What Are Spring Boot Profiles?

### 🧠 The Simple Explanation

Profiles let you create **multiple configuration sets** — one for each environment — within the same application. When you deploy, you simply tell Spring Boot which profile to activate, and it automatically loads the right configuration.

> Think of profiles as **clothing for seasons**. In summer, you wear light clothes. In winter, warm jackets. In rain, a raincoat. **Your body stays the same** — only the clothing changes. Similarly, your application code stays the same — only the configuration profile changes per environment.

### ⚙️ What Can Profiles Control?

- Properties and their values
- Database connections
- API URLs
- Logging levels
- Bean creation (which beans to activate or skip)
- Feature toggles

---

## How to Create Profiles

### 📁 The Naming Convention

Spring Boot recognizes profile-specific property files based on a naming pattern:

```
application-{profileName}.properties
```

or

```
application-{profileName}.yml
```

**Examples of valid file names:**
- `application-dev.properties` — development environment
- `application-qa.properties` — QA/testing environment
- `application-prod.properties` — production environment
- `application-staging.properties` — staging environment

⚠️ Use a **hyphen** (`-`) between `application` and the profile name — not an underscore.

### 🧠 How Loading Works

Spring Boot **always** loads `application.properties` first (the "default" profile). Then, based on the active profile, it loads the corresponding profile-specific file **on top**:

```
1. Load application.properties           ← Always loaded
2. Load application-{activeProfile}.properties  ← Overrides matching properties
```

If a property exists in both files, the **profile-specific file wins**.

---

## How to Activate a Profile

### ⚙️ Three Ways to Activate

**Option 1: Environment Variable**
```bash
export SPRING_PROFILES_ACTIVE=prod
java -jar app.jar
```

**Option 2: CLI Argument** (recommended for deployments)
```bash
java -jar app.jar --spring.profiles.active=prod
```

**Option 3: Inside `application.properties`** (not recommended for production)
```properties
spring.profiles.active=prod
```

⚠️ Defining the active profile inside `application.properties` means the same profile is always activated. You'd have to change and repackage the app to switch — which defeats the purpose.

### 🎯 Why CLI/Env Vars Are Preferred

The operations team provides **just one property**: `spring.profiles.active=prod`. Behind that single property, all 40+ environment-specific configurations are automatically loaded. That's the magic — **one switch activates everything**.

---

## Activating Multiple Profiles

You can activate more than one profile at a time:

```bash
java -jar app.jar --spring.profiles.active=common,prod
```

Spring Boot will load:
1. `application.properties` (always)
2. `application-common.properties`
3. `application-prod.properties`

If the same property exists in multiple profiles, the **last profile in the list wins**:

```
spring.profiles.active=qa,prod
# → prod properties override qa properties
```

---

## Writing Conditional Business Logic Based on Profiles

### 🧠 Reading Active Profiles in Code

You can detect which profile is active and execute different logic:

```java
@Autowired
private Environment env;

@Value("${jwt.expiration.hours:24}")
private int jwtExpirationHours;

@Value("${jwt.prod.expiration.hours:1}")
private int jwtProdExpirationHours;

public String generateJwtToken(Authentication auth) {
    List<String> profiles = Arrays.asList(env.getActiveProfiles());

    int expirationHours = jwtExpirationHours; // default: 24 hours
    if (profiles.contains("prod")) {
        expirationHours = jwtProdExpirationHours; // prod: 1 hour
    }

    // Use expirationHours for JWT token generation
}
```

This lets you:
- Use 24-hour JWT tokens in dev/QA for convenience
- Use 1-hour JWT tokens in production for security
- No code changes between environments — the profile decides

---

## Benefits of Spring Boot Profiles

| Benefit | Description |
|---------|-------------|
| **Same code, different configs** | One codebase, one JAR, multiple environments |
| **No manual property injection** | Ops team activates one profile instead of 40+ individual properties |
| **Reduced human error** | No risk of typos in individual property names |
| **Easy to manage** | All environment-specific values live in one file |
| **Framework support** | Spring Boot automatically handles profile loading and precedence |

---

## ✅ Key Takeaways

1. **Profiles** let you create environment-specific configurations: `application-dev.properties`, `application-qa.properties`, `application-prod.properties`
2. `application.properties` is **always loaded** as the default — profile-specific files override matching properties
3. Activate profiles via `--spring.profiles.active=prod` (CLI) or `SPRING_PROFILES_ACTIVE=prod` (env var)
4. **Multiple profiles** can be activated with commas — the last one has highest precedence
5. You can write **conditional Java logic** based on active profiles using `env.getActiveProfiles()`

## ⚠️ Common Mistakes

- Setting `spring.profiles.active` inside `application.properties` — this hardcodes the profile and defeats the purpose of external activation
- Forgetting that `application.properties` is always loaded — don't duplicate non-overridden properties in profile files
- Activating multiple profiles without understanding precedence — the last profile in the list wins for conflicting properties

## 💡 Pro Tips

- Only put **environment-specific overrides** in profile files — don't copy every property from `application.properties`
- Use **IntelliJ's Active Profiles field** for local testing instead of modifying environment variables
- Document which profiles exist and what they control — the ops team needs a clear reference for deployment
- The default profile (no profile activated) corresponds to plain `application.properties` — perfect for local development
