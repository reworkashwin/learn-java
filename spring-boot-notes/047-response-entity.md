# ResponseEntity — Crafting Custom HTTP Responses

## Introduction

So far, our REST API methods have been returning plain `String` values. Whatever we return from the method, Spring Boot wraps it into the response body and sends it back to the client with a default `200 OK` status code.

But is that always correct? If a POST endpoint *creates* a resource, shouldn't it return `201 Created` instead of `200 OK`? What if you need to send custom response headers?

That's where **`ResponseEntity`** comes in — it gives you **full control** over the HTTP response: status code, headers, and body.

---

## The Anatomy of an HTTP Response

Before diving into `ResponseEntity`, let's understand what an HTTP response contains:

| Part | Description | Required? |
|------|-------------|-----------|
| **Status Code** | Tells the client what happened (200, 201, 400, 500...) | ✅ Mandatory |
| **Headers** | Metadata about the response (Content-Type, custom headers) | ❌ Optional |
| **Body** | The actual data being sent back (JSON, String, etc.) | ❌ Optional |

When you return a plain `String` from a method, Spring Boot fills in the status code (`200 OK`) and body for you, but you lose control over these details. `ResponseEntity` hands that control back to you.

---

## Why Not Just Return Plain Objects?

Imagine this scenario:

```java
@PostMapping("/users")
public String createUser(@RequestBody UserDto user) {
    // save user to database
    return "User created successfully";
}
```

This works, but the client receives a `200 OK` status code. According to REST standards, resource creation should return `201 Created`. Without `ResponseEntity`, you can't change that.

---

## Using `ResponseEntity` — The Basics

### `ResponseEntity` for GET APIs (200 OK)

For GET APIs, the standard status code is `200 OK`. Spring provides a convenient shortcut:

```java
@GetMapping("/users/{id}")
public ResponseEntity<String> getUserById(@PathVariable String id) {
    String response = "User details for ID: " + id;
    return ResponseEntity.ok(response);
}
```

**What's happening here?**

1. The return type changed from `String` to `ResponseEntity<String>`
2. `ResponseEntity.ok(response)` sets the status to `200 OK` and puts `response` in the body

The `ok()` method is a shortcut. Behind the scenes, it's doing:

```java
ResponseEntity.status(HttpStatus.OK).body(response);
```

#### Alternative Syntax — Chained Builder

You can also write it in a more explicit, chained style:

```java
return ResponseEntity.ok().body(response);
```

Both produce the same result — `200 OK` with the response body.

---

### `ResponseEntity` for POST APIs (201 Created)

For POST APIs that create resources, the correct status code is `201 Created`:

```java
@PostMapping("/users")
public ResponseEntity<String> createUser(@RequestBody UserDto userDto) {
    // save user logic here
    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body("Created user with data: " + userDto);
}
```

**What's happening here?**

1. `ResponseEntity.status(HttpStatus.CREATED)` sets the status code to `201`
2. `.body(...)` attaches the response body

### The `HttpStatus` Enum — Your Status Code Library

Spring provides the `HttpStatus` enum with **every standard HTTP status code** you'll ever need:

| Range | Meaning | Examples |
|-------|---------|----------|
| **1xx** | Informational | `CONTINUE`, `SWITCHING_PROTOCOLS` |
| **2xx** | Success | `OK` (200), `CREATED` (201), `ACCEPTED` (202) |
| **3xx** | Redirection | `MOVED_PERMANENTLY`, `FOUND` |
| **4xx** | Client Error | `BAD_REQUEST` (400), `NOT_FOUND` (404) |
| **5xx** | Server Error | `INTERNAL_SERVER_ERROR` (500) |

You don't have to memorize status code numbers — just use the enum constants.

---

## Adding Custom Response Headers

Sometimes you need to send extra metadata to the client. You can attach custom headers using the `.header()` method:

```java
@PostMapping("/users")
public ResponseEntity<String> createUser(@RequestBody UserDto userDto) {
    return ResponseEntity
            .status(HttpStatus.CREATED)
            .header("Custom-Header", "example-value")
            .body("Created user with data: " + userDto);
}
```

When the client inspects the response headers, they'll see `Custom-Header: example-value` alongside Spring Boot's default headers.

---

## Putting It All Together — The Builder Pattern

`ResponseEntity` uses a **builder pattern** where you chain method calls:

```java
ResponseEntity
    .status(HttpStatus.CREATED)       // 1. Set status code
    .header("X-Request-Id", "abc123") // 2. Add headers (optional)
    .body("User created");            // 3. Set body (optional, must be last)
```

The `.body()` call must always come **last** because it finalizes and returns the `ResponseEntity` object.

---

## ✅ Key Takeaways

- `ResponseEntity<T>` gives you full control over status code, headers, and response body
- The generic type `T` represents the data type of the response body
- Use `ResponseEntity.ok()` as a shortcut for GET APIs returning `200 OK`
- Use `ResponseEntity.status(HttpStatus.CREATED)` for POST APIs returning `201 Created`
- It's a **recommended practice** to always use `ResponseEntity` instead of returning plain objects
- The `HttpStatus` enum provides constants for all standard HTTP status codes

## ⚠️ Common Mistakes

- **Returning `200 OK` for everything** — a POST that creates a resource should return `201 Created`, a DELETE should return `204 No Content`. Follow the REST standards
- **Mismatching the generic type** — if your method signature says `ResponseEntity<String>` but you try to return a `UserDto` in the body, you'll get a compilation error
- **Forgetting to update the method return type** — when switching from `String` to `ResponseEntity<String>`, the method signature must change too

## 💡 Pro Tips

- `RequestEntity` (for reading requests) and `ResponseEntity` (for sending responses) are complementary — use them together for full control over both sides of the HTTP conversation
- For GET APIs, `ResponseEntity.ok(data)` is the cleanest shortcut
- Spring Boot adds its own default headers (like `Content-Type: application/json`). Your custom headers are added **in addition** to those defaults
- In real enterprise applications, you'll use `ResponseEntity` in virtually every REST API method — get comfortable with the builder pattern early
