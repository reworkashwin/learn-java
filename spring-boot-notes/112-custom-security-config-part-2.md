# Crafting Your Own Rules — Custom Security Configurations (Part 2)

## Introduction

In Part 1, we learned to secure specific API paths using `requestMatchers()` and regex patterns. But as your application grows, putting every path directly inside the `SecurityFilterChain` method makes it **clumsy and hard to maintain**. In this lecture, we'll learn a cleaner architecture — **externalizing paths into a separate configuration class**, securing Swagger UI paths, and adding a final `anyRequest().denyAll()` safety net.

---

## Securing Swagger UI Paths

### 🧠 The Problem

After adding Spring Security, your **Swagger UI** documentation pages are also secured by default. Visiting `http://localhost:8080/api/swagger-ui.html` returns a `403 Forbidden` error.

But typically, you want API documentation to be **publicly accessible** so anyone can discover and understand your APIs.

### ⚙️ The Solution

Add all Swagger-related paths to your `requestMatchers()` with `permitAll()`:

```java
.requestMatchers(
    "/swagger-ui/**",
    "/swagger-ui.html",
    "/v3/api-docs/**",
    "/swagger-resources/**",
    "/webjars/**"
).permitAll()
```

These paths cover:
- The Swagger UI web pages
- The OpenAPI specification JSON document
- CSS, JavaScript, and image files that the UI loads
- Dependent JAR resources

After this, anyone can access your Swagger documentation without authentication.

---

## The Problem with Inline Paths

As you keep adding paths to your `SecurityFilterChain` method — public APIs, Swagger paths, secured APIs — the method becomes a **wall of text**:

```java
// This gets messy fast!
.requestMatchers("/api/companies/public", "/api/contacts/public").permitAll()
.requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", ...).permitAll()
.requestMatchers("/api/admin/**").authenticated()
// ... and so on for hundreds of APIs
```

This is **hard to read, hard to maintain, and error-prone**. There's a better way.

---

## Externalizing Paths with `PathsConfig`

### 🧠 The Concept

Create a separate configuration class that maintains **all your paths as lists**. Then inject those lists into your security configuration. This way:
- Paths are managed in one place
- Security configuration stays clean
- Adding new APIs means updating just the paths file

### ⚙️ Step 1: Create `PathsConfig`

```java
@Configuration
public class PathsConfig {

    @Bean("publicPaths")
    public List<String> publicPaths() {
        return List.of(
            "/api/companies/public",
            "/api/contacts/public",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/swagger-resources/**",
            "/webjars/**"
        );
    }

    @Bean("securedPaths")
    public List<String> securedPaths() {
        return List.of(
            "/api/**"   // placeholder regex for future secured APIs
        );
    }
}
```

Notice the **bean names** (`publicPaths` and `securedPaths`) — we'll need them for `@Qualifier`.

### ⚙️ Step 2: Inject Into Security Configuration

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class JobPortalSecurityConfig {

    @Qualifier("publicPaths")
    private final List<String> publicPaths;

    @Qualifier("securedPaths")
    private final List<String> securedPaths;

    @Bean
    SecurityFilterChain customSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(request -> {
                    publicPaths.forEach(path ->
                        request.requestMatchers(path).permitAll()
                    );
                    securedPaths.forEach(path ->
                        request.requestMatchers(path).authenticated()
                    );
                    request.anyRequest().denyAll();
                })
                .formLogin(flc -> flc.disable())
                .httpBasic(withDefaults())
                .csrf(csrfConfig -> csrfConfig.disable())
                .build();
    }
}
```

### ❓ Why `@Qualifier`?

Both beans are of type `List<String>`. Without `@Qualifier`, Spring wouldn't know which list to inject — it would throw an ambiguity error. The `@Qualifier` annotation tells Spring exactly which bean to inject by name.

---

## The `anyRequest().denyAll()` Safety Net

### 🧠 Why Add It?

At the end of your security configuration, add:

```java
request.anyRequest().denyAll();
```

This means: *"If someone tries to access a path that's NOT in my public or secured lists — deny them completely, even if they're authenticated."*

This is a **security best practice**:
- Protects against forgotten or unregistered endpoints
- Ensures only explicitly configured paths are accessible
- Acts as a catch-all safety net

---

## The Workflow Going Forward

With this architecture, here's your workflow when adding new APIs:

1. Create the REST API in your controller
2. Decide if it's **public** or **secured**
3. Add the path to the appropriate list in `PathsConfig`
4. Done! No need to touch `JobPortalSecurityConfig`

This is clean, maintainable, and scalable.

---

## ✅ Key Takeaways

1. **Swagger UI paths** need to be explicitly permitted — add all related paths to your public list
2. **Don't put all paths inline** in the security method — it becomes unmaintainable
3. Create a **`PathsConfig`** class to externalize public and secured paths as separate beans
4. Use **`@Qualifier`** to resolve ambiguity when injecting beans of the same type
5. Always end with **`anyRequest().denyAll()`** as a safety net for unconfigured paths
6. This architecture means you **never modify the security config** when adding new APIs — just update `PathsConfig`

---

## ⚠️ Common Mistakes

- **Not using `@Qualifier`** when injecting multiple `List<String>` beans — causes Spring to throw `NoUniqueBeanDefinitionException`
- **Forgetting Swagger static resources** — the UI page loads but CSS/JS breaks, making it look broken
- **Not adding `anyRequest().denyAll()`** at the end — leaves unconfigured paths in an unpredictable state

---

## 💡 Pro Tips

- Think of `PathsConfig` as your single source of truth for API access control — every developer on the team should know to update it when adding new APIs
- If you want to use `RegexRequestMatchers` with this approach, you can add conditional logic inside the `forEach` loop to check the path pattern
- The `securedPaths` list with `/api/**` as a placeholder is smart — it's ready for when you add secured endpoints in future sections
