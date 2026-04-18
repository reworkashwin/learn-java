# Environment Variables, JVM Args & CLI Args — Explained

## Introduction

We know that Spring Boot can read property values from external sources — not just `application.properties`. But *how exactly* do you feed properties using environment variables, JVM system properties, and command-line arguments? What's the syntax? What naming conventions must you follow?

This note breaks down the **three most common externalizing approaches** that operations teams use in production to override configuration without touching source code.

---

## Approach 1: Environment Variables

### 🧠 What Are Environment Variables?

Environment variables are key-value pairs defined at the **operating system level**. They exist outside your application and are accessible to any process running on that machine.

### ⚙️ The Naming Convention

When injecting a Spring Boot property via environment variables, you must **convert the property key** to a specific format:

| Rule | Example |
|------|---------|
| All letters → **UPPERCASE** | `spring` → `SPRING` |
| Dots (`.`) → **underscores (`_`)** | `spring.jpa` → `SPRING_JPA` |
| Hyphens (`-`) → **underscores (`_`)** | `show-sql` → `SHOW_SQL` |

**Original property:**
```
spring.jpa.show-sql
```

**Environment variable name:**
```
SPRING_JPA_SHOW_SQL
```

### ❓ Why Can't You Use the Original Format?

Operating systems have strict rules about environment variable names — they don't allow dots or hyphens. Spring Boot uses **relaxed binding** to automatically map `SPRING_JPA_SHOW_SQL` back to `spring.jpa.show-sql` internally.

### 🧪 How to Set Environment Variables

**On Windows:**
```cmd
set SPRING_JPA_SHOW_SQL=false; java -jar app.jar
```

**On Linux/macOS:**
```bash
export SPRING_JPA_SHOW_SQL=false
java -jar app.jar
```

Or inline:
```bash
SPRING_JPA_SHOW_SQL=false java -jar app.jar
```

For multiple variables:
```bash
export SPRING_JPA_SHOW_SQL=false
export CACHE_JOBS_TTL_MINUTES=5
java -jar app.jar
```

---

## Approach 2: JVM System Properties

### 🧠 What Are JVM System Properties?

JVM system properties are key-value pairs passed directly to the Java Virtual Machine when starting an application. They're set using the `-D` flag.

### ⚙️ The Syntax

```bash
java -Dproperty.key=value -jar app.jar
```

**Key difference from environment variables:** You use the **exact property key** as Spring Boot expects it — no uppercase conversion needed.

### 🧪 Examples

```bash
# Single property
java -Dspring.jpa.show-sql=false -jar app.jar

# Multiple properties
java -Dspring.jpa.show-sql=false -Dcache.jobs.ttl-minutes=5 -jar app.jar
```

### 💡 Placement Matters

The `-D` flags must come **before** `-jar`:

```bash
# ✅ Correct
java -Dspring.jpa.show-sql=false -jar app.jar

# ❌ Wrong — JVM won't read these
java -jar app.jar -Dspring.jpa.show-sql=false
```

---

## Approach 3: Command-Line Arguments

### 🧠 What Are CLI Arguments?

Command-line arguments are values passed to the application (not the JVM) after the JAR file name. In Spring Boot, they use the `--` prefix.

### ⚙️ The Syntax

```bash
java -jar app.jar --property.key=value
```

Like JVM properties, you use the **exact property key** — no uppercase conversion needed.

### 🧪 Examples

```bash
# Single argument
java -jar app.jar --spring.jpa.show-sql=false

# Multiple arguments
java -jar app.jar --spring.jpa.show-sql=false --cache.jobs.ttl-minutes=5
```

### 💡 Placement Matters

CLI arguments come **after** the JAR file name:

```bash
# ✅ Correct
java -jar app.jar --spring.jpa.show-sql=false

# ❌ Wrong — program arguments go after the JAR
java --spring.jpa.show-sql=false -jar app.jar
```

---

## Two Possible Outcomes When Injecting Properties

When you inject a property externally, one of two things happens:

### Scenario 1: Property Doesn't Exist in `application.properties`

The property is **created dynamically** in the application context:

```bash
# No P1 defined in application.properties
java -jar app.jar --my.new.property=hello
# → Spring Boot creates my.new.property with value "hello"
```

### Scenario 2: Property Already Exists in `application.properties`

The external value **overrides** the existing one:

```properties
# application.properties
spring.jpa.show-sql=true
```

```bash
java -jar app.jar --spring.jpa.show-sql=false
# → Value "false" wins because CLI has highest precedence
```

---

## Precedence Recap — All Three Together

If the **same property** is defined via all three approaches:

```properties
# application.properties
spring.jpa.show-sql=true
```

```bash
export SPRING_JPA_SHOW_SQL=false          # Environment variable
java -Dspring.jpa.show-sql=true \          # JVM property
     -jar app.jar \
     --spring.jpa.show-sql=false           # CLI argument
```

**Winner:** `false` (from CLI argument — highest precedence)

```
CLI Arguments        → Highest  ⬆️
JVM System Props     → High
Environment Vars     → Medium
application.properties → Lowest
```

---

## Quick Reference Table

| Approach | Syntax | Naming Convention | Precedence |
|----------|--------|-------------------|------------|
| Environment Variables | `SPRING_JPA_SHOW_SQL=false` | UPPERCASE, dots/hyphens → underscores | Medium |
| JVM System Properties | `-Dspring.jpa.show-sql=false` | Exact property key | High |
| CLI Arguments | `--spring.jpa.show-sql=false` | Exact property key | Highest |

---

## ✅ Key Takeaways

1. **Environment variables** require converting the property name to UPPERCASE with underscores — Spring Boot's relaxed binding handles the rest
2. **JVM properties** use `-D` flag with the exact property key name — placed **before** `-jar`
3. **CLI arguments** use `--` prefix with the exact property key — placed **after** the JAR filename
4. All three can **create new properties** or **override existing ones** from `application.properties`
5. **CLI arguments win** when the same property is defined in multiple places

## ⚠️ Common Mistakes

- Using dots in environment variable names — OS won't accept `spring.jpa.show-sql` as an env var
- Placing `-D` flags after `-jar` — JVM ignores them
- Confusing `-D` (JVM properties) with `--` (CLI arguments) — they're completely different mechanisms
- Using lowercase for environment variables — some OS are strict about this

## 💡 Pro Tips

- For **permanent** overrides on a server, use environment variables — they persist across restarts
- For **temporary** testing, use CLI arguments — easy to add and remove
- JVM properties are great for **infrastructure-level settings** like memory, GC, and system-wide configs
- The ops team only needs to learn **one of these approaches** — all three achieve the same goal
