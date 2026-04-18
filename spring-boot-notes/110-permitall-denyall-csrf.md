# Demo of `permitAll()`, `denyAll()`, and CSRF Disable

## Introduction

So far, we've used `anyRequest().authenticated()` to secure everything. But Spring Security offers more options: you can **permit all requests** without any security, or **deny all requests** even from authenticated users. In this lecture, we'll explore `permitAll()`, `denyAll()`, understand the difference between `401` and `403` HTTP status codes, and learn how to **disable CSRF protection** (temporarily) for testing.

---

## `anyRequest().permitAll()` — Open the Floodgates

### 🧠 What Does It Do?

```java
.authorizeHttpRequests(authorize -> authorize
        .anyRequest().permitAll()
)
```

This tells Spring Security: **"Let everyone in. No authentication required for any request."**

It's essentially the same as *not* using Spring Security at all.

### 🧪 Testing

- Postman with **No Auth** → ✅ You get the response
- Browser without login → ✅ You get the response

### ❓ When Would You Use This?

Great question! You might think, "Why add Spring Security just to permit everything?"

The answer: **environment-specific Bean creation**. Imagine this:
- In **lower environments** (development, testing) → Create a Bean with `permitAll()` so developers can test without security hassles
- In **production** → Create a different Bean with `authenticated()` so everything is secured

Spring allows you to create Beans **conditionally** based on the active environment profile. We'll explore that concept in future sections.

---

## `anyRequest().denyAll()` — Lock Everything Down

### 🧠 What Does It Do?

```java
.authorizeHttpRequests(authorize -> authorize
        .anyRequest().denyAll()
)
```

This tells Spring Security: **"Nobody gets in. Period. Not even authenticated users."**

### 🧪 Testing

| Scenario                     | Result                     |
|------------------------------|----------------------------|
| No authentication            | `401 Unauthorized`         |
| Valid credentials provided    | `403 Forbidden`            |

### 🔍 Understanding 401 vs. 403

These two status codes are often confused, but they mean very different things:

| Status Code | Name          | Meaning                                           |
|-------------|---------------|---------------------------------------------------|
| **401**     | Unauthorized  | "I don't know who you are — provide credentials"  |
| **403**     | Forbidden     | "I know who you are, but you're not allowed here" |

With `denyAll()`:
- Without credentials → 401 (who are you?)
- With valid credentials → 403 (I know you, but access is still denied)

### ❓ When Would You Use This?

Honestly? **Almost never** for `anyRequest().denyAll()`. There are no practical scenarios where you'd deny every single request. However, `denyAll()` becomes useful when combined with **specific API path configurations** — e.g., deny access to certain admin endpoints. We'll see that in the coming lectures.

---

## The Real-World Pattern

In practice, nobody uses `anyRequest()` with a blanket rule for an entire app. Enterprise applications have **mixed requirements**:

- Some APIs need to be **public** (e.g., view products, health checks)
- Some APIs need to be **secured** (e.g., place orders, update profiles)
- Some APIs might need to be **denied** (e.g., deprecated endpoints)

The methods `permitAll()`, `authenticated()`, and `denyAll()` become powerful when you use them with **`requestMatchers()`** to target specific API paths. That's coming up next!

---

## Disabling CSRF Protection

### 🧠 What Is CSRF?

**CSRF (Cross-Site Request Forgery)** is a type of attack where a malicious website tricks a user's browser into making unwanted requests to your backend.

Spring Security protects against CSRF **by default** for any request that can **modify data**:
- POST → ❌ Blocked by CSRF
- PUT → ❌ Blocked by CSRF
- DELETE → ❌ Blocked by CSRF
- GET → ✅ Allowed (read-only, no data modification)

### 🧪 The Problem

If you set `anyRequest().permitAll()` and try to send a POST request (e.g., to create a contact message), you'll get a **500 Internal Server Error** — not because of authentication, but because of CSRF protection rejecting the request.

### ⚙️ How to Disable CSRF (Temporarily)

```java
.csrf(csrfConfig -> csrfConfig.disable())
```

This is the same pattern as disabling Form Login — provide a lambda expression that calls `disable()`.

The full configuration looks like:

```java
@Bean
SecurityFilterChain customSecurityFilterChain(HttpSecurity http) throws Exception {
    return http
            .authorizeHttpRequests(authorize -> authorize
                    .anyRequest().permitAll()
            )
            .formLogin(flc -> flc.disable())
            .httpBasic(withDefaults())
            .csrf(csrfConfig -> csrfConfig.disable())
            .build();
}
```

After this change, POST requests work fine and return `201 Created`.

⚠️ **Important:** Disabling CSRF completely is **NOT recommended for production**. We'll learn how to handle CSRF properly in future sections.

---

## ✅ Key Takeaways

1. **`permitAll()`** — Allows all requests without any authentication; useful for lower environments or public APIs
2. **`denyAll()`** — Blocks all requests even from authenticated users; rarely used on `anyRequest()`
3. **`authenticated()`** — Requires valid credentials; the most common choice
4. **401 Unauthorized** = "Provide credentials" vs. **403 Forbidden** = "You're authenticated but not authorized"
5. **CSRF protection** blocks POST/PUT/DELETE by default — disable it with `.csrf(csrfConfig -> csrfConfig.disable())` for testing only
6. These methods become truly powerful when used with **`requestMatchers()`** for specific API paths

---

## ⚠️ Common Mistakes

- **Using `anyRequest().permitAll()` or `anyRequest().denyAll()` in production** — these blanket rules are not suitable for real applications
- **Confusing 401 and 403** — 401 means "authenticate yourself", 403 means "you're authenticated but not authorized"
- **Permanently disabling CSRF** — it's fine for development, but production apps need proper CSRF handling
- **Getting 500 instead of 401/403** — this can happen when your global exception handler catches the CSRF exception and returns 500

---

## 💡 Pro Tips

- IntelliJ may suggest replacing `csrfConfig -> csrfConfig.disable()` with a method reference — feel free to keep the lambda syntax if it's more readable to you
- Think of `permitAll()`, `authenticated()`, and `denyAll()` as three levels of a security dial — wide open, verified access, and completely locked
- Always plan to handle CSRF properly before going to production — disabling it is a temporary development convenience
