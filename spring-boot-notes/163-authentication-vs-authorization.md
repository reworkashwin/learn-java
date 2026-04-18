# Authentication vs Authorization

## Introduction

These two words — **authentication** and **authorization** — sound similar, and beginners often confuse them. But in security, they represent two completely different checks that happen at different stages. Understanding this distinction is *fundamental* before you can implement any role-based access control.

Let's break them apart clearly.

---

## What Is Authentication?

### 🧠 The Concept

Authentication answers one simple question: **"Who are you?"**

It's the process of verifying a user's identity. When someone provides their email and password, the system checks: "Are these credentials valid? Does this person exist in my database?"

- **Input required:** Username/email + Password
- **What it proves:** The user is who they claim to be
- **Short form:** **AuthN**
- **HTTP status on failure:** `401 Unauthorized`

Think of it as the **first gate** — you can't do anything in the system until you prove your identity.

---

## What Is Authorization?

### 🧠 The Concept

Authorization answers a different question: **"What can you do?"**

Once the system *knows* who you are (authentication passed), it then checks whether you have the **right privileges, roles, or permissions** to access a specific resource.

- **Input required:** User's roles/privileges (loaded from database after login)
- **What it proves:** The user has permission to perform the requested action
- **Short form:** **AuthZ**
- **HTTP status on failure:** `403 Forbidden`

The 403 response essentially tells the user: *"I know who you are, I accept you're a valid user, but you don't have permission to access this resource."*

---

## The Order Matters

Here's a critical point — **authentication always happens before authorization**:

```
User Request → Authentication (Who are you?) → Authorization (What can you do?) → Access Granted
```

Why? Because you can't check someone's permissions until you know who they are! During the login operation:
1. Verify the username and password
2. If valid, load the user's roles/privileges from the database
3. Store those roles in the authentication object
4. For subsequent requests, check if the user's roles match the required access level

---

## HTTP Status Codes — Know the Difference

| Scenario | Status Code | Meaning |
|---|---|---|
| Invalid credentials (wrong password) | `401 Unauthorized` | "I don't know who you are" |
| Valid credentials, insufficient permissions | `403 Forbidden` | "I know you, but you can't access this" |

⚠️ **Common Mistake:** Returning `401` when authorization fails. These are two distinct error codes for two distinct problems. Always use `403` for authorization failures.

---

## Real-World Analogy — The Airport

This analogy makes the difference unforgettable:

### Authentication = Airport Security Checkpoint

When you arrive at the airport, the security guard checks your **passport** and **boarding ticket**:
- Is this a valid passport? ✅
- Does the name on the ticket match the passport? ✅
- Is the ticket for today? ✅

The guard doesn't care *where* you're going. Their only job is to verify your **identity**. That's authentication.

### Authorization = Boarding Gate Check

After you pass security, you head to your gate. When boarding begins, the airline staff checks your ticket again:
- Is this ticket for *this* flight? ✅ → Board the plane
- Trying to board a flight to London when your ticket says Dubai? ❌ → "You're not authorized to board this flight"

You're a valid, authenticated traveler — but you're not **authorized** for this specific flight.

---

## Why Both Are Necessary

Can you build a secure application with only authentication? For simple apps, maybe. But for any **enterprise application** with multiple user types (admin, customer, employee, manager), you absolutely need both:

- A **customer** shouldn't be able to delete job postings
- An **employee** shouldn't be able to access admin dashboards  
- An **admin** should have full control

Without authorization, every logged-in user would have the exact same access — which defeats the purpose of having different user types.

---

## ✅ Key Takeaways

- **Authentication (AuthN):** Verifies identity → "Who are you?" → Uses credentials → `401` on failure
- **Authorization (AuthZ):** Verifies permissions → "What can you do?" → Uses roles/privileges → `403` on failure
- Authentication **always** happens before authorization
- Both are essential for building secure, real-world applications
- Spring Security provides built-in support for both

## 💡 Pro Tip

> Remember the airport analogy: **Security checkpoint = Authentication**, **Boarding gate = Authorization**. You can't reach the gate without passing security first, and passing security doesn't mean you can board any flight.
