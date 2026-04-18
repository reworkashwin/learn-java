# Tracing the Security Path — Internal Flow Demo (Part 1)

## Introduction

In the previous lecture, we discussed the Spring Security internal flow in theory. Now it's time to **see it in action**. In this lecture, we'll set breakpoints in the actual framework code and trace the flow step by step — from the login page, through filters, to the Authentication Manager and Authentication Providers. Understanding this hands-on will cement your knowledge of *who does what* in the security pipeline.

---

## The Key Filters

Spring Security has 15–20 filters. Let's focus on the three most important ones for authentication:

### 1. `AuthorizationFilter`

**What it does:** Examines every incoming request to determine:
- Is this a **public** path or a **secured** path?
- If secured, is the user **already authenticated** (via existing session)?
- If not authenticated, hand off to the next filter

Think of it as the first gate — it decides whether you need to prove your identity or not.

### 2. `DefaultLoginPageGeneratingFilter`

**What it does:** If the user needs to authenticate and Form Login is enabled, this filter **generates the default HTML login page**.

Inside this filter:
- There's a `doFilter()` method that calls `generateLoginPageHtml()`
- The `generateLoginPageHtml()` method uses an HTML template to build the login form
- This is the **exact code** that produces the login page you see in the browser

### 3. `UsernamePasswordAuthenticationFilter`

**What it does:** After the user submits credentials via the form login page, this filter:
1. **Extracts** the username from the request (`obtainUsername()`)
2. **Extracts** the password from the request (`obtainPassword()`)
3. **Creates** a `UsernamePasswordAuthenticationToken` — an implementation of the `Authentication` interface
4. **Forwards** the token to the `AuthenticationManager`

---

## The Authentication Object — `UsernamePasswordAuthenticationToken`

### 🧠 What Is It?

This is the concrete class that represents a user's credentials during authentication. It implements the `Authentication` interface (through `AbstractAuthenticationToken`).

### ⚙️ What Does It Store?

| Field              | What It Holds                   |
|--------------------|---------------------------------|
| `principal`        | The username                    |
| `credentials`      | The password                    |
| `authorities`      | Collection of roles/permissions |
| `authenticated`    | Boolean — is authentication done? |

### Key Methods

- `isAuthenticated()` — Returns whether authentication was successful
- `setAuthenticated(true)` — Called after successful authentication
- The `unauthenticated()` factory method creates a token where `authenticated = false` (used initially)
- The `authenticated()` factory method creates a token where `authenticated = true` (used after success)

---

## The Authentication Manager — `ProviderManager`

### 🧠 What Happens Here?

The `ProviderManager` is the implementation of `AuthenticationManager`. Its `authenticate()` method:

1. Gets all registered **Authentication Providers**
2. **Iterates** through each provider in a for loop
3. For each provider, asks: **"Do you support this authentication type?"** by calling `supports()`
4. If the provider says yes → calls `authenticate()` on that provider
5. If the provider says no → `continue` to the next provider
6. Handles exceptions if authentication fails

### ❓ Why Check `supports()` First?

Performance! Imagine you have:
- A provider for username/password
- A provider for OTP
- A provider for biometric

If the user submitted a username/password, there's no point executing the OTP or biometric provider. The `supports()` method lets each provider opt-in or opt-out based on the token type.

---

## The Default Authentication Provider — `DaoAuthenticationProvider`

### 🧠 What Is It?

When you haven't defined any custom Authentication Provider, Spring Security uses `DaoAuthenticationProvider` by default.

### ⚙️ The `supports()` Method

```java
public boolean supports(Class<?> authentication) {
    return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
}
```

Translation: "I support authentication when the token is of type `UsernamePasswordAuthenticationToken`."

### ⚙️ The `authenticate()` Method

This method lives in the parent abstract class (`AbstractUserDetailsAuthenticationProvider`):

1. **Extract username** from the Authentication object
2. **Check cache** — are user details already cached?
3. If not cached → call **`retrieveUser()`**
4. `retrieveUser()` → calls **`UserDetailsService.loadUserByUsername()`** to fetch user data from storage
5. Perform **additional authentication checks** (password comparison)
6. If passwords match → create a **success Authentication** token
7. If passwords don't match → throw `BadCredentialsException`

---

## Tracing the Request — Step by Step

Here's what happens when you enter credentials on the login page and click **Sign In**:

```
1. Browser sends POST /login with username & password
       ↓
2. UsernamePasswordAuthenticationFilter intercepts
       ↓
3. Extracts username via obtainUsername(request)
   Extracts password via obtainPassword(request)
       ↓
4. Creates UsernamePasswordAuthenticationToken (unauthenticated)
       ↓
5. Calls AuthenticationManager.authenticate(token)
       ↓
6. ProviderManager iterates through providers
       ↓
7. DaoAuthenticationProvider.supports() → returns true
       ↓
8. DaoAuthenticationProvider.authenticate() is called
       ↓
9. retrieveUser() → UserDetailsService.loadUserByUsername("madan")
       ↓
10. User details loaded from storage
       ↓
11. Password comparison happens (via PasswordEncoder)
       ↓
12. Success → UsernamePasswordAuthenticationToken created with authenticated=true
       ↓
13. Stored in SecurityContext
       ↓
14. Response sent to browser with JSESSIONID cookie
```

---

## Form Login vs. HTTP Basic — The Only Difference

The entire flow is **identical** for both Form Login and HTTP Basic authentication. The **only difference** is which filter extracts the credentials:

| Authentication Type | Filter Used                               | How Credentials Are Read          |
|--------------------|-------------------------------------------|-----------------------------------|
| Form Login         | `UsernamePasswordAuthenticationFilter`     | From form POST body              |
| HTTP Basic         | `BasicAuthenticationFilter`               | From `Authorization` header       |

After the extraction step, both paths converge → `AuthenticationManager` → `DaoAuthenticationProvider` → same flow.

---

## ✅ Key Takeaways

1. **`AuthorizationFilter`** — First checkpoint; decides if the path is public or secured
2. **`DefaultLoginPageGeneratingFilter`** — Generates the HTML login page when Form Login is enabled
3. **`UsernamePasswordAuthenticationFilter`** — Extracts credentials from form submissions and creates the `Authentication` token
4. **`ProviderManager`** — Iterates providers and delegates authentication; checks `supports()` before calling `authenticate()`
5. **`DaoAuthenticationProvider`** — The default provider; fetches user details and compares passwords
6. Form Login and HTTP Basic follow the **same flow** — only the credential extraction filter differs

---

## ⚠️ Common Mistakes

- **Confusing the filters** — remember: `AuthorizationFilter` (checks access), `DefaultLoginPageGeneratingFilter` (shows login page), `UsernamePasswordAuthenticationFilter` (extracts form credentials)
- **Thinking AuthenticationManager does the authentication** — it only *manages* and *delegates*
- **Not understanding `supports()`** — this method prevents unnecessary provider execution

---

## 💡 Pro Tips

- You can debug the entire Spring Security flow by setting breakpoints in these framework classes — a great way to learn how it works
- In your IDE, use "Search Everywhere" with "All Places" selected and "Inherited Members" checked to find overridden methods in subclasses
- The `Authentication` object flows through the entire chain like a baton in a relay race — if you understand this object, you understand the flow
