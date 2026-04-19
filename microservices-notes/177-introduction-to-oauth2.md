# Introduction to OAuth2

## Introduction

Now that we understand *why* OAuth2 exists, let's define *what* it actually is, and explore its core advantages. OAuth2 isn't just another security library — it's a **specification** that fundamentally changed how the entire internet handles authorization.

---

## What is OAuth2?

**OAuth** stands for **Open Authorization**. Let's break that down:

- **Open** — It's a free, open-source protocol. Anyone can implement it.
- **Authorization** — Its primary focus is controlling *what* a user or application can do.

OAuth2 is built on IETF standards and licensed under the Open Web Foundation. The current version is **OAuth 2.0**, and the authors are working on **OAuth 2.1** (which cleans up and consolidates the spec).

### The One-Line Definition

> OAuth2 allows an application to grant permissions to access data in another application, without sharing passwords.

This process of granting permissions to third-party applications is called **authorization** or **delegated authorization** — because you're delegating access rights on your behalf.

---

## Key Advantages of OAuth2

### 1. Supports All Types of Applications and Scenarios

This is huge. OAuth2 isn't limited to web apps. It defines different **grant flows** for different communication scenarios:

| Scenario | Grant Flow |
|----------|-----------|
| Two backend servers communicating | Client Credentials |
| UI/mobile app calling a backend | Authorization Code (with PKCE) |
| IoT devices, smart TVs, consoles | Device Authorization |

No matter what kind of application or device you're building, OAuth2 has a grant flow designed for your use case. We'll explore the most relevant flows for microservices in this section.

### 2. Separation of Auth Logic

OAuth2 mandates a dedicated **Authorization Server** that handles all authentication and authorization. This server:
- Receives login requests from client applications
- Validates credentials
- Issues access tokens

The business logic of your applications stays completely separate from security logic. This is why organizations like Google, GitHub, and Facebook can have dozens of products all using the same login system.

And it's not just for internal apps — the auth server can also be accessed by **third-party applications** (like StackOverflow accessing GitHub's auth server). This would be impossible if auth logic was embedded inside the business server.

### 3. No Credential Sharing — Token-Based Access

The end user never shares their password with third-party applications. Instead, the auth server issues a **temporary access token** with specific privileges.

#### The Hotel Analogy

Think of checking into a five-star hotel:
- At reception, they verify your booking and give you an **access card**
- This card opens **only your room** and lets you take the elevator **only to your floor**
- If you lose the card, the hotel can **remotely invalidate** it and issue a new one
- The housekeeping staff gets a **different card** with broader access (any room)

OAuth2 works exactly the same way:
- The auth server issues **access tokens** (your key card)
- Each token has specific **scopes** (your room access level)
- Tokens are **temporary** and can be revoked
- Different clients get tokens with **different privileges**

---

## ✅ Key Takeaways

- OAuth2 = Open Authorization — a free, open-source security specification (currently version 2.0)
- It supports every type of application scenario through different grant flows
- Core principle: separate auth logic into a dedicated Authorization Server
- Users never share passwords — temporary access tokens with defined scopes are used instead
- Think of tokens like hotel key cards: temporary, scoped, and revocable
- All user/client credentials live in one place — the auth server
