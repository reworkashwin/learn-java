# Replacing In-Memory Login with Database Authentication

## Introduction

We've built a custom `AuthenticationProvider` — now it's time to **plug it in** and replace the old in-memory authentication. This lecture connects all the pieces: wiring the provider into the `ProviderManager`, updating the login API to extract user details from the database, and enriching the JWT token with real user data.

---

## Wiring the AuthenticationProvider into SecurityConfig

### 🧠 What Needs to Change?

Previously, our `SecurityConfig` created an `InMemoryUserDetailsManager` and a `DaoAuthenticationProvider`. Now we replace all of that with our custom provider.

### ⚙️ Before (In-Memory)

```java
@Bean
public InMemoryUserDetailsManager userDetailsManager() {
    UserDetails user = User.withUsername("john")
        .password(passwordEncoder.encode("test123"))
        .roles("USER")
        .build();
    return new InMemoryUserDetailsManager(user);
}
```

### ⚙️ After (Database)

```java
@Configuration
public class JobPortalSecurityConfig {

    private final AuthenticationProvider authenticationProvider;

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationProvider authenticationProvider) {
        return new ProviderManager(authenticationProvider);
    }
}
```

### 🔍 What Changed?

1. **Removed** all `InMemoryUserDetailsManager` and `DaoAuthenticationProvider` code.
2. **Injected** our custom `AuthenticationProvider` (via constructor injection — `@Component` on the provider makes it a Spring bean).
3. **Passed** it to the `ProviderManager`.

The `ProviderManager` accepts any `AuthenticationProvider`. Since we only have one, we pass it directly. If you had multiple providers (password, OTP, biometric), you'd pass all of them.

---

## How ProviderManager Selects the Right Provider

When `ProviderManager.authenticate()` is called, it:

1. **Iterates** through all registered `AuthenticationProvider` beans.
2. Calls `supports()` on each one.
3. The first provider that returns `true` handles the authentication.
4. Others are skipped.

This is powerful for multi-style authentication systems.

---

## Updating the Login API

### 🧠 What Changes in the Controller?

After authentication succeeds, we need to:
1. Extract the **principal** (which is now our `JobPortalUser` entity, not Spring's `User`).
2. Build the JWT with **real user data** (name, email, mobile number, role).
3. Return rich user details in the response.

### ⚙️ Updated JWT Token Generation

```java
private String generateJwToken(Authentication authentication) {
    JobPortalUser user = (JobPortalUser) authentication.getPrincipal();
    
    return Jwts.builder()
        .claim("name", user.getName())
        .claim("email", user.getEmail())
        .claim("mobileNumber", user.getMobileNumber())
        // ... other JWT configurations
        .compact();
}
```

Previously, we cast to `User` (Spring Security's class). Now we cast to `JobPortalUser` because that's what we stored as the principal in our custom provider.

### ⚙️ Enriching the Login Response

```java
@PostMapping("/login/public/v1.0")
public ResponseEntity<UserDto> login(@RequestBody LoginRequestDto loginDto) {
    // ... authentication logic ...
    
    JobPortalUser loggedInUser = (JobPortalUser) result.getPrincipal();
    
    UserDto userDto = new UserDto();
    BeanUtils.copyProperties(loggedInUser, userDto);
    userDto.setRole(loggedInUser.getRole().getName());
    userDto.setUserId(loggedInUser.getId());
    
    return ResponseEntity.ok(userDto);
}
```

### 🔍 Why Manual Role Mapping?

```java
userDto.setRole(loggedInUser.getRole().getName());
```

The role in the entity is an **object** (`Role`), but the DTO expects a **String** (the role name). `BeanUtils.copyProperties()` can't auto-convert between these types, so we extract the name manually.

---

## Testing the Complete Flow

### Test 1: Invalid Credentials

```
POST /api/login/public/v1.0
Body: { "username": "invalid@test.com", "password": "wrong" }
Response: 401 — Authentication failed
```

### Test 2: Valid Job Seeker

```
POST /api/login/public/v1.0
Body: { "username": "john@gmail.com", "password": "EazyBytes@1803" }
Response: 200 OK
{
    "userId": 3,
    "name": "John Doe",
    "email": "john@gmail.com",
    "mobileNumber": "1234567890",
    "role": "ROLE_JOB_SEEKER",
    "jwtToken": "eyJhbGci..."
}
```

### Test 3: Employer & Admin

Both Sanjana (employer) and Admin return correct role names and user details — confirming the database authentication works for all user types.

---

## The Complete Authentication Architecture

```
Client sends login request
    ↓
AuthController.login()
    ↓
AuthenticationManager.authenticate()
    ↓
ProviderManager iterates providers
    ↓
JobPortalUsernamePasswordAuthenticationProvider
    → supports() returns true for UsernamePasswordAuthenticationToken
    → authenticate():
        1. Extract username/password from request
        2. Query database by email
        3. Build authorities from role
        4. Compare passwords via PasswordEncoder
        5. Return authenticated token with JobPortalUser as principal
    ↓
AuthController receives Authentication result
    → Generate JWT token with user claims
    → Build UserDto response
    → Return to client
```

---

## ✅ Key Takeaways

- Remove **all in-memory** configurations when switching to database auth.
- Pass your custom `AuthenticationProvider` to the `ProviderManager`.
- Cast `getPrincipal()` to `JobPortalUser` (not `User`) since that's what the custom provider stores.
- Enrich the JWT token with real data: name, email, mobile number, role.
- `BeanUtils.copyProperties()` handles matching fields; map complex types (like Role objects) manually.

## ⚠️ Common Mistakes

- **Forgetting to remove in-memory code** — leads to confusing behavior with two auth sources.
- **Casting to the wrong principal type** — `ClassCastException` at runtime if you cast to `User` instead of `JobPortalUser`.
- **Not sending user details in the response** — the frontend needs role information for conditional rendering.

## 💡 Pro Tips

- Store as much useful info as possible in JWT claims — it saves round trips to the database.
- The principal stored in the `Authentication` object is accessible throughout the request lifecycle via `SecurityContextHolder`.
- When supporting multiple authentication styles, each provider handles one style and the `ProviderManager` routes automatically.
