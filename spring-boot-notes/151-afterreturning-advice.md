# AfterReturning Advice Demo — Working with Method Results

## Introduction

What if you want to run some logic **only when a method executes successfully** — and you also need access to the **return value** of that method? That's exactly what **AfterReturning Advice** is for. In this section, we'll implement a real-world scenario: logging a success audit message after a user logs in, using the login response data.

---

## After vs AfterReturning — What's the Difference?

Before diving in, let's clarify a common source of confusion:

| Advice Type | When It Runs | Can Access Return Value? |
|-------------|-------------|------------------------|
| `@After` | After method finishes — **success or failure** | ❌ No |
| `@AfterReturning` | **Only** after successful execution (no exception) | ✅ Yes |

### ❓ Why Does This Matter?

With `@After`, you can only run **generic logic** — you can't access what the method returned. It runs even if the method threw an exception.

With `@AfterReturning`, you get the **actual return value** from the target method, and it only runs on **success**. This makes it perfect for scenarios where you need the result.

---

## The Use Case — Login Success Auditing

Whenever a user successfully logs into the application, we want to:
- Log a message: "User X authenticated with role Y"
- In a real enterprise app, this could trigger a confirmation email or SMS

This is a perfect AfterReturning scenario because:
1. We only want to log on **successful** logins
2. We need the **response data** (username, roles) from the login method

---

## Implementing AfterReturning Advice

### The Aspect Class

```java
@Aspect
@Component
@Slf4j
public class LoginSuccessAuditAspect {

    @AfterReturning(
        pointcut = "execution(* com.eazybytes.jobportal.controller.AuthController.apiLogin(..))",
        returning = "response"
    )
    public void logSuccessfulLogin(JoinPoint joinPoint, Object response) {
        if (!(response instanceof ResponseEntity<?> responseEntity)) {
            return;
        }

        Object body = responseEntity.getBody();
        if (!(body instanceof LoginResponseDto loginResponse)) {
            return;
        }

        if (loginResponse.getUserDetails() != null) {
            String username = loginResponse.getUserDetails().getUsername();
            String roles = loginResponse.getUserDetails().getRoles();
            log.info("Login success for user: {} with roles: {}", username, roles);
        }
    }
}
```

---

## Understanding the Annotation Parameters

### 🔑 The `pointcut` Parameter

```java
pointcut = "execution(* com.eazybytes.jobportal.controller.AuthController.apiLogin(..))"
```

This targets the specific login method in `AuthController`.

### 🔑 The `returning` Parameter

```java
returning = "response"
```

This is the magic of AfterReturning. The value `"response"` must **match the parameter name** in your method:

```java
public void logSuccessfulLogin(JoinPoint joinPoint, Object response) {
//                                                         ^^^^^^^^
//                                                   Must match "returning" value
```

Whatever the target method returns, Spring will pass it as this `response` parameter.

### ❓ Why Use `Object` Instead of the Actual Type?

```java
Object response  // instead of ResponseEntity<LoginResponseDto> response
```

Using `Object` makes the aspect **reusable**. If you later add more login methods (like `apiLoginV2`, `apiLoginOAuth`), you can widen the pointcut (e.g., `apiLogin*`) and the same aspect handles all of them without type-casting issues at the AOP level.

---

## The Logic — Step by Step

1. **Check if response is a ResponseEntity** — if not, this isn't the method we expect, return early
2. **Extract the body** — get the actual data from the response
3. **Check if body is LoginResponseDto** — type safety before accessing fields
4. **Extract user details** — get username and roles
5. **Log the audit message** — record the successful login

### 💡 Defensive Programming in Aspects

Notice all the `instanceof` checks and early returns. In Aspects, it's important to be **defensive** because:
- The same aspect might accidentally match other methods in the future
- The return type might not always be what you expect
- A `null` body would cause `NullPointerException`

---

## Testing the Aspect

### 🧪 Step by Step

1. **Get CSRF token** — POST login requires CSRF protection
2. **Send login request** — with valid username and password
3. **Check the response** — successful login returns user details
4. **Check the console** — you should see:

```
Login success for user: john@example.com with roles: ROLE_USER
```

This message comes from `LoginSuccessAuditAspect` — not from any controller or service code.

---

## Real-World Applications of AfterReturning

| Scenario | What You'd Do |
|----------|---------------|
| **Login auditing** | Log who logged in, when, from which IP |
| **Email notifications** | Send "New login detected" email after successful auth |
| **Metrics collection** | Record successful operation counts |
| **Caching results** | Cache the return value for future calls |
| **Data transformation** | Process or enrich the returned data |

---

## ✅ Key Takeaways

- **AfterReturning** runs only on **successful** method execution — not when exceptions are thrown
- Use the `returning` attribute to capture the target method's return value
- The `returning` value name must **exactly match** the method parameter name
- Use `Object` as the parameter type for flexibility and reusability
- **After** advice runs regardless of success/failure but **cannot** access the return value
- AfterReturning is perfect for **auditing, notifications, and post-processing**

---

## ⚠️ Common Mistakes

- **Mismatched names** — the `returning = "response"` value must match the parameter name `Object response`
- **Using `@After` when you need the return value** — `@After` doesn't give you access to the result
- **Not handling null/unexpected types** — always check types before casting
- **Confusing `@After` and `@AfterReturning`** — `@After` runs always, `@AfterReturning` runs only on success

---

## 💡 Pro Tips

- If you need logic that runs on BOTH success and failure, use `@After`
- If you need the return value, you MUST use `@AfterReturning`
- For login auditing in production, consider also logging the IP address, timestamp, and device info
- You can modify the returned object in AfterReturning (it's the same reference), but be cautious — this can cause unexpected behavior
