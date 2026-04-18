# Working with @PathVariable — Part 1

## Introduction

We've learned about the anatomy of HTTP requests and we know that path variables are dynamic values embedded in the URL. But how do we actually **extract** those values inside our Java code?

That's where `@PathVariable` comes in — a simple annotation that does some serious magic behind the scenes. Spring Boot reads the dynamic value from the URL, converts it to the right data type, and hands it to your method as a parameter. You just write the annotation and use the value. Let's see how.

---

## Concept 1: Understanding Path Variables in Context

### 🧠 What's the scenario?

Consider this REST API path:

```
GET /api/dummy/users/123/posts/456
```

Breaking this down:
- `/api/dummy/users` — static path (identifies the resource)
- `123` — **dynamic** path variable (user ID)
- `/posts` — static path (sub-resource)
- `456` — **dynamic** path variable (post ID)

The client is saying: *"Give me the post with ID 456 that belongs to user 123."*

### ❓ Why can't we hardcode these values?

If we hardcoded `/api/dummy/users/123/posts/456` as our API path, the API would **only** work for user 123 and post 456. We need these values to be dynamic — any user ID, any post ID.

---

## Concept 2: Defining Path Variables in Spring Boot

### ⚙️ Step-by-step

**Step 1:** Create a new controller class with `@RestController`:

```java
@RestController
public class UserController {
    // REST APIs go here
}
```

**Step 2:** Define the API path with **placeholders** using curly braces `{}`:

```java
@GetMapping("/api/dummy/users/{userId}/posts/{postId}")
```

Instead of hardcoded values like `123`, we use `{userId}` as a placeholder. Spring Boot knows that whatever value appears at that position in the URL will be mapped to `userId`.

**Step 3:** Accept the path variables as method parameters using `@PathVariable`:

```java
@GetMapping("/api/dummy/users/{userId}/posts/{postId}")
public String searchUserPost(@PathVariable Long userId, @PathVariable Long postId) {
    return "Fetched user with id " + userId + " and postId with " + postId;
}
```

### 🧪 How the mapping works

When a client calls:
```
GET /api/dummy/users/124/posts/460
```

Spring Boot does this behind the scenes:
1. Sees `124` at the `{userId}` position → assigns `124` to `userId`
2. Sees `460` at the `{postId}` position → assigns `460` to `postId`

Your method receives `userId = 124` and `postId = 460`. You can verify this by setting a breakpoint — the values will be there.

### 💡 The Magic

As a developer, you **never** write code to parse the URL, extract substrings, or convert types. Spring Boot handles all of that. You just declare the annotation and use the variable.

---

## Concept 3: The Name Matching Rule

### ⚠️ Critical Rule

The placeholder name in the path **must exactly match** the method parameter name:

```java
// ✅ Works — names match
@GetMapping("/api/users/{userId}")
public String getUser(@PathVariable Long userId) { ... }

// ❌ Breaks — names don't match
@GetMapping("/api/users/{userId}")
public String getUser(@PathVariable Long customerId) { ... }
```

In the second example, Spring Boot tries to find a placeholder called `{customerId}` in the path, can't find it, and throws a runtime exception:

```
Required URI template variable 'customerId' for method parameter type Long is not present
```

We'll learn how to use different names in Part 2 with the `name` parameter.

---

## Concept 4: Path Variables Are Mandatory by Default

### 🧠 What happens if a client doesn't send a path variable?

If your API path is:

```java
@GetMapping("/api/dummy/users/{userId}/posts/{postId}")
```

And the client calls:
```
GET /api/dummy/users/123/posts
```

They'll get a **404 Not Found** error. Why? Because the path doesn't match — Spring Boot expects something after `/posts/` but nothing was provided.

### ⚙️ Making a Path Variable Optional

You can mark a path variable as optional using `required = false`:

```java
@PathVariable(required = false) Long postId
```

But there's a catch — you also need a **matching API path** that doesn't include the optional variable. Otherwise, the URL still won't match any route.

---

## Concept 5: Supporting Multiple API Paths

### 🧠 The Problem

If `postId` is optional, you need to handle two URL patterns:
1. `/api/dummy/users/{userId}/posts/{postId}` — with post ID
2. `/api/dummy/users/{userId}` — without post ID

### ⚙️ The Solution — Multiple Paths on One Method

```java
@GetMapping(path = {
    "/api/dummy/users/{userId}/posts/{postId}",
    "/api/dummy/users/{userId}"
})
public String searchUserPost(
        @PathVariable Long userId,
        @PathVariable(required = false) Long postId) {

    if (postId == null) {
        return "Fetched user with id " + userId;
    } else {
        return "Fetched user with id " + userId + " and postId with " + postId;
    }
}
```

### ⚙️ How it works

- If the client calls `/api/dummy/users/123/posts/456` → the first path matches → `postId = 456`
- If the client calls `/api/dummy/users/123` → the second path matches → `postId = null`

### ⚠️ Critical Detail

When a path variable is optional and not provided, its value is `null`. You **must** handle this in your business logic with a null check. Otherwise, you'll get a `NullPointerException`.

---

## Concept 6: Choosing the Right Data Type

### 🧠 Why does data type matter?

When you declare `@PathVariable Long userId`, Spring Boot automatically converts the string `"123"` from the URL into a `Long` value. If the client sends `"abc"` instead, Spring Boot will throw an error because `"abc"` can't be converted to `Long`.

### 🧪 Common data types for path variables

| Data Type | Use Case | Example |
|-----------|----------|---------|
| `Long` | Numeric IDs | `/users/123` |
| `Integer` | Smaller numeric values | `/pages/5` |
| `String` | Slugs, names | `/users/john-doe` |
| `UUID` | Universally unique IDs | `/users/550e8400-e29b...` |

---

## ✅ Key Takeaways

1. Use `{placeholder}` in the API path to define dynamic path variables
2. Use `@PathVariable` annotation on method parameters to receive the values
3. **Placeholder name must match method parameter name** exactly (by default)
4. Spring Boot automatically extracts and type-converts path variables — zero manual parsing
5. Path variables are **mandatory** by default — missing variables cause 404 errors
6. Use `required = false` to make a path variable optional, but also provide a matching path without it
7. When optional and not provided, the value is `null` — always add null checks
8. Support multiple paths on one method using `path = { "path1", "path2" }`

## ⚠️ Common Mistakes

- Mismatching placeholder names and parameter names — causes runtime exceptions
- Marking a path variable as optional without providing a second API path that omits it
- Forgetting null checks when using optional path variables
- Not choosing the right data type — if you expect numbers, use `Long` or `Integer`, not `String`

## 💡 Pro Tips

- Use IntelliJ's debugger to verify path variable values — set a breakpoint and inspect the parameters
- You can have path variables at **any position** in the path and as **many** as you need
- Keep API paths readable — `/api/users/{userId}/posts/{postId}` clearly communicates the resource hierarchy
