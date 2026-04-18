# Enforcing Strong Passwords with CompromisedPasswordChecker

## Introduction

You've built a registration API. Users can create accounts. But are you letting them use passwords like `password123` or `test@123`? These passwords pass basic UI validations (8 characters, uppercase, lowercase, digit, special character) — but they're incredibly **weak** because they've been leaked in countless data breaches.

Spring Security 6.3 introduced a brilliant tool to solve this: **`CompromisedPasswordChecker`**. It checks passwords against a real-world database of breached credentials.

---

## Why UI Validations Aren't Enough

Typical frontend password rules:
- At least 8 characters ✅
- One uppercase letter ✅
- One lowercase letter ✅
- One digit ✅
- One special character ✅

A password like `Password@1` passes all of these. But it's been **compromised millions of times** in real breaches. A hacker's dictionary attack would crack it instantly.

> Frontend validations check **format**. Backend checks should verify **strength**.

---

## Enter CompromisedPasswordChecker

### 🧠 What Is It?

`CompromisedPasswordChecker` is a Spring Security interface that checks if a given password has been **leaked in known data breaches** across the internet.

### ⚙️ How It Works

1. You pass a password to the `check()` method.
2. It calls the **Have I Been Pwned** REST API (haveibeenpwned.com).
3. The API checks its database of billions of breached passwords.
4. It returns a `CompromisedPasswordDecision` — which tells you if the password is compromised.

### 🌐 About Have I Been Pwned

[haveibeenpwned.com](https://haveibeenpwned.com) is a trusted, widely-used service that:
- Continuously analyzes data breaches across the web.
- Maintains a database of compromised passwords and accounts.
- Provides a free API for password checking.
- Is used by organizations worldwide for security validation.

> Think of it as a "blacklist" of every password that's ever been exposed in a data breach.

---

## Setting It Up

### Step 1: Create the Bean

In your `SecurityConfig`:

```java
@Bean
public CompromisedPasswordChecker compromisedPasswordChecker() {
    return new HaveIBeenPwnedRestApiPasswordChecker();
}
```

That's it. One bean. The implementation class `HaveIBeenPwnedRestApiPasswordChecker` handles all the API calls to Have I Been Pwned internally.

### Step 2: Inject and Use in Registration

```java
@RestController
public class AuthController {

    private final CompromisedPasswordChecker compromisedPasswordChecker;

    @PostMapping("/api/register/public/v1.0")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequestDto dto) {

        // Check if password is compromised FIRST
        CompromisedPasswordDecision decision = 
            compromisedPasswordChecker.check(dto.password());

        if (decision.isCompromised()) {
            return ResponseEntity.badRequest()
                .body(Map.of("password", "Choose a strong password. The provided password is compromised."));
        }

        // ... continue with registration
    }
}
```

### 🔍 What Happens Internally

1. `check(password)` → calls Have I Been Pwned API.
2. Returns `CompromisedPasswordDecision` object.
3. `decision.isCompromised()` → `true` if the password exists in breach databases.
4. If compromised → reject with 400 Bad Request and a helpful message.

---

## The Registration Flow (Complete)

With the compromised password check added, the full registration flow becomes:

```
Client sends registration request
    ↓
1. Check if password is compromised (CompromisedPasswordChecker)
    → If YES: return 400 "Choose a strong password"
    ↓
2. Check for duplicate email/mobile (Derived Query)
    → If duplicate found: return 400 with specific errors
    ↓
3. Copy properties from DTO → Entity
    ↓
4. Hash the password (BCryptPasswordEncoder)
    ↓
5. Fetch and assign default role (ROLE_JOB_SEEKER)
    ↓
6. Save user to database
    ↓
7. Return 201 Created
```

---

## Setting Up Demo Accounts

For testing and development, create three demo accounts with different roles:

| Name    | Email              | Role             | Password         |
|---------|--------------------|-----------------|------------------|
| John Doe| john@gmail.com     | ROLE_JOB_SEEKER | EazyBytes@1803   |
| Sanjana | sanjana@gmail.com  | ROLE_EMPLOYER   | EazyBytes@1803   |
| Admin   | admin@gmail.com    | ROLE_ADMIN      | EazyBytes@1803   |

- All three are initially created as `ROLE_JOB_SEEKER` through the registration API.
- Manually update `role_id` in the database for Sanjana (→ 2) and Admin (→ 3).
- In a real app, an admin panel would handle role upgrades.

---

## ✅ Key Takeaways

- **Never rely only on frontend password validation** — hackers bypass UI entirely.
- `CompromisedPasswordChecker` verifies passwords against **real breach databases**.
- It uses the **Have I Been Pwned** API — a trusted, industry-standard service.
- Create the bean in one line → inject → call `check()` → done.
- This feature requires **Spring Security 6.3+**.

## ⚠️ Common Mistakes

- **Checking password strength only on the UI** — backend validation is essential.
- **Not checking for compromised passwords** — users will choose "Password@1" every time.
- **Using this with older Spring Security versions** — `CompromisedPasswordChecker` is available from 6.3 onwards.

## 💡 Pro Tips

- The Have I Been Pwned API uses a **k-anonymity** model — your actual password is never sent to the API. Only a partial hash prefix is sent, making it privacy-safe.
- Place the compromised check **before** all other registration logic — fail fast and save resources.
- When creating demo accounts, use the same credentials throughout your team for consistent testing.
