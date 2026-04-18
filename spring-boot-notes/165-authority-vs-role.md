# Authority vs Role — Which One Should You Use?

## Introduction

In Spring Security, you'll hear two terms thrown around: **Authority** and **Role**. Both can implement authorization, but they serve different purposes and operate at different granularity levels. Choosing the right one depends on your application's complexity. Let's understand the difference clearly.

---

## What Is an Authority?

### 🧠 Fine-Grained Access Control

An authority represents a **single, specific action** that a user can perform. It controls access at a very detailed level.

```
VIEWJOB, ADDJOB, DELETEJOB, ADDCOMPANY, EDITPROFILE
```

Each possible action in your application becomes its own authority. When you use authority-based authorization, you're saying: *"Only users who have the `DELETEJOB` authority can invoke this delete endpoint."*

**When to use:** When you need precise control over individual actions — especially in complex enterprise systems where different users have highly customized permission sets.

**Downside:** If your application has hundreds or thousands of possible actions, maintaining all those authority mappings becomes a nightmare.

---

## What Is a Role?

### 🧠 Coarse-Grained Access Control

A role is a **group of privileges**. Instead of listing every individual action, you assign a role that implicitly grants a set of actions.

```
ROLE_ADMIN   → Can do everything (add, delete, view, manage)
ROLE_EMPLOYER → Can add jobs, view applicants
ROLE_JOBSEEKER → Can view jobs, apply to jobs
```

With role-based authorization, you're saying: *"Only users with the `ADMIN` role can access this endpoint."* You don't specify *which* exact actions — if they have the role, they're in.

**When to use:** When you can logically group users into categories with shared permissions. This is the most common approach.

---

## The Key Difference

| Aspect | Authority | Role |
|---|---|---|
| Granularity | Fine-grained (individual actions) | Coarse-grained (group of actions) |
| Example | `VIEWJOB`, `DELETEJOB` | `ROLE_ADMIN`, `ROLE_EMPLOYER` |
| Use case | Complex permission systems | Standard user-type systems |
| Maintenance | High (many authorities) | Low (few roles) |

Both are represented by the **same interface** — `GrantedAuthority`. At the end of the day, both are just strings. So how does Spring Security tell them apart?

---

## The ROLE_ Prefix Convention

Since both authorities and roles use `GrantedAuthority`, Spring Security uses a **naming convention** to distinguish them:

- **Roles** must start with `ROLE_` prefix: `ROLE_ADMIN`, `ROLE_USER`
- **Authorities** do NOT have this prefix: `VIEWJOB`, `DELETEJOB`

This is the default prefix. If you want to customize it:

```java
@Bean
static GrantedAuthorityDefaults grantedAuthorityDefaults() {
    return new GrantedAuthorityDefaults("MYPREFIX_");
}
```

⚠️ Note the `static` keyword — this ensures Spring publishes these configurations before initializing security beans.

💡 **Pro Tip:** Stick with the default `ROLE_` prefix unless you have a very specific reason to change it.

---

## Methods for Authority-Based Authorization

When using authorities, you have these methods available in your security configuration:

### `hasAuthority(String authority)`

Requires the user to have an **exact** authority:

```java
.requestMatchers("/api/jobs/delete").hasAuthority("DELETEJOB")
```

### `hasAnyAuthority(String... authorities)`

User needs **at least one** of the listed authorities:

```java
.requestMatchers("/api/jobs").hasAnyAuthority("VIEWJOB", "MANAGEJOB")
```

### `hasAllAuthorities(String... authorities)`

User must have **every single** authority listed (useful for users with multiple authorities):

```java
.requestMatchers("/api/admin").hasAllAuthorities("VIEWJOB", "DELETEJOB", "MANAGEJOB")
```

### `access()` — For Complex Requirements

Accepts a Spring Expression Language (SpEL) expression for advanced scenarios:

```java
// Ensure user can only access their own profile
.requestMatchers("/profiles/{name}")
    .access(new WebExpressionAuthorizationManager("#name == authentication.name"))

// Require multiple authorities using allOf()
.requestMatchers("/api/admin/**")
    .access(allOf(hasAuthority("ADMIN"), hasAuthority("MANAGER")))
```

---

## Methods for Role-Based Authorization

Very similar methods, but with one important difference — **don't include the `ROLE_` prefix**:

### `hasRole(String role)`

```java
.requestMatchers("/api/admin/**").hasRole("ADMIN")
// Behind the scenes, checks for "ROLE_ADMIN" in the user's authorities
```

### `hasAnyRole(String... roles)`

```java
.requestMatchers("/api/jobs").hasAnyRole("ADMIN", "EMPLOYER")
```

### `hasAllRoles(String... roles)` and `access()`

Work the same way as their authority counterparts.

### ⚠️ Critical Point

When you call `hasRole("ADMIN")`, Spring Security **automatically prepends** `ROLE_` to make it `ROLE_ADMIN`. So:

- ✅ In your database: `ROLE_ADMIN`
- ✅ In `hasRole()`: `"ADMIN"` (no prefix)
- ❌ In `hasRole()`: `"ROLE_ADMIN"` (wrong — would check for `ROLE_ROLE_ADMIN`)

---

## ✅ Key Takeaways

- **Authority** = individual action (fine-grained) → `DELETEJOB`, `VIEWJOB`
- **Role** = group of actions (coarse-grained) → `ROLE_ADMIN`, `ROLE_USER`
- Both use `GrantedAuthority` internally — they're just strings
- The `ROLE_` prefix is the convention that distinguishes roles from authorities
- When using `hasRole()`, do NOT include the `ROLE_` prefix — Spring adds it automatically
- When using `hasAuthority()`, pass the exact string stored in your database
- For most applications, **role-based authorization** is simpler and sufficient

## 💡 Pro Tip

> Roles are for **who you are** (admin, user, manager). Authorities are for **what you can do** (delete, view, edit). If your app has clear user categories, go with roles. If you need per-action control, use authorities.
