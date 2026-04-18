# Invoking the Spring Security Authentication Flow Manually — Part 1

## Introduction

So far, Spring Security has been handling authentication **automatically** — whenever you hit a secured API, the framework intercepts the request, extracts credentials, and authenticates the user. But for real enterprise applications, this approach has problems. In this lecture, we'll understand **why manual authentication is needed**, build a dedicated **login REST API**, and set up the foundation for token-based authentication.

---

## Concept 1: The Problem with Automatic Authentication

### 🧠 What are the issues?

There are **two major problems** with relying on Spring Security's automatic authentication:

### Problem 1: No Dedicated Login Endpoint

Right now, authentication happens when the user hits **any** secured API with Basic Auth credentials. That means:
- The UI developer has to pick a random secured API to trigger login
- Credentials are sent with every single request
- There's no clean separation between "logging in" and "using the app"

**What we should have:** A dedicated login API that the frontend calls only once with credentials.

### Problem 2: No Token Mechanism

Without tokens, the UI application has to send username and password with **every single request**. That's:
- Repetitive and inefficient
- A security risk (credentials flying around constantly)
- Not how modern apps work

**What we should have:** After successful login, the backend sends a **token**. The frontend stores it (as a cookie) and sends the token — not credentials — for all subsequent requests.

### 💡 Insight

> In modern applications, credentials are sent **once** during login. After that, everything works through tokens. Think of it like checking into a hotel — you show your ID once at reception, get a room key (token), and use the key for everything else.

---

## Concept 2: Building the Login REST API

### ⚙️ Step 1: Create the Auth Package and Controller

```java
@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
public class AuthController {
    // login logic goes here
}
```

### ⚙️ Step 2: Create DTOs for Login

**LoginRequestDto** — accepts credentials from the UI:
```java
public record LoginRequestDto(String username, String password) {}
```

**LoginResponseDto** — sends response back to the UI:
```java
public record LoginResponseDto(String message, UserDto user, String jwtToken) {}
```

**UserDto** — represents user information:
```java
@Getter @Setter @ToString
public class UserDto {
    private Long userId;
    private String name;
    private String email;
    private String mobileNumber;
    private String role;
    private Long companyId;
    private String companyName;
    private LocalDateTime createdAt;
}
```

### ❓ Why use a POST method for login?

```java
@PostMapping("login/public")
public ResponseEntity<LoginResponseDto> apiLogin(@RequestBody LoginRequestDto dto) {
    // ...
}
```

If you use GET, the username and password would be sent as **query parameters or path variables** — visible in:
- The browser URL bar
- Browser history
- Server access logs

POST sends data in the **request body**, keeping credentials hidden.

### ⚙️ Step 3: Make the Login API Public

Add the login path to the public paths configuration:

```java
// In PathConfig
"/api/auth/login/public"
```

Since this is a login endpoint, it **must** be accessible without authentication — otherwise users could never log in!

---

## Concept 3: Initial Test — Dummy Response

### 🧪 First iteration

For now, the login API simply returns a dummy response:

```java
@PostMapping("login/public")
public ResponseEntity<LoginResponseDto> apiLogin(@RequestBody LoginRequestDto dto) {
    UserDto userDto = new UserDto(); // empty user
    LoginResponseDto response = new LoginResponseDto(
        HttpStatus.OK.getReasonPhrase(), // "OK"
        userDto,
        null // JWT token — not yet implemented
    );
    return ResponseEntity.ok(response);
}
```

### 🧪 Testing from Postman

```
POST http://localhost:8080/api/auth/login/public
Body (JSON):
{
    "username": "madan",
    "password": "Madan@123"
}

Response:
{
    "message": "OK",
    "user": { all null },
    "jwtToken": null
}
```

At this point, **even wrong credentials return success** because we're not actually authenticating — just returning a dummy response. The real authentication logic comes next.

---

## Concept 4: The Big Picture — What We're Building

### 🧠 The Complete Login Flow

```
UI Login Page
    ↓ (sends username + password)
POST /api/auth/login/public  (public API — no auth required)
    ↓
Backend performs manual authentication
    ↓
If successful → Generate JWT token → Send token to UI
    ↓
UI stores token as a cookie
    ↓
For all future requests, UI sends the token (not credentials)
    ↓
Backend validates the token → allows/denies access
```

### 💡 Insight

> We're building a login API where:
> 1. Credentials come in → authentication happens → JWT token goes out
> 2. Future requests use the token, not credentials
> 3. The token has an expiration time — after which the user must log in again

---

## ✅ Key Takeaways

1. **Don't rely on automatic authentication** for enterprise apps — build a dedicated login API
2. Use **POST** for login endpoints to keep credentials out of URLs and browser history
3. The login API should be a **public/unsecured** endpoint (otherwise nobody can log in)
4. After successful login, send a **JWT token** so the frontend doesn't need to send credentials again
5. Create proper **DTOs** (Request and Response) for clean API design
6. The login API is incomplete without actual authentication and token generation — coming next

---

## ⚠️ Common Mistakes

1. **Using GET for login** — exposes credentials in URLs and browser history
2. **Making the login endpoint secured** — creates a chicken-and-egg problem (need to be authenticated to authenticate)
3. **Not handling the case where credentials are wrong** — right now we return success for everything (we'll fix this)

---

## 💡 Pro Tips

- The `UserDto` fields will make more sense when we implement user registration and database storage in future sections
- Java Records are perfect for DTOs that are just data containers (like `LoginRequestDto` and `LoginResponseDto`)
- The `/public` suffix in the path makes it easy to identify and configure public endpoints
