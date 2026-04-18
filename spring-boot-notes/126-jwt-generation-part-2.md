# Generating JWT Token in Backend App — Part 2 (Integration & Testing)

## Introduction

We've built the `JwtUtil` class that generates JWT tokens. Now let's integrate it into the login REST API, test the complete flow, and inspect what our generated JWT token actually contains.

---

## Concept 1: Integrating JwtUtil into the AuthController

### ⚙️ The Changes

The integration is straightforward — just two modifications to `AuthController`:

```java
@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;  // ← Inject JwtUtil
    
    @PostMapping("login/public")
    public ResponseEntity<LoginResponseDto> apiLogin(@RequestBody LoginRequestDto dto) {
        try {
            Authentication resultAuthentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.username(), dto.password())
            );
            
            // Generate JWT token after successful authentication
            String jwtToken = jwtUtil.generateJwtToken(resultAuthentication);
            
            LoginResponseDto response = new LoginResponseDto(
                HttpStatus.OK.getReasonPhrase(),
                new UserDto(),
                jwtToken  // ← Pass the actual token (was null before)
            );
            return ResponseEntity.ok(response);
            
        } catch (BadCredentialsException e) {
            // ... error handling
        }
    }
}
```

Two simple changes:
1. Inject `JwtUtil` as a dependency
2. Call `jwtUtil.generateJwtToken(resultAuthentication)` and pass the result to the response DTO

---

## Concept 2: Debugging the Token Generation

### ⚙️ What's inside the Authentication object?

After successful authentication, inspecting `resultAuthentication`:

```
resultAuthentication:
  ├── principal: User
  │     ├── username: "madan"
  │     └── authorities: [ROLE_USER, ...]
  ├── credentials: null (erased)
  └── authenticated: true
```

This `principal` object is what `JwtUtil` uses — it casts it to a `User` object and extracts the username and role information.

### ⚙️ The Generated Token

The `generateJwtToken()` method produces a token like:

```
eyJhbGciOiJIUzM4NCJ9.eyJpc3MiOiJKb2IgUG9ydGFsIiwic3ViIjoiSldUIFRva2VuIiwidXNlcm5hbWUiOiJtYWRhbiIsInJvbGVzIjoiUk9MRV9VU0VSIn0.signature_hash_here
```

### 🧪 Inspecting the Decoded Token

When decoded (e.g., using the JWT tab in Postman or jwt.io):

**Header:**
```json
{
    "alg": "HS384"
}
```

**Payload:**
```json
{
    "iss": "Job Portal",
    "sub": "JWT Token",
    "username": "madan",
    "roles": "ROLE_USER,ROLE_ADMIN",
    "iat": 1713446400,
    "exp": 1713532800
}
```

**Signature:** The hash value generated with your secret key.

---

## Concept 3: Testing from Postman

### 🧪 The Complete Login Flow

```
POST http://localhost:8080/api/auth/login/public

Body:
{
    "username": "madan",
    "password": "Madan@123"
}

Response:
{
    "message": "OK",
    "user": { ... },
    "jwtToken": "eyJhbGciOiJIUzM4NCJ9.eyJpc3M..."
}
```

The response now includes a **real JWT token** instead of `null`. The client application can:
1. Store this token (typically in a cookie or localStorage)
2. Send it with every subsequent request
3. Decode the payload to read user information without calling the backend

---

## Concept 4: What's Next — The Validation Problem

### 🧠 Current State

We can now **generate** JWT tokens after login. But if a client sends this token with a secured API request, our backend has **no mechanism to validate it**.

Right now:
- ✅ Login → generates JWT token → sends to client
- ❌ Subsequent requests with JWT token → backend doesn't know what to do with it

### 🧠 What we need

A **JWT Token Validator Filter** that:
1. Intercepts every incoming request
2. Checks if a JWT token is present in the request header
3. Validates the token (checks signature, expiration)
4. If valid → allows the request through
5. If invalid/tampered/expired → rejects the request

This is the critical second component that we'll build in the next lectures.

---

## ✅ Key Takeaways

1. Integration is simple: inject `JwtUtil` into `AuthController`, call `generateJwtToken()` after successful authentication
2. The `Authentication` object from successful login contains everything needed to build the token (username, roles)
3. The JWT token appears in the login response and can be inspected/decoded by the client
4. Token generation is only **half** the solution — we still need a **validator filter** for subsequent requests
5. Always **restart the application** (not just hot-reload) after adding new library dependencies

---

## ⚠️ Common Mistakes

1. **Not restarting the application** after adding JJWT dependencies — leads to `NoClassDefFoundError` for the `Keys` class
2. **Forgetting to replace the `null` JWT token** in the response DTO with the actual generated token
3. **Assuming token generation is enough** — without validation, the token is useless for securing API requests

---

## 💡 Pro Tips

- Use Postman's **JWT** tab to quickly inspect the decoded contents of your token
- The token expiration time (`exp`) and issued time (`iat`) are visible in the payload — useful for debugging
- When roles are comma-separated (e.g., `"ROLE_USER,ROLE_ADMIN"`), you'll need to split them during validation
