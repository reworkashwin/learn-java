# Traditional (Legacy) Methods of API Versioning in Spring Boot

## Introduction

Before Spring 7 introduced a modern, centralized API versioning feature, developers had to implement versioning **manually** using annotation attributes in their controller methods. This is what we call the **legacy approach**.

Why learn it if it's legacy? Because the vast majority of real-world Spring projects **still** run on older versions of Spring and Spring Boot. You'll encounter this approach in production codebases daily. Understanding it also makes you appreciate how much cleaner the modern approach is.

In this lesson, we'll implement all four versioning strategies — path, request param, request header, and media type — the traditional way.

---

## Setup — The Legacy Version Controller

First, create a controller class dedicated to versioning:

```java
@RestController
@RequestMapping("/api/legacy/versions")
public class LegacyVersionController {
    // versioned methods go here
}
```

The parent path `/api/legacy/versions` is shared by all methods in this controller.

---

## Approach 1: Path Versioning (Legacy)

### ⚙️ How It Works

You define separate methods with different path values in their `@GetMapping`:

```java
@GetMapping({"", "/", "/v1"})
public ResponseEntity<String> defaultPathVersion() {
    return ResponseEntity.ok("Response from Path V1 - API 1.0.0");
}

@GetMapping("/v2")
public ResponseEntity<String> v2PathVersion() {
    return ResponseEntity.ok("Response from Path V2 - API 2.0.0");
}
```

**What's happening here?**

- The first method handles **three** paths: the empty path, just `/`, and `/v1`. This means if a client doesn't specify any version, they still get V1 as the **fallback**.
- The second method only responds to `/v2`.

### 🧪 Testing

| Request Path | Method Invoked | Response |
|-------------|----------------|----------|
| `/api/legacy/versions` | `defaultPathVersion()` | API 1.0.0 |
| `/api/legacy/versions/v1` | `defaultPathVersion()` | API 1.0.0 |
| `/api/legacy/versions/v2` | `v2PathVersion()` | API 2.0.0 |

### A Note on Version Numbering

In the industry, versions follow **semantic versioning** with three digits:

```
MAJOR.MINOR.PATCH
```

| Change Type | Example | What Changes |
|-------------|---------|--------------|
| Patch fix | 1.0.0 → 1.0.1 | Bug fixes, cosmetic changes |
| Minor release | 1.0.1 → 1.1.0 | Small enhancements (patch resets to 0) |
| Major release | 1.1.0 → 2.0.0 | Breaking changes (minor + patch reset to 0) |

Whether you use `v1`/`v2` or `1.0.0`/`2.0.0` in your API paths is a team decision.

---

## Approach 2: Request Parameter Versioning (Legacy)

### ⚙️ How It Works

Use the `params` attribute in `@GetMapping` to route based on query parameters:

```java
@GetMapping(params = {"", "version=1"})
public ResponseEntity<String> defaultRequestParamVersion() {
    return ResponseEntity.ok("Response from RequestParam V1 - API 1.0.0");
}

@GetMapping(params = "version=2")
public ResponseEntity<String> v2RequestParamVersion() {
    return ResponseEntity.ok("Response from RequestParam V2 - API 2.0.0");
}
```

The `params` attribute tells Spring: *"Only invoke this method if the request has this specific query parameter."*

### 🧪 Testing

| Request | Method Invoked | Response |
|---------|----------------|----------|
| `/api/legacy/versions?version=1` | `defaultRequestParamVersion()` | API 1.0.0 |
| `/api/legacy/versions?version=2` | `v2RequestParamVersion()` | API 2.0.0 |
| `/api/legacy/versions` (no param) | `defaultRequestParamVersion()` | API 1.0.0 (fallback) |
| `/api/legacy/versions?v=2` (wrong name) | `defaultRequestParamVersion()` | API 1.0.0 (fallback) |

Notice: if the client sends a wrong parameter name, it falls back to the default method.

---

## Approach 3: Request Header Versioning (Legacy)

### ⚙️ How It Works

Use the `headers` attribute in `@GetMapping`:

```java
@GetMapping(headers = {"", "X-API-VERSION=1"})
public ResponseEntity<String> defaultRequestHeaderVersion() {
    return ResponseEntity.ok("Response from Header V1 - API 1.0.0");
}

@GetMapping(headers = "X-API-VERSION=2")
public ResponseEntity<String> v2RequestHeaderVersion() {
    return ResponseEntity.ok("Response from Header V2 - API 2.0.0");
}
```

### 🧪 Testing

| Header Sent | Method Invoked | Response |
|-------------|----------------|----------|
| `X-API-VERSION: 1` | `defaultRequestHeaderVersion()` | API 1.0.0 |
| `X-API-VERSION: 2` | `v2RequestHeaderVersion()` | API 2.0.0 |
| No header | `defaultRequestHeaderVersion()` | API 1.0.0 (fallback) |

### ⚠️ Watch Out

Make sure you use the `headers` attribute, **not** `params`. This is a common copy-paste mistake that causes unexpected routing:

```java
// ❌ WRONG — this checks query params, not headers!
@GetMapping(params = "X-API-VERSION=2")

// ✅ CORRECT
@GetMapping(headers = "X-API-VERSION=2")
```

---

## Approach 4: Media Type Versioning (Legacy)

### ⚙️ How It Works

Use the `produces` attribute in `@GetMapping` with custom MIME types:

```java
@GetMapping(produces = "application/vnd.eazyapp.v1+json")
public ResponseEntity<String> defaultMediaTypeVersion() {
    return ResponseEntity.ok("Response from MediaType V1 - API 1.0.0");
}

@GetMapping(produces = "application/vnd.eazyapp.v2+json")
public ResponseEntity<String> v2MediaTypeVersion() {
    return ResponseEntity.ok("Response from MediaType V2 - API 2.0.0");
}
```

**Key terminology:**
- `produces` → what the **backend** produces (the response format)
- `Accept` header → what the **client** is willing to accept

They're two sides of the same coin. The backend says "I produce this format" and the client says "I accept this format."

### 🧪 Testing

The client sends the `Accept` header:

| Accept Header Value | Method Invoked | Response |
|--------------------|----------------|----------|
| `application/vnd.eazyapp.v1+json` | `defaultMediaTypeVersion()` | API 1.0.0 |
| `application/vnd.eazyapp.v2+json` | `v2MediaTypeVersion()` | API 2.0.0 |

### ⚠️ Watch Out

Again, make sure you use the `produces` attribute, **not** `headers` or `params`:

```java
// ❌ WRONG
@GetMapping(headers = "application/vnd.eazyapp.v2+json")

// ✅ CORRECT
@GetMapping(produces = "application/vnd.eazyapp.v2+json")
```

---

## Summary of Annotation Attributes

| Strategy | Attribute | Example Value |
|----------|-----------|---------------|
| Path | Path in `@GetMapping` | `"/v1"`, `"/v2"` |
| Request Param | `params` | `"version=1"` |
| Request Header | `headers` | `"X-API-VERSION=1"` |
| Media Type | `produces` | `"application/vnd.app.v1+json"` |

---

## Why This Approach is Called "Legacy"

These manual approaches work fine, but they have a significant downside — **scalability**. In an enterprise application with hundreds of REST APIs, you'd need to:

- Visit every controller class
- Add path/param/header/produces configurations to every method
- Manage fallback logic for each method individually

That's a lot of repetitive, error-prone work. Spring 7's modern approach solves this by **centralizing** all versioning configuration in one place.

---

## ✅ Key Takeaways

- Legacy versioning uses annotation attributes: path values, `params`, `headers`, and `produces`
- All four approaches work with `@GetMapping`, `@PostMapping`, `@RequestMapping`, etc.
- Adding empty path (`""`) or empty values as fallback allows default version handling
- This approach requires per-method configuration — it doesn't scale well
- Still widely used in projects running Spring Boot 3.x and earlier

## ⚠️ Common Mistakes

- **Using `params` when you mean `headers`** — or `headers` when you mean `produces`. Triple-check the attribute name
- **Forgetting to update method names** when copy-pasting — leads to confusing debugging sessions
- **Not providing a fallback** — if no version matches and there's no default method, clients get `404` errors

## 💡 Pro Tips

- These legacy approaches aren't "bad" — they're just more manual. If your project is on Spring Boot 3.x, this is your only option
- When migrating to Spring 7, you can gradually replace legacy versioning with the modern `ApiVersionConfigurer` approach
- In the next lesson, you'll see how Spring 7 simplifies everything with centralized configuration
