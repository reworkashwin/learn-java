# Securing the Gateway Server as a Resource Server — Setup

## Introduction

You've got your Keycloak auth server running. You've got client credentials configured. You can obtain an access token. But there's one critical missing piece — your **resource server**. Without converting your Gateway server into a resource server, there's no one on the other end to actually *validate* that access token. That's what we tackle here.

Why the Gateway server? Because it's the single entry point to your entire microservices network. If you secure the gateway, you secure everything behind it.

---

## Adding Security Dependencies to the Gateway Server

### 🧠 What do we need?

Three dependencies go into the Gateway server's `pom.xml`:

1. **`spring-boot-starter-security`** — Pulls in the Spring Security framework itself.
2. **`spring-security-oauth2-resource-server`** — Converts the Gateway into an OAuth2 resource server that can validate access tokens.
3. **`spring-security-oauth2-jose`** — Adds support for JWT token processing (JSON Object Signing and Encryption).

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-oauth2-resource-server</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-oauth2-jose</artifactId>
</dependency>
```

After adding these, reload your Maven changes to download all necessary libraries.

---

## Building the SecurityConfig Class

### ❓ Why a configuration class?

Spring Security needs to know *your* rules — which APIs are public, which require authentication, and how tokens should be validated. You define all of this in a configuration class.

### ⚙️ Key Annotations

Since Spring Cloud Gateway is built on the **reactive** stack (Spring WebFlux), you must use:

- `@Configuration` — Tells Spring this class defines beans.
- `@EnableWebFluxSecurity` — Activates reactive security. **Not** `@EnableWebSecurity` (that's for traditional servlet-based apps).

### ⚙️ The SecurityWebFilterChain Bean

This is the core of your security setup. The method signature looks like:

```java
@Bean
public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
    // configuration goes here
    return http.build();
}
```

The `ServerHttpSecurity` parameter is the builder through which you express your security rules.

---

## Defining Access Rules — Permit vs. Authenticate

Here's the key decision: not all APIs need the same level of protection.

### The Business Logic

- **GET APIs** → Allow public access (`permitAll`). Read-only operations are safe to expose.
- **POST/PUT/DELETE on accounts, cards, loans** → Require authentication.

### How It Looks in Code

```java
http.authorizeExchange(exchanges -> exchanges
        .pathMatchers(HttpMethod.GET).permitAll()
        .pathMatchers("/eazybank/accounts/**").authenticated()
        .pathMatchers("/eazybank/cards/**").authenticated()
        .pathMatchers("/eazybank/loans/**").authenticated()
);
```

**Order matters.** The first rule has the highest priority. Since `GET` with `permitAll()` is listed first, GET requests to accounts/cards/loans are still allowed without authentication — even though `.authenticated()` is specified for those paths. For everything else (POST, PUT, DELETE), authentication is enforced.

💡 **Pro Tip:** The path matchers for accounts, cards, and loans are written as separate `.pathMatchers()` calls (not comma-separated) intentionally. You'll see why when role-based authorization is introduced later.

---

## Configuring the Resource Server for JWT

After the authorization rules, you tell Spring Security this is an OAuth2 resource server that uses JWT tokens:

```java
http.oauth2ResourceServer(rs -> rs
        .jwt(jwt -> jwt.jwtAuthenticationConverter(Customizer.withDefaults()))
);
```

Using `Customizer.withDefaults()` means: "Use Spring Security's default JWT validation logic."

---

## Disabling CSRF Protection

```java
http.csrf(csrf -> csrf.disable());
```

Why disable it? CSRF (Cross-Site Request Forgery) protection is designed for browser-based interactions. When your clients are backend services communicating via APIs (no browsers), CSRF protection only gets in the way — it would reject all your POST, PUT, and DELETE requests.

---

## Telling the Resource Server Where to Validate Tokens

Your Gateway (resource server) needs to know how to verify that an access token was legitimately issued by Keycloak. This is configured in `application.yml`:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: http://localhost:7080/realms/master/protocol/openid-connect/certs
```

### 🧠 What does this do?

During startup, the resource server hits this URL to download Keycloak's **public certificate**. With this certificate, it can:

- Verify that an access token was indeed signed by Keycloak's **private key**
- Check if the token is expired, tampered with, or otherwise invalid

The key insight: Keycloak holds the **private key** (used to *sign* tokens). The resource server holds the **public key** (used to *verify* tokens). The resource server can never *issue* tokens — only validate them.

---

## Summary of Changes

| Change | Where |
|--------|-------|
| 3 security dependencies | `pom.xml` |
| `SecurityConfig` class with filter chain | `config` package |
| JWK Set URI property | `application.yml` |

---

## ✅ Key Takeaways

- The Gateway server acts as a resource server — the security gatekeeper for all microservices behind it.
- Use `@EnableWebFluxSecurity` (not `@EnableWebSecurity`) because Gateway is reactive.
- Public key from Keycloak lets the resource server validate tokens without contacting Keycloak on every request.
- CSRF is disabled because there are no browsers involved in service-to-service communication.

⚠️ **Common Mistake:** Using `@EnableWebSecurity` instead of `@EnableWebFluxSecurity` in a Gateway project. This will silently fail because the Gateway is built on WebFlux, not the servlet stack.
