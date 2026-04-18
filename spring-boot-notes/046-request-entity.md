# RequestEntity — Reading the Entire Request in One Shot

## Introduction

So far, we've learned how to read different parts of an HTTP request using individual annotations — `@RequestBody`, `@RequestHeader`, `@RequestParam`, and `@PathVariable`. Each annotation is designed to extract one specific piece of data from the incoming request.

But what if you want to read **everything** — headers, body, query params, and path — all at once, using a single object? That's exactly what `RequestEntity` is for.

In this lesson, we'll explore `RequestEntity`, understand when it shines, and when you're better off sticking with individual annotations.

---

## What is `RequestEntity`?

### 🧠 The Concept

`RequestEntity` is a class provided by the Spring Framework that **wraps the entire incoming HTTP request** into a single object. Instead of using four different annotations to read four different parts of the request, you use one `RequestEntity` parameter and extract whatever you need from it.

Think of it like receiving a **package** — instead of someone handing you the letter, the stickers, and the label separately, you get the whole package and open it yourself.

### ⚙️ How It Works

`RequestEntity` is a generic class:

```java
RequestEntity<T>
```

The generic type `T` represents the **data type of the request body**. If your request body is a `UserDto`, you'd use:

```java
RequestEntity<UserDto>
```

From this single object, you can call methods to access different parts of the request:

| Method | Returns |
|--------|---------|
| `getHeaders()` | `HttpHeaders` object (all request headers) |
| `getBody()` | The request body (type `T`) |
| `getUrl().getQuery()` | Query parameters as a raw `String` |
| `getUrl().getPath()` | The full URI path |
| `getMethod()` | The HTTP method (GET, POST, etc.) |
| `hasBody()` | `boolean` — whether the request has a body |

---

## Using `RequestEntity` in a REST API

### 🧪 Example

Here's how you'd create a POST endpoint using `RequestEntity`:

```java
@PostMapping("/request-entity")
public String createUserWithRequestEntity(RequestEntity<UserDto> requestEntity) {

    // Read all headers
    HttpHeaders headers = requestEntity.getHeaders();

    // Read the request body
    UserDto userDto = requestEntity.getBody();

    // Read query params (raw string)
    String queryParam = requestEntity.getUrl().getQuery();

    // Read the full URI path
    String path = requestEntity.getUrl().getPath();

    return "User created successfully";
}
```

Notice there are **no annotations** on the method parameter — no `@RequestBody`, no `@RequestHeader`. The `RequestEntity` class handles it all.

### What Happens at Runtime?

When you debug this method after sending a request:

- **`headers`** → contains all 9+ headers (e.g., `Content-Type`, `User-Agent`, `User-Location`)
- **`userDto`** → the deserialized body with fields like `name`, `email`, `gender`
- **`queryParam`** → `null` if no query params were sent
- **`path`** → the full path invoked by the client (e.g., `/api/users/request-entity`)

---

## When to Use `RequestEntity` (and When NOT To)

### ✅ Best Use Case — Headers + Body Together

If your business logic needs to read **both the request headers and the request body**, `RequestEntity` is a clean shortcut. Instead of writing:

```java
public String createUser(@RequestBody UserDto user,
                         @RequestHeader("User-Location") String location,
                         @RequestHeader("Content-Type") String contentType) { ... }
```

You can simplify to:

```java
public String createUser(RequestEntity<UserDto> requestEntity) {
    HttpHeaders headers = requestEntity.getHeaders();
    UserDto user = requestEntity.getBody();
    // read any header from the headers object
}
```

### ⚠️ Avoid It for Query Params and Path Variables

Here's the catch — `RequestEntity` can *technically* give you query params and path variables, but it's **not practical**:

- **Query Params** → `getUrl().getQuery()` returns everything as a single raw `String` like `name=John&age=25`. You'd have to manually parse and split it — messy and error-prone.
- **Path Variables** → `getUrl().getPath()` returns a full path like `/api/users/42/request-entity`. You'd have to manually extract `42` from that string — cumbersome.

Why go through that pain when `@RequestParam` and `@PathVariable` do it effortlessly?

---

## ✅ Key Takeaways

- `RequestEntity<T>` wraps the entire HTTP request into a single object
- The generic `T` represents the data type of the request body
- Use it when you need to read **headers + body** together in your business logic
- Avoid it for reading query params and path variables — use `@RequestParam` and `@PathVariable` instead
- It's a **class**, not an **annotation** — you use it as a method parameter type

## ⚠️ Common Mistakes

- **Forgetting the generic type** — always specify the body type (e.g., `RequestEntity<UserDto>`), otherwise the body will be returned as a raw `Object`
- **Trying to use it for everything** — just because it *can* access query params doesn't mean it *should*. Parsing raw strings manually is fragile and defeats the purpose of Spring's annotation-based approach
- **Confusing with `@RequestBody`** — `RequestEntity` replaces `@RequestBody` *and* `@RequestHeader` together. Don't use both on the same parameter

## 💡 Pro Tips

- `RequestEntity` pairs well with `ResponseEntity` — use `RequestEntity` to read the full request and `ResponseEntity` to craft the full response
- The `hasBody()` method is handy for conditional logic where the body may or may not be present
- You can also use `getMethod()` to check which HTTP method was used — useful in generic handler methods
