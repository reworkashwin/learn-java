# Passing Config Using Env Variables, JVM & CLI — Live Demo

## Introduction

Theory is great, but seeing these externalizing approaches in action makes everything click. In this note, we'll walk through a hands-on demo of overriding `spring.jpa.show-sql` using environment variables, JVM system properties, and CLI arguments — and watch precedence rules play out in real time.

---

## Starting Point: The Default Behavior

With `spring.jpa.show-sql=true` in `application.properties`, every database interaction logs SQL statements to the console.

**Proof:** Trigger a login API call → SQL statements like `SELECT * FROM users...` appear in the console logs.

This is helpful during development but harmful in production (performance overhead, log pollution).

---

## Demo 1: Overriding with Environment Variables

### ⚙️ Setting Up

In IntelliJ (or any IDE), you provide environment variables through run configuration:

1. Open **Edit Configurations**
2. Under **Modify Options**, select **Environment Variables**
3. Enter: `SPRING_JPA_SHOW_SQL=false`

Multiple variables are separated by semicolons:
```
SPRING_JPA_SHOW_SQL=false;JWT_SECRET=myCustomSecret
```

### 🧪 Result

After restarting the application and triggering the login API:
- **No SQL statements** in the console
- The `false` value from the environment variable overrode the `true` in `application.properties`

### 💡 Key Observation

The same approach works for **custom properties** too. For example, `JWT_SECRET` can be injected via environment variables, and the `Environment.getProperty("JWT_SECRET")` code will read the externally provided value instead of the default.

---

## Demo 2: Overriding with JVM System Properties

### ⚙️ Setting Up

While keeping the environment variable (`SPRING_JPA_SHOW_SQL=false`), add a JVM option:

1. Open **Edit Configurations**
2. Under **Modify Options**, select **Add VM Options**
3. Enter: `-Dspring.jpa.show-sql=true`

### 🧪 Result

After restarting and triggering the login API:
- **SQL statements appear** in the console
- The JVM property (`true`) overrode the environment variable (`false`)

**Why?** JVM properties have **higher precedence** than environment variables:

```
VM option: true   ← Winner (higher priority)
Env variable: false
application.properties: (commented out)
```

---

## Demo 3: Overriding with CLI Arguments

### ⚙️ Setting Up

While keeping both the environment variable and JVM option, add a CLI argument:

1. Open **Edit Configurations**
2. Under **Modify Options**, select **Program Arguments**
3. Enter: `--spring.jpa.show-sql=false`

### 🧪 Result

After restarting and triggering the login API:
- **No SQL statements** in the console
- The CLI argument (`false`) overrode both the JVM property (`true`) and the environment variable (`false`)

**The precedence ladder confirmed:**

```
CLI argument: false   ← Winner (highest priority)
VM option: true
Env variable: false
application.properties: true
```

---

## The Power of Externalizing — Summarized

### 🎯 What Operations Teams Get

```
Same JAR file → Deploy to Dev  (show-sql=true via env vars)
Same JAR file → Deploy to QA   (show-sql=true via env vars)
Same JAR file → Deploy to Prod (show-sql=false via env vars)
```

**No code changes. No rebuilding. No repackaging.**

The operations team can control:
- Framework properties (`spring.jpa.show-sql`)
- Custom properties (`cache.jobs.ttl-minutes`)
- Secrets (`JWT_SECRET`)

All from outside the application.

---

## Real-World Usage Pattern

In enterprise deployments, the typical pattern is:

```bash
# Production deployment script
export SPRING_JPA_SHOW_SQL=false
export CACHE_JOBS_TTL_MINUTES=5
export JWT_SECRET=<secure-production-secret>
java -jar jobportal-backend.jar
```

Or using CLI arguments:

```bash
java -jar jobportal-backend.jar \
  --spring.jpa.show-sql=false \
  --cache.jobs.ttl-minutes=5
```

The development team **builds once**, and the ops team **configures per environment**.

---

## ✅ Key Takeaways

1. All three externalizing approaches work as expected — environment variables, JVM properties, and CLI arguments all successfully override `application.properties`
2. **Precedence is real**: CLI > JVM > Env Vars > `application.properties`
3. This works for **both framework properties and custom properties**
4. The same JAR can behave differently across environments without any code changes
5. In IDEs like IntelliJ, you can simulate all three approaches through run configurations

## ⚠️ Common Mistakes

- Using a very short JWT secret via environment variables — this can cause runtime errors (secrets need sufficient length)
- Forgetting to restart the application after changing external config — properties are loaded at startup
- Not cleaning up test environment variables after experiments — they persist and affect subsequent runs

## 💡 Pro Tips

- After testing with external configs in your IDE, **remove them** to return to default behavior — avoid confusion during local development
- In production, prefer **environment variables** for secrets and **CLI arguments** for deployment-specific overrides
- While these approaches solve the individual property override problem, managing 40+ properties across environments gets tedious — that's where **Spring Boot Profiles** (next topic) save the day
