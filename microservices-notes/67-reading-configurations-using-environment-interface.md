# Reading Configurations Using the Environment Interface

## Introduction

The second approach for reading configuration in Spring Boot uses the `Environment` interface. Unlike `@Value`, which reads from your application properties files, this approach taps into the **environment variables** of the system where your microservice runs.

Why does this matter? Some configuration values — especially sensitive ones like database passwords, API keys, or secret tokens — should **never** live in your `application.yml`. They should be injected via the operating system's environment variables, where only server admins have access. The `Environment` interface is your bridge to that data.

---

## Understanding Environment Variables vs. Application Properties

Before we dive in, let's clarify a common confusion:

| Source | Example | Where It Lives |
|--------|---------|----------------|
| Application properties | `build.version=1.0` | `application.yml` in your codebase |
| Environment variables | `JAVA_HOME=/usr/lib/jvm/java-17` | Operating system / server config |

Application properties are baked into your source code (or classpath). Environment variables exist outside your application — they're set on the machine itself.

Why would you use environment variables for sensitive data? Because your `application.yml` is committed to Git. Anyone with repo access can see those values. Environment variables, on the other hand, are only visible to those with server access.

---

## Using the Environment Interface

### 🧠 What Is It?

`Environment` is a Spring Core interface (`org.springframework.core.env.Environment`) that gives you access to environment properties — both OS-level environment variables and Spring's own property sources.

### ⚙️ How It Works

Step 1: Inject the `Environment` bean into your controller:

```java
@Autowired
private Environment environment;
```

⚠️ **Important:** Make sure you import from `org.springframework.core.env.Environment`, **not** from Hibernate or any other package. The wrong import will compile fine but give you completely different behavior.

Step 2: Use `getProperty()` to read any environment variable:

```java
@GetMapping("/java-version")
public ResponseEntity<String> getJavaVersion() {
    return ResponseEntity
            .status(HttpStatus.OK)
            .body(environment.getProperty("JAVA_HOME"));
}
```

When someone calls `GET /api/java-version`, Spring reads the `JAVA_HOME` environment variable from the operating system and returns it.

### 🧪 Example Output

If you have Java installed via SDKMAN, you might see:

```
/Users/yourname/.sdkman/candidates/java/current
```

On a production server where JDK is installed manually, you'd see something like:

```
/usr/lib/jvm/java-17-openjdk
```

You can read **any** environment variable this way — `JAVA_HOME`, `MAVEN_HOME`, `PATH`, or custom ones you define on your server.

---

## Practical Use Case: Reading Sensitive Configs

In real microservices, this pattern is commonly used for:

- **Database passwords**: Set `DB_PASSWORD` as an env var, read with `environment.getProperty("DB_PASSWORD")`
- **API keys for third-party services**: Keep them out of source code entirely
- **Cloud credentials**: AWS secret keys, Azure connection strings, etc.

This keeps your secrets off Git while making them available to your running application.

---

## Limitations of the Environment Interface

Does this solve all our problems? Not quite. Here are the downsides:

1. **One property at a time** — Just like `@Value`, you call `getProperty("KEY")` for each individual property. 50 properties = 50 method calls.

2. **Hardcoded key names** — You're still writing string literals like `"JAVA_HOME"` in your Java code. Typo? You get `null` back with no compile-time warning.

3. **Not ideal for bulk properties** — If you have a group of related properties (say, all contact information for your service), there's no elegant way to map them together using this approach.

Think of it this way: `@Value` is like asking someone for their name. The `Environment` interface is like asking someone for their phone number. Both work one question at a time. But if you need their entire contact card, you need a better tool.

---

## ✅ Key Takeaways

- The `Environment` interface reads OS-level environment variables (and other property sources)
- Always import from `org.springframework.core.env.Environment` — not Hibernate
- Use `environment.getProperty("KEY_NAME")` to fetch a value
- Best suited for **sensitive information** that shouldn't be in your codebase
- Like `@Value`, this approach only reads **one property at a time** and requires hardcoded key names
- Not recommended when you have many related properties to read — there's a better approach for that

💡 **Pro Tip:** In production, you typically won't have more than 2-3 environment variables per microservice. For bulk configuration, `@ConfigurationProperties` (the third approach) is far more practical.
