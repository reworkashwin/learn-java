# Reading Configurations Using @ConfigurationProperties

## Introduction

We've now seen two ways to read configuration: `@Value` (one property, one field) and the `Environment` interface (one property at a time via method call). Both share the same painful limitation — they don't scale. If you have 20 related properties, you need 20 fields or 20 method calls, all with hardcoded key names.

The third approach, `@ConfigurationProperties`, solves this elegantly. It lets you map an **entire group of properties** to a single Java class — one annotation, one object, all your config neatly packaged. This is the approach the Spring team themselves recommend for most use cases.

---

## The Problem We're Solving

Imagine your accounts microservice needs to expose contact information — a help message, developer contact details, and on-call support numbers. That's multiple properties with different data types:

```yaml
accounts:
  message: "Welcome to EazyBank accounts related local APIs"
  contactDetails:
    name: "John Doe - Developer"
    email: "john@eazybank.com"
  onCallSupport:
    - "(555) 123-4567"
    - "(555) 987-6543"
```

With `@Value`, you'd need three separate fields, three `@Value` annotations, and you'd need to guess the right Java types for nested objects and lists. With `@ConfigurationProperties`, you map **all of this** to one class.

---

## Understanding Java Records (Quick Detour)

Before building our config class, let's talk about **records** — a Java feature introduced in Java 16 (preview) and finalized in Java 17.

### 🧠 What Is a Record?

A record is a special kind of class designed to be a **data carrier**. You declare the fields, and Java automatically generates:
- A constructor accepting all fields
- Getter methods (named after the fields, not with `get` prefix)
- `equals()`, `hashCode()`, and `toString()`
- All fields are `final` — immutable after creation

No setter methods. No boilerplate. Perfect for configuration data that should be read-only.

```java
public record AccountsContactInfoDto(
    String message,
    Map<String, String> contactDetails,
    List<String> onCallSupport
) {}
```

That's it. Three lines. Java handles the rest.

### Why Use Records for Config?

Configuration properties should be **immutable** once loaded. You don't want runtime code accidentally changing your database URL or contact email. Records enforce this by design — no setters, all fields final.

---

## Mapping Properties to a Record with @ConfigurationProperties

### ⚙️ Step 1: Create the Record Class

The field names in your record **must match** the property names in YAML:

| YAML Property | Java Field | Java Type |
|--------------|-----------|-----------|
| `message` | `String message` | Simple string |
| `contactDetails` (name, email) | `Map<String, String> contactDetails` | Key-value pairs → Map |
| `onCallSupport` (list of phones) | `List<String> onCallSupport` | Multiple values → List |

```java
@ConfigurationProperties(prefix = "accounts")
public record AccountsContactInfoDto(
    String message,
    Map<String, String> contactDetails,
    List<String> onCallSupport
) {}
```

The `prefix = "accounts"` tells Spring: "Look for properties starting with `accounts.` and map the sub-properties to these fields."

### ⚙️ Step 2: Enable It in Your Main Class

Spring doesn't auto-discover `@ConfigurationProperties` classes. You need to explicitly enable them:

```java
@SpringBootApplication
@EnableConfigurationProperties(AccountsContactInfoDto.class)
public class AccountsApplication { ... }
```

This tells Spring Boot: "During startup, create a bean from `AccountsContactInfoDto` by reading properties with the `accounts` prefix."

### ⚙️ Step 3: Inject and Use It

Now you can inject this anywhere — just like any other Spring bean:

```java
@Autowired
private AccountsContactInfoDto accountsContactInfoDto;
```

And expose it through a REST API:

```java
@GetMapping("/contact-info")
public ResponseEntity<AccountsContactInfoDto> getContactInfo() {
    return ResponseEntity
            .status(HttpStatus.OK)
            .body(accountsContactInfoDto);
}
```

The response comes back as a complete JSON object:

```json
{
  "message": "Welcome to EazyBank accounts related local APIs",
  "contactDetails": {
    "name": "John Doe - Developer",
    "email": "john@eazybank.com"
  },
  "onCallSupport": ["(555) 123-4567", "(555) 987-6543"]
}
```

---

## Why This Is the Recommended Approach

Think about what just happened:
- **One class** handles all related properties
- **No hardcoded property keys** in your business logic
- **Type-safe** — Spring validates data types at startup, not at runtime
- **Reusable** — inject the same DTO anywhere you need the config
- **Clean** — your controller doesn't know or care where the data comes from

Compare this to the `@Value` approach where you'd need three separate fields, three annotations, and three hardcoded key strings — just for this one set of properties. Now multiply that by every controller that needs the same config.

---

## The Remaining Challenge

So `@ConfigurationProperties` is clearly the best approach for reading configuration. But it doesn't solve everything. Consider this:

What if you need **different property values** for different environments? Your dev environment uses a test database, QA uses a staging database, and production uses the real thing. Right now, all three environments would load the exact same `application.yml`.

How do you maintain different configurations for different environments without rebuilding your application? That's where **Spring Boot Profiles** come in — and that's exactly what we'll explore next.

---

## ✅ Key Takeaways

- `@ConfigurationProperties(prefix = "...")` maps a group of properties to a POJO or record class
- Field names must match property names; data types must match the structure (String, Map, List, etc.)
- Use `@EnableConfigurationProperties` in your main class to activate it
- Prefer Java records for config DTOs — they're immutable by design
- This is the **Spring-recommended** approach over `@Value` for grouped properties
- The injected DTO is a regular Spring bean — use it anywhere via `@Autowired`

⚠️ **Common Mistake:** Forgetting `@EnableConfigurationProperties` — without it, Spring won't create the bean, and you'll get a "No qualifying bean" error at startup.

💡 **Pro Tip:** You can use regular POJO classes instead of records if you need setter-based binding. But for read-only configuration, records are cleaner and safer.
