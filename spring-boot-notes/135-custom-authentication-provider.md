# Understanding Authentication Flow & Creating a Custom AuthenticationProvider

## Introduction

So far, our login has relied on Spring Security's default `DaoAuthenticationProvider` with `InMemoryUserDetailsManager`. But now we want to authenticate users against our **database**. Even more importantly, we want **full control** over the authentication logic — not just username/password matching, but the ability to add custom rules.

In this lesson, we build our own **custom `AuthenticationProvider`** from scratch.

---

## The Default Authentication Flow (Recap)

```
User enters credentials
    ↓
AuthenticationManager (ProviderManager)
    ↓
DaoAuthenticationProvider (default)
    ↓
UserDetailsService.loadUserByUsername()
    ↓
Returns UserDetails object
    ↓
PasswordEncoder.matches() — compares passwords
    ↓
Authentication result (success/failure)
```

This works fine for simple cases. But what if you need:
- Block users who've failed login **3 times consecutively**?
- Restrict logins from **certain countries**?
- Support **multiple authentication styles** (password, OTP, security key)?

The default provider can't handle any of these. You need your own.

---

## Two Approaches to Database Authentication

### Approach 1: Custom UserDetailsService (Basic)

Override `loadUserByUsername()` — query your database, return a `UserDetails` object, and let the default `DaoAuthenticationProvider` handle password comparison.

**Downside:** Limited flexibility. You're still constrained by the default provider's logic.

### Approach 2: Custom AuthenticationProvider (Recommended)

Build your own `AuthenticationProvider` that handles the **entire authentication** — loading user data, comparing passwords, building the authentication result.

**Advantage:** Complete control. You can add any custom logic you want.

> We're going with Approach 2.

---

## Building the Custom AuthenticationProvider

### ⚙️ The Class Structure

```java
@Component
@RequiredArgsConstructor
public class JobPortalUsernamePasswordAuthenticationProvider 
        implements AuthenticationProvider {

    private final JobPortalUserRepository jobPortalUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Authentication authenticate(Authentication authentication) {
        // Our custom logic here
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class
                .isAssignableFrom(authentication);
    }
}
```

### 🔍 Understanding the Two Methods

#### `supports()` — What Authentication Style Do You Handle?

```java
@Override
public boolean supports(Class<?> authentication) {
    return UsernamePasswordAuthenticationToken.class
            .isAssignableFrom(authentication);
}
```

This tells the `ProviderManager`: "I handle username/password authentication." If you had an OTP provider, that provider's `supports()` would check for an OTP token type instead.

#### `authenticate()` — The Actual Logic

This is where all the magic happens:

```java
@Override
public Authentication authenticate(Authentication authentication) {
    String username = authentication.getName();
    String password = authentication.getCredentials().toString();

    // 1. Load user from database
    JobPortalUser user = jobPortalUserRepository
        .findJobPortalUserByEmail(username)
        .orElseThrow(() -> new UsernameNotFoundException(
            "User not found: " + username));

    // 2. Build authorities from role
    List<SimpleGrantedAuthority> authorities = List.of(
        new SimpleGrantedAuthority(user.getRole().getName())
    );

    // 3. Verify password
    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
        throw new BadCredentialsException("Invalid credentials");
    }

    // 4. Return authenticated token
    return new UsernamePasswordAuthenticationToken(
        user,           // principal — the full entity
        null,           // credentials — null for security
        authorities     // granted authorities
    );
}
```

### Step-by-Step Breakdown

#### Step 1: Extract Credentials

```java
String username = authentication.getName();
String password = authentication.getCredentials().toString();
```

The `Authentication` object passed by `ProviderManager` contains whatever the user entered in the login form.

#### Step 2: Load User from Database

```java
JobPortalUser user = jobPortalUserRepository
    .findJobPortalUserByEmail(username)
    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
```

We query the database directly using a derived query method — no `UserDetailsService` layer needed.

The derived query method in the repository:

```java
Optional<JobPortalUser> findJobPortalUserByEmail(String email);
```

#### Step 3: Convert Roles to Spring Security Format

```java
List<SimpleGrantedAuthority> authorities = List.of(
    new SimpleGrantedAuthority(user.getRole().getName())
);
```

Spring Security represents authorities as `GrantedAuthority` objects. Since each user has one role (like `ROLE_JOB_SEEKER`), we create a single-element list. For multi-role systems, you'd add multiple entries.

#### Step 4: Verify Password

```java
if (!passwordEncoder.matches(password, user.getPasswordHash())) {
    throw new BadCredentialsException("Invalid credentials");
}
```

`passwordEncoder.matches()` takes the **plain text** password and the **stored hash**, and checks if they match. Never compare passwords directly.

#### Step 5: Return Authenticated Token

```java
return new UsernamePasswordAuthenticationToken(user, null, authorities);
```

| Parameter     | Value       | Why                                                 |
|--------------|-------------|-----------------------------------------------------|
| `principal`  | `user`      | The full entity — accessible later via `getPrincipal()` |
| `credentials`| `null`      | Security best practice — don't keep passwords around |
| `authorities`| `authorities`| The user's roles/permissions                        |

The 3-argument constructor **automatically sets `authenticated = true`** internally.

---

## Why Store the Full Entity as Principal?

By default, Spring Security stores a `UserDetails` object as the principal. We're storing our **entire `JobPortalUser` entity** instead. This means anywhere in the application, we can do:

```java
JobPortalUser user = (JobPortalUser) authentication.getPrincipal();
String email = user.getEmail();
String role = user.getRole().getName();
```

No need for extra database queries to get user details after login.

---

## ✅ Key Takeaways

- A custom `AuthenticationProvider` gives you **complete control** over authentication logic.
- Implement two methods: `supports()` (what auth type you handle) and `authenticate()` (the actual logic).
- Query the database directly from the provider — no `UserDetailsService` needed.
- Store the full entity as the principal for easy access throughout the application.
- Always pass `null` for credentials in the returned token — security best practice.
- The 3-argument `UsernamePasswordAuthenticationToken` constructor auto-sets `authenticated = true`.

## ⚠️ Common Mistakes

- **Forgetting `@Component`** — the provider won't be detected by Spring without it.
- **Not implementing `supports()`** — the `ProviderManager` won't know which provider to use.
- **Comparing passwords as plain strings** — always use `passwordEncoder.matches()`.
- **Keeping credentials in the returned token** — pass `null` to avoid security leaks.

## 💡 Pro Tips

- You can have **multiple `AuthenticationProvider`** implementations — one for passwords, one for OTP, one for biometrics. The `ProviderManager` iterates through all and finds the right one using `supports()`.
- This pattern scales beautifully in enterprise applications where authentication requirements evolve over time.
- Add custom logic like account lockout, IP-based restrictions, or 2FA checks right inside `authenticate()`.
