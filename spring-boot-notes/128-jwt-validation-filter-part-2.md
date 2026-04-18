# Building a Filter to Validate the JWT Token — Part 2 (Testing & End-to-End Flow)

## Introduction

We've built the `JwtTokenValidatorFilter` and injected it into the Spring Security filter chain. Now it's time to **test the complete end-to-end flow** — from login to getting a JWT token to using that token for secured API calls. We'll also debug through the filters to see exactly how Spring Security processes our request.

---

## Concept 1: Testing the Complete Flow

### 🧪 Step 1: Get a JWT Token via Login

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
    "jwtToken": "eyJhbGciOiJIUzM4NCJ9..."
}
```

During this call:
- `shouldNotFilter()` returns `true` (it's a public path)
- The JWT validation filter is **completely skipped**
- Authentication happens via `AuthenticationManager.authenticate()`
- JWT token is generated and returned

### 🧪 Step 2: Use the JWT Token for a Secured API

```
GET http://localhost:8080/api/companies

Headers:
  Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

In Postman, select **Bearer Token** under the Auth tab and paste the token. Postman automatically adds the `Authorization: Bearer <token>` header.

---

## Concept 2: Debugging the shouldNotFilter() Method

### ⚙️ For Public Paths (Login)

When calling `/api/auth/login/public`:

```
request.getRequestURI() → "/api/auth/login/public"
publicPaths contains "/api/auth/login/public"

AntPathMatcher.match("/api/auth/login/public", "/api/auth/login/public") → TRUE

shouldNotFilter() returns TRUE → Filter is SKIPPED
```

### ⚙️ For Secured Paths (GetAllCompanies)

When calling `/api/companies`:

```
request.getRequestURI() → "/api/companies"
publicPaths does NOT contain "/api/companies"

No match found → shouldNotFilter() returns FALSE → Filter is EXECUTED
```

---

## Concept 3: Debugging the doFilterInternal() Method

### ⚙️ Line by line for a secured request with JWT:

1. **Read Authorization header:**
   ```
   authHeaderString = "Bearer eyJhbGciOiJIUzM4NCJ9..."
   ```

2. **Extract JWT token (remove "Bearer "):**
   ```
   jwtToken = "eyJhbGciOiJIUzM4NCJ9..."
   ```

3. **Get secret and create SecretKey** — same secret used during generation

4. **Parse and verify the token:**
   ```java
   Claims claims = Jwts.parser()
       .verifyWith(secretKey)
       .build()
       .parseSignedClaims(jwtToken)
       .getPayload();
   ```
   If the signature is valid, we get the claims. If tampered, an exception is thrown.

5. **Extract username and roles:**
   ```
   username = "madan"
   roles = "ROLE_USER"
   ```

6. **Create Authentication object:**
   ```
   Authentication(principal="madan", credentials=null, authorities=[ROLE_USER], authenticated=true)
   ```

7. **Set in SecurityContext:**
   ```java
   SecurityContextHolder.getContext().setAuthentication(authentication);
   ```

8. **Pass to next filter:**
   ```java
   filterChain.doFilter(request, response);
   ```

---

## Concept 4: What Happens in BasicAuthenticationFilter After Our Filter

### ⚙️ The Critical Check

After our filter runs, `BasicAuthenticationFilter.doFilterInternal()` executes:

1. It tries to extract credentials from the request
2. If no credentials are found (we sent a token, not Basic Auth), `authRequest` is `null`
3. With `authRequest == null`, it **skips** its authentication logic
4. Even if credentials WERE present, it calls `authenticationIsRequired()`:
   - This checks if the SecurityContext already has a valid Authentication
   - Since our filter already placed one there → returns `false`
   - Basic Auth authentication is **skipped**
5. The request passes through to the controller

### 💡 Insight

> This is the elegant design of Spring Security's filter chain. Each filter checks if previous filters have already done the work. Our JWT filter sets the Authentication in SecurityContext, and BasicAuthenticationFilter respects that — no redundant authentication.

---

## Concept 5: Testing Both Credentials AND JWT Token Simultaneously

### 🧪 What if you send both?

To test this, the instructor temporarily changes the JWT header from `Authorization` to `Authorization1` (since both Basic Auth and Bearer token use the `Authorization` header name).

Result: **Both filters run, but our JWT filter wins.** Since our filter runs first and sets the Authentication, BasicAuthenticationFilter finds it and skips.

### 💡 Insight

> In a real application, you'd typically use only one method — either Basic Auth or JWT — not both. This test just proves that the filter ordering works correctly.

---

## Concept 6: addFilterBefore vs addFilterAfter

### ⚙️ addFilterBefore(YourFilter, Reference.class)

Your filter runs **BEFORE** the reference filter.

```java
http.addFilterBefore(jwtValidator, BasicAuthenticationFilter.class);
// JwtTokenValidatorFilter → BasicAuthenticationFilter → ...
```

We used this for our **validator filter**.

### ⚙️ addFilterAfter(YourFilter, Reference.class)

Your filter runs **AFTER** the reference filter.

```java
http.addFilterAfter(jwtGenerator, BasicAuthenticationFilter.class);
// BasicAuthenticationFilter → JwtTokenGeneratorFilter → ...
```

When would you use this? If you want to generate JWT tokens even when Spring Security handles authentication **automatically** (not via a manual login API). After `BasicAuthenticationFilter` completes the authentication, your generator filter can read the `Authentication` from SecurityContext and create the token.

### ⚙️ addFilter() — Insert at a Default Position

Inserts the filter at the framework's default position in the chain.

### 💡 Insight

> In our current setup, we generate the JWT token manually from the controller (not a filter) because we trigger authentication manually. The `addFilterAfter` pattern is useful when you want automatic authentication AND automatic token generation.

---

## Concept 7: The Complete Architecture — Summary

### 🧠 What We Built in This Section

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT APPLICATION                      │
│                                                           │
│  1. Login Page → POST /api/auth/login/public              │
│     (sends username + password)                           │
│                                                           │
│  2. Receives JWT Token in response                        │
│                                                           │
│  3. Stores token (cookie/localStorage)                    │
│                                                           │
│  4. Secured API → GET /api/companies                      │
│     (sends JWT token in Authorization header)             │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   BACKEND APPLICATION                     │
│                                                           │
│  Login Flow:                                              │
│    AuthController → AuthenticationManager → JWT Generated  │
│                                                           │
│  Secured API Flow:                                        │
│    JwtTokenValidatorFilter (validates token)               │
│    → Sets Authentication in SecurityContext                │
│    → BasicAuthenticationFilter (skips — already authed)    │
│    → Controller (processes request)                       │
│                                                           │
│  Key Components:                                           │
│  • InMemoryUserDetailsManager (user storage)              │
│  • BCryptPasswordEncoder (password hashing)               │
│  • JwtUtil (token generation)                             │
│  • JwtTokenValidatorFilter (token validation)             │
└─────────────────────────────────────────────────────────┘
```

---

## Concept 8: What's Coming Next

### 🧠 Current Limitations

1. Users are stored **in memory** — lost on restart
2. No **registration** flow — users are hardcoded
3. No **database** integration for user management

### 🧠 Next Section Goals

1. Store user details in a **database**
2. Build a **registration REST API**
3. Test the end-to-end flow with the **React UI**

---

## ✅ Key Takeaways

1. `shouldNotFilter()` ensures the JWT filter only runs for **secured paths**, not public ones
2. `AntPathMatcher` handles wildcard/regex path matching for public path comparisons
3. After our filter sets the Authentication, `BasicAuthenticationFilter` automatically **skips** its authentication
4. `addFilterBefore()` places your custom filter before a specified Spring Security filter
5. `addFilterAfter()` is useful when you want to generate tokens after automatic authentication
6. The `Bearer` prefix in the Authorization header is an industry standard meaning "trust the token holder"
7. The complete JWT flow: **Login → Get Token → Send Token → Validate Token → Access Resource**

---

## ⚠️ Common Mistakes

1. **Sending both Basic Auth and Bearer token on the same `Authorization` header** — they conflict; use one or the other
2. **Forgetting to disable form login** when using JWT — `http.formLogin(c -> c.disable())`
3. **Not testing both valid and tampered tokens** — always verify that invalid tokens are properly rejected
4. **Skipping the `shouldNotFilter()` override** — your filter will unnecessarily process public routes

---

## 💡 Pro Tips

- Use Postman's **Bearer Token** auth type — it automatically formats the `Authorization: Bearer <token>` header
- You can inspect any JWT token at jwt.io to verify its contents match what you expect
- The `filterChain.doFilter()` call is present in ALL Spring Security filters — it's the mechanism that passes control through the chain
- As a next enhancement, you'll move from InMemory storage to **database-backed user management**, which uses the exact same authentication flow — just a different `UserDetailsService` implementation
