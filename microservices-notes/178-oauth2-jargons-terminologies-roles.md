# OAuth2 Jargons, Terminologies & Roles

## Introduction

If you want to explain OAuth2 confidently — in an interview, in a design discussion, or in a code review — you need to speak its language. OAuth2 has a specific vocabulary, and using these terms correctly will instantly show that you know what you're talking about.

Let's break down each role and term with clear, relatable examples.

---

## The Four Key Roles

### 1. Resource Owner

**Who is it?** The end user who *owns* the data (resources).

In the StackOverflow + GitHub scenario:
- **You** are the resource owner
- Your resources are your **email address**, **display name**, and **profile details** stored in GitHub

In the Google Photos scenario:
- **You** are the resource owner
- Your resources are the **photos** stored in Google Photos

The resource owner is the person who grants (or denies) permission for a third-party to access their data.

### 2. Client

**Who is it?** The application that wants to access the resource owner's data.

In the StackOverflow scenario:
- **StackOverflow** is the client
- It wants to access your GitHub resources (email, profile) on your behalf

A client can be a website, a mobile app, or a backend API. The key characteristic is: it needs access to resources that belong to someone else, stored on some other server.

### 3. Authorization Server

**Who is it?** The server that authenticates the resource owner and issues access tokens.

In the StackOverflow scenario:
- **GitHub's auth server** is the authorization server
- It knows about you (you have a GitHub account)
- It validates your credentials and issues tokens to StackOverflow

⚠️ **Important:** The resource owner **must** have an account with the authorization server. You can't use "Sign in with GitHub" if you don't have a GitHub account. The auth server only authenticates users it knows about.

### 4. Resource Server

**Who is it?** The server where the resource owner's data is actually stored.

In the StackOverflow scenario:
- **GitHub's API server** is the resource server
- It holds your profile data, email, repositories, etc.

The flow: Client gets a token from the Auth Server → Client sends the token to the Resource Server → Resource Server validates the token and returns the requested data.

💡 **Insight:** In large organizations like Google or GitHub, the Authorization Server and Resource Server are typically *separate* systems. The auth server handles identity; the resource server handles data.

---

## Scopes: Controlling Privileges

### What Are Scopes?

Scopes are **granular permissions** that define what the client application can do with the access token. Think of them as the "rules of engagement" for the token.

When the auth server issues a token, it embeds scopes that dictate exactly what actions the client can perform.

### Real-World Example

When you click "Sign up with GitHub" on StackOverflow, GitHub shows you a consent screen:

```
Stack Exchange wants to access:
✅ Personal user data → Email address (read-only)
```

This means StackOverflow requested the **email read-only** scope. GitHub is asking you: "Are you okay with this?"

Notice what StackOverflow **cannot** do:
- ❌ Create repositories on your behalf
- ❌ Delete your code
- ❌ Access your private repos
- ❌ Change your password

If StackOverflow had requested repository access, that scope would appear on the consent screen, and you could **deny** it.

### GitHub's Scope Documentation

GitHub publishes all supported scopes in their docs:

| Scope | Access Level |
|-------|-------------|
| `repo` | Full access to public and private repositories (very powerful!) |
| `user:email` | Read-only access to email addresses |
| `read:user` | Read-only access to profile data |

The principle is simple: request only the minimum scopes you need. This follows the **principle of least privilege**.

---

## Putting It All Together

Here's the complete flow using all the jargons:

1. The **Resource Owner** (you) wants to log into a **Client** (StackOverflow) using GitHub
2. The Client redirects you to the **Authorization Server** (GitHub auth)
3. You authenticate with the Authorization Server (enter GitHub credentials)
4. The Authorization Server asks for consent based on requested **Scopes**
5. On approval, the Authorization Server issues an **Access Token** to the Client
6. The Client uses the Access Token to call the **Resource Server** (GitHub API)
7. The Resource Server validates the token and returns the **Resources** (your email, profile)

---

## ✅ Key Takeaways

- **Resource Owner** = the end user who owns the data
- **Client** = the application requesting access to resources
- **Authorization Server** = authenticates users and issues tokens
- **Resource Server** = stores and serves the actual resources
- **Scopes** = granular permissions controlling what a client can do with a token
- Always request minimum scopes needed (principle of least privilege)
- Master these terms — they're essential for interviews and design discussions
