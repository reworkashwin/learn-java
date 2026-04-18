# Package Structure Patterns in Action — Hands-On Demo

## Introduction

In the previous lecture, we learned about two package structure approaches — by layer and by feature/domain. Now it's time to put theory into practice. We'll create the actual package structure for our Job Portal application, set up API versioning, configure a global API prefix, and build our first REST API endpoint — all following enterprise-level standards.

---

## Creating the Domain Package — Company

Our Job Portal has two major domains: **company** and **jobs**. Since this section focuses on exposing a REST API for company details, we start with the `company` domain.

### Step 1: Create the Domain Package

Under the root package (`com.easybytes.jobportal`), create a new package called `company`.

> ⚠️ Remember: use **singular** — `company`, not `companies`.

### Step 2: Create the Technical Sub-Package

Inside `company/`, create a `controller/` package — because we're building a REST API.

### Step 3: Create the Controller Class

Inside `controller/`, create `CompanyController.java`:

```java
@RestController
@RequestMapping("/api/companies")
public class CompanyController {
    // REST API methods go here
}
```

Notice something important here: the **package** name is `company` (singular — it's a domain name), but the **REST API path** uses `companies` (plural — it's a resource name). This is a widely followed REST convention:

- **Package names** → singular (`company`)
- **REST resource paths** → plural nouns (`/companies`)

---

## Setting Up API Versioning

In enterprise applications, you don't just expose a REST API and forget about it. Over time, requirements change, and you need to **version** your APIs so that older clients don't break when you introduce new behavior.

### Step 1: Create the Config Package

Under the root package, create `config/web/`. This `config` package is one of those **supporting packages** we discussed — it doesn't belong to any single domain.

### Step 2: Create WebConfig

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureApiVersioning(ApiVersionConfigurer configurer) {
        configurer.useMediaTypeParameter(
            "application/vnd.eazyapp+json", "v"
        )
        .addSupportedVersions("1.0", "2.0", "3.0")
        .setDefaultVersion("1.0");
    }
}
```

### 🧠 What's happening here?

- We're using **Media Type-based versioning** — the version is passed via the `Accept` header
- The media type format is `application/vnd.eazyapp+json` where `eazyapp` is your application name
- The version parameter is `v` (e.g., `v=1.0`)
- We support versions `1.0`, `2.0`, and `3.0`
- If a client doesn't send any version info, the **default version** `1.0` is used

### Step 3: Use Version in Controller

```java
@GetMapping(version = "1.0")
public ResponseEntity<String> getAllCompanies() {
    return ResponseEntity.ok("companies list");
}
```

The `version = "1.0"` attribute ties this method to version 1.0. If a future requirement comes in, you can create a **new method** for version 2.0 without touching the existing one. This is the beauty of versioning — backward compatibility.

---

## Configuring a Global API Prefix

In our Job Portal, every REST API should start with `/api` (e.g., `/api/companies`, `/api/jobs`, `/api/users`). But hardcoding `/api` in every single controller's `@RequestMapping` is:

1. **Repetitive** — you'll write it dozens of times
2. **Error-prone** — someone might forget it
3. **Hard to change** — if you later want `/api/v2/eazyapp`, you'd have to modify every controller

### The Solution — Centralized Path Prefix

Inside `WebConfig`, override `configurePathMatch`:

```java
@Override
public void configurePathMatch(PathMatchConfigurer configurer) {
    configurer.addPathPrefix("/api", _ -> true);
}
```

### 🧠 How it works

- `addPathPrefix("/api", ...)` adds `/api` before every controller's path
- The second parameter is a **Predicate** — a lambda that decides whether to apply the prefix to a given controller
- `_ -> true` means "apply to ALL controllers"
- The `_` is an **unnamed variable** (Java 22+) — we use it because we don't need the controller type inside the lambda

Now you can simplify your controller:

```java
@RestController
@RequestMapping("/companies")  // No need for /api prefix here!
public class CompanyController { ... }
```

The actual URL becomes `/api/companies` automatically.

### ❓ What if you don't want the prefix on some controllers?

Replace the lambda with actual logic:

```java
configurer.addPathPrefix("/api", controllerType -> {
    // return true to apply prefix, false to skip
    return controllerType.getSimpleName().endsWith("Controller");
});
```

💡 **Pro Tip:** If you ever need to change the prefix to `/api/eazyapp`, you update **one line** in `WebConfig` instead of touching every controller class.

---

## Testing the REST API

### Sending a Request with Version

In Postman, create a GET request to `http://localhost:8080/api/companies` with this header:

```
Accept: application/vnd.eazyapp+json;v=1.0
```

**Result:** `"companies list"` ✅

### Testing with Wrong Version

Change `v=1.0` to `v=2.0`:

**Result:** `404 Not Found` — because no method handles version 2.0 yet.

### Testing Without Version Header

Remove the `Accept` header entirely:

**Result:** `"companies list"` — because we set `1.0` as the **default version**.

Still, it's best practice to always send the version explicitly.

---

## ✅ Key Takeaways

- Create domain packages with **singular names** (`company`, `job`, `user`)
- Use **plural nouns** for REST resource paths (`/companies`, `/jobs`)
- Set up **API versioning** early — it saves painful migrations later
- Use **Media Type-based versioning** (`Accept` header) as the enterprise standard
- Configure a **global API prefix** in `WebConfig` instead of repeating it in every controller
- Use Java's **unnamed variables** (`_`) when a lambda parameter isn't used
- Always **restart manually** when adding new dependencies — DevTools handles code changes, not dependency changes

---

## ⚠️ Common Mistakes

- Using plural for package names (`companies/controller/` instead of `company/controller/`)
- Hardcoding `/api` in every controller's `@RequestMapping`
- Forgetting to set a default version — clients that don't send a version header will get 404
- Not separating config into its own package — dumping `WebConfig` into a domain package

---

## 💡 Pro Tips

- The `configurePathMatch` approach is especially powerful in microservices where you might want different prefixes for different groups of controllers
- Always set a **default version** so clients that forget the version header still get a valid response
- Enterprise applications often include the **product name** in the API path (e.g., `/eazyapp/api/companies`) — the prefix configurer makes this trivially easy
