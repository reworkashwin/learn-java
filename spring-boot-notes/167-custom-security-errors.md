# Customizing Security Errors in Spring Security

## Introduction

We discovered a problem: when authorization fails, Spring Security returns `401 Unauthorized` instead of `403 Forbidden`. This is misleading — the user *is* authenticated, they just lack the right role. Let's understand *why* this happens and how to fix it with proper custom error responses.

---

## Understanding the Problem

### The ExceptionTranslationFilter

Inside Spring Security's filter chain, there's a filter called `ExceptionTranslationFilter`. This filter handles two types of exceptions:

1. **`AuthenticationException`** → User is not authenticated → Should return `401`
2. **`AccessDeniedException`** → User is authenticated but lacks permissions → Should return `403`

For `AuthenticationException`, it invokes the **`AuthenticationEntryPoint`**.

For `AccessDeniedException`:
- If the user is anonymous → Invokes `AuthenticationEntryPoint` (treats it as auth issue)
- If the user is authenticated → Invokes **`AccessDeniedHandler`** (returns `403`)

### Why We Get 401 Instead of 403

The root cause? We had **HTTP Basic authentication enabled** even though we weren't using it:

```java
http.httpBasic(Customizer.withDefaults()); // This was causing the problem!
```

With HTTP Basic enabled, the `BasicAuthenticationEntryPoint` kicks in for all security exceptions and always returns `401` — regardless of whether it's an authentication or authorization failure.

Since we use **manual authentication** (via `AuthenticationController` with JWT), we don't need HTTP Basic at all.

---

## The Fix — Part 1: Disable HTTP Basic

```java
http.httpBasic(AbstractHttpConfigurer::disable);
```

By disabling HTTP Basic, the `BasicAuthenticationEntryPoint` no longer intercepts authorization exceptions. Now the `AccessDeniedHandler` can properly return `403`.

After this fix, authorization failures correctly return `403 Forbidden` — but the response body is empty. We want meaningful error messages.

---

## The Fix — Part 2: Custom Exception Handling

Spring Security provides the `exceptionHandling()` method in the security configuration to define custom behavior for both scenarios:

```java
http.exceptionHandling(exception -> exception
    .accessDeniedHandler((request, response, accessDeniedException) -> {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write(
            "{\"error\": \"AccessDenied\", \"message\": \"You don't have permission to access this resource\"}"
        );
    })
    .authenticationEntryPoint((request, response, authException) -> {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(
            "{\"error\": \"Unauthorized\", \"message\": \"Authentication required\"}"
        );
    })
);
```

### What Each Handler Does

**`accessDeniedHandler`** — Triggered when authorization fails (authenticated user, wrong role):
- Sets status to `403 Forbidden`
- Returns JSON body with error details

**`authenticationEntryPoint`** — Triggered when authentication fails:
- Sets status to `401 Unauthorized`
- Returns JSON body with error details

---

## A Nuance — AuthenticationController Already Handles 401

In our application, login errors are already handled inside `AuthenticationController` with a custom `buildErrorResponse()` method. So the `authenticationEntryPoint` in the security config might conflict.

The solution? You can **comment out** the `authenticationEntryPoint` configuration if your controller already sends proper `401` responses. The custom `accessDeniedHandler` is the important one — it ensures `403` is returned for authorization failures.

---

## Testing the Fix

### Authorization Failure (Regular user accessing admin endpoint):

```json
// Status: 403 Forbidden
{
    "error": "AccessDenied",
    "message": "You don't have permission to access this resource"
}
```

### Authentication Failure (Invalid credentials):

```json
// Status: 401 Unauthorized
// (Handled by AuthenticationController's error response)
```

### Successful Admin Request:

```json
// Status: 200 OK
// (Returns contact messages array)
```

---

## ✅ Key Takeaways

- `ExceptionTranslationFilter` routes authentication exceptions to `AuthenticationEntryPoint` and authorization exceptions to `AccessDeniedHandler`
- Having HTTP Basic **enabled but unused** causes all security errors to return `401` — disable it with `AbstractHttpConfigurer::disable`
- Use `exceptionHandling()` to customize error responses for both `401` and `403` scenarios
- Always return **JSON responses** with meaningful error messages, not empty bodies
- If your controller already handles authentication errors, you may not need a custom `authenticationEntryPoint`

## ⚠️ Common Mistake

> Leaving `http.httpBasic(Customizer.withDefaults())` enabled when you're using JWT-based authentication. This silently overrides the error handling and returns `401` for everything. Always disable features you're not actively using.

## 💡 Pro Tip

> When configuring security, think about all four scenarios: (1) public access, (2) successful authenticated access, (3) authentication failure, and (4) authorization failure. Each should return an appropriate status code and message.
