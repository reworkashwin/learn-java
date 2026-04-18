# Generating JWT Token in Backend App — Part 1

## Introduction

We understand JWT tokens — their structure, the signature, and why they're tamper-proof. Now it's time to actually **generate** them in our Spring Boot backend. We'll add the required dependencies, set up a secret key, and build a utility class (`JwtUtil`) that creates JWT tokens with user information after successful authentication.

---

## Concept 1: Two Components You Need for JWT

### 🧠 The Big Picture

To adopt JWT tokens in a backend application, you need two components:

1. **JWT Token Generator** — creates a token during login (this lecture)
2. **JWT Token Validator** — validates the token for subsequent requests (next lecture)

We'll focus on the generator first.

---

## Concept 2: Adding the JJWT Library Dependencies

### 🧠 What library are we using?

The **JJWT (Java JWT)** library — a popular, well-maintained library for creating and parsing JWT tokens.

### ⚙️ Three Dependencies Required

Add these to your `pom.xml`:

```xml
<!-- JWT API -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>

<!-- JWT Implementation -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>

<!-- JWT Jackson (JSON processing) -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
```

After adding, **sync Maven changes** to download the libraries.

### ⚠️ Important

> After adding new dependencies, do a **manual restart** of your application — don't rely on DevTools hot reload. The new classes need to be properly loaded into the classpath.

---

## Concept 3: Setting Up the Secret Key

### 🧠 Why do we need a secret?

Remember the JWT signature formula?
```
Signature = Hash(encodedHeader + "." + encodedPayload, SECRET_KEY)
```

The secret key is essential for generating and validating signatures.

### ⚙️ Creating an ApplicationConstants class

```java
public class ApplicationConstants {
    
    private ApplicationConstants() {
        throw new IllegalStateException("Utility class — do not instantiate");
    }
    
    public static final String JWT_SECRET_KEY = "your-complex-default-secret-value-here";
}
```

### ❓ Why the private constructor + exception?

This is a **constants-only class** — it should never be instantiated. Two safety mechanisms:
1. **Private constructor** — blocks `new ApplicationConstants()`
2. **Throw exception** — blocks reflection-based instantiation

This is a standard enterprise pattern to protect constant utility classes.

### ⚙️ Environment Variable Fallback

For production, the secret should come from an **environment variable**, not hardcoded source code:

```java
String secret = env.getProperty("JWT_SECRET", ApplicationConstants.JWT_SECRET_KEY);
```

- If `JWT_SECRET` environment variable exists → use it
- If not → use the default constant (for local development)

### ⚠️ Important

> **Never use simple secrets** like `12345` or `secret`. Use a long, complex, random string that's impossible to guess.

---

## Concept 4: Building the JwtUtil Class

### ⚙️ The Class Structure

```java
@Component
@RequiredArgsConstructor
public class JwtUtil {
    
    private final Environment env;
    
    public String generateJwtToken(Authentication authentication) {
        // token generation logic
    }
}
```

- **`@Component`** — makes it injectable as a Spring bean
- **`Environment`** — reads environment variables (for the secret key)
- Import `Environment` from `org.springframework.core.env` (not Hibernate!)

### ⚙️ The Complete Token Generation Logic

```java
public String generateJwtToken(Authentication authentication) {
    // 1. Get the secret value
    String secret = env.getProperty("JWT_SECRET", ApplicationConstants.JWT_SECRET_KEY);
    
    // 2. Create the SecretKey object
    SecretKey secretKey = Keys.hmacShaKeyFor(secret.getBytes());
    
    // 3. Get logged-in user details
    User fetchedUser = (User) authentication.getPrincipal();
    String username = fetchedUser.getUsername();
    
    // 4. Build the JWT token
    String jwtToken = Jwts.builder()
        .issuer("Job Portal")
        .subject("JWT Token")
        .claim("username", username)
        .claim("roles", authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.joining(",")))
        .issuedAt(new Date())
        .expiration(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))
        .signWith(secretKey)
        .compact();
    
    return jwtToken;
}
```

Let's break down each step.

---

## Concept 5: Step-by-Step Token Generation

### Step 1: Get the Secret

```java
String secret = env.getProperty("JWT_SECRET", ApplicationConstants.JWT_SECRET_KEY);
```

Checks for an environment variable first, falls back to the default constant.

### Step 2: Create the SecretKey Object

```java
SecretKey secretKey = Keys.hmacShaKeyFor(secret.getBytes());
```

`Keys.hmacShaKeyFor()` converts the string secret into a proper `SecretKey` object that the JJWT library needs. The `Keys` class comes from the JJWT library.

### Step 3: Extract User Details

```java
User fetchedUser = (User) authentication.getPrincipal();
String username = fetchedUser.getUsername();
```

- `authentication.getPrincipal()` returns the logged-in user as an `Object`
- We cast it to Spring Security's `User` class
- Extract the username for embedding in the token

### Step 4: Build the Token

| Method | Purpose |
|--------|---------|
| `.issuer("Job Portal")` | Who issued this token (your app name/org) |
| `.subject("JWT Token")` | What this token represents |
| `.claim("username", username)` | Custom claim — embeds username in payload |
| `.claim("roles", ...)` | Custom claim — embeds user roles in payload |
| `.issuedAt(new Date())` | When the token was created |
| `.expiration(...)` | When the token expires |
| `.signWith(secretKey)` | Generates the digital signature |
| `.compact()` | Builds and returns the final JWT string |

### Step 5: Setting Expiration

```java
new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
//                               24h × 60min × 60sec × 1000ms
```

This adds 24 hours to the current time. The multiplication converts to **milliseconds** because `Date` works in milliseconds.

Expiration times vary by business needs:
- High-security: 60 minutes
- Normal apps: 24 hours  
- "Remember me": 1 month or more

### Step 6: Extracting Roles

```java
authentication.getAuthorities().stream()
    .map(GrantedAuthority::getAuthority)
    .collect(Collectors.joining(","))
```

- `getAuthorities()` — returns a collection of `GrantedAuthority` objects
- `.map(GrantedAuthority::getAuthority)` — extracts the role name as a String
- `.collect(Collectors.joining(","))` — joins all role names with commas

Example output: `"ROLE_USER,ROLE_ADMIN"`

---

## Concept 6: The claim() Method — Populating the Payload

### 🧠 What is a claim?

A **claim** is a key-value pair stored in the JWT payload. You can call `.claim()` any number of times to add more data.

```java
.claim("username", "madan")          // who is this user
.claim("roles", "ROLE_USER")         // what can they do
.claim("email", "madan@email.com")   // additional info (optional)
```

### ❓ What should you put in claims?

- ✅ Username, roles, email, user ID
- ❌ **Never** put the password in the token
- ❌ Avoid very large data — keep the token size reasonable

### 💡 Insight

> As your application grows, you'll add more claims — like email, mobile number, company ID. The JWT token becomes a compact user profile card.

---

## ✅ Key Takeaways

1. Add three JJWT dependencies: `jjwt-api`, `jjwt-impl`, `jjwt-jackson`
2. Store the secret key in an **ApplicationConstants** class with environment variable fallback
3. Use `Keys.hmacShaKeyFor()` to create a `SecretKey` object from the secret string
4. Build tokens using `Jwts.builder()` with issuer, subject, claims, expiration, and signature
5. Extract user information from the `Authentication` object for embedding in the token
6. Always set an **expiration time** — JWT tokens should not live forever
7. The `.signWith(secretKey)` call generates the tamper-proof signature

---

## ⚠️ Common Mistakes

1. **Importing the wrong `Environment` class** — use `org.springframework.core.env.Environment`, NOT Hibernate's
2. **Not restarting the app** after adding JJWT dependencies — DevTools may not load new classes properly
3. **Using a simple secret** — makes the signature guessable
4. **Putting sensitive data** (passwords) in JWT claims — the payload is Base64 encoded, not encrypted
5. **Forgetting `.compact()`** — without it, you get a builder object, not the token string

---

## 💡 Pro Tips

- Use `.claim()` for custom data and the built-in methods (`.issuer()`, `.subject()`, `.issuedAt()`, `.expiration()`) for standard JWT fields
- The same secret key must be used for both generation AND validation — store it in a shared constant
- For production, always inject the secret via environment variables or a secrets manager
