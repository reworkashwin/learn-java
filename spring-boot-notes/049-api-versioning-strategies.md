# API Versioning Strategies — Four Approaches

## Introduction

Now that we understand **why** API versioning is critical, the natural next question is — **how** do we actually implement it? Where exactly do we put the version number?

There are **four popular approaches** used across the industry. Each one places the version information in a different part of the HTTP request. Let's explore all four, understand how they work, and learn when to use each one.

---

## Strategy 1: Path (URI) Versioning

### 🧠 What is It?

The version number lives **directly in the URL path**:

```
GET /api/v1/restaurants/123
GET /api/v2/restaurants/123
```

Instead of `v1` or `v2`, you could also use plain numbers like `1`, `2`, or even semantic versions like `1.0.0` — it's up to your team.

### ⚙️ How It Works

The client changes the URL path to target a specific API version. The backend has separate handler methods (or controllers) for each version.

### ✅ Pros
- Extremely simple and visible — you can see the version right in the URL
- Easy to test in a browser or Postman
- Most intuitive approach for beginners

### ❌ Cons
- "Pollutes" the URL with version numbers
- URL changes between versions, which can affect caching and bookmarks

---

## Strategy 2: Request Parameter Versioning

### 🧠 What is It?

The version number is sent as a **query parameter**:

```
GET /api/restaurants/123?version=1
GET /api/restaurants/123?version=2
```

The query param name (`version`) and its values (`1`, `2`) can be anything you decide.

### ⚙️ How It Works

The backend inspects the query parameter to decide which version of the logic to execute. The base URL stays the same — only the query string changes.

### ✅ Pros
- The base URL remains clean and unchanged
- Easy to add without restructuring routes

### ❌ Cons
- Version info is less visible (hidden in query string)
- If the client forgets the param, you need fallback logic

---

## Strategy 3: Request Header Versioning

### 🧠 What is It?

The version number is sent as a **custom HTTP header**:

```
GET /api/restaurants/123
Header: X-API-VERSION: 1
```

```
GET /api/restaurants/123
Header: X-API-VERSION: 2
```

### ⚙️ How It Works

The client sends a custom header (e.g., `X-API-VERSION`) with every request. The backend reads this header and routes to the appropriate version logic.

### ✅ Pros
- URL is completely clean — no version numbers in the path or query string
- Professional approach used by many enterprise APIs

### ❌ Cons
- Can't test versioning by just changing the URL in a browser
- Requires clients to always include the correct header

---

## Strategy 4: Media Type (Content Negotiation) Versioning

### 🧠 What is It?

The version is embedded in the `Accept` header using a **custom MIME type**:

```
GET /api/restaurants/123
Header: Accept: application/vnd.myapp.v1+json
```

```
GET /api/restaurants/123
Header: Accept: application/vnd.myapp.v2+json
```

### Understanding the MIME Type Value

Let's break down `application/vnd.myapp.v1+json`:

| Part | Meaning |
|------|---------|
| `application` | Top-level MIME type — indicates two applications are communicating |
| `vnd` | **Vendor-specific** — this is a custom format, not a global standard |
| `myapp` | Your application or company name (e.g., `github`, `stripe`) |
| `v1` | The API version |
| `+json` | The data format used for communication |

The key takeaway: `application` and `vnd` are **always static**. You customize the app name, version, and format.

### Real-World Usage

Major companies use this exact pattern:

- **GitHub**: `application/vnd.github.v3+json`
- **Stripe**: `application/vnd.stripe.v1+json`

This tells the server: *"Return version 3 of this API, formatted as JSON."*

### ✅ Pros
- URL stays completely clean and stable — never changes across versions
- Industry-standard approach for large-scale APIs
- Follows HTTP content negotiation standards

### ❌ Cons
- Most complex to implement and understand
- Harder to test without tools like Postman
- Requires clients to understand MIME type conventions

---

## Comparing All Four Approaches

| Approach | Version Location | URL Changes? | Complexity |
|----------|-----------------|-------------|------------|
| **Path Versioning** | URL path (`/v1/...`) | ✅ Yes | Low |
| **Request Param** | Query string (`?version=1`) | Partially | Low |
| **Request Header** | Custom header (`X-API-VERSION`) | ❌ No | Medium |
| **Media Type** | `Accept` header (MIME type) | ❌ No | High |

---

## Which One Should You Use?

There's no single "best" approach — it depends on your situation:

- **Starting a new project?** → Path versioning is the simplest to begin with
- **Don't want to change URLs?** → Request header or media type versioning
- **Building enterprise-grade APIs?** → Media type versioning is the industry gold standard
- **Working with a team that prefers simplicity?** → Request parameter versioning

Many organizations use **path versioning** for external/public APIs (because it's the most visible) and **header/media type versioning** for internal APIs (because it keeps URLs clean).

---

## ✅ Key Takeaways

- There are four standard approaches: **Path**, **Request Param**, **Request Header**, and **Media Type**
- Path versioning is the simplest — version number goes right in the URL
- Media type versioning is the most professional — uses the `Accept` header with custom MIME types
- Header and media type approaches keep URLs clean and stable
- The `vnd` prefix in MIME types means "vendor-specific" — it signals a custom format
- Big companies like GitHub and Stripe use media type versioning

## ⚠️ Common Mistakes

- **Mixing versioning strategies** in the same API — pick one approach and be consistent
- **Making up random MIME type formats** — follow the `application/vnd.{app}.{version}+{format}` convention
- **Not documenting which strategy you use** — clients need to know how to specify the version

## 💡 Pro Tips

- Discuss with your team which strategy fits best **before** building any APIs
- Whatever names you use for headers, params, or paths — keep them consistent across all endpoints
- In the upcoming lectures, you'll see both the legacy (manual) way and the modern Spring 7 way to implement each strategy
