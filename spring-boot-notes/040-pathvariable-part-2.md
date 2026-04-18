# Working with @PathVariable — Part 2

## Introduction

In Part 1, we learned the basics of `@PathVariable` — how to define placeholders, extract values, and handle optional variables. But we ran into a strict rule: **the placeholder name must exactly match the method parameter name**.

What if you want to use a different name? What if your API has five path variables and you're tired of listing each one? Part 2 answers these questions with two powerful techniques: the `name` parameter and the `Map` approach.

---

## Concept 1: Using a Different Parameter Name (The `name` Attribute)

### 🧠 The Problem

Sometimes the placeholder name in the URL and the variable name you want in your Java code don't align. For example:

```java
@GetMapping("/api/dummy/users/{userId}/orders/{orderId}")
public String searchOrder(@PathVariable Long customerId, @PathVariable Long orderId) {
    // ...
}
```

The path has `{userId}` but the method uses `customerId`. Spring Boot tries to find a placeholder called `{customerId}` in the path, can't find one, and throws:

```
Required URI template variable 'customerId' for method parameter type Long is not present
```

### ⚙️ The Solution — Use the `name` Parameter

Tell Spring Boot which placeholder maps to which parameter:

```java
@GetMapping("/api/dummy/users/{userId}/orders/{orderId}")
public String searchOrder(
        @PathVariable(name = "userId") Long customerId,
        @PathVariable Long orderId) {

    return "Fetched user with id " + customerId + " and orderId with " + orderId;
}
```

### ⚙️ How it works

The `name = "userId"` attribute tells Spring Boot: *"Take whatever value comes from the `{userId}` placeholder and assign it to the `customerId` parameter."*

It's basically creating an alias — the placeholder can have one name, the Java variable can have another.

### 🧪 When would you use this?

- When your domain model uses different terminology than your API (e.g., API says "user" but your code calls it "customer")
- When working with legacy code where changing the URL path isn't an option
- When readability within the method is better served by a different name

### ⚠️ Common Mistake

Make sure the value you pass to `name` matches the placeholder **exactly** — including correct spelling and casing. A typo like `name = "userid"` when the placeholder is `{userId}` will cause a runtime error.

---

## Concept 2: Accepting All Path Variables with a Map

### 🧠 The Problem

What happens when your REST API has many path variables — four, five, or more? Listing each one individually gets tedious and makes the method signature look cluttered:

```java
// This is getting messy...
public String handleRequest(
        @PathVariable Long userId,
        @PathVariable Long orderId,
        @PathVariable Long itemId,
        @PathVariable Long variantId) {
    // ...
}
```

### ⚙️ The Solution — Use a Single `Map<String, String>`

Instead of individual parameters, accept all path variables as a single map:

```java
@GetMapping("/api/dummy/users/{userId}/address/{addressId}")
public String searchUserAddress(@PathVariable Map<String, String> pathVariablesMap) {
    String userId = pathVariablesMap.get("userId");
    String addressId = pathVariablesMap.get("addressId");
    return "Fetched user with id " + userId + " and addressId with " + addressId;
}
```

### ⚙️ How it works

Spring Boot takes **all** path variable placeholders from the URL and puts them into the map:

| Key | Value |
|-----|-------|
| `"userId"` | `"123"` |
| `"addressId"` | `"789"` |

The **key** is the placeholder name (from `{...}`), and the **value** is whatever the client sent.

### ❓ When should you use this approach?

- When you have **3 or more** path variables
- When you want to keep the method signature clean
- When the number of path variables might change in the future (adding new ones requires no parameter changes)

### ⚠️ Important Caveat

When using `Map<String, String>`, all values come as **strings**. If you need a `Long` or `Integer`, you have to convert manually:

```java
Long userId = Long.parseLong(pathVariablesMap.get("userId"));
```

With individual `@PathVariable` annotations, Spring Boot handles the type conversion automatically. So there's a trade-off:

| Approach | Pros | Cons |
|----------|------|------|
| Individual `@PathVariable` | Automatic type conversion, type-safe | Verbose with many variables |
| `Map<String, String>` | Clean signature, flexible | Manual type conversion, all strings |

---

## Concept 3: Quick Reference — All @PathVariable Techniques

### 🧪 Technique 1: Basic (name must match)

```java
@GetMapping("/api/users/{userId}")
public String getUser(@PathVariable Long userId) {
    return "User: " + userId;
}
```

### 🧪 Technique 2: Custom name (alias)

```java
@GetMapping("/api/users/{userId}")
public String getUser(@PathVariable(name = "userId") Long customerId) {
    return "Customer: " + customerId;
}
```

### 🧪 Technique 3: Optional path variable

```java
@GetMapping(path = {"/api/users/{userId}/posts/{postId}", "/api/users/{userId}"})
public String getUser(@PathVariable Long userId,
                      @PathVariable(required = false) Long postId) {
    if (postId == null) return "User: " + userId;
    return "User: " + userId + ", Post: " + postId;
}
```

### 🧪 Technique 4: Map for multiple variables

```java
@GetMapping("/api/users/{userId}/address/{addressId}")
public String getUser(@PathVariable Map<String, String> pathVars) {
    return "User: " + pathVars.get("userId") + ", Address: " + pathVars.get("addressId");
}
```

---

## ✅ Key Takeaways

1. Use `@PathVariable(name = "placeholder")` when your method parameter name differs from the URL placeholder
2. The `name` attribute creates an **alias** — the placeholder and the Java variable can have different names
3. For APIs with many path variables, use `@PathVariable Map<String, String>` to accept all of them at once
4. With the Map approach, all values are **strings** — you must manually convert to other types
5. Individual `@PathVariable` gives you **automatic type conversion**; `Map` gives you **cleaner signatures**
6. Always ensure the `name` value exactly matches the placeholder in the path — typos cause runtime errors

## ⚠️ Common Mistakes

- Typos in the `name` parameter — `name = "userid"` won't match `{userId}` (case-sensitive)
- Forgetting that `Map<String, String>` returns strings, not `Long` or `Integer`
- Using the `Map` approach for 1-2 variables — individual parameters are cleaner in that case

## 💡 Pro Tips

- Use individual `@PathVariable` for **1-2 variables** — it's cleaner and type-safe
- Use `Map<String, String>` for **3+ variables** — keeps the method signature manageable
- The `name` attribute is also available as `value` — `@PathVariable(value = "userId")` works identically
- These techniques apply to all HTTP methods — `@GetMapping`, `@PostMapping`, `@PutMapping`, etc.
