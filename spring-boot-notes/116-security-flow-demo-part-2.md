# Tracing the Security Path — Internal Flow Demo (Part 2)

## Introduction

In Part 1, we traced the flow from filters to the Authentication Manager to the Authentication Provider. Now we'll go deeper — into the **`DaoAuthenticationProvider`**, the **`UserDetailsService`**, and the **`PasswordEncoder`**. We'll see exactly how user details are loaded from storage, how passwords are compared, and how the successful authentication result is created and stored. We'll also trace the **HTTP Basic** filter to see how it differs.

---

## Inside the DaoAuthenticationProvider

### 🔍 The `authenticate()` Method

When the `ProviderManager` calls `authenticate()` on `DaoAuthenticationProvider`, here's what happens inside:

**Step 1 — Extract the username:**
```java
String username = authentication.getName();  // "madan"
```

**Step 2 — Load user details:**
```java
UserDetails user = retrieveUser(username, authentication);
```

The `retrieveUser()` method is where the bridge to `UserDetailsService` happens.

---

## Inside `retrieveUser()` — The Bridge to UserDetailsService

### ⚙️ What Happens Here?

```java
UserDetails loadedUser = this.getUserDetailsService()
    .loadUserByUsername(username);
```

This single line connects the Authentication Provider to whatever storage system holds your user data.

### 🧠 Which Implementation Is Used?

Since we configured static credentials in `application.properties`, the framework uses **`InMemoryUserDetailsManager`** — it stores user details in a **HashMap** in memory.

If you peek inside `InMemoryUserDetailsManager.loadUserByUsername()`:
```java
public UserDetails loadUserByUsername(String username) {
    UserDetails user = users.get(username.toLowerCase());
    // ... validation ...
    return user;
}
```

It's simply fetching from a HashMap! The key is the username (`madan`), and the value is a `UserDetails` object containing username, password, and roles.

### 📌 The `UserDetails` Interface and `User` Class

- **`UserDetails`** — An interface that represents a user in Spring Security
- **`User`** — The default implementation class
- Any time Spring Security needs to represent a user, it uses a `UserDetails` object

In coming sections, we'll replace `InMemoryUserDetailsManager` with our own implementation that loads users from a database.

---

## The Two Key Interfaces for User Management

| Interface              | Methods                                  | Use Case                           |
|------------------------|------------------------------------------|------------------------------------|
| `UserDetailsService`   | `loadUserByUsername(String username)`     | Only need to *load* users          |
| `UserDetailsManager`   | `createUser()`, `updateUser()`, `deleteUser()`, `changePassword()` + inherited `loadUserByUsername()` | Full user CRUD management |

### ❓ Why Two Interfaces?

Some projects manage user creation/deletion through their own services (outside Spring Security). They only need to *load* users during authentication — so they implement `UserDetailsService`.

Others want Spring Security to handle everything — they implement `UserDetailsManager`.

`UserDetailsManager` **extends** `UserDetailsService`, so it includes `loadUserByUsername()` automatically.

---

## Password Comparison — `additionalAuthenticationChecks()`

### ⚙️ Where Does It Happen?

After loading the user from storage, the `DaoAuthenticationProvider` calls:

```java
additionalAuthenticationChecks(userDetails, authentication);
```

Inside this method:

**Step 1 — Get the password the user just entered:**
```java
String presentedPassword = authentication.getCredentials().toString();
```

**Step 2 — Get the stored password from the database:**
```java
String storedPassword = userDetails.getPassword();
```

**Step 3 — Compare using PasswordEncoder:**
```java
if (!passwordEncoder.matches(presentedPassword, storedPassword)) {
    throw new BadCredentialsException("Bad credentials");
}
```

### 🧠 The PasswordEncoder Interface

```java
public interface PasswordEncoder {
    String encode(CharSequence rawPassword);         // Hash a password for storage
    boolean matches(CharSequence rawPassword, String encodedPassword);  // Compare passwords
}
```

Two critical methods:
- **`encode()`** — Used during registration to hash the password before saving to database
- **`matches()`** — Used during login to compare the entered password with the stored hash

If the passwords **match** → authentication continues
If they **don't match** → `BadCredentialsException` is thrown → 401 error

---

## Creating the Success Authentication

### ⚙️ What Happens After Passwords Match?

The `DaoAuthenticationProvider` calls:

```java
createSuccessAuthentication(principal, authentication, userDetails);
```

Inside this method:
1. Performs housekeeping (stores details in Security Context)
2. Calls `UsernamePasswordAuthenticationToken.authenticated(username, credentials, authorities)`
3. Inside the constructor → **`setAuthenticated(true)`** is called

This is the moment authentication is officially marked as **successful**.

The resulting `Authentication` object (with `authenticated = true`) becomes the **definitive proof** that this user is legitimate. All other components check `isAuthenticated()` to decide whether to allow access.

---

## The Security Context — Remembering the User

After the successful `Authentication` object is created:

1. It's stored in the **Security Context** along with the `JSESSIONID`
2. The `JSESSIONID` cookie is sent to the browser
3. On the next request, the browser sends the cookie back
4. The `AuthorizationFilter` checks the Security Context → finds a match
5. **Skips the entire authentication flow** → forwards directly to the controller

This is why you only log in once, not on every request.

---

## HTTP Basic Flow — The BasicAuthenticationFilter

### 🧠 How Does It Differ?

For HTTP Basic, the filter is **`BasicAuthenticationFilter`** instead of `UsernamePasswordAuthenticationFilter`. Inside its `doFilterInternal()` method:

**Step 1 — Read the `Authorization` header:**
```java
String header = request.getHeader("Authorization");
// Value: "Basic bWFkYW46TWFkYW5AMTIz"
```

**Step 2 — Remove the "Basic " prefix:**
```java
String base64Token = header.substring(6);  // Remove "Basic "
```

**Step 3 — Decode Base64:**
```java
String decoded = new String(Base64.getDecoder().decode(base64Token));
// Result: "madan:Madan@123"
```

**Step 4 — Split by colon:**
```java
String username = decoded.substring(0, colonIndex);  // "madan"
String password = decoded.substring(colonIndex + 1);  // "Madan@123"
```

**Step 5 — Create `UsernamePasswordAuthenticationToken`:**
Same token type as Form Login! From here, the flow is **identical**:
→ `ProviderManager` → `DaoAuthenticationProvider` → `InMemoryUserDetailsManager` → `PasswordEncoder` → Security Context

### 📌 The Key Difference

| Form Login                                | HTTP Basic                          |
|-------------------------------------------|-------------------------------------|
| `UsernamePasswordAuthenticationFilter`     | `BasicAuthenticationFilter`         |
| Credentials from POST form body           | Credentials from `Authorization` header |
| Uses login page                           | No login page (header-based)        |

**After credential extraction, everything is the same.**

---

## ✅ Key Takeaways

1. **`DaoAuthenticationProvider`** calls `retrieveUser()` which delegates to `UserDetailsService.loadUserByUsername()`
2. By default, **`InMemoryUserDetailsManager`** stores users in a HashMap — we'll replace this with database storage later
3. **`UserDetails`** is the interface, **`User`** is the default implementation for representing users
4. Password comparison happens in **`additionalAuthenticationChecks()`** using **`PasswordEncoder.matches()`**
5. Successful auth creates a token with **`setAuthenticated(true)`**, stored in the **Security Context**
6. HTTP Basic uses **`BasicAuthenticationFilter`** to decode credentials from the `Authorization` header — after that, same flow as Form Login
7. The `JSESSIONID` cookie prevents re-authentication on every request

---

## ⚠️ Common Mistakes

- **Not understanding that this flow applies to both Form Login AND HTTP Basic** — only the credential extraction differs
- **Thinking `InMemoryUserDetailsManager` is production-ready** — it's only for demos; production apps use database-backed implementations
- **Ignoring PasswordEncoder** — always hash passwords; never store plain text

---

## 💡 Pro Tips

- Debug these framework classes yourself! Set breakpoints in `DaoAuthenticationProvider.authenticate()`, `InMemoryUserDetailsManager.loadUserByUsername()`, and `BasicAuthenticationFilter.doFilterInternal()` to watch the flow live
- Understanding this flow is **essential** for the next sections — we'll write our own `UserDetailsService` to load from a database, and our own `PasswordEncoder` configuration
- In interviews, being able to explain this flow (Filters → Manager → Provider → UserDetailsService → PasswordEncoder → SecurityContext) shows deep Spring Security knowledge
