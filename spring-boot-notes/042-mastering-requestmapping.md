# Mastering @RequestMapping

## Introduction

So far, we've been using shortcut annotations like `@GetMapping` and `@PostMapping` to build REST APIs. But there's an older, more powerful annotation that they're all built on top of — **`@RequestMapping`**.

Why should you learn it? Because `@RequestMapping` can do things the shortcut annotations can't — like defining a **common parent path** for an entire controller class, or allowing a single endpoint to support **multiple HTTP methods**. You'll find it everywhere in real-world Spring Boot projects, and there are scenarios where it's not just useful — it's **mandatory**.

---

## Concept 1: @RequestMapping vs Shortcut Annotations

### 🧠 What's the Difference?

| Feature | `@GetMapping`, `@PostMapping`, etc. | `@RequestMapping` |
|---------|--------------------------------------|-------------------|
| Can be used on **methods** | ✅ Yes | ✅ Yes |
| Can be used on **classes** | ❌ No | ✅ Yes |
| Restricts to a single HTTP method | ✅ Automatically | ❌ Not by default |
| Supports multiple HTTP methods | ❌ No | ✅ Yes |

The shortcut annotations (`@GetMapping`, `@PostMapping`, etc.) have `@Target(ElementType.METHOD)` — meaning they can **only** be placed on methods. Try putting `@GetMapping` on a class and you'll get a compilation error.

`@RequestMapping` has `@Target({ElementType.TYPE, ElementType.METHOD})` — it works on both **classes** and **methods**.

---

## Concept 2: Defining a Common Parent Path

### ❓ Why Do We Need This?

Look at a typical `UserController`:

```java
@GetMapping("/api/dummy/users/{id}")
@GetMapping("/api/dummy/users/{id}/address/{addressId}")
@GetMapping("/api/dummy/users/search")
@PostMapping("/api/dummy/users")
```

See the pattern? Every single method starts with `/api/dummy/users`. That's a lot of repetition.

### ⚙️ How @RequestMapping Solves This

Place `@RequestMapping` on the **class** with the common prefix:

```java
@RestController
@RequestMapping("/api/dummy/users")
public class UserController {

    @GetMapping("/{id}")
    public String getUser(@PathVariable Long id) { ... }

    @GetMapping("/{id}/address/{addressId}")
    public String getUserAddress(...) { ... }

    @GetMapping("/search")
    public String searchUsers() { ... }

    @PostMapping
    public String createUser() { ... }
}
```

Now each method only defines its **unique** sub-path. The framework automatically combines the class-level path with the method-level path.

### 💡 Insight

This is one of the **most common** uses of `@RequestMapping` in production code. Even if you use `@GetMapping` / `@PostMapping` on methods, you'll almost always use `@RequestMapping` on the class for the parent path.

> Think of it like a street address — `@RequestMapping` on the class is the **street name**, and the method-level path is the **house number**.

---

## Concept 3: Using @RequestMapping on Methods

### ⚙️ Basic Usage (No HTTP Method Restriction)

```java
@RequestMapping("/home")
public String home() {
    return "Hello World";
}
```

When you use `@RequestMapping` on a method **without specifying an HTTP method**, the endpoint accepts **ALL** HTTP methods — GET, POST, PUT, DELETE, PATCH, everything.

```
GET /home     → "Hello World" ✅
POST /home    → "Hello World" ✅
DELETE /home  → "Hello World" ✅
```

### ⚠️ Why This Is Dangerous

Exposing the same method for all HTTP methods is a **bad practice**. A GET request should read data, a POST should create data — mixing them breaks REST conventions and creates security risks.

---

## Concept 4: Restricting to Specific HTTP Methods

### ⚙️ Single Method

```java
@RequestMapping(path = "/home", method = RequestMethod.GET)
public String home() {
    return "Hello World";
}
```

Now only GET requests reach this endpoint. A DELETE request would return **405 Method Not Allowed**.

### ⚙️ Multiple Methods

Here's where `@RequestMapping` shines — something shortcut annotations can't do:

```java
@RequestMapping(
    path = "/home",
    method = {RequestMethod.GET, RequestMethod.POST}
)
public String home() {
    return "Hello World";
}
```

Now the endpoint accepts **both** GET and POST, but rejects DELETE, PUT, and others.

```
GET /home     → "Hello World" ✅
POST /home    → "Hello World" ✅
DELETE /home  → 405 Error ❌
```

### 💡 When Would You Need Multiple Methods?

It's rare, but sometimes an endpoint needs to handle both GET and POST — for example, a search endpoint that accepts criteria either as query params (GET) or as a request body (POST).

---

## Concept 5: The `path` and `value` Parameters

Both `path` and `value` do the same thing — define the URL path:

```java
@RequestMapping(path = "/home")    // explicit
@RequestMapping(value = "/home")   // same thing
@RequestMapping("/home")           // shorthand (uses value)
```

### Supporting Multiple Paths

You can map a single method to **multiple** URL paths:

```java
@RequestMapping(path = {"/home", "/welcome", "/index"})
public String home() {
    return "Hello World";
}
```

Now `/home`, `/welcome`, and `/index` all invoke the same method.

---

## Concept 6: The `consumes` and `produces` Parameters

### 🧠 What Are They?

- **`consumes`** — Restricts what **input format** the API accepts
- **`produces`** — Declares what **output format** the API returns

### ⚙️ Example

```java
@RequestMapping(
    path = "/home",
    method = RequestMethod.POST,
    consumes = MediaType.APPLICATION_JSON_VALUE,
    produces = MediaType.APPLICATION_JSON_VALUE
)
public String home() {
    return "Hello World";
}
```

- `consumes = "application/json"` → Only accepts JSON input. Sending XML will throw an error.
- `produces = "application/json"` → Tells clients the response will be in JSON format.

### 💡 Using MediaType Constants

Instead of hardcoding `"application/json"`, use Spring's `MediaType` constants:

```java
consumes = MediaType.APPLICATION_JSON_VALUE
produces = MediaType.APPLICATION_JSON_VALUE
```

Other available values include:
- `APPLICATION_XML_VALUE`
- `TEXT_PLAIN_VALUE`
- `APPLICATION_ATOM_XML_VALUE`
- `APPLICATION_GRAPHQL_RESPONSE_VALUE`

---

## Concept 7: Other Parameters

`@RequestMapping` supports additional parameters you'll encounter later:

| Parameter | Purpose |
|-----------|---------|
| `headers` | Accept specific HTTP headers |
| `params` | Accept specific query parameters |
| `consumes` | Restrict input content type |
| `produces` | Declare output content type |
| `version` | API versioning (covered in later sections) |

---

## Concept 8: When to Use What?

### Decision Guide

```
Single HTTP method?
  └── YES → Use @GetMapping, @PostMapping, etc. (cleaner syntax)
  └── NO (multiple methods) → Use @RequestMapping with method = {...}

Need a parent path on the class?
  └── YES → Use @RequestMapping on the class (mandatory — no alternative)
```

---

## ✅ Key Takeaways

1. **`@RequestMapping` on a class** defines a common parent path for all methods — this is its most important use
2. **`@RequestMapping` on a method** without `method` param accepts ALL HTTP methods (bad practice)
3. **Always specify the `method` parameter** when using `@RequestMapping` on a method
4. For **single HTTP method** endpoints, prefer shortcut annotations (`@GetMapping`, `@PostMapping`)
5. For **multiple HTTP methods** on one endpoint, `@RequestMapping` is the only option
6. Use `consumes` and `produces` to control input/output content types

## ⚠️ Common Mistakes

- Using `@RequestMapping` on a method without specifying the HTTP method — exposes it to ALL methods
- Trying to put `@GetMapping` on a class — it won't compile
- Hardcoding `"application/json"` instead of using `MediaType.APPLICATION_JSON_VALUE`
- Leaving `consumes`/`produces` configured when you haven't set up JSON request/response handling yet

## 💡 Pro Tips

- **Always** use `@RequestMapping` on your controller class for the parent path — it's a best practice in every production project
- Use shortcut annotations on methods for cleaner, more readable code
- If you open the `@RequestMapping` source code (Cmd+F12 / Ctrl+F12), you can see all available parameters and their return types
- Comment out `consumes`/`produces` during development if you're not ready to handle JSON payloads yet
