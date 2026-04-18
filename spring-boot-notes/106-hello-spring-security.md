# Hello Spring Security — Your First Handshake with the Framework

## Introduction

So far, we've built backend REST APIs that interact with a database using Spring Data JPA. But there's a critical piece missing — **security**. Think about it: would you open a bank account with a bank that has zero security? Of course not! The same logic applies to any enterprise application — insurance, healthcare, finance — they all need to be secured. In this section, we'll meet **Spring Security**, a powerful framework in the Spring ecosystem that helps you protect your Spring-based applications.

---

## What Is Spring Security?

### 🧠 The Big Picture

Spring Security is a dedicated project under the Spring ecosystem that focuses **exclusively** on security. Just like Spring Data JPA is the go-to for database interaction, Spring Security is the go-to for securing your application.

Here's what Spring Security brings to the table:

- **Authentication** — Verifying *who* the user is (e.g., username + password)
- **Authorization** — Deciding *what* the user is allowed to do (e.g., admin vs. regular user)
- **Seamless Spring Boot integration** — Works out-of-the-box with minimal setup
- **Protection for any resource** — REST APIs, web pages, anything
- **Highly customizable** — Tweak it as much as your business requirements demand
- **Built-in defenses** — Protects against common attacks like CSRF, CORS issues, Session Fixation, and more
- **Multiple login approaches** — Username/password from databases, LDAP, OAuth2, JWT tokens, SAML, and more

💡 **Pro Tip:** Spring Security is so extensive that it has its own dedicated courses. In this course, we'll focus on the fundamentals — storing credentials in a database and securing REST APIs.

---

## Adding Spring Security to Your Project

### ⚙️ How to Add It

All you need is **one Maven dependency**. Here's how:

1. Go to [start.spring.io](https://start.spring.io)
2. Click **Add Dependencies**
3. Search for **Spring Security**
4. Click **Explore** to see the `pom.xml` entry
5. Copy the dependency into your project's `pom.xml`

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

> There's also a unit-testing dependency for Spring Security, but we won't need it for now.

After adding the dependency:
- Sync Maven changes
- Rebuild the project
- Start the application

And that's when the **magic** begins. 🪄

---

## What Happens After Adding the Dependency?

### 🔒 Everything Gets Locked Down

The moment you add Spring Security to your classpath, **every single REST API in your application is secured by default**. No request will be accepted without authentication credentials.

Here's what you'll observe:

1. **UI Application Breaks** — If you had a frontend talking to your backend, it'll stop working. You'll see CORS policy errors in the browser console. This is because Spring Security requires CORS configuration to follow its own standards (we'll fix this later).

2. **Postman Returns a Login Page** — If you try to hit any GET endpoint from Postman, instead of JSON data, you'll get an HTML login page as the response.

3. **Browser Shows Login Page** — Accessing any GET endpoint in the browser redirects you to a default login page provided by Spring Security.

### 🧪 Testing It Out

When you try to invoke `GET /api/companies` from Postman:
- Instead of the expected JSON, you get **HTML** in the response
- If you click **Preview** in Postman, you'll see a login form asking for username and password

The same happens in the browser — navigating to `http://localhost:8080/api/companies` shows the login page.

> Who's providing this login page? **Spring Security** — it generates one for you automatically!

---

## How to Log In with Default Credentials

### 🔑 The Default Username and Password

Spring Security provides default credentials out of the box:

| Field    | Value                                      |
|----------|--------------------------------------------|
| Username | `user`                                     |
| Password | Auto-generated (check your application logs) |

To find the password:
1. Open your application console/logs
2. Scroll through the startup output
3. Look for: `Using generated security password: <some-long-value>`
4. Copy that value — that's your password

### 🧪 Logging In via Browser

1. Go to the login page
2. Enter username: `user`
3. Paste the generated password
4. Click **Sign In**
5. You'll see your API response (e.g., company and job details)

### 🧪 Logging In via Postman

1. Go to the **Authorization** tab of your request
2. Select **Basic Auth** as the auth type
3. Enter username: `user`
4. Paste the generated password
5. Click **Send** — you'll get the successful response

---

## Why POST/PUT/DELETE Requests Still Fail

### ⚠️ CSRF Protection

Even after providing valid credentials, if you try to invoke a POST, PUT, or DELETE endpoint, you'll still get blocked. Why?

This is because of **CSRF (Cross-Site Request Forgery) protection**, which Spring Security enables by default.

Here's the logic:
- **GET requests** = Read-only → No CSRF protection needed → ✅ Works fine
- **POST/PUT/DELETE requests** = Can modify data → CSRF protection kicks in → ❌ Blocked by default

> We'll learn how to properly handle CSRF protection in upcoming lectures. For now, only test GET endpoints.

---

## ✅ Key Takeaways

1. **Spring Security** is a dedicated framework for securing Spring-based applications — it handles authentication, authorization, and common attack prevention
2. **Adding one dependency** is all it takes to activate Spring Security — it immediately secures every endpoint
3. The **default username** is `user` and the **password** is auto-generated in the console logs
4. Spring Security supports two login styles: **Form Login** (browser login page) and **HTTP Basic** (credentials in request header)
5. **GET requests** work fine with basic auth, but **POST/PUT/DELETE** requests are blocked by **CSRF protection** by default

---

## ⚠️ Common Mistakes

- **Forgetting to check console logs** for the generated password — it changes every time the application restarts
- **Trying to test POST endpoints** right away — they'll fail due to CSRF protection, not because your credentials are wrong
- **Not syncing Maven** after adding the dependency — the framework won't be on the classpath

---

## 💡 Pro Tips

- The auto-generated password changes on every restart — don't memorize it, always check the logs
- In Postman, use the **Basic Auth** type under the Authorization tab — Postman handles the Base64 encoding for you
- We'll eventually replace this default setup with real user credentials stored in a database — this is just the starting point
