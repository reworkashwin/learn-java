# Invoking the Spring Security Authentication Flow Manually — Part 2

## Introduction

We've built a public login REST API, but it currently returns success for every request — even with wrong credentials. Now it's time to **actually trigger Spring Security's authentication flow from our code**, handle success and failure, and prepare for JWT token generation.

---

## Concept 1: Creating the AuthenticationManager Bean

### 🧠 What is it?

To manually trigger authentication, you need an `AuthenticationManager` bean. This is the same component Spring Security uses internally during automatic authentication.

### ⚙️ How to create it

```java
@Bean
public AuthenticationManager authenticationManager() {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService());
    provider.setPasswordEncoder(passwordEncoder());
    return new ProviderManager(provider);
}
```

Let's break this down:

1. **`DaoAuthenticationProvider`** — the authentication provider that uses a `UserDetailsService` to fetch users and a `PasswordEncoder` to verify passwords
2. **`setPasswordEncoder(passwordEncoder())`** — tells the provider to use BCrypt for password comparison
3. **Constructor takes `userDetailsService()`** — tells the provider where to fetch user details (InMemoryUserDetailsManager)
4. **`ProviderManager`** — wraps the authentication provider and acts as the `AuthenticationManager`

### ❓ Why not just create an empty AuthenticationManager?

Because the `AuthenticationManager` needs to know:
- **WHERE** to find users → `UserDetailsService`
- **HOW** to verify passwords → `PasswordEncoder`
- **WHICH** authentication provider to use → `DaoAuthenticationProvider`

Without these, it can't authenticate anyone.

### 💡 Insight

> You're essentially wiring together the same components that Spring Security uses internally, but now you control when authentication happens.

---

## Concept 2: Triggering Authentication from the Controller

### ⚙️ Inject the AuthenticationManager

```java
@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    
    // ...
}
```

### ⚙️ Call authenticate()

```java
Authentication resultAuthentication = authenticationManager.authenticate(
    new UsernamePasswordAuthenticationToken(dto.username(), dto.password())
);
```

Here's what's happening:

1. **Create a `UsernamePasswordAuthenticationToken`** — wraps the username and password from the login request
2. **Call `authenticationManager.authenticate()`** — triggers the full Spring Security authentication flow
3. **If successful** — returns an `Authentication` object with user details and `authenticated = true`
4. **If failed** — throws an exception (we need to catch it!)

### 🧪 What's inside the result?

After successful authentication:
```
resultAuthentication:
  ├── authenticated: true
  ├── principal: User(username=madan, authorities=[ROLE_USER])
  └── credentials: null  ← erased for security!
```

Notice that credentials are **erased** after authentication — Spring Security does this intentionally so passwords don't linger in memory.

---

## Concept 3: Handling Authentication Failures

### 🧠 Why is this important?

If the credentials are wrong, `authenticationManager.authenticate()` throws an exception. We need to catch it and send a proper error response.

### ⚙️ Exception Handling in the Controller

```java
@PostMapping("login/public")
public ResponseEntity<LoginResponseDto> apiLogin(@RequestBody LoginRequestDto dto) {
    try {
        Authentication resultAuthentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(dto.username(), dto.password())
        );
        
        // Success — return OK response with user details
        LoginResponseDto response = new LoginResponseDto(
            HttpStatus.OK.getReasonPhrase(),
            new UserDto(),
            null // JWT token — coming soon
        );
        return ResponseEntity.ok(response);
        
    } catch (BadCredentialsException e) {
        return buildErrorResponse("Invalid username or password", HttpStatus.UNAUTHORIZED);
    } catch (AuthenticationException e) {
        return buildErrorResponse("Authentication failed", HttpStatus.UNAUTHORIZED);
    } catch (Exception e) {
        return buildErrorResponse("Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

### 🧪 The buildErrorResponse() helper

```java
private ResponseEntity<LoginResponseDto> buildErrorResponse(String message, HttpStatus status) {
    LoginResponseDto response = new LoginResponseDto(message, null, null);
    return ResponseEntity.status(status).body(response);
}
```

### ❓ Why not use the Global Exception Handler?

The login logic exists in **only one method**. Security-related exceptions (`BadCredentialsException`, `AuthenticationException`) are specific to this login flow and won't occur in other controllers. Handling them locally keeps things simple and focused.

Global exception handlers are best for exceptions that can occur across **multiple controllers**.

---

## Concept 4: Testing — Success and Failure Scenarios

### 🧪 Test 1: Invalid Credentials

```
POST /api/auth/login/public
Body: { "username": "madan", "password": "wrongpass" }

Result: 401 Unauthorized
{
    "message": "Invalid username or password",
    "user": null,
    "jwtToken": null
}
```

What happens internally:
1. `authenticate()` is called
2. User "madan" is found in InMemoryUserDetailsManager
3. BCrypt `matches()` fails (wrong password)
4. `BadCredentialsException` is thrown
5. Caught by our catch block → 401 response

### 🧪 Test 2: Valid Credentials

```
POST /api/auth/login/public
Body: { "username": "madan", "password": "Madan@123" }

Result: 200 OK
{
    "message": "OK",
    "user": { ... },
    "jwtToken": null
}
```

What happens internally:
1. `authenticate()` is called
2. User "madan" is found
3. BCrypt `matches()` succeeds
4. `Authentication` object returned with `authenticated: true`
5. Success response sent

### 🧪 Inspecting the Authentication object (Debug)

```
resultAuthentication:
  ├── authenticated: true
  ├── principal:
  │     ├── username: "madan"
  │     └── authorities: [ROLE_USER]
  └── credentials: null (erased)
```

---

## Concept 5: What's Next — JWT Token Generation

### 🧠 Current state

Right now, the login API works — it correctly authenticates users and returns success/failure. But the `jwtToken` field is still `null`.

### 🧠 What's missing?

After successful authentication, we need to:
1. **Generate a JWT token** containing user information (username, roles, expiration)
2. **Send the token** in the login response
3. **Build a filter** to validate the token for subsequent requests

The next lectures dive deep into JWT tokens.

---

## ✅ Key Takeaways

1. To trigger authentication manually, create an `AuthenticationManager` bean with `ProviderManager`, `DaoAuthenticationProvider`, `UserDetailsService`, and `PasswordEncoder`
2. Call `authenticationManager.authenticate()` with a `UsernamePasswordAuthenticationToken`
3. On success, you get an `Authentication` object with `authenticated: true` and user details
4. On failure, the framework throws `BadCredentialsException` or `AuthenticationException`
5. Credentials are **erased** from the `Authentication` object after successful login (security feature)
6. Handle security exceptions in the controller for login-specific error responses

---

## ⚠️ Common Mistakes

1. **Forgetting to create the AuthenticationManager bean** — you can't manually trigger authentication without it
2. **Not providing UserDetailsService and PasswordEncoder to the DaoAuthenticationProvider** — the provider won't know how to fetch users or verify passwords
3. **Not catching exceptions from `authenticate()`** — unhandled exceptions will return a 500 error instead of a proper 401
4. **Trying to read the password from `Authentication` after login** — credentials are erased for security

---

## 💡 Pro Tips

- The same `AuthenticationManager` flow works identically whether you use InMemoryUserDetailsManager or a database-backed implementation
- The `UsernamePasswordAuthenticationToken` is just one type of authentication token — Spring Security supports custom token types too
- Always version your APIs (`/v1.0/`) from the start — it makes future API evolution much easier
