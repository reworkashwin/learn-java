# CORS — The Browser's Overprotective Parent

## Introduction

In the previous lecture, we saw a frustrating error: our React frontend couldn't talk to our Spring Boot backend. The browser stopped them like an overprotective parent saying, *"You two aren't allowed to talk to each other!"*

That "parent" is the browser's **CORS policy**. In this lecture, we'll deeply understand what CORS is, why it exists, how the browser decides to block requests, and what options Spring Boot gives us to fix it.

Understanding CORS isn't optional — it's **essential knowledge** for every backend developer. Without it, you'll be locked in an eternal fight with your frontend team.

---

## What is CORS?

**CORS** stands for **Cross-Origin Resource Sharing**.

Let's break that down:
- **Cross-Origin** = Two different applications (different domains, ports, or protocols)
- **Resource Sharing** = They're trying to exchange data with each other

So CORS is a **browser mechanism** that controls whether two different origins are allowed to share resources with each other.

### 🧠 What is an "Origin"?

An origin is simply a combination of three things:

| Component    | Example                |
|-------------|------------------------|
| **Protocol** | `http` or `https`     |
| **Host**     | `localhost`, `example.com` |
| **Port**     | `3000`, `8080`, `5173` |

**If ANY of these three components differ between two URLs, they are considered different origins.**

### Examples

| Frontend URL               | Backend URL               | Same Origin? | Why?                    |
|---------------------------|---------------------------|-------------|-------------------------|
| `http://localhost:5173`   | `http://localhost:8080`   | ❌ No       | Different ports          |
| `http://domain1.com`      | `http://domain2.com`      | ❌ No       | Different hosts          |
| `http://example.com`      | `https://example.com`     | ❌ No       | Different protocols      |
| `https://mysite.com`      | `https://mysite.com/api`  | ✅ Yes      | Same protocol, host, port|

In our case, the React app runs at `http://localhost:5173` and the Spring Boot API runs at `http://localhost:8080`. The port numbers are different → different origins → **CORS kicks in**.

---

## Why Does the Browser Block Cross-Origin Requests?

Here's the thing — CORS is **not** a security attack. It's a **security protection**.

Think about this scenario:

1. You log into **netflix.com** and your browser stores a session cookie
2. You accidentally visit a malicious website — **hacker.com**
3. Behind the scenes, **hacker.com** tries to make a request to **netflix.com** using your browser
4. Since your browser has Netflix's session cookie, the hacker could steal your data!

The browser prevents this by saying:

> *"Hey, hacker.com is trying to access netflix.com? Those are two different origins. I'm blocking this communication unless netflix.com explicitly says it's okay."*

### Real-World Analogy

Imagine you're at a restaurant. A stranger walks up to your table and says, *"I'll take their food."* The waiter (browser) would say, *"Sorry, you're not from this table (different origin). I'm not serving you unless the table (backend) says it's okay."*

That's exactly what the browser does. It acts as a **gatekeeper** between applications.

> ⚠️ **Important Clarification:** Many developers think CORS is a security issue or attack. It's NOT. It's the browser's **default protection mechanism** to prevent unauthorized cross-origin data sharing.

---

## How CORS Works — The Preflight Request

When the browser detects a cross-origin request, it doesn't just block and give up. It follows a protocol:

### Step-by-Step Flow

1. **UI tries to call a backend API** (e.g., `GET /api/companies`)
2. **Browser detects different origins** (port 5173 → port 8080)
3. **Browser sends a "preflight" request** to the backend BEFORE the actual request
   - This is an `OPTIONS` request asking: *"Hey backend, is it okay if I send requests from this origin?"*
4. **Backend responds** with headers that say which origins, methods, and headers are allowed
5. **Browser checks the response:**
   - If the origin is allowed → ✅ Actual request proceeds
   - If the origin is NOT allowed → ❌ Request is blocked (CORS error)

Think of the preflight request as a **security checkpoint** at an airport. Before you board the plane (actual request), security checks your ID and boarding pass (preflight). If everything matches, you're allowed through.

---

## Options to Fix CORS in Spring Boot

Spring Boot provides **four main approaches** to configure CORS. Let's understand each one.

---

### Option 1: `@CrossOrigin` Annotation

The simplest approach. Place the `@CrossOrigin` annotation on a REST API method or controller class.

#### On a single method:

```java
@GetMapping("/companies")
@CrossOrigin(origins = "http://localhost:5173")
public List<CompanyDTO> getCompanies() {
    // ...
}
```

#### On an entire controller:

```java
@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class CompanyController {
    // All methods in this controller allow CORS from the specified origin
}
```

#### Multiple origins:

```java
@CrossOrigin(origins = {"http://localhost:5173", "https://myapp.com"})
```

#### Allow all origins (⚠️ dangerous):

```java
@CrossOrigin(origins = "*")
```

**Pros:** Simple and quick
**Cons:**
- You must add it to **every controller class** or method
- Updating origins means visiting every controller
- Doesn't scale for real applications with many controllers

---

### Option 2: CorsFilter Bean

Create a global configuration using a `CorsFilter` bean.

```java
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(Collections.singletonList("*"));
        config.setAllowedHeaders(List.of("content-type"));
        config.setExposedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
```

| Method                  | Purpose                                              |
|------------------------|------------------------------------------------------|
| `setAllowedOrigins()`  | Which domains can send requests                       |
| `setAllowedMethods()`  | Which HTTP methods are accepted (GET, POST, etc.)     |
| `setAllowedHeaders()`  | Which request headers the backend will accept         |
| `setExposedHeaders()`  | Which response headers the frontend can read          |
| `setAllowCredentials()`| Whether to pass cookies/auth tokens                   |

**Pros:** Global configuration — applies to all endpoints
**Cons:** Slightly more code than the annotation approach

---

### Option 3: Spring Security CORS Configuration

When you add Spring Security to your project (which we'll cover in a later section), you can configure CORS through the security filter chain.

> This option will be covered in detail during the **Spring Security** section of this course.

---

### Option 4: WebMvcConfigurer — `addCorsMappings()`

Override the `addCorsMappings()` method in a class that implements `WebMvcConfigurer`.

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .exposedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

| Method             | Purpose                                                                 |
|-------------------|-------------------------------------------------------------------------|
| `addMapping()`    | URL patterns to apply CORS config to (`/**` = all, `/api/**` = API only)|
| `allowedOrigins()`| Domains allowed to access your APIs                                     |
| `allowedMethods()`| HTTP methods allowed                                                    |
| `allowedHeaders()`| Request headers accepted                                                |
| `exposedHeaders()`| Response headers exposed to the frontend                                |
| `allowCredentials()`| Whether cookies and auth tokens are sent                              |
| `maxAge()`        | How long (in seconds) the browser caches the preflight response         |

The `maxAge(3600)` means the browser caches the CORS configuration for **3600 seconds (1 hour)**. During that hour, the browser won't send additional preflight requests for the same API — a nice **performance optimization**.

---

## What Happens Behind the Scenes?

When Spring Boot processes any of these CORS configurations, it sends **response headers** in the preflight response:

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: content-type
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

The browser reads these headers and decides: *"Okay, the backend says this origin is allowed. I'll let the actual request through."*

---

## When is CORS NOT Required?

If the frontend and backend share the **same origin**, CORS isn't needed.

Example:
- Frontend: `https://mywebsite.com`
- Backend: `https://mywebsite.com/api`

Same protocol, same host, same port → **same origin → no CORS**.

---

## Why Postman Didn't Have This Problem

Great question! When we tested our APIs with Postman, we never saw a CORS error. Why?

Because **Postman is not a browser**. It sends HTTP requests directly — there's no "origin" concept. CORS is purely a **browser-enforced policy**. Tools like Postman, `curl`, and other HTTP clients bypass CORS entirely.

This is exactly why backend developers and frontend developers often clash:
- **Backend dev:** *"My API works perfectly in Postman!"*
- **Frontend dev:** *"I keep getting CORS errors!"*
- **The real problem:** The backend hasn't configured CORS to allow the frontend's origin.

> 💡 **Pro Tip:** As a backend developer, it's **your responsibility** to configure CORS. The frontend can only send the request — it's the backend and browser that decide whether to allow it.

---

## ✅ Key Takeaways

- **CORS** = Cross-Origin Resource Sharing — a browser security mechanism, NOT a security attack
- An **origin** = protocol + host + port — if any differ, it's a cross-origin request
- The browser sends a **preflight request** (OPTIONS) before the actual request to check permissions
- Spring Boot offers **4 ways** to configure CORS: `@CrossOrigin`, `CorsFilter`, Spring Security, and `WebMvcConfigurer`
- **Never use `*` (wildcard) for `allowedOrigins` in production** — it opens your API to every application on the internet
- CORS only applies to **browsers** — tools like Postman don't enforce it

## ⚠️ Common Mistakes

- **Thinking CORS is a security attack** — It's the opposite; it's a protection mechanism
- **Using `origins = "*"` in production** — This removes all origin restrictions and is a serious security risk
- **Using `@CrossOrigin` when you have a `WebMvcConfigurer` class** — The `addCorsMappings()` method with empty logic overrides annotation-based configs
- **Blaming the frontend for CORS errors** — It's always the backend's responsibility to configure CORS

## 💡 Pro Tips

- Use the `maxAge()` setting to cache preflight responses — it reduces unnecessary OPTIONS requests and improves performance
- In real applications, use **global CORS configuration** (Option 2, 3, or 4) instead of per-controller annotations
- Always test your APIs from a browser-based frontend, not just Postman — CORS issues only appear in browsers
- Keep your allowed origins list **explicit** — list each domain instead of using wildcards
