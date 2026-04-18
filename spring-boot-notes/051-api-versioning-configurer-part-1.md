# API Versioning with `ApiVersionConfigurer` — Part 1 (Spring 7)

## Introduction

In the previous lesson, we saw how legacy API versioning requires manual configuration on **every single controller method** — setting paths, params, headers, or produces attributes individually. That's tedious and error-prone in large applications.

Spring 7 (and Spring Boot 4) introduced a **game-changing feature**: `ApiVersionConfigurer`. With this, you configure API versioning **once** in a centralized place, and it applies to your entire application. Let's see how it works.

---

## The Big Picture — What Changes?

| Aspect | Legacy Approach | Spring 7 Approach |
|--------|----------------|-------------------|
| Configuration | Per-method, per-controller | Centralized in one config class |
| Supported versions | Implicit (whatever you map) | Explicitly declared |
| Switching strategies | Rewrite all annotations | Change one line of code |
| Default version | Manual fallback logic | `setDefaultVersion()` |
| Version ranges | Not possible | `2.0+` syntax supported |

---

## Step 1: Create the Configuration Class

Create a `WebConfig` class inside your main application package:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureApiVersioning(ApiVersionConfigurer configurer) {
        configurer
            .usePathSegment(2)
            .addSupportedVersions("1.0", "2.0", "3.0");
    }
}
```

### Breaking This Down

1. **`@Configuration`** — marks this class as a Spring configuration class that defines beans and settings
2. **`implements WebMvcConfigurer`** — this interface provides hook methods to customize Spring MVC behavior
3. **`configureApiVersioning()`** — a default method introduced in Spring 7 specifically for API versioning
4. **`ApiVersionConfigurer`** — the input parameter that provides a fluent API to configure versioning

### ⚠️ Important: Package Placement

This config class **must** be inside the same package (or a sub-package) where your Spring Boot main class lives. If you accidentally create it outside the main package, Spring won't detect it and you'll get:

```
API version specified, but no API version strategy configured
```

---

## Step 2: Create the Version Controller

```java
@RestController
@RequestMapping("/api/version/{v}")
public class VersionController {

    @GetMapping(version = "1.0")
    public ResponseEntity<String> defaultVersion() {
        return ResponseEntity.ok("Version 1.0.0");
    }

    @GetMapping(version = "2.0")
    public ResponseEntity<String> v2Version() {
        return ResponseEntity.ok("Version 2.0.0");
    }
}
```

### What's Different Here?

Notice the **`version`** attribute on `@GetMapping`. This is **new in Spring 7** — it's a dedicated parameter specifically for API versioning. No more hijacking `params`, `headers`, or `produces` for versioning purposes.

Also notice that both methods have the **same base path** (`/api/version/{v}`) and **no unique sub-paths**. In the legacy approach, this would cause an "ambiguous mapping" error. But with Spring 7's `version` attribute, the framework knows these are **different versions of the same API**, not duplicate mappings.

### What Happens Without `version`?

If you remove the `version` attribute from both methods, Spring will throw:

```
Ambiguous mapping. Cannot map 'versionController' method to the same path.
```

The `version` attribute resolves this ambiguity by telling Spring they're version-differentiated endpoints.

---

## Step 3: Configure the Versioning Strategy

The `ApiVersionConfigurer` supports different strategies through simple method calls. Let's explore two strategies covered in this lesson.

### Strategy A: Path Segment Versioning

```java
configurer
    .usePathSegment(2)
    .addSupportedVersions("1.0", "2.0", "3.0");
```

**What does `usePathSegment(2)` mean?**

The path `/api/version/{v}` has three segments:

| Index | Segment |
|-------|---------|
| 0 | `api` |
| 1 | `version` |
| 2 | `{v}` ← this is the version placeholder |

By saying `usePathSegment(2)`, you're telling Spring: *"The third segment of the URL path is the version number."*

**Testing:**

| Request | Response |
|---------|----------|
| `GET /api/version/1.0` | `Version 1.0.0` |
| `GET /api/version/2.0` | `Version 2.0.0` |
| `GET /api/version/4.0` | `400 Bad Request` (unsupported version) |

### Strategy B: Query Parameter Versioning

To switch to query parameter versioning, just change the configurer:

```java
configurer
    .useQueryParam("version")
    .addSupportedVersions("1.0", "2.0", "3.0");
```

And remove the path variable from the controller's `@RequestMapping`:

```java
@RequestMapping("/api/version")  // no {v} path variable
```

No changes needed in the `@GetMapping` methods — the `version` attribute stays the same!

**Testing:**

| Request | Response |
|---------|----------|
| `GET /api/version?version=1.0` | `Version 1.0.0` |
| `GET /api/version?version=2.0` | `Version 2.0.0` |
| `GET /api/version?version=4.0` | `400 Bad Request` |

---

## Powerful Features of `ApiVersionConfigurer`

### Feature 1: Default Version

What if a client doesn't specify any version? Instead of returning an error, you can set a default:

```java
configurer
    .useQueryParam("version")
    .addSupportedVersions("1.0", "2.0", "3.0")
    .setDefaultVersion("1.0");
```

Now if a client calls `/api/version` without any query param, the framework automatically treats it as `?version=1.0` and invokes the V1 method.

### Feature 2: Version Range with `+` Syntax

Instead of mapping one method to exactly one version, you can handle **a range of versions**:

```java
@GetMapping(version = "2.0+")
public ResponseEntity<String> v2Version() {
    return ResponseEntity.ok("Version 2.0.0");
}
```

The `2.0+` means: *"Handle any version that is 2.0 or higher."*

With supported versions `1.0`, `2.0`, `3.0`:

| Version Sent | Method Invoked |
|-------------|----------------|
| `1.0` | `defaultVersion()` |
| `2.0` | `v2Version()` (matches `2.0+`) |
| `3.0` | `v2Version()` (matches `2.0+`, since 3.0 ≥ 2.0) |
| `2.5` | `400 Bad Request` (not in supported versions list) |

The `+` only works with versions declared in `addSupportedVersions()`. If `2.5` isn't in the list, it's rejected — even though it's numerically between 2.0 and 3.0.

### Feature 3: Switching Strategies Is Trivial

Want to switch from path versioning to query param versioning? Just change **one line** in `WebConfig`:

```java
// Before: Path versioning
configurer.usePathSegment(2)

// After: Query param versioning
configurer.useQueryParam("version")
```

Update the `@RequestMapping` path accordingly, and you're done. No changes to any `@GetMapping` methods.

---

## ✅ Key Takeaways

- Spring 7 introduced `ApiVersionConfigurer` for centralized API versioning
- Configure once in a `WebConfig` class — applies to all controllers
- Use the `version` attribute on `@GetMapping` / `@PostMapping` to tag methods with specific versions
- `addSupportedVersions()` explicitly declares which versions your API supports
- Unsupported versions automatically return `400 Bad Request`
- `setDefaultVersion()` handles clients that don't specify a version
- The `2.0+` syntax lets one method handle multiple versions
- Switching between path, query param, and other strategies requires changing only the config — not the controllers

## ⚠️ Common Mistakes

- **Placing the config class outside the main application package** — Spring won't detect it and you'll get a confusing "no API version strategy configured" error
- **Forgetting `addSupportedVersions()`** — without this, the framework doesn't know which versions are valid
- **Sending unsupported version numbers** — e.g., sending `2.5` when only `1.0`, `2.0`, `3.0` are declared. The `+` range doesn't interpolate

## 💡 Pro Tips

- The `ApiVersionConfigurer` has many more features — explore the official Spring documentation to discover them all
- In Part 2, you'll see how to implement header-based and media type–based versioning using this same configurer
- This feature is available from Spring Framework 7.0+ / Spring Boot 4.0+. If your project uses older versions, stick with the legacy approach for now
