# Controlling Logs Per Environment with Logback & Profiles

## Introduction

We've controlled properties, database connections, and even bean creation using Spring Boot profiles. But what about **logging**? In development, you want detailed console logs for debugging. In production, you want minimal logging — only errors, written to files, not the console.

Logback, the default logging framework in Spring Boot, supports **profile-aware configuration** through the `<springProfile>` tag. This lets you define completely different logging behaviors for each environment — all within a single `logback.xml` file.

---

## The Problem: One Logging Config for All Environments

### 🧠 Current Setup

In a typical `logback.xml`, you define appenders and attach them globally:

```xml
<!-- Console appender -->
<appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder><pattern>${LOG_PATTERN}</pattern></encoder>
</appender>

<!-- File appender -->
<appender name="ROLLING_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <!-- rolling policy config... -->
</appender>

<!-- Applied to all environments -->
<root level="INFO">
    <appender-ref ref="ROLLING_FILE" />
    <appender-ref ref="CONSOLE" />
</root>
```

This means **every environment** gets:
- INFO-level logging
- Both console AND file output

But in production, you don't need console logging (there's no IDE terminal to read it). And you probably want ERROR-level only to keep log files clean and small.

---

## The Solution: `<springProfile>` Tags

### ⚙️ How It Works

After defining your appenders, wrap environment-specific logger configurations inside `<springProfile>` tags:

```xml
<!-- Appender definitions stay the same (outside springProfile) -->
<appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">...</appender>
<appender name="ROLLING_FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">...</appender>

<!-- Production: ERROR level, file only -->
<springProfile name="prod">
    <root level="ERROR">
        <appender-ref ref="ROLLING_FILE" />
    </root>
    <logger name="com.eazybytes.jobportal" level="ERROR">
        <appender-ref ref="ROLLING_FILE" />
    </logger>
</springProfile>

<!-- QA: INFO level, file only -->
<springProfile name="qa">
    <root level="INFO">
        <appender-ref ref="ROLLING_FILE" />
    </root>
    <logger name="com.eazybytes.jobportal" level="INFO">
        <appender-ref ref="ROLLING_FILE" />
    </logger>
</springProfile>

<!-- Default (local dev): INFO level, console + file -->
<springProfile name="default">
    <root level="INFO">
        <appender-ref ref="ROLLING_FILE" />
        <appender-ref ref="CONSOLE" />
    </root>
    <logger name="com.eazybytes.jobportal" level="INFO">
        <appender-ref ref="ROLLING_FILE" />
        <appender-ref ref="CONSOLE" />
    </logger>
</springProfile>
```

---

## Profile-Specific Logging Behavior

| Profile | Log Level | Console | File | Use Case |
|---------|-----------|---------|------|----------|
| `default` | INFO | ✅ Yes | ✅ Yes | Local development — need all the details |
| `qa` | INFO | ❌ No | ✅ Yes | QA servers — no IDE console, but need detailed logs |
| `prod` | ERROR | ❌ No | ✅ Yes | Production — minimal logging for performance |

### 🧠 Why Disable Console in QA/Prod?

In production and QA, applications run as background services on servers — there's no IDE or terminal watching the console output. Console logging to nowhere wastes CPU cycles. Only file logging matters.

### 🧠 Why ERROR Level in Production?

- **Performance:** Logging every INFO message under high traffic floods log files
- **Signal vs. Noise:** In production, you care about errors, not routine operations
- **Storage:** ERROR-only logs are dramatically smaller, reducing disk usage and log rotation overhead

---

## Testing the Configuration

### 🧪 With `prod` Profile

Start the application with `SPRING_PROFILES_ACTIVE=prod`:

**Expected behavior:**
- After the Spring Boot banner, **no console logs** appear
- Trigger a REST API → **no logs in console**
- Only ERROR-level messages written to the log file

### 🧪 With `default` Profile

Start the application with no profile (default):

**Expected behavior:**
- Full console logging at INFO level
- SQL statements visible (if `show-sql=true`)
- All application logs printed to both console and file

---

## Structure of the Final `logback.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 1. Define appenders (shared across all profiles) -->
    <appender name="CONSOLE" class="...">...</appender>
    <appender name="ROLLING_FILE" class="...">...</appender>

    <!-- 2. Profile-specific logger configurations -->
    <springProfile name="prod">
        <!-- Production logging rules -->
    </springProfile>

    <springProfile name="qa">
        <!-- QA logging rules -->
    </springProfile>

    <springProfile name="default">
        <!-- Local development logging rules -->
    </springProfile>
</configuration>
```

**Key principle:** Appenders are defined **once** at the top. `<springProfile>` blocks simply choose **which appenders to use** and **at what level**.

---

## ✅ Key Takeaways

1. Use **`<springProfile name="...">`** in `logback.xml` to define environment-specific logging behavior
2. **Appenders** (console, file) are defined once — profiles just reference them differently
3. **Production** should use ERROR level with file-only logging for performance and cleanliness
4. **Local development** should use INFO level with both console and file for maximum debugging visibility
5. The `default` profile name matches the behavior when **no profile** is explicitly activated

## ⚠️ Common Mistakes

- Defining appenders inside `<springProfile>` blocks — appenders should be defined at the top level and shared
- Forgetting the `default` profile — without it, no logging config is active when running locally
- Using DEBUG level in production — generates enormous log files under high traffic

## 💡 Pro Tips

- During local testing, always use the **default** profile for full visibility into what your application is doing
- If you activate `prod` locally for testing, remember that console logs will disappear — check the log file instead
- Consider adding a `WARN` level for QA environments — it captures warnings without the noise of INFO
- The `<springProfile>` tag is a Spring Boot extension — it only works in `logback-spring.xml` or `logback.xml` within a Spring Boot application
