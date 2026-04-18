# Demo of Logging — Part 2

## Introduction

In Part 1, we set up logging manually using `LoggerFactory`. But typing that boilerplate in every class gets tedious quickly. In this lecture, we'll discover a **Lombok shortcut** that eliminates the boilerplate, learn how to group packages for shared log levels, and — most importantly — learn how to write logs to **files** using JSON format for production-ready structured logging.

---

## Simplifying Logger Creation with Lombok's `@Slf4j`

### The Manual Way (Boilerplate)

Remember the logger constant we created in every class?

```java
private static final Logger LOGGER = LoggerFactory.getLogger(LoggingController.class);
```

This works, but writing this in *every single class* gets repetitive. And you have to remember to update the class name if you copy-paste it.

### The Lombok Way (One Annotation!)

Just add `@Slf4j` on top of your class:

```java
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/logging")
public class LoggingController {

    @GetMapping(path = "/public")
    public String testLogging() {
        log.trace("TRACE: Tracking execution flow");
        log.debug("DEBUG: Debugging information");
        log.info("INFO: General information");
        log.warn("WARN: Something might go wrong");
        log.error("ERROR: Something serious happened!");
        
        return "Logging tested successfully";
    }
}
```

What changed?

| Before (Manual) | After (Lombok) |
|-----------------|----------------|
| Manually create `Logger` constant | Just add `@Slf4j` annotation |
| Variable name: `LOGGER` (uppercase) | Variable name: `log` (lowercase) |
| Must pass class name to `getLogger()` | Lombok handles it automatically |
| Import `Logger` and `LoggerFactory` | Import only `lombok.extern.slf4j.Slf4j` |

Behind the scenes, Lombok generates the exact same `LoggerFactory.getLogger(YourClass.class)` code in the compiled `.class` file. You get the same result with zero boilerplate.

> 💡 **Pro Tip**: From now on, whenever you need logging in a class, just add `@Slf4j` at the top and use `log.info()`, `log.error()`, etc. That's it. No manual logger creation needed.

---

## Log Level Groups — Controlling Multiple Packages at Once

### ❓ Why do we need groups?

In a real application, you might want:
- **Controller** and **Security** packages → only show ERROR logs
- **Service** and **Repository** packages → show INFO logs
- **Integration** packages → show DEBUG logs

Setting individual `logging.level` properties for each package works, but log groups make it cleaner.

### ⚙️ How to define a group

**Step 1**: Define the group and assign packages to it:

```properties
logging.group.jobportal_error=com.eazybytes.jobportal.company,com.eazybytes.jobportal.security,com.eazybytes.jobportal.contact
```

**Step 2**: Set the log level for the entire group:

```properties
logging.level.jobportal_error=ERROR
```

Now all three packages — `company`, `security`, and `contact` — share the **ERROR** log level.

### ⚠️ What happens when there's a conflict?

If you have both:

```properties
logging.level.com.eazybytes.jobportal=INFO
logging.group.jobportal_error=com.eazybytes.jobportal.company
logging.level.jobportal_error=ERROR
```

Which one wins for the `company` package? **The group configuration takes priority.** The `company` package will use ERROR, not INFO.

If you remove `company` from the group, the general package-level setting (INFO) kicks back in.

> 💡 **Pro Tip**: Use log groups when different layers of your application need different log levels. Controller/security layers might need only ERROR in production, while service layers need INFO for business event tracking.

---

## Writing Logs to Files

### ❓ Why file logging?

In production, there's no IDE console. Your application runs on a server. When an issue occurs at 3 AM, developers need to open **log files** to investigate. Console logging is useless in higher environments.

### ⚙️ How to enable file logging

Add this property:

```properties
logging.file.name=logs/jobportal.log
```

That's it. Spring Boot will now write logs to both the **console** and the **file**. If you specify a path like `logs/jobportal.log`, a `logs` folder will be created in your project workspace.

If you provide an absolute path (like `/var/log/jobportal.log`), logs will be written to that exact location.

---

## File Log Format — Why JSON?

### The Problem with Plain Text Logs in Files

By default, if you don't configure a file pattern, the file logs might not include timestamps or use a different format than the console. That's dangerous — in production, you **must** have timestamps to know when an issue occurred.

### The Solution: Structured JSON Logging

For production log files, use **JSON format**. Here's why:

1. **Log aggregation tools** like ELK Stack (Elasticsearch, Logstash, Kibana), Splunk, and AWS CloudWatch work best with structured JSON
2. JSON makes it easy to **search and filter** logs by timestamp, level, or any field
3. Structured logging is **predictable** — every log entry follows the same schema

### ⚙️ Setting up JSON file logging

```properties
logging.pattern.file={"timestamp":"%d{yyyy-MM-dd HH:mm:ss.SSS}","level":"%level","logger":"%logger","message":"%msg"}%n
```

This produces log entries like:

```json
{"timestamp":"2024-01-15 10:30:45.123","level":"INFO","logger":"c.e.j.c.controller.LoggingController","message":"User logged in successfully"}
```

Each log entry is a JSON object with:
- `timestamp` — when the event happened
- `level` — severity (INFO, ERROR, etc.)
- `logger` — which class generated the log
- `message` — the actual log message

You can customize this JSON structure based on your requirements.

> ⚠️ **Common Mistake**: Using the same decorative/colored pattern for file logs that you use for console logs. Console patterns with ANSI colors don't make sense in files. Always use a structured format (preferably JSON) for file logging.

---

## The Growing Log File Problem

### The Issue

If you keep writing logs to a single file, that file will grow — and grow — and grow. In a busy production application, a log file can easily reach **10 GB, 100 GB, or even 1 TB**. Opening or processing a file that large is essentially impossible.

### The Solution: Log File Rotation

Logging libraries support **rolling** log files based on:
- **Time**: Create a new file every day
- **Size**: Create a new file when the current one reaches a certain size (e.g., 10 MB)

Old log files can be moved to an archive folder, and the library can automatically delete the oldest files when storage limits are reached.

We'll set up this rolling file strategy in the next lecture using `logback.xml`.

---

## ✅ Key Takeaways

1. Use **`@Slf4j`** (Lombok) instead of manually creating a Logger constant — it generates the same code with zero boilerplate
2. With `@Slf4j`, the logger variable name is **`log`** (lowercase)
3. **Log groups** let you assign the same log level to multiple packages at once using `logging.group.<name>` and `logging.level.<name>`
4. Group-level configuration **takes priority** over general package-level configuration when there's a conflict
5. Enable file logging with `logging.file.name=logs/jobportal.log`
6. Use **JSON format** for file logs — it's required for integration with tools like ELK, Splunk, and CloudWatch
7. Always include **timestamps** in file log patterns — without them, you can't determine when issues occurred
8. A single log file will grow indefinitely in production — you need **log rotation**, which we'll configure next
