# Designing Production-Ready Logging with Logback Appenders

## Introduction

So far, we've configured logging using `application.properties`. That works for simple setups, but production applications need more — rolling log files, archived logs, size limits, and the ability to write to both the console *and* files simultaneously. For that, we need **Logback's XML configuration** with **appenders**.

In this lecture, we'll create a `logback.xml` configuration from scratch, set up rolling file appenders with size and time-based rotation, add console logging alongside file logging, and understand how all the pieces fit together for a production-grade logging setup.

---

## What Is `logback.xml`?

### 🧠 What is it?

`logback.xml` is a configuration file that gives you **full control** over Logback — Spring Boot's default logging library. When Spring Boot finds this file in the `resources` folder during startup, it uses these configurations instead of the `application.properties` logging settings.

### ❓ Why use it instead of `application.properties`?

The `application.properties` approach is limited. You can set log levels and basic patterns, but you can't:
- Configure rolling/rotating log files
- Set up multiple appenders (console + file + custom)
- Define archive policies (how many old files to keep, max total size)
- Create sophisticated file naming patterns for archived logs

`logback.xml` gives you all of this and more.

### ⚙️ Where to create it

```
src/main/resources/logback.xml
```

Place it directly inside the `resources` folder, alongside `application.properties`. Spring Boot will auto-detect it.

---

## Understanding Appenders

### 🧠 What is an appender?

An **appender** is a component that defines *where* your logs go. Think of it as a destination:
- **Console appender** → logs go to the console (terminal/IDE output)
- **File appender** → logs go to a file
- **Rolling file appender** → logs go to a file, and old files are rotated/archived automatically

You can have **multiple appenders** active at the same time. For example, write logs to both the console (for local development) and a file (for production).

---

## Building the `logback.xml` — Step by Step

### The Complete Configuration

```xml
<configuration>

    <!-- Property: logs folder location -->
    <property name="LOGS" value="${LOG_PATH:-logs}" />

    <!-- Appender 1: Rolling File -->
    <appender name="RollingFile" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOGS}/jobportal.log</file>
        <encoder>
            <pattern>
                {"timestamp":"%d{yyyy-MM-dd HH:mm:ss.SSS}","level":"%level","logger":"%logger","message":"%msg"}%n
            </pattern>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>${LOGS}/archived/jobportal-%d{yyyy-MM-dd}.%i.log</fileNamePattern>
            <maxFileSize>1MB</maxFileSize>
            <maxHistory>30</maxHistory>
            <totalSizeCap>1GB</totalSizeCap>
        </rollingPolicy>
    </appender>

    <!-- Appender 2: Console -->
    <appender name="Console" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <!-- Root logger: applies to ALL packages -->
    <root level="INFO">
        <appender-ref ref="RollingFile" />
        <appender-ref ref="Console" />
    </root>

    <!-- Package-specific logger -->
    <logger name="com.eazybytes.jobportal" level="ERROR">
        <appender-ref ref="RollingFile" />
        <appender-ref ref="Console" />
    </logger>

</configuration>
```

Now let's break down every section.

---

## Section 1: The Logs Property

```xml
<property name="LOGS" value="${LOG_PATH:-logs}" />
```

This defines a variable called `LOGS`. Its value comes from:
1. An environment variable `LOG_PATH` (if it exists), OR
2. A folder called `logs` in the project directory (default)

This variable is reused throughout the configuration. In production, you'd set `LOG_PATH` to something like `/var/log/jobportal`.

---

## Section 2: The Rolling File Appender

This is the heart of production logging.

### File Name

```xml
<file>${LOGS}/jobportal.log</file>
```

The active log file. All new log messages are written here.

### Encoder Pattern

```xml
<encoder>
    <pattern>
        {"timestamp":"%d{yyyy-MM-dd HH:mm:ss.SSS}","level":"%level","logger":"%logger","message":"%msg"}%n
    </pattern>
</encoder>
```

This defines the format of each log entry. We're using JSON format here, which is ideal for production environments where logs are consumed by tools like ELK, Splunk, or CloudWatch.

### Rolling Policy

```xml
<rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
```

The **`SizeAndTimeBasedRollingPolicy`** rotates log files based on both size and time. Here's what each setting does:

| Setting | Value | Meaning |
|---------|-------|---------|
| `fileNamePattern` | `${LOGS}/archived/jobportal-%d{yyyy-MM-dd}.%i.log` | Archived files go to `logs/archived/` with date and index in the name |
| `maxFileSize` | `1MB` (use `10MB` or `20MB` in production) | When the active file hits this size, it rolls over |
| `maxHistory` | `30` | Keep a maximum of 30 archived files |
| `totalSizeCap` | `1GB` | Total storage across all log files can't exceed 1 GB |

### How rolling works in practice

1. Your app writes logs to `logs/jobportal.log`
2. When `jobportal.log` reaches 1 MB, it gets moved to `logs/archived/jobportal-2024-01-15.0.log`
3. A new empty `jobportal.log` is created
4. If the file rolls over multiple times on the same day, the index increments: `.0.log`, `.1.log`, `.2.log`
5. When you have more than 30 archived files, the oldest one is deleted
6. When total size exceeds 1 GB, the oldest logs are deleted

> 💡 **Pro Tip**: For production, use `10MB` or `20MB` as `maxFileSize`. The `1MB` value is great for local testing because you can see the rotation happen quickly.

---

## Section 3: The Console Appender

```xml
<appender name="Console" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
        <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
    </encoder>
</appender>
```

This appender writes logs directly to the console. It doesn't need a file name since there's no file involved.

The pattern here can be different from the file pattern — for the console, you'd typically use a human-readable format (possibly with colors), while for files, you'd use JSON.

---

## Section 4: Root and Package-Level Loggers

### Root Logger

```xml
<root level="INFO">
    <appender-ref ref="RollingFile" />
    <appender-ref ref="Console" />
</root>
```

This applies to **all packages** (your code + framework code). It says:
- Log level: INFO
- Write to: both `RollingFile` and `Console` appenders

### Package-Specific Logger

```xml
<logger name="com.eazybytes.jobportal" level="ERROR">
    <appender-ref ref="RollingFile" />
    <appender-ref ref="Console" />
</logger>
```

This overrides the root logger for your application package. Only ERROR messages from your application code will be logged.

---

## Important: Remove Conflicting Properties

Once you have `logback.xml`, **remove or comment out** the file-related logging properties from `application.properties`:

```properties
# Comment these out — logback.xml handles them now
# logging.file.name=logs/jobportal.log
# logging.pattern.file=...
```

If both `logback.xml` and `application.properties` define file logging, they can conflict. Let `logback.xml` be the single source of truth for file logging configuration.

> ⚠️ **Common Mistake**: Having both `logback.xml` file appender configurations and `logging.file.name` in `application.properties`. This creates confusing behavior. Pick one approach and stick with it.

---

## Verifying the Setup

After creating `logback.xml` and restarting the application:

1. **Console**: You should see log messages printed in the format defined by the Console appender
2. **File**: Check `logs/jobportal.log` — logs are written in JSON format
3. **Archived folder**: When the file exceeds the `maxFileSize`, check `logs/archived/` for rotated files with date-stamped names

To test rolling quickly, temporarily set the root level to `TRACE`:

```xml
<root level="TRACE">
```

This generates a massive volume of logs, which will trigger the rolling policy within minutes. Remember to **revert back to INFO** after testing.

---

## Official Documentation Reference

For advanced logging topics, refer to the Spring Boot official documentation under **Core Features → Logging**:
- Console Output and format customization
- File Output and rotation
- Log Levels and Groups
- Structured Logging (JSON, ELK integration)
- Logback Extensions and Log4j2 Extensions

The documentation is the definitive reference for anything beyond what we've covered here.

---

## ✅ Key Takeaways

1. **`logback.xml`** in `src/main/resources/` gives you full control over Logback configuration — Spring Boot auto-detects it
2. **Appenders** define *where* logs go — Console, File, or Rolling File
3. The **`RollingFileAppender`** with `SizeAndTimeBasedRollingPolicy` is essential for production — it rotates log files by size and time
4. Configure `maxFileSize` (per file), `maxHistory` (number of archived files), and `totalSizeCap` (total storage) to manage disk usage
5. Archived log files include the **date** and an **index** (for multiple rollovers per day) in their names
6. Use **multiple appenders** — Console for local development, Rolling File for production
7. Remove or comment out conflicting `logging.file.*` properties from `application.properties` when using `logback.xml`
8. Always use **JSON format** for file logging in production — it integrates with ELK, Splunk, and CloudWatch
9. Never use `System.out.println()` or `console.log()` in production applications — use the logging framework
