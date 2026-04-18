# HTTP Service Groups — Organizing and Customizing REST Clients

## Introduction

When your application consumes multiple third-party APIs, each might have different base URLs, authentication methods, headers, and interceptors. How do you manage all of this cleanly? The answer is **HTTP Service Groups** — a powerful feature that lets you organize your service interfaces into logical groups and configure each group independently.

---

## The Problem: Multiple APIs, Different Configurations

Imagine your application calls:
- A **Todos API** that uses Bearer token authentication
- A **Posts API** that uses Basic authentication
- A **Users API** that needs a custom request interceptor

Without groups, you'd end up with scattered configuration or awkward workarounds. Groups solve this elegantly.

---

## Step 1: Define Groups with @ImportHttpServices

### ⚙️ Separating Interfaces into Groups

Instead of one `@ImportHttpServices` with all interfaces, create separate ones with **group names**:

```java
@Configuration
@ImportHttpServices(group = "todos", types = TodoService.class)
@ImportHttpServices(group = "posts", types = PostService.class)
public class HttpServiceClientConfig {
    // ...
}
```

Each `@ImportHttpServices` annotation now has a **`group`** property — a logical name that groups related interfaces together.

> In real applications, a group might contain **multiple interfaces** that all belong to the same third-party integration.

---

## Step 2: Configure Each Group Independently

### ⚙️ The Group Configurer Bean

```java
@Bean
public RestClientHttpServiceGroupConfigurer groupConfigurer() {
    return groups -> {
        groups.filterByName("todos").forEachClient((group, restClientBuilder) -> {
            restClientBuilder
                    .baseUrl("https://jsonplaceholder.typicode.com/todos")
                    .defaultHeaders(headers -> {
                        headers.setBasicAuth("username", "password");
                    })
                    .requestInterceptor((request, body, execution) -> {
                        // Intercept and modify requests here
                        return execution.execute(request, body);
                    })
                    .build();
        });

        groups.filterByName("posts").forEachClient((group, restClientBuilder) -> {
            restClientBuilder
                    .baseUrl("https://jsonplaceholder.typicode.com/posts")
                    .defaultHeader("Accept", "application/json")
                    .build();
        });
    };
}
```

### 🧠 Breaking It Down

**`groups.filterByName("todos")`** — selects the group named "todos"

**`.forEachClient((group, restClientBuilder) -> { ... })`** — executes the lambda for every interface in the group. The lambda receives:
- `group` — an `HttpServiceGroup` object with group metadata
- `restClientBuilder` — a `RestClient.Builder` to configure the RestClient for this group

**Inside the lambda**, you can call any `RestClient.Builder` method:
- `.baseUrl()` — set the base URL
- `.defaultHeader()` — add default headers
- `.defaultHeaders()` — set multiple headers (useful for auth)
- `.requestInterceptor()` — intercept every request before it's sent
- `.build()` — build the configured RestClient

---

## Step 3: Remove URL from Interface Annotations

Since the base URL is now configured in the group configurer, you can **remove it from the interface**:

```java
// Before - URL in annotation
@HttpExchange(url = "https://jsonplaceholder.typicode.com/todos")
public interface TodoService { ... }

// After - URL configured in group
@HttpExchange
public interface TodoService { ... }
```

This is cleaner because URL configuration is now **centralized** in the config class.

---

## Request Interceptors

### 🧠 What Are They?

Interceptors let you **modify every request** before it's sent. Common use cases:
- Adding authentication tokens
- Logging requests
- Adding tracing headers

```java
.requestInterceptor((request, body, execution) -> {
    // Modify request here (add headers, log, etc.)
    return execution.execute(request, body);  // Forward the request
})
```

**Parameters:**
- `request` — the full HTTP request being sent
- `body` — the request body (if any)
- `execution` — call `.execute()` to actually send the request

> Always call `execution.execute(request, body)` at the end — otherwise the request won't be sent!

---

## The Power of Groups

### 💡 Why Groups Matter in Enterprise Applications

| Without Groups | With Groups |
|----------------|-------------|
| Base URLs scattered across interfaces | Centralized URL configuration |
| Auth credentials duplicated in every service | Auth configured once per group |
| New interfaces need full configuration | New interfaces inherit group config automatically |
| Hard to manage 10+ third-party integrations | Clean, organized by API provider |

### 🧠 Real-World Scenario

```
Group: "payment-gateway"
├── PaymentService.class
├── RefundService.class
└── ReceiptService.class
→ All share: same base URL, same API key header, same interceptor

Group: "notification-service"
├── EmailService.class
├── SmsService.class
└── PushNotificationService.class
→ All share: different base URL, Bearer token auth
```

When someone adds a new `InvoiceService` to the "payment-gateway" group, it **automatically inherits** the base URL, API key, and interceptor — zero additional configuration needed.

---

## Summary: Three Approaches to REST Consumption

| Approach | Use When | Effort |
|----------|----------|--------|
| **RestTemplate** | Never — it's deprecated | ❌ |
| **RestClient** | You need full control over API calls | Medium |
| **HTTP Service Client** | Standard REST consumption (recommended) | Low |
| **HTTP Service Client + Groups** | Multiple third-party APIs with different configs | Low |

---

## ✅ Key Takeaways

- Groups organize HTTP Service Client interfaces by logical API provider
- Each group gets its own `RestClient` configuration — base URL, headers, auth, interceptors
- Use `RestClientHttpServiceGroupConfigurer` bean to configure groups
- New interfaces added to a group automatically inherit all group configuration
- Always prefer HTTP Service Client (with or without groups) over RestClient or RestTemplate

## ⚠️ Common Mistakes

- Forgetting to call `.build()` in the group configurer — the RestClient won't be fully created
- Forgetting `execution.execute(request, body)` in interceptors — the request won't be sent
- Not removing the URL from `@HttpExchange` after configuring it in the group — causes confusion
- Having the same URL in both the annotation and the group — potential for mismatches

## 💡 Pro Tips

- Use groups even if you start with just one API — it's easier to add more later
- Interceptors are perfect for adding correlation IDs, tracing headers, or request logging
- The `group` parameter in `forEachClient` gives you access to the group name and metadata — useful for conditional logic
- Groups create **separate RestClient beans** for each group, ensuring isolation between different API configurations
