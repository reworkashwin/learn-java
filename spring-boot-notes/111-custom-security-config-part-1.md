# Crafting Your Own Rules — Custom Security Configurations (Part 1)

## Introduction

So far, we've been using `anyRequest()` to apply one blanket rule to the entire application. But real-world applications are never that simple — you need some APIs public and others secured. In this lecture, we'll learn how to configure **API-specific security** using `requestMatchers()`, establish a **naming convention** for public APIs, and use **regex patterns** to simplify configurations.

---

## Using `requestMatchers()` for Specific APIs

### 🧠 The Idea

Instead of `anyRequest()`, you use **`requestMatchers()`** to specify which API paths get which security rules.

Let's say we have two REST APIs:
- `GET /api/companies` → Should be **public** (no authentication needed)
- `POST /api/contacts` → Should be **secured** (authentication required)

### ⚙️ The Configuration

```java
@Bean
SecurityFilterChain customSecurityFilterChain(HttpSecurity http) throws Exception {
    return http
            .authorizeHttpRequests(authorize -> authorize
                    .requestMatchers("/api/companies").permitAll()
                    .requestMatchers("/api/contacts").authenticated()
            )
            .formLogin(flc -> flc.disable())
            .httpBasic(withDefaults())
            .csrf(csrfConfig -> csrfConfig.disable())
            .build();
}
```

**How it works:**
- `requestMatchers("/api/companies").permitAll()` → Anyone can access this without logging in
- `requestMatchers("/api/contacts").authenticated()` → Only authenticated users can access this

You can pass **multiple paths** to `requestMatchers()` separated by commas:
```java
.requestMatchers("/api/companies", "/api/products", "/api/categories").permitAll()
```

### 🧪 Testing

- `GET /api/companies` with No Auth → ✅ Successful response
- `POST /api/contacts` with No Auth → ❌ `401 Unauthorized`
- `POST /api/contacts` with Basic Auth → ✅ `201 Created`

---

## Establishing a URL Naming Strategy

### ❓ Why Do We Need a Strategy?

If your application grows to 50 or 100 REST APIs, configuring each one individually in `requestMatchers()` becomes a nightmare. You need a **pattern** so that one line of configuration can cover many APIs.

### 🧠 The Strategy: Suffix with `/public`

The best practice is to give all public REST APIs a **common suffix** (or prefix). Here, we'll use `/public`:

**Before:**
```
GET  /api/companies       → Public
POST /api/contacts        → Public
```

**After:**
```
GET  /api/companies/public   → Public
POST /api/contacts/public    → Public
```

### ⚙️ How to Update Your Controllers

In `CompanyController`:
```java
@GetMapping(path = "public")
public List<Company> getAllCompanies() { ... }
```

In `ContactController`:
```java
@PostMapping(path = "public")
public ContactMessage sendMessage(...) { ... }
```

Now both APIs end with `/public`, creating a predictable pattern.

---

## Using Regex Request Matchers

### 🧠 The Power Move

Instead of listing every API path, use a **regex pattern** that matches all public APIs at once:

```java
.requestMatchers(RegexRequestMatchers.regexMatcher(".*public$")).permitAll()
```

This says: *"Any API path that ENDS with `public` → permit all."*

### 🔍 Breaking Down the Regex

| Part        | Meaning                              |
|-------------|--------------------------------------|
| `.*`        | Match any characters before          |
| `public`    | The literal word "public"            |
| `$`         | End of the string                    |

### ✨ The Advantage

With this single line of configuration:
- **No matter how many public APIs you add** in the future, they're automatically covered
- You just need to ensure they end with `/public` in their path
- No need to touch the security configuration file again

---

## What Happens to Unconfigured Paths?

Here's something important: if someone tries to access an API path that you **haven't configured** in your security rules, Spring Security treats it as a secured path by default.

For example, if someone tries the old path `/api/companies` (without `/public`):
- Without credentials → `401 Unauthorized`
- With valid credentials → `403 Forbidden`

Why `403` even with valid credentials? Because Spring Security sees there's **no matching controller mapping** for that path, and by default, it denies requests to unmapped paths.

---

## ✅ Key Takeaways

1. Use **`requestMatchers("/path")`** to configure security for specific API paths
2. Use **`permitAll()`**, **`authenticated()`**, or **`denyAll()`** after `requestMatchers()` to set the rule
3. Establish a **URL naming strategy** — like suffixing public APIs with `/public` — so regex can cover them all
4. Use **`RegexRequestMatchers.regexMatcher()`** for pattern-based security configuration
5. The strategy for URL naming can vary by company — the key is to have *some* consistent pattern
6. Unconfigured paths default to secured behavior

---

## ⚠️ Common Mistakes

- **Not having a URL naming strategy** — leads to messy, hard-to-maintain security configurations
- **Forgetting to update Postman/client paths** after changing API paths — old paths will return 401/403
- **Only configuring some paths** without a fallback `anyRequest()` — unconfigured paths have unpredictable behavior

---

## 💡 Pro Tips

- The naming strategy (`/public` suffix) is just one approach — some teams use `/open`, `/v1/public`, or even a prefix like `/public/api/...`. Pick what works for your team and stay consistent
- Always create **new Postman requests** for updated paths — keep old ones around temporarily for reference
- You can combine regex matchers with explicit `requestMatchers()` in the same configuration
