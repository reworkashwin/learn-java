# Externalizing Configurations: Command-Line, JVM & Environment Options

## Introduction

We now know how to create profiles, but there's a catch — we've been activating them by hardcoding `spring.profiles.active: prod` inside `application.yml`. That means every time we want to switch environments, we'd need to modify the YAML and regenerate our Docker image. That violates a fundamental microservices principle: **immutability**.

The solution? Provide configuration values **externally** during startup, without touching the application code. Spring Boot supports three main approaches, each with different syntax and precedence levels.

---

## The Three Approaches

### 1. Command-Line Arguments (Highest Precedence)

Command-line arguments are the most powerful way to override configuration. Whatever you pass here **wins** over everything else — JVM properties, environment variables, and `application.yml` values.

**Syntax when running a JAR:**
```bash
java -jar myapp.jar --spring.profiles.active=prod --build.version=1.1
```

The key pattern:
- Prefix with `--` (double hyphen)
- Property key = value
- Separate multiple arguments with spaces

Spring Boot automatically converts these command-line arguments into property key-value pairs and injects them into the `Environment` object.

**In an IDE (IntelliJ):**
Go to your run configuration → **Program Arguments** field and enter:
```
--spring.profiles.active=prod --build.version=1.1
```

---

### 2. JVM System Properties (Medium Precedence)

JVM properties sit between command-line arguments and application property files in the precedence hierarchy. They're useful when you want to set properties at the JVM level without using command-line argument syntax.

**Syntax:**
```bash
java -Dspring.profiles.active=prod -Dbuild.version=1.1 -jar myapp.jar
```

The key pattern:
- Prefix with `-D`
- Property key = value
- Place **before** the `-jar` argument

**In an IDE:**
Go to your run configuration → **VM Options** field and enter:
```
-Dspring.profiles.active=prod -Dbuild.version=1.1
```

---

### 3. Environment Variables (Universally Supported)

Environment variables are the most portable approach. They work not just with Java/Spring Boot, but with **any** language or platform — making them the standard choice in containerized and cloud-native deployments.

**Syntax rules for environment variables:**
1. Convert all letters to **UPPERCASE**
2. Replace all dots (`.`) with **underscores** (`_`)

So `spring.profiles.active` becomes `SPRING_PROFILES_ACTIVE`.

**On Linux/Mac:**
```bash
SPRING_PROFILES_ACTIVE=prod BUILD_VERSION=1.8 java -jar myapp.jar
```

**On Windows (PowerShell):**
```powershell
$env:SPRING_PROFILES_ACTIVE="prod"; java -jar myapp.jar
```

**In an IDE:**
Go to your run configuration → **Environment Variables** field and enter:
```
SPRING_PROFILES_ACTIVE=prod;BUILD_VERSION=1.8
```

Note: Environment variables in IDE fields are separated by **semicolons**.

---

## The Precedence Hierarchy

What happens when the **same property** is defined in multiple places? Spring Boot follows a strict precedence order:

```
Command-Line Arguments    ← WINS (highest priority)
       ↓
JVM System Properties
       ↓
Environment Variables
       ↓
Profile-specific YAML     (e.g., application-prod.yml)
       ↓
Default application.yml   ← LOSES (lowest priority)
```

### 🧪 Example

Suppose `build.version` is defined everywhere:

| Source | Value |
|--------|-------|
| `application-prod.yml` | `1.0` |
| Environment variable `BUILD_VERSION` | `1.8` |
| JVM property `-Dbuild.version` | `1.1` |
| Command-line `--build.version` | `1.3` |

Result? **`1.3`** — command-line arguments always win.

Remove the command-line argument → **`1.1`** (JVM property wins)
Remove the JVM property → **`1.8`** (environment variable wins)
Remove the environment variable → **`1.0`** (profile YAML wins)

---

## Why This Matters for Microservices

With externalized configuration, you achieve true immutability:

1. **Build once** — Generate a single Docker image
2. **Deploy anywhere** — Same image goes to dev, QA, prod
3. **Configure externally** — Pass the right profile and properties at startup

No code changes. No rebuilds. No repackaging. The same JAR or Docker image serves every environment.

---

## ✅ Key Takeaways

- **Command-line args** (`--key=value`): Highest precedence, great for one-off overrides
- **JVM properties** (`-Dkey=value`): Medium precedence, JVM-level configuration
- **Environment variables** (`KEY_NAME=value`): Most portable, universally supported across platforms
- Precedence: CLI > JVM > Env Vars > Profile YAML > Default YAML
- Environment variables require uppercase and underscores (`spring.profiles.active` → `SPRING_PROFILES_ACTIVE`)
- This enables **immutable deployments** — build once, configure externally

💡 **Pro Tip:** In production Docker/Kubernetes environments, environment variables are the standard approach because they integrate naturally with container orchestration tools, Helm charts, and CI/CD pipelines.
