# API Versioning with `ApiVersionConfigurer` — Part 2 (Headers & Media Type)

## Introduction

In Part 1, we set up centralized API versioning using `ApiVersionConfigurer` and explored two strategies — **path segment** and **query parameter** versioning. Both required only a one-line change in the config class to switch between them.

Now it's time to cover the remaining two strategies: **request header versioning** and **media type versioning**. The beauty? Your REST controller doesn't change at all. Everything happens inside `WebConfig`. Let's dive in.

---

## Strategy C: Request Header Versioning

### 🧠 What Is It?

Instead of putting the version number in the URL path or query string, the client sends it as a **custom HTTP header** in the request. The server reads the header value and routes to the right version of the method.

### ❓ Why Would You Use It?

Headers keep your URLs clean. There's no `/v1/` polluting the path and no `?version=1.0` cluttering the query string. The version is tucked away in the request metadata — invisible in the URL but fully functional behind the scenes.

This is especially popular in enterprise APIs where clean, unchanging URLs matter.

### ⚙️ How to Configure It

Switch from `useQueryParam()` to `useRequestHeader()` in your `WebConfig`:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureApiVersioning(ApiVersionConfigurer configurer) {
        configurer
            .useRequestHeader("X-API-VERSION")
            .addSupportedVersions("1.0", "2.0", "3.0")
            .setDefaultVersion("1.0");
    }
}
```

That's it. One method call changed — `useRequestHeader("X-API-VERSION")` — and the entire application now reads versions from the `X-API-VERSION` header.

### 🧪 How the Client Sends the Version

In Postman (or any HTTP client), you add a custom header to your request:

| Header Name | Header Value |
|-------------|-------------|
| `X-API-VERSION` | `2.0` |

**Results:**

| Header Value | Method Invoked |
|-------------|----------------|
| `X-API-VERSION: 1.0` | `defaultVersion()` — Version 1 |
| `X-API-VERSION: 2.0` | `v2Version()` — Version 2 (matches `2.0+`) |
| `X-API-VERSION: 3.0` | `v2Version()` — Version 2 (3.0 ≥ 2.0, so `2.0+` catches it) |
| *(no header sent)* | `defaultVersion()` — falls back to default `1.0` |

### 💡 Key Insight: No Controller Changes Needed

When you switch from query param to request header versioning, the **only file you touch is `WebConfig`**. Your `@GetMapping(version = "1.0")` and `@GetMapping(version = "2.0+")` annotations remain exactly the same.

This is the power of the centralized configurer — the controller declares *what* version it handles, and the config decides *how* the version is extracted from the request.

> The one exception is **path segment versioning**, which requires a `{v}` placeholder in the `@RequestMapping` path. All other strategies leave the controller completely untouched.

---

## Strategy D: Media Type Versioning

### 🧠 What Is It?

Media type versioning (also called **content negotiation versioning**) uses the `Accept` header to specify both the desired response format *and* the API version. The version is embedded inside a custom media type.

This is considered the most RESTful approach by many API purists because it leverages HTTP's built-in content negotiation mechanism.

### ❓ Why Is It Different?

In header versioning, you use a *custom* header like `X-API-VERSION`. In media type versioning, you use the *standard* `Accept` header but with a **custom media type** that encodes the version.

Instead of:
```
Accept: application/json
```

You send:
```
Accept: application/vnd.eazyapp+json;v=2.0
```

The version parameter `v=2.0` is appended to the media type value itself.

### ⚙️ How to Configure It

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureApiVersioning(ApiVersionConfigurer configurer) {
        configurer
            .useMediaTypeParameter(
                MediaType.parseMediaType("application/vnd.eazyapp+json"),
                "v"
            )
            .addSupportedVersions("1.0", "2.0", "3.0")
            .setDefaultVersion("1.0");
    }
}
```

### Breaking This Down

The `useMediaTypeParameter()` method takes **two arguments**:

1. **`MediaType`** — the custom media type your API recognizes. Since `application/vnd.eazyapp+json` is not a standard media type, you can't use a constant from the `MediaType` class — you must parse it using `MediaType.parseMediaType()`.

2. **`"v"`** — the parameter name that carries the version. The client will append `;v=1.0` or `;v=2.0` to the media type.

Why not include the version directly in the media type string like `application/vnd.eazyapp.v1+json`? Because then the framework wouldn't know **where** the version number is. By separating the static media type from the version parameter name `"v"`, you give Spring a clear extraction rule: *"Look for a parameter named `v` in the Accept header's media type."*

### 🧪 How the Client Sends the Version

In Postman, set the `Accept` header:

| Header Name | Header Value |
|-------------|-------------|
| `Accept` | `application/vnd.eazyapp+json;v=2.0` |

**Results:**

| Accept Header Value | Method Invoked |
|---------------------|----------------|
| `application/vnd.eazyapp+json;v=1.0` | `defaultVersion()` |
| `application/vnd.eazyapp+json;v=3.0` | `v2Version()` (matches `2.0+`) |
| *(no Accept header)* | `defaultVersion()` (default `1.0`) |

---

## All Four Strategies at a Glance

Here's the complete picture — four strategies, each requiring **only a one-line config change**:

| Strategy | Config Method | Client Sends Version Via |
|----------|--------------|--------------------------|
| Path Segment | `usePathSegment(2)` | URL path: `/api/version/2.0` |
| Query Param | `useQueryParam("version")` | Query string: `?version=2.0` |
| Request Header | `useRequestHeader("X-API-VERSION")` | Header: `X-API-VERSION: 2.0` |
| Media Type | `useMediaTypeParameter(mediaType, "v")` | Header: `Accept: ...;v=2.0` |

### Controller Changes Required?

| Strategy | Controller Annotation Changes? |
|----------|-------------------------------|
| Path Segment | ✅ Yes — needs `{v}` in `@RequestMapping` path |
| Query Param | ❌ No |
| Request Header | ❌ No |
| Media Type | ❌ No |

---

## Important Constraint: Numeric Versions Only for `+` Ranges

The `2.0+` range syntax is incredibly useful — but it only works when your version values are **numeric** (like `1.0`, `2.0`, `3.0`).

If you use alphanumeric versions like `V1`, `V2`, `V3`, the `+` range **will not work**. Spring needs numeric values to determine whether `3.0 ≥ 2.0` — it can't make that comparison with `V3` vs `V2`.

```java
// ✅ Works with + ranges
.addSupportedVersions("1.0", "2.0", "3.0")

// ❌ Cannot use + ranges with these
.addSupportedVersions("V1", "V2", "V3")
```

If your organization uses alphanumeric versioning, you can still use `ApiVersionConfigurer` — you just can't use the `+` range feature. Each version must be mapped explicitly.

---

## ✅ Key Takeaways

- **Request header versioning** uses `useRequestHeader("X-API-VERSION")` — the client passes the version as a custom HTTP header
- **Media type versioning** uses `useMediaTypeParameter()` — the version is embedded in the `Accept` header's custom media type (e.g., `application/vnd.eazyapp+json;v=2.0`)
- Switching between strategies only requires changing **one line** in `WebConfig` — no controller changes (except for path segment versioning)
- The `+` range syntax (e.g., `2.0+`) only works with **numeric** version values — alphanumeric versions like `V1`, `V2` are not compatible with ranges
- `setDefaultVersion()` ensures clients that don't send any version still get a valid response
- This feature requires **Spring Framework 7.0+ / Spring Boot 4.0+**

## ⚠️ Common Mistakes

- **Using alphanumeric versions with `+` ranges** — `V1`, `V2` values won't work with `2.0+` syntax. Stick to numeric versions like `1.0`, `2.0` if you want range matching
- **Embedding the version inside the media type string** — don't write `application/vnd.eazyapp.v1+json`. Instead, keep the media type static and pass the version parameter name separately as the second argument
- **Forgetting the `Accept` header entirely for media type versioning** — without it, the default version kicks in, which may not be the behavior you expect during testing

## 💡 Pro Tips

- Media type versioning is considered the most RESTful approach because it uses HTTP's native content negotiation — prefer it for public-facing APIs where RESTful purity matters
- For internal microservice-to-microservice communication, request header versioning is often simpler and cleaner
- The `ApiVersionConfigurer` approach is the **modern, recommended way** to handle API versioning in Spring Boot 4+ — use it over legacy per-controller annotations in all new projects
