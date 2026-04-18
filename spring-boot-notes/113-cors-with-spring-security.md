# CORS Configurations Using Spring Security

## Introduction

Remember the CORS error we saw at the very beginning of this section when the UI application tried to talk to the backend? We had previously configured CORS in a `WebConfig` class — but once Spring Security is added, those configurations **stop working**. In this lecture, we'll learn how to configure CORS the **Spring Security way**, so your frontend and backend can communicate properly.

---

## Why the Old CORS Config Doesn't Work

### 🧠 The Problem

Earlier, we had a `WebConfig` class with CORS configurations that allowed cross-origin requests from our React frontend. But after adding Spring Security:
- The UI application can't fetch data
- The browser console shows **CORS policy errors**

Why? Because **Spring Security intercepts requests before they reach your web MVC configuration**. The old `WebConfig` CORS settings are simply bypassed.

When Spring Security is in your classpath, you **must** provide CORS configuration through Spring Security's own mechanism.

---

## Setting Up CORS with Spring Security

### ⚙️ Step 1: Delete the Old `WebConfig` CORS Code

First, remove the old CORS configuration from `WebConfig` — it's no longer effective.

### ⚙️ Step 2: Create a `CorsConfigurationSource` Bean

At the end of your `JobPortalSecurityConfig` class, create a method that returns a `CorsConfigurationSource` bean:

```java
@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("http://localhost:5173"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

This is **the same CORS logic** we had before — same allowed origins, methods, and headers. We're just writing it in a format that Spring Security understands.

### ⚙️ Step 3: Feed It to Spring Security

In your `SecurityFilterChain` bean, add the `.cors()` method and connect it to the bean:

```java
@Bean
SecurityFilterChain customSecurityFilterChain(HttpSecurity http) throws Exception {
    return http
            .authorizeHttpRequests(request -> {
                // ... your path configurations
            })
            .formLogin(flc -> flc.disable())
            .httpBasic(withDefaults())
            .csrf(csrfConfig -> csrfConfig.disable())
            .cors(corsConfig -> corsConfig.configurationSource(corsConfigurationSource()))
            .build();
}
```

Let's break this down:
- **`.cors()`** — Enables CORS handling in Spring Security
- **`corsConfig -> corsConfig.configurationSource(...)`** — Tells Spring Security where to get the CORS rules
- **`corsConfigurationSource()`** — Calls the bean method we just created

---

## When Does CORS Matter?

CORS issues only appear when:
1. Your **frontend** (e.g., `http://localhost:5173`) is on a **different origin** than your **backend** (`http://localhost:8080`)
2. The frontend tries to call **secured** API paths

For **public APIs**, the UI might already work without CORS issues. But the moment secured paths are involved, CORS configuration becomes essential.

---

## Testing

After making these changes:
1. Rebuild the backend
2. Update the UI code to use the new API paths (with `/public` suffix)
3. Start both applications
4. The frontend should successfully fetch and display data without any CORS errors

---

## ✅ Key Takeaways

1. When Spring Security is present, **CORS must be configured through Spring Security** — not through `WebMvcConfigurer`
2. Create a **`CorsConfigurationSource` bean** with your allowed origins, methods, and headers
3. Connect it to the `SecurityFilterChain` using **`.cors(corsConfig -> corsConfig.configurationSource(...))`**
4. The CORS configuration logic itself is the same — only the **where** you put it changes
5. Always remove or disable the old `WebConfig` CORS setup to avoid confusion

---

## ⚠️ Common Mistakes

- **Keeping the old `WebConfig` CORS setup** alongside Spring Security CORS — the old one is silently ignored, causing confusion
- **Forgetting to call `.cors()`** in the `SecurityFilterChain` — the `CorsConfigurationSource` bean exists but isn't connected
- **Not allowing `OPTIONS` method** — browsers send preflight OPTIONS requests for CORS, and blocking them breaks the flow

---

## 💡 Pro Tips

- If your UI is deployed at a different URL in production (e.g., `https://myapp.com`), update the `allowedOrigins` list accordingly
- You can allow **multiple origins** in the list for different environments
- Setting `allowCredentials(true)` is important if your frontend sends cookies (like `JSESSIONID`) with requests
