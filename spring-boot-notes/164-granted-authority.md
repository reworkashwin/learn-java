# How Spring Security Stores Authorities — GrantedAuthority

## Introduction

We've established that authorization needs roles/privileges. But *how* does Spring Security actually store and manage these authority details internally? It doesn't just keep them as plain strings — there's a well-defined contract behind it. Understanding this internal mechanism is crucial before you start configuring authorization rules.

---

## The GrantedAuthority Interface

### 🧠 What Is It?

`GrantedAuthority` is an **interface** in Spring Security that represents the authority (role/privilege) of a logged-in user. It has a single abstract method:

```java
public interface GrantedAuthority {
    String getAuthority();
}
```

That's it — just one method that returns the authority name as a `String`. Simple, but powerful.

### The Implementation — SimpleGrantedAuthority

The most commonly used implementation is `SimpleGrantedAuthority`:

```java
SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_ADMIN");

// Later, to read the authority:
String role = authority.getAuthority(); // Returns "ROLE_ADMIN"
```

This class:
- Accepts the authority name through its constructor
- Stores it internally
- Returns it when `getAuthority()` is called

---

## How Authorities Are Set During Login

Let's trace the exact flow inside our job portal application:

### Step 1 — Load User from Database

Inside `JobPortalUsernamePasswordAuthenticationProvider`, the `authenticate()` method first loads the user:

```java
JobPortalUser jobPortalUser = userRepository.findByEmail(username);
```

This entity object contains all user details **including the role** (fetched via the relationship mapping).

### Step 2 — Convert Role to GrantedAuthority

```java
String roleName = jobPortalUser.getRole().getName(); // e.g., "ROLE_ADMIN"

SimpleGrantedAuthority authority = new SimpleGrantedAuthority(roleName);

List<GrantedAuthority> authorities = List.of(authority);
```

Why the conversion? Because Spring Security **only understands** authorities in the form of `GrantedAuthority` objects — not plain strings.

### Step 3 — Pass Authorities to the Authentication Object

```java
return new UsernamePasswordAuthenticationToken(jobPortalUser, null, authorities);
```

The authorities are the **third parameter** in this constructor. Internally, the super constructor stores them as an **unmodifiable list** — meaning once the authentication object is created, nobody can tamper with the roles. This is an intentional security design.

---

## How Authorities Travel with JWT

After login, the user gets a JWT token. But what happens for subsequent requests?

### During JWT Creation (Login Response)

```java
// In JwtUtil — roles are embedded in the JWT
String authorities = authentication.getAuthorities()
    .stream()
    .map(GrantedAuthority::getAuthority)
    .collect(Collectors.joining(","));
```

All roles are joined into a comma-separated string and stored in the JWT claims.

### During JWT Validation (Subsequent Requests)

When a subsequent request comes in with a JWT token, the `JWTTokenValidationFilter` extracts the roles:

```java
String rolesString = claims.get("authorities"); // e.g., "ROLE_ADMIN,ROLE_USER"

List<GrantedAuthority> authorities = AuthorityUtils
    .commaSeparatedStringToAuthorityList(rolesString);
```

The `AuthorityUtils` helper method converts the comma-separated string back into a list of `GrantedAuthority` objects. These are then passed to the `Authentication` object again:

```java
new UsernamePasswordAuthenticationToken(username, null, authorities);
```

So for every single request, Spring Security knows the user's authorities — whether it's the initial login or a subsequent JWT-based request.

---

## What About Multiple Roles?

Our application uses a **single role per user** (`@ManyToOne` mapping). But in enterprise apps, a user might have multiple roles (admin + manager, etc.).

To support multiple roles:

1. Change the entity mapping from `@ManyToOne` to `@OneToMany`
2. Create a join table (`user_roles`) with `user_id` and `role_id` columns
3. Iterate over all roles and create a `SimpleGrantedAuthority` for each:

```java
List<GrantedAuthority> authorities = user.getRoles().stream()
    .map(role -> new SimpleGrantedAuthority(role.getName()))
    .collect(Collectors.toList());
```

---

## ✅ Key Takeaways

- `GrantedAuthority` is the interface Spring Security uses to represent user authorities/roles
- `SimpleGrantedAuthority` is the most common implementation — wraps a role name string
- During login, roles are loaded from DB, converted to `GrantedAuthority`, and stored in the `Authentication` object
- Authorities are stored as an **unmodifiable list** for security reasons
- Roles travel in the JWT token as comma-separated strings and are reconstructed on each request
- Spring Security won't enforce any authorization **unless you explicitly configure it** — that's the next step

## ⚠️ Common Mistake

> Don't forget to pass the authorities as the **third parameter** of `UsernamePasswordAuthenticationToken`. If you use the two-argument constructor, Spring Security won't have any role information, and all authorization checks will fail.
