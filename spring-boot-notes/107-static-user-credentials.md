# Static User Credentials — Locking the Door with Custom Logins

## Introduction

In the previous lecture, we saw that Spring Security generates a random password every time the application starts. Checking the console logs for a new password on every restart? That's tedious. Luckily, Spring Security lets you **configure your own static username and password** directly in the `application.properties` file. This isn't production-grade — but it's perfect for demos, prototyping, and low-priority applications.

---

## Configuring Static Credentials

### 🧠 What's the Problem?

Every time your Spring Boot app restarts, Spring Security generates a **new random password**. You have to go dig through the console logs to find it. That's not practical, even for development.

### ⚙️ The Solution — `application.properties`

Spring Security provides three properties to configure static user details:

```properties
spring.security.user.name=madan
spring.security.user.password=Madan@123
spring.security.user.roles=USER,ADMIN
```

Let's break these down:

| Property                         | What It Does                                    |
|----------------------------------|-------------------------------------------------|
| `spring.security.user.name`      | Sets the username (overrides the default `user`) |
| `spring.security.user.password`  | Sets the password (no more random generation)   |
| `spring.security.user.roles`     | Assigns roles to the user (for authorization)   |

### ❓ What About Roles?

Roles are used for **authorization** — controlling *what* a user can do. For example:
- A `USER` role might only be able to read data
- An `ADMIN` role might be able to create, update, and delete data

We'll dive deep into authorization later. For now, just know you can assign multiple roles using commas.

---

## What Changes After Adding These Properties?

Once you add these properties and restart:

1. **No more auto-generated password** in the console logs — Spring Security sees your custom credentials and skips password generation
2. The **default username `user`** is replaced with whatever you configured
3. Your configured password is the only valid password

### 🧪 Testing in the Browser

1. Navigate to your secured API: `http://localhost:8080/api/companies`
2. The login page appears
3. Enter your custom username and password
4. Click **Sign In** → you get the response

What happens if you enter **wrong credentials** (e.g., `madan1` instead of `madan`)? Spring Security validates them and returns an **"Invalid credentials"** message. The framework handles all the validation for you!

### 🧪 Testing in Postman

1. Under the **Authorization** tab, select **Basic Auth**
2. Enter your custom username and password
3. Click **Send** → successful response

---

## Organizing Postman for Security Testing

Here's a good practice as you work with Spring Security:

1. Create a **Security** folder in Postman
2. Inside it, create sub-folders like **Company** and **Contacts**
3. Copy your existing API requests into these folders
4. Configure authorization (Basic Auth) on each request with your static credentials

This keeps your security testing organized and separate from your non-security requests.

---

## ✅ Key Takeaways

1. Use `spring.security.user.name`, `spring.security.user.password`, and `spring.security.user.roles` in `application.properties` to set static credentials
2. Once configured, Spring Security **stops generating** the random password
3. Invalid credentials are automatically validated and rejected by the framework
4. This approach is **not production-ready** — it's a single user with hardcoded credentials
5. Production apps need registration pages, database-backed credentials, and multi-user support — we'll build toward that

---

## ⚠️ Common Mistakes

- **Forgetting to rebuild** after changing `application.properties` — old credentials will still be active
- **Testing with the UI application** at this stage — it won't work yet because CORS configurations need to be updated for Spring Security. We'll do that later
- **Using this approach in production** — a single static user is only suitable for demos and internal tools

---

## 💡 Pro Tips

- Think of static credentials as training wheels — great for learning and quick demos, but you'll outgrow them fast
- For low-priority internal tools or quick prototypes, static credentials save setup time
- Always plan for a proper user management system (database-backed) in production
