# REST API Best Practices

## Introduction

Building a REST API is easy. Building a **professional-grade** REST API that follows industry standards? That's what separates a good developer from a great one.

As a Java backend developer, you'll create hundreds of REST APIs and work with thousands throughout your career — testing, debugging, fixing, and modifying them. Before we dive into building real APIs, let's nail down the **best practices and standards** you must follow. These aren't just academic rules — they're the conventions used by every serious backend team in the industry.

---

## Concept 1: What is REST API? (Quick Refresher)

### 🧠 What is it?

**REST** stands for **Representational State Transfer**. It's an architectural style that allows applications to communicate with each other over the HTTP protocol.

In the real world, you have:
- UI applications (React, Angular)
- Backend applications (Spring Boot)
- Mobile apps (Android, iOS)
- Microservices

When any of these want to talk to each other, they use **REST APIs** as the communication bridge.

### ⚙️ How does communication happen?

REST APIs exchange data primarily in **JSON format** (lightweight and widely adopted). XML is also supported but rarely used in modern applications.

Since REST uses HTTP, every API must be exposed using an **HTTP method** that describes the type of action being performed.

---

## Concept 2: HTTP Methods — Choosing the Right One

### 🧠 What are HTTP methods?

HTTP methods tell the server **what kind of operation** the client wants to perform. Choosing the right method is not optional — it's a fundamental REST standard.

| HTTP Method | Purpose | Annotation | When to Use |
|-------------|---------|------------|-------------|
| **GET** | Read/fetch data | `@GetMapping` | Retrieving data without modifying anything |
| **POST** | Create new data | `@PostMapping` | Inserting a new record into the database |
| **PUT** | Full update | `@PutMapping` | Replacing an entire record with new data |
| **PATCH** | Partial update | `@PatchMapping` | Updating only a few fields of a record |
| **DELETE** | Remove data | `@DeleteMapping` | Deleting a record from the database |

### ❓ What's the difference between PUT and PATCH?

This is a classic interview question. Here's the distinction:

- **PUT** = I'm replacing the *entire* record. Think of it as tearing out an old page and inserting a brand new one.
- **PATCH** = I'm updating *just a few fields*. Think of it as using whiteout on specific lines and writing new values.

### 🧪 Example

```java
@RestController
public class UserController {

    @GetMapping("/api/users")        // Fetch all users
    @PostMapping("/api/users")       // Create a new user
    @GetMapping("/api/users/{id}")   // Fetch a specific user
    @PutMapping("/api/users/{id}")   // Update entire user record
    @PatchMapping("/api/users/{id}") // Update some user fields
    @DeleteMapping("/api/users/{id}")// Delete a user
}
```

### 💡 Insight

Notice how the annotation names follow a consistent pattern — only the HTTP method changes: `@GetMapping`, `@PostMapping`, `@PutMapping`, etc. Spring Boot keeps things simple and predictable.

---

## Concept 3: The `@RestController` Annotation

### 🧠 What is it?

`@RestController` is a combination of two annotations:

1. **`@Controller`** — Marks the class as an HTTP request handler
2. **`@ResponseBody`** — Automatically serializes return values to JSON (or XML)

```java
@RestController  // = @Controller + @ResponseBody
public class UserController {

    @GetMapping("/api/users")
    public List<User> getAllUsers() {
        // Return value is automatically converted to JSON
        return userService.findAll();
    }
}
```

### ❓ Why not just use `@Controller`?

With plain `@Controller`, you'd have to manually annotate every method with `@ResponseBody` to return JSON. `@RestController` does it automatically for ALL methods in the class. Less boilerplate, cleaner code.

---

## Concept 4: API Path Naming Standards

### 🧠 The Golden Rule: Use Nouns, Not Verbs

This is one of the most important REST conventions. Your API paths should describe the **resource**, not the action.

**✅ Correct (Nouns):**
```
GET    /api/users          → Fetch all users
POST   /api/users          → Create a user
GET    /api/users/{id}     → Fetch a specific user
PUT    /api/users/{id}     → Update a user
DELETE /api/users/{id}     → Delete a user
```

**❌ Wrong (Verbs):**
```
GET    /api/getUsers
POST   /api/createUser
DELETE /api/removeUser
```

### ❓ Why nouns?

Because the **HTTP method already tells you the action**. `GET /api/users` already says "get users." Writing `GET /api/getUsers` is redundant — you're saying "get" twice.

### ⚙️ More naming rules

1. **Use plural nouns**: `/api/users` not `/api/user`
2. **Use a common prefix**: Start with `/api/` so developers immediately know these are REST endpoints (not Spring MVC view routes)
3. **Use lowercase**: `/api/users` not `/api/Users`
4. **Use hyphens for multi-word resources**: `/api/user-profiles` not `/api/userProfiles`

### 🧪 Supporting Multiple Paths

A single method can support multiple API paths:

```java
@GetMapping(path = {"/", "/hello"})
public String greet() {
    return "Hello, World!";
}
```

Both `/` and `/hello` will route to this method. For a single path, skip the `path` parameter:

```java
@GetMapping("/hello")
public String greet() {
    return "Hello, World!";
}
```

### 💡 Pro Tip

Notice how the same path `/api/users/{id}` is reused for GET, PUT, and DELETE. The HTTP method differentiates them. This is clean, predictable API design.

---

## Concept 5: Request Body — When Do Clients Send Data?

### 🧠 How it works

Not all HTTP methods carry data in the same way:

| Method | Path Variables | Request Body |
|--------|---------------|--------------|
| **GET** | ✅ Yes | ❌ No body |
| **POST** | Sometimes | ✅ Yes (new data) |
| **PUT** | ✅ Yes (identify record) | ✅ Yes (updated data) |
| **PATCH** | ✅ Yes (identify record) | ✅ Yes (partial data) |
| **DELETE** | ✅ Yes (identify record) | ❌ No body |

### ❓ Why no body for GET and DELETE?

- **GET** is for reading. The server knows what to fetch based on the URL alone.
- **DELETE** only needs to know *which* record to delete — the ID in the path is sufficient.
- **POST** and **PUT** need to send actual data (user details, product info, etc.) — that goes in the request body.

---

## Concept 6: HTTP Response Status Codes

### 🧠 What are status codes?

When your API finishes processing a request, it must tell the client whether things went well or not. That's done through **HTTP status codes**.

### ⚙️ Success Codes (2xx)

| Code | Meaning | When to Use |
|------|---------|-------------|
| **200** | OK | GET request processed successfully |
| **201** | Created | POST request — new record created |
| **202** | Accepted | Request accepted, will process later (async) |
| **204** | No Content | PUT/DELETE successful, nothing to return |

### ⚙️ Client Error Codes (4xx) — "You messed up"

| Code | Meaning | When to Use |
|------|---------|-------------|
| **400** | Bad Request | Invalid input (e.g., string where number expected) |
| **401** | Unauthorized | No authentication provided |
| **403** | Forbidden | Authenticated but no permission |
| **404** | Not Found | Resource doesn't exist (e.g., user ID 999 not in DB) |
| **405** | Method Not Allowed | Wrong HTTP method (e.g., POST to a GET-only endpoint) |

### ⚙️ Server Error Codes (5xx) — "We messed up"

| Code | Meaning | When to Use |
|------|---------|-------------|
| **500** | Internal Server Error | Unhandled exceptions (NullPointerException, etc.) |
| **503** | Service Unavailable | Server overloaded or temporarily down |

### 💡 Key Distinction

- **4xx** = The client sent a bad request. It's *their* fault.
- **5xx** = The server accepted a valid request but failed to process it. It's *our* fault.

### ❓ What's the difference between 401 and 403?

- **401 Unauthorized**: "I don't know who you are. Log in first."
- **403 Forbidden**: "I know who you are, but you don't have permission to do this."

This distinction matters a lot when implementing Spring Security — we'll cover it in detail later.

---

## ✅ Key Takeaways

1. **REST** = Applications communicating over HTTP using JSON
2. Choose the **correct HTTP method** — GET for read, POST for create, PUT for full update, PATCH for partial update, DELETE for remove
3. **`@RestController`** = `@Controller` + `@ResponseBody` — auto-serializes responses to JSON
4. **Use nouns** in API paths, not verbs: `/api/users` not `/api/getUsers`
5. **Use plural nouns** and a common `/api/` prefix
6. Same path + different HTTP methods = different operations (good REST design)
7. GET and DELETE don't carry request bodies; POST and PUT do
8. Return proper **status codes**: 2xx for success, 4xx for client errors, 5xx for server errors
9. **401** = "Who are you?" vs **403** = "You can't do this"

## ⚠️ Common Mistakes

- Using verbs in API paths (`/api/getUsers` instead of `/api/users`)
- Using singular nouns (`/api/user` instead of `/api/users`)
- Returning 200 for everything — even errors
- Confusing PUT with PATCH — PUT replaces entirely, PATCH updates selectively
- Not differentiating between 401 and 403

## 💡 Pro Tips

- Following these conventions makes your APIs **predictable**. Any developer joining your team will immediately understand the API structure
- These standards come from the broader REST community, not just Spring Boot — they apply regardless of the backend framework
- When in doubt about which status code to use, refer to the [HTTP Status Codes reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
