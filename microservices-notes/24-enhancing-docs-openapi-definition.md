# Enhancing Documentation of REST APIs Using @OpenAPIDefinition

## Introduction

We got our Swagger UI up and running with zero effort — just a Maven dependency. But if you look at the top section, it's blank. No title, no description, no contact info, no license. It looks like an unfinished product. In a professional setting, this won't fly.

In this lecture, we enhance the **global metadata** of our API documentation — the information that applies to the entire microservice, not just individual endpoints. We'll also cover an important Spring Boot concept about package scanning.

---

## Concept 1: The @OpenAPIDefinition Annotation

### 🧠 What is it?

`@OpenAPIDefinition` is the top-level annotation for providing metadata about your entire API. It's placed on your main Spring Boot application class and defines the overall identity of your documentation.

### ⚙️ How it works

Add it to your `AccountsApplication` class:

```java
@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditAwareImpl")
@OpenAPIDefinition(
    info = @Info(
        title = "Accounts Microservice REST API Documentation",
        description = "EazyBank Accounts Microservice REST API Documentation",
        version = "v1",
        contact = @Contact(
            name = "Your Name",
            email = "your-email@example.com",
            url = "https://yourwebsite.com"
        ),
        license = @License(
            name = "Apache 2.0",
            url = "https://yourwebsite.com/license"
        )
    ),
    externalDocs = @ExternalDocumentation(
        description = "EazyBank Accounts Microservice REST API Documentation",
        url = "https://yourwebsite.com/docs"
    )
)
public class AccountsApplication {
    // ...
}
```

### Let's break down each piece:

| Parameter | Purpose |
|---|---|
| `@Info → title` | Short summary displayed at the top of Swagger UI |
| `@Info → description` | Detailed description of what this microservice does |
| `@Info → version` | API version (v1, v2, etc.) |
| `@Contact` | Who to reach out to for questions (name, email, URL) |
| `@License` | Licensing information for your API |
| `@ExternalDocumentation` | Link to external docs for deeper reading |

### 🧪 Result in Swagger UI

Before: empty header section
After: beautiful title, description, contact info, license link, and external docs link — all at the top of the page.

### 💡 Insight

The `@Contact` doesn't have to be a person — it can be a team email, a support portal, or a Slack channel. In real projects, use whatever communication channel makes sense for your organization.

---

## Concept 2: Additional Parameters in @OpenAPIDefinition

### 🧠 What else can you define?

Beyond what we've used, `@OpenAPIDefinition` also supports:

- **`security`** — Define what security mechanisms protect your APIs (OAuth2, JWT, API keys)
- **`servers`** — List the URLs where your API is hosted (dev, staging, production)
- **`tags`** — Pre-define tag categories for grouping APIs
- **`extensions`** — Custom vendor extensions

These are advanced features for production-grade documentation. For now, `info`, `contact`, `license`, and `externalDocs` give you a professional-looking documentation header.

---

## Concept 3: Spring Boot Package Scanning (Bonus)

### 🧠 What is it?

Spring Boot's main class lives in a root package (e.g., `com.eazybytes.accounts`). By default, Spring Boot automatically scans all **sub-packages** under this root package for beans, controllers, repositories, and entities.

### ❓ Why does this matter?

If all your packages are sub-packages of the main class's package, everything just works. But if you create packages *outside* the root package, Spring Boot won't find your beans.

### ⚙️ What to do if packages are outside the root

Use explicit scanning annotations:

```java
@SpringBootApplication
@ComponentScan(basePackages = {"com.eazybytes.accounts.controller", "com.eazybytes.accounts.service"})
@EnableJpaRepositories(basePackages = "com.eazybytes.accounts.repository")
@EntityScan(basePackages = "com.eazybytes.accounts.entity")
public class AccountsApplication {
    // ...
}
```

| Annotation | Scans for |
|---|---|
| `@ComponentScan` | `@Component`, `@Service`, `@Controller`, `@Repository` beans |
| `@EnableJpaRepositories` | JPA repository interfaces |
| `@EntityScan` | JPA entity classes |

### 💡 Insight

The best practice? **Always keep your packages as sub-packages of the main class's package.** Then you never need these annotations. Only use explicit scanning if your project structure forces it.

---

## ✅ Key Takeaways

- `@OpenAPIDefinition` provides global metadata for your entire API documentation
- Place it on your Spring Boot main application class
- Use `@Info` for title, description, version, contact, and license
- Use `@ExternalDocumentation` to link to additional resources
- This metadata appears at the top of Swagger UI for all consumers to see
- Keep packages as sub-packages of your main class to avoid component scanning issues

## ⚠️ Common Mistakes

- Putting `@OpenAPIDefinition` on a controller instead of the main class — it works but isn't conventional
- Using placeholder/dummy data in production (update contact and license info before deploying)
- Creating packages outside the root package without adding scanning annotations

## 💡 Pro Tips

- The `version` field is great for API versioning — update it when you make breaking changes
- Use team email addresses instead of individual emails in `@Contact` for production
- The `@ExternalDocumentation` URL is a great place to link to your internal wiki or Confluence page
