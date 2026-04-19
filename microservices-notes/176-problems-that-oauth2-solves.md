# Problems That OAuth2 Solves

## Introduction

Before we dive into OAuth2, let's understand *why* it exists in the first place. What was the world like before OAuth2? What problems did developers face with basic authentication? And how does OAuth2 elegantly solve them?

Understanding the "why" will make everything about OAuth2 click instantly.

---

## The Old World: Basic Authentication

### How It Worked

Back in the early days of the web, security was straightforward:

1. User enters credentials (username + password) into an HTML form
2. Credentials are sent to the backend server
3. Backend validates the credentials
4. On success, the server generates a **session** and stores it in a **browser cookie**
5. As long as the session is active, the user can access protected resources

Simple, right? So what's the problem?

### Drawback 1: Tight Coupling of Business and Auth Logic

With basic authentication, your backend server contains **both** business logic and authentication logic in the same deployment. This means:
- A change in authentication logic could break business logic
- You need extensive regression testing for any security change
- Scaling them independently is impossible

This approach is also **not mobile-friendly** or **REST API-friendly** — sessions and cookies don't translate well to native mobile apps or stateless API communication.

### Drawback 2: No Solution for Third-Party Access

Here's the big one. Imagine this scenario:

You store your photos in **Google Photos**. A third-party website offers amazing photo editing features — collages, filters, enhancements. But to use them, you need to import your Google Photos into that website.

With basic authentication, the only option is to **give the third-party website your Google credentials**. You're trusting them not to misuse your password. You're trusting them to only read your photos and not delete them, send emails from your account, or change your password.

That's a terrible security model. And yet, before OAuth2, this was common.

---

## Problem 1: Centralized Authentication Across Products

Think about Google. They have Gmail, YouTube, Google Photos, Google Maps, Google Drive — dozens of products. Have you ever wondered how you use the **same login** across all of them?

The answer is OAuth2's core recommendation: **separate all authentication and authorization logic into a dedicated component** called an **Authorization Server**.

Every Google product — Gmail, YouTube, Maps — connects to the *same* auth server for login. This means:
- One place to manage credentials
- One place to update security policies
- One place to enforce multi-factor authentication
- If a security requirement changes, you update one server, not fifty applications

💡 **Insight:** This is why your Google login works everywhere — behind the scenes, every Google product delegates authentication to a single centralized auth server that follows OAuth2 principles.

---

## Problem 2: Sharing Access Without Sharing Credentials

This is OAuth2's signature feature. Let's see it in action with a real-world example.

### The StackOverflow Demo

Go to StackOverflow and click **Sign Up**. You'll see options:
- Sign up with email/password (basic approach)
- Sign up with **Google**, **GitHub**, or **Facebook**

When you click "Sign up with GitHub":

1. You're **redirected to GitHub's website** (not StackOverflow's!)
2. You enter your GitHub credentials **on GitHub's domain** — StackOverflow never sees your password
3. GitHub authenticates you and asks for your **consent**: "Do you want to share your email and display name with StackOverflow?"
4. After you approve, GitHub issues a **temporary access token** to StackOverflow
5. You're redirected back to StackOverflow, now logged in with your GitHub identity

### What Just Happened?

- StackOverflow **never received your GitHub password**
- GitHub gave StackOverflow a **limited access token** — it can only read your email and display name
- StackOverflow **cannot** create repositories, delete your code, or do anything beyond what that token allows
- The token is **temporary** — it expires, and StackOverflow can't do anything after that

This is the magic of OAuth2. You grant **limited, temporary access** to a third-party application without ever sharing your master credentials.

Think of it like giving a **valet key** to a parking attendant — it can start the car and drive it, but it can't open the trunk or the glove box.

---

## Summary of What OAuth2 Solves

| Problem | Before OAuth2 | With OAuth2 |
|---------|--------------|-------------|
| Multiple apps, same login | Each app manages its own auth | Centralized auth server for all apps |
| Third-party access | Share your actual credentials | Temporary access tokens with limited scope |
| Coupling | Auth logic mixed with business logic | Auth server is a separate component |
| Mobile/API support | Session-based (cookie-dependent) | Token-based (works everywhere) |

---

## ✅ Key Takeaways

- Basic authentication tightly couples auth and business logic, doesn't support third-party access, and isn't API/mobile-friendly
- OAuth2 solves the centralized login problem — one auth server, many applications
- OAuth2's signature feature: granting third-party access without sharing credentials, using temporary access tokens
- The third-party app only gets limited privileges (scopes), not full account access
- Tokens are temporary and can be revoked, unlike shared passwords
