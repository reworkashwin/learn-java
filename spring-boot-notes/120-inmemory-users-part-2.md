# Creating Users Using InMemoryUserDetailsManager — Part 2 (Testing & Debugging)

## Introduction

We've created multiple users with hashed passwords using `InMemoryUserDetailsManager`. Now it's time to **test everything** and **debug the authentication flow** step by step to see exactly how Spring Security verifies credentials behind the scenes.

---

## Concept 1: Setting Up the Test Scenario

### ⚙️ Prerequisites

Before testing, ensure:
1. At least one REST API is marked as **secured** (not public)
2. The `PasswordEncoder` bean is configured (BCryptPasswordEncoder)
3. The `InMemoryUserDetailsManager` bean has users configured

The instructor moves the companies-related REST API path to the **secured paths** list, so authentication is required to access it.

---

## Concept 2: Debugging the Authentication Flow — Step by Step

### 🧠 What are we looking at?

We're placing breakpoints in the `DaoAuthenticationProvider` to trace the exact authentication flow:

1. **`retrieveUser()`** — fetches user details from the storage
2. **`additionalAuthenticationChecks()`** — compares passwords

### ⚙️ The Flow When You Send a Request

When you invoke a secured API from Postman with Basic Auth credentials (`madan` / `Madan@123`):

```
Request → BasicAuthenticationFilter → ProviderManager → DaoAuthenticationProvider
```

Inside `DaoAuthenticationProvider`:
1. **`authenticate()`** is called
2. **`retrieveUser()`** is called — this invokes `loadUserByUsername()`
3. Once user details are fetched, **`additionalAuthenticationChecks()`** compares passwords

---

## Concept 3: Inside retrieveUser() — How Users Are Fetched

### ⚙️ What happens?

`retrieveUser()` calls `loadUserByUsername()` on your `InMemoryUserDetailsManager`.

If you open `InMemoryUserDetailsManager` and look at the `loadUserByUsername()` method, here's what it does:

1. It maintains a **HashMap** of users internally
2. When called with username `"madan"`, it calls `users.get("madan")`
3. Returns the matching `UserDetails` object

### 🧪 Debugging the HashMap

When you inspect the `users` HashMap in the debugger:

```
users = {
    "madan" → UserDetails(username=madan, password=$2a$10$..., authorities=[ROLE_USER]),
    "admin" → UserDetails(username=admin, password=$2a$10$..., authorities=[ROLE_ADMIN])
}
```

Notice:
- Passwords are stored as **hash values** — nobody can read the original password
- Authorities are stored alongside user details
- The HashMap uses the **username** as the key for O(1) lookup

---

## Concept 4: Inside additionalAuthenticationChecks() — Password Comparison

### ⚙️ What happens?

This method performs the actual password verification:

1. **Null check** — verifies `authentication.getCredentials()` is not null
2. **Extract presented password** — reads the password entered by the user
3. **Invoke `matches()`** — calls `BCryptPasswordEncoder.matches(presentedPassword, storedHashedPassword)`

### 🧪 Inside BCryptPasswordEncoder.matches()

```java
// presentedPassword = "Madan@123" (what the user typed)
// storedPassword = "$2a$10$xyz...abc..." (what's in the HashMap)

boolean result = BCrypt.checkpassword(presentedPassword, storedPassword);
```

The `checkpassword()` method:
1. Extracts the salt from the stored hash value
2. Re-hashes the presented password with the same salt
3. Compares the result with the stored hash
4. Returns `true` if they match, `false` otherwise

If `true` → request is forwarded to the controller layer → successful response.

---

## Concept 5: Testing with Multiple Users

### 🧪 Test Case 1: User "madan"

```
Username: madan
Password: Madan@123
Result: ✅ 200 OK — Successful response
```

### 🧪 Test Case 2: User "admin"

```
Username: admin
Password: admin@123
Result: ✅ 200 OK — Successful response
```

Both users authenticate successfully through the same flow. The framework automatically handles looking up the correct user, extracting the salt, and verifying the password.

---

## Concept 6: Understanding Authorities and Roles

### 🧠 What did we see in the debugger?

When inspecting the user object after retrieval:

```
username: "madan"
password: "$2a$10$..."
authorities: [SimpleGrantedAuthority("ROLE_USER")]
```

Notice that when we set `.roles("USER")`, Spring Security automatically prefixes it with `ROLE_`. So `"USER"` becomes `"ROLE_USER"`.

### 💡 Insight

> Authorities and roles are explored in detail in upcoming sections. For now, just know that when you set `.roles("USER")`, the framework stores it as `ROLE_USER` internally.

---

## Concept 7: Why Hash Values Differ — The Salt Factor

### ❓ A common confusion

"I used the same password as the instructor, but my hash value is different. Is something wrong?"

**Nothing is wrong!** BCrypt generates a **random salt** each time. So even for the same plain text input:

```
Run 1: encode("Madan@123") → $2a$10$abc...
Run 2: encode("Madan@123") → $2a$10$xyz...  ← Different!
```

Both hash values are valid for the password `Madan@123`. The `matches()` method handles this correctly by extracting the specific salt from each hash value.

---

## ✅ Key Takeaways

1. `InMemoryUserDetailsManager` stores users in a **HashMap** with username as the key
2. `retrieveUser()` calls `loadUserByUsername()` → simple HashMap lookup
3. `additionalAuthenticationChecks()` calls `BCryptPasswordEncoder.matches()` to verify passwords
4. The **salt is embedded** within the stored hash — no separate salt storage needed
5. Same password produces **different hash values** each time due to random salt generation
6. After successful authentication, Spring Security **erases credentials** from the request for security reasons

---

## ⚠️ Common Mistakes

1. **Expecting the same hash value for the same password** — BCrypt generates a different hash each time (different salt)
2. **Thinking the hash mismatch means an error** — the `matches()` method handles different salts correctly
3. **Forgetting that credentials are erased after authentication** — you won't find the password in the `Authentication` object after login

---

## 💡 Pro Tips

- Use your IDE's debugger to trace through the authentication flow — it's the best way to understand Spring Security internals
- The authentication flow is always: `Filter → ProviderManager → AuthenticationProvider → UserDetailsService → PasswordEncoder`
- Once you understand this flow with `InMemoryUserDetailsManager`, the same flow applies when you switch to database-backed user storage
