# What Happens Under the Hood — Spring Security Internals

## Introduction

Before we jump into advanced Spring Security features, we need to understand *how* the framework works internally. Knowing the internal flow is not just academic — it's **essential** for implementing custom authentication providers, user detail services, and password encoders in the coming sections. In this lecture, we'll walk through the **complete Spring Security authentication flow**, every component involved, and use a brilliant **SDLC analogy** to make it stick.

---

## The Spring Security Internal Flow — Overview

When an end user tries to access a REST API or web page, the request passes through several components before reaching your controller. Here's the full chain:

```
End User → Spring Security Filters → Authentication Manager → Authentication Providers
                                                                    ↓
                                                            UserDetailsService / UserDetailsManager
                                                                    ↓
                                                              PasswordEncoder
                                                                    ↓
                                                         Security Context (store result)
                                                                    ↓
                                                              Controller Layer
```

Let's break down each component.

---

## Component 1: Spring Security Filters

### 🧠 What Are They?

The **first line of defense**. Spring Security has around **15–20 filters** that intercept every incoming request. Think of them as bouncers at the door of a nightclub.

### ⚙️ What Do They Do?

1. **Examine the request path** — Is this a public path or a secured path?
2. **Check existing sessions** — Has this user already authenticated? (via `JSESSIONID` cookie)
3. **Redirect to login** — If the path is secured and the user isn't authenticated, show the login page
4. **Extract credentials** — Once the user submits credentials, the filter extracts the username and password from the request
5. **Create an Authentication object** — Converts the raw credentials into a structured `Authentication` object

### ❓ Why Convert to an Authentication Object?

Without this step, every component down the chain would have to dig into the raw HTTP request to find credentials. By extracting them early into a standard `Authentication` object, all subsequent components can simply call `getUsername()`, `getPassword()`, etc.

The `Authentication` object stores:
- **Principal** — The username
- **Credentials** — The password
- **Authorities** — Roles/permissions
- **Authenticated flag** — Whether authentication was successful

---

## Component 2: Authentication Manager

### 🧠 What Is It?

An **interface** (`AuthenticationManager`) whose job is to **initiate** the authentication process. Its default implementation is `ProviderManager`.

### ⚙️ What Does It Do?

- Receives the `Authentication` object from the filters
- **Iterates through all registered Authentication Providers**
- Asks each provider: "Can you handle this type of authentication?"
- Delegates the actual authentication work to the matching provider

Think of it as a **delivery manager** — it doesn't do the work itself, but it knows who to assign it to.

---

## Component 3: Authentication Providers

### 🧠 What Are They?

The components that **actually perform authentication**. Each provider handles a specific *style* of authentication.

### ❓ Why Multiple Providers?

A web application might support multiple login methods:
- Username + Password
- OTP (One-Time Password)
- Biometric
- Social login (Google, GitHub)

Each method needs its own authentication logic → hence, **multiple providers**.

### ⚙️ How Does It Work?

The Authentication Manager iterates through all providers and asks: "Do you support `UsernamePasswordAuthenticationToken`?" (or whatever token type is being used). If a provider says yes, it handles the authentication. Others are skipped.

The default provider is **`DaoAuthenticationProvider`**, which supports username/password authentication.

---

## Component 4: UserDetailsService / UserDetailsManager

### 🧠 What Are They?

These components **load user information from a storage system** (database, in-memory, LDAP, etc.).

| Interface              | Responsibility                                       |
|------------------------|------------------------------------------------------|
| `UserDetailsService`   | Load user details by username (`loadUserByUsername()`) |
| `UserDetailsManager`   | Full CRUD — create, update, delete, change password   |

### ❓ Why Two Interfaces?

Some projects handle user creation/deletion **outside** of Spring Security (e.g., via custom admin panels). These projects only need `UserDetailsService` to load users during authentication.

Others want Spring Security to handle everything — those use `UserDetailsManager`.

### ⚙️ How Does It Work?

1. The Authentication Provider passes the username to `UserDetailsService`
2. The service loads the user from the database (or memory)
3. Returns a `UserDetails` object containing the stored username, password, roles, etc.
4. The provider now has **two sets of credentials**: what the user entered, and what's stored in the database

---

## Component 5: Password Encoder

### 🧠 What Is It?

The component responsible for **securely handling passwords**.

### ❓ Why Not Store Passwords in Plain Text?

If your password `Madan@123` is stored as-is in the database, anyone with database access can read it. That's a catastrophic security flaw.

### ⚙️ What Does the Password Encoder Do?

1. **During Registration** — Hashes the password before storing it in the database
2. **During Login** — Compares the entered password with the stored hash

**Hashing** is a one-way operation:
- Plain text → Hash value ✅ (easy)
- Hash value → Plain text ❌ (impossible)

Even if someone hacks your database, all they see are hash values — they can't reverse-engineer the original passwords.

> "But if hashing is one-way, how do you compare passwords during login?" — Great question! We'll cover this in detail in coming lectures. The short answer: the encoder hashes the entered password and compares the **two hash values**.

---

## Component 6: Security Context

### 🧠 What Is It?

The **storage area** where successful authentication details are kept. After a user is authenticated:

1. The result is stored in the **Security Context** along with the `JSESSIONID`
2. The `JSESSIONID` is sent to the browser as a cookie
3. On future requests, the browser sends the cookie back
4. The filters check the Security Context — if a matching session exists, **skip the entire authentication flow**
5. The request goes directly to the controller

This is why you don't have to log in for every single API call — the session remembers you.

---

## The SDLC Analogy — Making It Stick

To help remember this flow, here's a brilliant analogy using the **Software Development Lifecycle (SDLC)**:

| Spring Security Component         | SDLC Equivalent                          |
|------------------------------------|------------------------------------------|
| End User (entering credentials)    | Client/Business People (giving requirements) |
| Spring Security Filters            | Business Analysts / Product Owners       |
| Authentication Object              | User Story (in Jira)                     |
| Authentication Manager             | Delivery Manager                         |
| Authentication Providers           | Team Leads                               |
| UserDetailsService/Manager         | Developers and QAs                       |
| Password Encoder                   | Security/Vulnerability Scanner           |
| Security Context                   | Jira/Confluence (storing results)        |

### 🧪 The Story

1. **Client** (end user) provides **requirements** (credentials)
2. **Business Analysts** (filters) validate the requirements, check if already handled, and convert them into a **User Story** (Authentication object)
3. The **Delivery Manager** (AuthenticationManager) receives the User Story but doesn't implement it himself
4. He forwards it to the **Team Leads** (Authentication Providers) based on the type of work
5. Team Leads rely on **Developers & QAs** (UserDetailsService) to actually implement and test
6. The **Security guy** (PasswordEncoder) scans for vulnerabilities
7. Once done, results are stored in **Jira** (Security Context) for future reference

---

## ✅ Key Takeaways

1. **Filters** are the first contact point — they intercept requests, check sessions, extract credentials, and create `Authentication` objects
2. **AuthenticationManager** (`ProviderManager`) initiates authentication but delegates to providers
3. **AuthenticationProviders** perform the actual authentication — each handles a specific style (username/password, OTP, etc.)
4. **UserDetailsService** loads user data from storage; **UserDetailsManager** adds CRUD operations
5. **PasswordEncoder** ensures passwords are hashed (never plain text) and handles comparison during login
6. **SecurityContext** stores successful auth results to avoid re-authentication on every request
7. For **public paths** — none of this flow is triggered; the request goes directly to the controller

---

## ⚠️ Common Mistakes

- **Skipping internal flow understanding** — without this knowledge, you won't understand *why* we create custom providers and services in later sections
- **Confusing AuthenticationManager with AuthenticationProvider** — the Manager delegates, the Provider does the work
- **Storing passwords in plain text** — always use a PasswordEncoder

---

## 💡 Pro Tips

- Every interface mentioned (Authentication, AuthenticationManager, AuthenticationProvider, UserDetailsService, PasswordEncoder) has **default implementation classes** provided by Spring Security — you only write custom ones when you need custom behavior
- The SDLC analogy is a great way to explain Spring Security in interviews
- Understanding this flow is the foundation for everything we'll build next: custom providers, database-backed user storage, and password hashing
