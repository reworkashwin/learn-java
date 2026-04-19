# Implementing Custom Routing with Spring Cloud Gateway

## Introduction

Default routing is great for getting started, but real projects often need **custom routing rules**. Maybe you want a professional-looking URL prefix like `/easybank/accounts/...` instead of just `/accounts/...`. Or you need different routing logic for different services. Spring Cloud Gateway lets you define your own routing configurations using Java code.

---

## Why Custom Routing?

### The Default Behavior

With default discovery-based routing, clients call:
```
http://localhost:8072/accounts/api/create
```

### The Custom Requirement

We want a more professional URL structure with an organization prefix:
```
http://localhost:8072/easybank/accounts/api/create
http://localhost:8072/easybank/loans/api/fetch?mobileNumber=...
http://localhost:8072/easybank/cards/api/fetch?mobileNumber=...
```

This tells clients: *"You're accessing the EasyBank platform, specifically the accounts service."* Much more professional.

---

## Building the RouteLocator Bean

### ⚙️ The Code

In your gateway application's main class (or any `@Configuration` class), define a `@Bean` method:

```java
@Bean
public RouteLocator easyBankRouteConfig(RouteLocatorBuilder routeLocatorBuilder) {
    return routeLocatorBuilder.routes()
        .route(p -> p
            .path("/easybank/accounts/**")
            .filters(f -> f.rewritePath("/easybank/accounts/(?<segment>.*)", "/${segment}"))
            .uri("lb://ACCOUNTS"))
        .route(p -> p
            .path("/easybank/loans/**")
            .filters(f -> f.rewritePath("/easybank/loans/(?<segment>.*)", "/${segment}"))
            .uri("lb://LOANS"))
        .route(p -> p
            .path("/easybank/cards/**")
            .filters(f -> f.rewritePath("/easybank/cards/(?<segment>.*)", "/${segment}"))
            .uri("lb://CARDS"))
        .build();
}
```

### 🧠 Breaking Down Each Route

Let's dissect the accounts route:

```java
.route(p -> p
    .path("/easybank/accounts/**")           // Predicate: match this path
    .filters(f -> f.rewritePath(
        "/easybank/accounts/(?<segment>.*)",  // Capture everything after prefix
        "/${segment}"))                        // Forward only the captured part
    .uri("lb://ACCOUNTS"))                    // Route to ACCOUNTS via load balancer
```

**Step 1 — Path Predicate**: If the incoming request path starts with `/easybank/accounts/`, this route matches.

**Step 2 — RewritePath Filter**: The path `/easybank/accounts/api/create` gets rewritten to `/api/create`. The `(?<segment>.*)` regex captures everything after `/easybank/accounts/` into a variable called `segment`, and `/${segment}` becomes the forwarded path.

**Step 3 — URI**: `lb://ACCOUNTS` means "use load balancer + Eureka to find and route to the ACCOUNTS service."

### ⚠️ Important: Use Uppercase for Service Names in URI

In the `.uri("lb://ACCOUNTS")`, use **uppercase** because that's how services are registered in Eureka. The lowercase setting only affects how clients write the URL path, not the internal service registry names.

### ⚠️ Important: Double Forward Slashes After lb:

Make sure you write `lb://ACCOUNTS`, not `lb:/ACCOUNTS`. Missing the double forward slash causes an "invalid hostname" error.

---

## Disabling Default Routes

With custom routes defined, having the default auto-discovered routes creates confusion. Clients might use either path format. To enforce your custom routes only:

```yaml
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: false    # ← Disable auto-discovery routes
```

Now only your `@Bean`-defined routes appear in `/actuator/gateway/routes`.

---

## Java Config vs YAML Config

Spring Cloud Gateway supports both approaches:

**Java-based** (recommended):
```java
.route(p -> p.path("/easybank/accounts/**")
    .filters(f -> f.rewritePath(...))
    .uri("lb://ACCOUNTS"))
```

**YAML-based**:
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: accounts-route
          uri: lb://ACCOUNTS
          predicates:
            - Path=/easybank/accounts/**
          filters:
            - RewritePath=/easybank/accounts/(?<segment>.*), /${segment}
```

Java-based configuration is preferred because:
- More flexibility for complex routing logic
- Better IDE support (autocomplete, type checking)
- Easier to define multiple filters
- Can include conditional logic

---

## Verifying the Routes

After the change, check `/actuator/gateway/routes`:
- You should see only 3 routes (one per microservice) with the `easybank` prefix
- No more default auto-discovered routes

Testing:
```
POST http://localhost:8072/easybank/accounts/api/create  → ✅ Works
GET  http://localhost:8072/easybank/accounts/api/fetch    → ✅ Works
GET  http://localhost:8072/accounts/api/fetch             → ❌ 404 (default disabled)
```

---

## ✅ Key Takeaways

- Define custom routes using a `RouteLocator` `@Bean` for professional URL structures
- Use `rewritePath` to strip custom prefixes before forwarding to microservices
- Disable default discovery-based routes when using custom routes to avoid confusion
- Always use `lb://SERVICE_NAME` (with uppercase) in the URI — this is the Eureka-registered name
- Java-based routing configuration is preferred over YAML for flexibility

## ⚠️ Common Mistakes

- Missing double forward slashes in `lb://ACCOUNTS` → causes "invalid hostname" error
- Using lowercase service names in `.uri("lb://accounts")` → won't match Eureka registry
- Leaving default routes enabled alongside custom routes → confusing dual-path access
- Forgetting the `/**` wildcard in path predicates → only matches exact paths, not sub-paths

## 💡 Pro Tip

You can add any number of filters in the `.filters()` lambda by chaining them: `.filters(f -> f.rewritePath(...).addResponseHeader(...).circuitBreaker(...))`. This is the power of Java-based config — compose as many filters as you need.
