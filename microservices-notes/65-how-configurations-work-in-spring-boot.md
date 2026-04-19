# How Configurations Work in Spring Boot

## Introduction

Before jumping into advanced configuration management with Spring Cloud Config Server, let's understand the fundamentals. Spring Boot provides several built-in mechanisms for handling configurations — from simple property files to environment variables to command-line arguments. Understanding these basics is essential because the advanced approaches build on top of them.

---

## Spring Boot's Configuration Sources

Spring Boot lets you externalize your configuration so that the **same application code works across different environments** without rebuilding. The key configuration sources are:

1. **Property files** — `application.properties` or `application.yml`
2. **YAML files** — structured alternative to properties files
3. **Environment variables** — OS-level variables
4. **Command-line arguments** — passed during application startup

---

## Configuration Priority Order

What happens when the same property is defined in multiple places? Spring Boot follows a strict **priority order** — higher-priority sources override lower ones:

| Priority | Source | Example |
|----------|--------|---------|
| 1 (Lowest) | `application.properties` / `application.yml` | `server.port=8080` |
| 2 | OS Environment Variables | `export SERVER_PORT=9090` |
| 3 | Java System Properties | `-Dserver.port=9091` |
| 4 | JNDI Attributes | (legacy) |
| 5 | Servlet Config Init Parameters | (web-specific) |
| 6 (Highest) | Command-Line Arguments | `--server.port=9092` |

The rule is simple: **later sources override earlier ones**.

So if `application.yml` says `server.port=8080` but you pass `--server.port=9092` as a command-line argument, your app starts on port **9092**.

> Why is this useful? You define sensible defaults in `application.yml` for development, then override specific properties per environment using environment variables or command-line arguments.

---

## Three Ways to Read Configuration Values

Now that you know where configs come from, how do you access them in your Java code?

### Approach 1: `@Value` Annotation

The simplest approach — inject a single property into a field:

```java
@Value("${build.version}")
private String buildVersion;
```

During startup, Spring Boot looks for the property `build.version` across all configuration sources (respecting priority order) and populates the field.

**When to use**: When you need just a few properties in a specific class.

**Limitation**: You hardcode the property key name. If you have 20 properties, you need 20 `@Value` annotations.

---

### Approach 2: `Environment` Interface

Spring Boot provides an `Environment` interface that gives programmatic access to properties, especially **OS environment variables**:

```java
@Autowired
private Environment environment;

public void someMethod() {
    String dbUrl = environment.getProperty("DATABASE_URL");
}
```

Server administrators often create OS environment variables with sensitive information during server setup. The `Environment` interface lets you read those values.

**When to use**: When reading OS-level environment variables or when you need programmatic (not declarative) property access.

**Limitation**: Still requires hardcoding property key names. Each property needs a separate `getProperty()` call.

---

### Approach 3: `@ConfigurationProperties` (Recommended)

The most robust approach — bind an **entire group of properties** to a Java class automatically:

**Step 1**: Define properties with a common prefix in `application.yml`:

```yaml
accounts:
  message: "Welcome to Accounts"
  contactDetails:
    name: "John Doe"
    email: "john@example.com"
  onCallSupport:
    - "(555) 111-2222"
    - "(555) 333-4444"
```

**Step 2**: Create a configuration class with matching field names:

```java
@ConfigurationProperties(prefix = "accounts")
public class AccountsContactInfo {
    private String message;
    private Map<String, String> contactDetails;
    private List<String> onCallSupport;
    
    // getters and setters
}
```

**Step 3**: Field names and types must match the YAML structure. Spring Boot automatically binds all properties to the fields during startup.

**When to use**: When you have **multiple related properties** that logically belong together.

**Advantages over @Value and Environment**:
- No hardcoded property keys scattered across your code
- Type-safe binding (Maps, Lists, nested objects)
- All related configs in one place
- Easy to test

---

## Comparison of the Three Approaches

| Aspect | `@Value` | `Environment` | `@ConfigurationProperties` |
|--------|----------|---------------|---------------------------|
| Hardcoded keys | Yes | Yes | No (prefix only) |
| Multiple properties | One per annotation | One per `getProperty()` call | All at once |
| Type safety | Basic | No | Full (Maps, Lists, Objects) |
| Best for | 1-2 properties | Environment variables | Groups of related properties |
| Recommended for production | No | No | ✅ Yes |

---

## The Bigger Picture

These Spring Boot approaches are the **basic level** of configuration management. They work, but they have limitations when you have hundreds of microservices:

- Properties are still defined per-microservice
- No centralized management across all services
- No real-time refresh without restart
- No versioning of configuration changes

The advanced solution — **Spring Cloud Config Server** — addresses all of these limitations. We'll explore that after implementing these basic approaches.

---

## ✅ Key Takeaways

- Spring Boot supports multiple configuration sources: property files, environment variables, system properties, and command-line arguments
- Configuration sources follow a **strict priority order** — command-line arguments have the highest priority
- **Three ways to read properties**: `@Value` (single property), `Environment` interface (programmatic access), `@ConfigurationProperties` (recommended for groups)
- `@ConfigurationProperties` is the **production-recommended approach** — type-safe, no hardcoded keys, binds entire property groups
- These basic approaches work well for individual services but don't solve centralized configuration management across many microservices
- Spring Cloud Config Server (covered next) is the production-grade solution
