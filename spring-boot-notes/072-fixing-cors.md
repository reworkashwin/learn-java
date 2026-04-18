# Fixing CORS — Global and Per-Controller Solutions

## Introduction

We've understood what CORS is, why it exists, and why the browser blocks cross-origin requests. Now it's time to **actually fix it** in our Spring Boot application so that our React frontend can successfully communicate with our backend.

In this lecture, we'll look at two approaches — the `@CrossOrigin` annotation (per-controller) and the `WebMvcConfigurer` approach (global) — and understand **why the global approach is preferred** in real-world applications.

---

## Option 1: The `@CrossOrigin` Annotation Approach

The quickest way to resolve CORS is to slap the `@CrossOrigin` annotation on your controller or method.

```java
@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class CompanyController {

    @GetMapping("/api/companies")
    public List<CompanyDTO> getCompanies() {
        // ...
    }
}
```

### What Can You Configure?

If you open the `@CrossOrigin` annotation, you'll find these configurable properties:

| Property             | Purpose                                                  |
|---------------------|----------------------------------------------------------|
| `origins`           | List of allowed origin URLs                              |
| `methods`           | Allowed HTTP methods (GET, POST, etc.)                   |
| `allowedHeaders`    | Request headers the backend will accept                  |
| `exposedHeaders`    | Response headers the frontend can read                   |
| `allowCredentials`  | Whether to send cookies/auth tokens                      |
| `maxAge`            | How long to cache the preflight response (in seconds)    |
| `originPatterns`    | Regex patterns for matching origin URLs                  |
| `allowPrivateNetwork` | Whether to allow private network access                |

### Using a Wildcard

```java
@CrossOrigin(origins = "*")
```

This allows **any** UI application to send traffic to your backend. Use this only for local testing or non-critical applications.

> ⚠️ **Never use `*` in production.** It's like leaving your front door wide open and putting up a sign saying, "Come on in, everyone!"

### Multiple Origins

```java
@CrossOrigin(origins = {"http://localhost:5173", "https://myapp.com"})
```

---

### Why We're NOT Using This Approach

The `@CrossOrigin` annotation has a serious limitation: **it doesn't scale**.

In a real application, you might have dozens of controller classes. You'd need to:
1. Add `@CrossOrigin` to **every single controller**
2. If the origin URL changes, update it in **every single place**

That's a maintenance nightmare.

But there's an even bigger gotcha...

---

### ⚠️ The Hidden Trap: `@CrossOrigin` + `WebMvcConfigurer`

Here's something that catches many developers off guard:

> **If your application already has a class implementing `WebMvcConfigurer`, the `@CrossOrigin` annotation will NOT work — even if you place it on the controller class.**

Why? Because the `WebMvcConfigurer` interface has a default method called `addCorsMappings()` with **empty logic**. This empty method **overrides** whatever you configure with the `@CrossOrigin` annotation.

So if you have a configuration class like this:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // Even with no addCorsMappings() override,
    // the default empty implementation wins over @CrossOrigin
}
```

...your `@CrossOrigin` annotations are silently ignored!

> 💡 **Pro Tip:** Only use `@CrossOrigin` if you **don't** have any class implementing `WebMvcConfigurer`. If you do, switch to global CORS configuration.

---

## Option 2: Global CORS Configuration with `WebMvcConfigurer` (Recommended)

Since we already have a `WebConfig` class implementing `WebMvcConfigurer` (from our API versioning setup), we'll configure CORS globally by overriding the `addCorsMappings()` method.

### The Implementation

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("*")
                .allowedHeaders("*")
                .exposedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

Let's break down each line:

---

### `addMapping("/**")`

This defines **which URL patterns** the CORS configuration applies to.

| Pattern       | Meaning                                    |
|--------------|---------------------------------------------|
| `/**`        | All URLs in the entire application          |
| `/api/**`    | Only URLs starting with `/api/`             |

Using `/**` means every single endpoint in your backend application will have these CORS settings applied.

---

### `allowedOrigins("http://localhost:5173")`

Specifies which frontend origins are allowed to send requests.

- The method accepts **varargs** (`String...`), so you can pass multiple origins:

```java
.allowedOrigins("http://localhost:5173", "https://production-app.com")
```

- In our case, we only have one React app running locally.
- In production, you'd replace this with your actual domain name.

---

### `allowedMethods("*")`

Defines which HTTP methods are accepted from cross-origin requests.

- `"*"` = Accept all HTTP methods (GET, POST, PUT, DELETE, PATCH, etc.)
- You can also be specific: `"GET", "POST", "PUT", "DELETE"`

---

### `allowedHeaders("*")`

Controls which **request headers** the backend will accept from the frontend.

- `"*"` = Accept all request headers
- If you want to restrict, specify individual headers: `"content-type", "authorization"`

---

### `exposedHeaders("*")`

Controls which **response headers** the frontend is allowed to read.

- By default, browsers only expose a limited set of "safe" response headers
- `"*"` = Expose all response headers to the frontend
- To expose specific headers: `"X-Custom-Header", "Authorization"`

---

### `allowCredentials(true)`

Tells the browser to **include credentials** (cookies, authentication tokens) in cross-origin requests.

Without this, even if the user is logged in on the frontend, the backend won't receive their session cookies.

---

### `maxAge(3600)`

Sets how long (in **seconds**) the browser should cache the preflight response.

- `3600` seconds = **1 hour**
- During this hour, the browser won't send preflight (OPTIONS) requests for the same API
- After the cache expires, the browser sends a new preflight request

This is a **performance optimization**. Without it, the browser sends a preflight request before **every single** cross-origin API call.

---

## Testing the Fix

After adding the CORS configuration:

1. **Build** the Spring Boot application
2. **Restart** the server

Now refresh the React application in your browser:

- ✅ No CORS errors in the developer console!
- ✅ The **Companies** section now displays data from the backend
- ✅ The "View All Companies" page shows all 30 companies from the database
- ✅ Pagination works — you can navigate between pages of company data

### Verifying in the Developer Console

Open the browser's **Developer Tools** (`F12`) → **Network** tab:

1. Refresh the page
2. Click on the `companies` API request
3. Check the **Preview** tab — you'll see the `CompanyDTO` objects returned by your backend

The **Jobs** section is still empty because we haven't configured job data in the backend yet — that's coming in future sections.

---

## Comparing the Two Approaches

| Feature                       | `@CrossOrigin`              | `WebMvcConfigurer`            |
|------------------------------|-----------------------------|---------------------------------|
| Scope                        | Per method or per controller | Global — entire application     |
| Scalability                  | ❌ Poor                     | ✅ Excellent                    |
| Maintenance                  | ❌ Update everywhere         | ✅ Single place to update       |
| Works with `WebMvcConfigurer`| ❌ Gets overridden           | ✅ Native support               |
| Best for                     | Quick prototyping            | Production applications         |

---

## ✅ Key Takeaways

- **`@CrossOrigin`** is quick but doesn't scale — avoid it in real applications (especially if you have a `WebMvcConfigurer` class)
- **`WebMvcConfigurer.addCorsMappings()`** is the recommended approach for global CORS configuration
- If a class implements `WebMvcConfigurer`, the `@CrossOrigin` annotation's config gets **silently overridden** by the empty default `addCorsMappings()` method
- Use `maxAge()` to cache preflight responses and improve performance
- Always **build and restart** your Spring Boot application after changing CORS configuration
- Never use `origins = "*"` in production — always specify exact domain names

## ⚠️ Common Mistakes

- **Using `@CrossOrigin` when `WebMvcConfigurer` is already in the project** — The annotation silently gets ignored, and developers waste hours debugging
- **Forgetting to restart the Spring Boot server** after adding CORS configuration — Changes won't take effect until the server restarts
- **Using wildcard `*` for `allowedOrigins` in production** — This is a security risk that allows any website to access your API
- **Not setting `allowCredentials(true)`** when authentication is needed — The backend won't receive cookies or auth tokens without this

## 💡 Pro Tips

- Since you likely already have a `WebMvcConfigurer` class (for API versioning, interceptors, etc.), always prefer the `addCorsMappings()` approach
- You can use the **Network** tab in browser Developer Tools to inspect preflight requests and verify your CORS headers
- Consider keeping allowed origins in your `application.properties` or `application.yml` file so you can change them without modifying Java code
- Use environment-specific origin lists — different origins for dev, staging, and production environments
