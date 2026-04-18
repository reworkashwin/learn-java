# Controlling Bean Creation Using Profiles & Conditions

## Introduction

So far, every bean we've created in our Spring Boot application is **always created**, regardless of the environment. But what if you want a bean to exist **only in production**? Or only when a specific feature is enabled? Or only when a certain library is on the classpath?

This is where **conditional bean creation** comes in — a powerful concept that lets you control *which beans get created and when*. Combined with profiles, this opens up elegant solutions for environment-specific behavior.

---

## Why Would You Conditionally Create Beans?

### 🧠 The Problem

Think about authentication. In **production**, you want strict password validation — users must provide the correct password or get rejected. But in **QA/development**, testers constantly struggle with passwords:

- They can't remember passwords used during account creation
- Hashed passwords in the database can't be reversed
- When production user data is cloned to QA for bug reproduction, the original password is unknown

QA teams beg developers: *"Just let us log in with any password in the testing environment!"*

### ❓ The Solution

Create **two authentication beans**:
1. **Strict authentication** — for production (validates passwords)
2. **Relaxed authentication** — for non-production (skips password checks)

Use profiles to control which one gets created.

---

## Approach 1: `@Profile` — Bean Creation Based on Active Profile

### ⚙️ How It Works

The `@Profile` annotation restricts bean creation to specific profiles:

```java
@Component
@Profile("prod")
public class ProdAuthenticationProvider implements AuthenticationProvider {

    @Override
    public Authentication authenticate(Authentication auth) {
        // Load user by email
        // ✅ Check password — strict validation
        if (!passwordEncoder.matches(rawPassword, hashedPassword)) {
            throw new BadCredentialsException("Invalid username or password");
        }
        return new UsernamePasswordAuthenticationToken(user, null, authorities);
    }
}
```

```java
@Component
@Profile("!prod")
public class NonProdAuthenticationProvider implements AuthenticationProvider {

    @Override
    public Authentication authenticate(Authentication auth) {
        // Load user by email
        // ⚠️ Skip password check — any password works
        return new UsernamePasswordAuthenticationToken(user, null, authorities);
    }
}
```

### 🧪 What Happens at Runtime?

| Active Profile | Bean Created | Password Required? |
|---------------|-------------|-------------------|
| `prod` | `ProdAuthenticationProvider` | ✅ Yes — strict validation |
| `qa` | `NonProdAuthenticationProvider` | ❌ No — any password works |
| `default` | `NonProdAuthenticationProvider` | ❌ No — any password works |
| `prod,qa` | Both (prod wins for `@Profile("prod")`) | ✅ Yes |

### 🧠 Understanding `!prod`

The `!` prefix means "**NOT** this profile":
- `@Profile("prod")` → only when `prod` is active
- `@Profile("!prod")` → when `prod` is **not** active (any other profile)

---

## Approach 2: `@ConditionalOnProperty` — Bean Creation Based on Property Value

### ⚙️ How It Works

Create a bean only when a specific property has a specific value:

```java
@Bean
@ConditionalOnProperty(name = "feature.caching.enabled", havingValue = "true")
public CacheManager cacheManager() {
    return new CaffeineCacheManager();
}
```

This bean is **only created** when:
```properties
feature.caching.enabled=true
```

If the property is `false` or missing, the bean is skipped entirely.

### 💡 Use Case

Feature flags! Enable/disable features per environment using properties:

```properties
# Development
feature.caching.enabled=true
feature.email-notifications.enabled=false

# Production
feature.caching.enabled=true
feature.email-notifications.enabled=true
```

---

## Approach 3: `@ConditionalOnMissingBean` — Avoid Duplicates

### ⚙️ How It Works

Create a bean **only if no other bean of that type already exists**:

```java
@Bean
@ConditionalOnMissingBean
public MyService myService() {
    return new DefaultMyService();
}
```

If another configuration already created a `MyService` bean, this one is skipped — preventing duplicate bean errors.

---

## Approach 4: `@ConditionalOnClass` — Bean Based on Classpath

### ⚙️ How It Works

Create a bean **only if a specific class exists** in the classpath (i.e., a library is included):

```java
@Bean
@ConditionalOnClass(name = "com.someLibrary.SomeClass")
public MyLibraryBean myLibraryBean() {
    return new MyLibraryBean();
}
```

This is how Spring Boot's auto-configuration works internally — it creates database-related beans only if database driver classes are on the classpath.

---

## The Non-Prod Auth Provider — A Real-World Example

### 🧪 Testing the Flow

**With QA profile active:**

1. Login with employer email `sanjana@company.com` and invalid password `abc123`
2. The `NonProdAuthenticationProvider` is active (because profile is not `prod`)
3. Password check is skipped → login succeeds
4. Employer sees all posted jobs, company details — everything works

**With prod profile active:**

1. Login with same email and invalid password `abc123`
2. The `ProdAuthenticationProvider` is active
3. Password check fails → "Invalid username or password" error
4. Must enter the correct password to proceed

### ⚠️ Where to Draw the Line

QA teams might ask: *"Can we also skip username validation?"*

**No.** Without a valid username, you can't:
- Load the user's profile data
- Determine their role (job seeker, employer, admin)
- Display role-specific pages and data

Skipping password validation is reasonable for testing. Skipping username validation breaks the application logic.

---

## Summary of Conditional Annotations

| Annotation | Condition | When to Use |
|-----------|-----------|-------------|
| `@Profile("prod")` | Specific profile is active | Environment-specific beans |
| `@Profile("!prod")` | Profile is NOT active | Non-production alternatives |
| `@ConditionalOnProperty` | Property has a specific value | Feature flags |
| `@ConditionalOnMissingBean` | No existing bean of that type | Default/fallback beans |
| `@ConditionalOnClass` | Class exists on classpath | Library-dependent beans |

---

## ✅ Key Takeaways

1. **`@Profile`** controls bean creation based on the active Spring Boot profile
2. Use `!profileName` to create beans for all environments **except** a specific one
3. **`@ConditionalOnProperty`** is perfect for feature flags — enable/disable beans via properties
4. These annotations work with both `@Component`/`@Service` stereotypes and `@Bean` methods
5. Conditional beans reduce memory usage and startup time by only creating what's needed

## ⚠️ Common Mistakes

- Creating both prod and non-prod beans without `@Profile` — causes `NoUniqueBeanDefinitionException`
- Using `@Profile("!prod")` but forgetting to create the `@Profile("prod")` counterpart — no bean exists when prod is active
- Allowing login with any username in non-prod — breaks role-based logic

## 💡 Pro Tips

- The non-prod authentication provider is a **huge time-saver** for QA teams — implement it early
- Use `@ConditionalOnProperty` for features you want to toggle without redeploying
- Always test both profile scenarios locally before deploying — verify that the right bean is created for each profile
- For local development, use the **default profile** so the non-prod auth provider is active — makes testing faster
