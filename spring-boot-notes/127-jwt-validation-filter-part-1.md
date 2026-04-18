# Building a Filter to Validate the JWT Token — Part 1

## Introduction

We can generate JWT tokens after login. Now we need the other half — a **filter** that intercepts every secured request, extracts the JWT token, validates it, and either allows or rejects the request. This is where we build the `JwtTokenValidatorFilter`, understand the `OncePerRequestFilter`, and set up the `SecurityContext`.

---

## Concept 1: What Is a Filter and Why Do We Need One?

### 🧠 What is it?

A **filter** intercepts HTTP requests before they reach the controller. It can inspect, modify, or reject requests. Spring Security itself uses multiple filters (like `BasicAuthenticationFilter`) to enforce security.

### ❓ Why build our own filter?

Because Spring Security doesn't natively understand our custom JWT tokens. We need to teach it:

1. Look for a JWT token in the request header
2. Parse and validate the token
3. Extract user information (username, roles)
4. Tell Spring Security "this user is already authenticated"

---

## Concept 2: Creating the JwtTokenValidatorFilter

### ⚙️ Extending OncePerRequestFilter

```java
@RequiredArgsConstructor
public class JwtTokenValidatorFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        // validation logic here
    }
}
```

### ❓ Why `OncePerRequestFilter`?

In some scenarios, a request might be processed multiple times (e.g., forwarding). By extending `OncePerRequestFilter`, the framework guarantees your filter logic runs **exactly once** per request — no duplicates.

### ❓ Why no `@Component` annotation?

We're **not** injecting this filter as a Spring bean elsewhere. Instead, we'll manually register it in the security configuration. No stereotype annotation needed.

---

## Concept 3: The Validation Logic — Step by Step

### ⚙️ Step 1: Read the JWT Token from the Request Header

```java
String authHeaderString = request.getHeader(ApplicationConstants.JWT_HEADER);
```

The industry standard is to send JWT tokens in the **Authorization** header. The constant `JWT_HEADER` is set to `"Authorization"`.

### ⚙️ Step 2: Extract the Actual Token

```java
if (authHeaderString != null) {
    String jwtToken = authHeaderString.substring(7); // Remove "Bearer " prefix
}
```

When sending JWT tokens, the standard format is:
```
Authorization: Bearer eyJhbGciOi...
```

The "**Bearer**" prefix (7 characters including the space) means: "whoever holds/bears this token is trusted." We strip it to get the raw JWT token.

### ⚙️ Step 3: Get the Secret Key

```java
String secret = getEnvironment().getProperty("JWT_SECRET", ApplicationConstants.JWT_SECRET_KEY);
SecretKey secretKey = Keys.hmacShaKeyFor(secret.getBytes());
```

Same secret used during generation — this is critical. The validation will only work if both sides use the **exact same secret**.

### ⚙️ Step 4: Parse and Verify the Token

```java
Claims claims = Jwts.parser()
    .verifyWith(secretKey)      // verify signature with our secret
    .build()
    .parseSignedClaims(jwtToken) // parse the token
    .getPayload();               // extract the payload (claims)
```

This is where the magic happens:
- `verifyWith(secretKey)` — checks if the signature matches
- If the token is tampered → **throws an exception**
- If valid → returns the claims (payload data)

### ⚙️ Step 5: Extract User Information from Claims

```java
String username = claims.get("username", String.class);
String roles = claims.get("roles", String.class);
```

We read the same claims we embedded during token generation.

### ⚙️ Step 6: Create an Authentication Object

```java
Authentication authentication = new UsernamePasswordAuthenticationToken(
    username,                 // principal (who the user is)
    null,                      // credentials (no password needed)
    AuthorityUtils.commaSeparatedStringToAuthorityList(roles)  // authorities
);
```

### ❓ Why `null` for credentials?

We don't have the password, and we don't need it — the JWT token has already proven the user's identity. Passing `null` is perfectly acceptable.

### ❓ What does `AuthorityUtils.commaSeparatedStringToAuthorityList()` do?

Converts a comma-separated string like `"ROLE_USER,ROLE_ADMIN"` into a list of `GrantedAuthority` objects that Spring Security understands.

### ❓ Why use this specific constructor?

The three-argument constructor of `UsernamePasswordAuthenticationToken` automatically calls `setAuthenticated(true)`. This tells Spring Security: **"This user is already authenticated — don't authenticate them again."**

### ⚙️ Step 7: Set the Authentication in SecurityContext

```java
SecurityContextHolder.getContext().setAuthentication(authentication);
```

This is the critical line. By placing the `Authentication` object in the `SecurityContext`, we tell the entire Spring Security framework: "This user is logged in."

When `BasicAuthenticationFilter` runs later, it checks the SecurityContext first. If authentication is already there, it **skips** its own authentication logic.

### ⚙️ Step 8: Pass the Request to the Next Filter

```java
filterChain.doFilter(request, response);
```

**Never forget this line!** It hands the request to the next filter in the chain. If you skip it, the request dies in your filter and never reaches the controller.

---

## Concept 4: Exception Handling

### ⚙️ Token Expired

```java
catch (ExpiredJwtException e) {
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.getWriter().write("JWT token expired");
    return;
}
```

### ⚙️ Invalid/Tampered Token

```java
catch (Exception e) {
    throw new BadCredentialsException("Invalid JWT token");
}
```

---

## Concept 5: The shouldNotFilter() Method — Skipping Public Paths

### 🧠 The Problem

Our filter intercepts **every** request. But public APIs (like `/api/auth/login/public`) don't carry JWT tokens — that's the whole point of them being public. Running validation logic on these requests is unnecessary.

### ⚙️ The Solution

Override `shouldNotFilter()`:

```java
@Override
protected boolean shouldNotFilter(HttpServletRequest request) {
    return publicPaths.stream()
        .anyMatch(path -> new AntPathMatcher().match(path, request.getRequestURI()));
}
```

- Returns `true` → filter is **skipped** (for public paths)
- Returns `false` → filter is **executed** (for secured paths)

### ❓ Why use `AntPathMatcher` instead of `String.equals()`?

Because public paths can contain **regex patterns** like `/api/companies/*/jobs`. Standard string comparison can't handle wildcards — `AntPathMatcher.match()` can.

### ⚙️ Injecting Public Paths

```java
@Qualifier("publicPaths")
private final List<String> publicPaths;
```

The `@Qualifier` is needed because there are multiple `List<String>` beans (public paths and secured paths). Without it, Spring wouldn't know which one to inject.

---

## Concept 6: Injecting the Filter into Spring Security

### ⚙️ In JobPortalSecurityConfig:

```java
http.addFilterBefore(
    new JwtTokenValidatorFilter(publicPaths),
    BasicAuthenticationFilter.class
);
```

### ❓ What does `addFilterBefore()` mean?

It says: "Execute my `JwtTokenValidatorFilter` **BEFORE** `BasicAuthenticationFilter`."

### ❓ Why before BasicAuthenticationFilter?

The flow becomes:
1. **JwtTokenValidatorFilter** runs first — checks for JWT, sets Authentication in SecurityContext
2. **BasicAuthenticationFilter** runs next — sees Authentication already exists, **skips** its own authentication
3. Request reaches the controller

If we ran our filter **after** BasicAuthenticationFilter, it would try to authenticate using Basic Auth first (which would fail because the client sent a token, not credentials).

---

## Concept 7: How It All Connects — The Full Flow

### 🧠 For Public APIs (login, registration):

```
Request → shouldNotFilter() returns TRUE → Filter SKIPPED → Normal flow
```

### 🧠 For Secured APIs (with JWT token):

```
Request → shouldNotFilter() returns FALSE → doFilterInternal() executes
    → Extract JWT from Authorization header
    → Verify signature with secret key
    → Extract username + roles from claims
    → Create Authentication object (authenticated=true)
    → Set in SecurityContext
    → filterChain.doFilter() → BasicAuthenticationFilter
    → BasicAuthenticationFilter checks SecurityContext → Authentication exists → SKIP
    → Request reaches Controller → ✅ Success
```

### 🧠 For Secured APIs (with tampered token):

```
Request → doFilterInternal() → verifyWith() → SIGNATURE MISMATCH → Exception thrown → 401 Unauthorized
```

---

## ✅ Key Takeaways

1. Extend `OncePerRequestFilter` to ensure your filter logic runs exactly once per request
2. JWT tokens are sent in the `Authorization` header with a `Bearer ` prefix
3. Use `Jwts.parser().verifyWith(secretKey)` to validate the signature — it throws an exception if tampered
4. After validating, create an `Authentication` object and set it in `SecurityContextHolder`
5. The **three-argument constructor**  of `UsernamePasswordAuthenticationToken` sets `authenticated = true` automatically
6. Use `addFilterBefore(YourFilter, BasicAuthenticationFilter.class)` to run your filter first
7. Override `shouldNotFilter()` to skip the filter for public paths
8. **Never forget `filterChain.doFilter()`** — without it, the request chain stops at your filter

---

## ⚠️ Common Mistakes

1. **Forgetting `filterChain.doFilter()`** — the request never reaches the controller
2. **Using the wrong secret** for validation vs generation — signatures won't match
3. **Not handling `ExpiredJwtException`** — expired tokens silently fail instead of returning a proper error
4. **Not overriding `shouldNotFilter()`** — the filter runs on public APIs unnecessarily
5. **Using `String.equals()` instead of `AntPathMatcher`** — wildcard paths won't match

---

## 💡 Pro Tips

- `SecurityContextHolder.getContext().setAuthentication()` is the key to telling Spring Security "this user is already authenticated"
- The `BasicAuthenticationFilter` checks `authenticationIsRequired()` before authenticating — if our filter already set the authentication, it skips
- This same filter pattern works whether you use InMemory, database, or any other user storage
