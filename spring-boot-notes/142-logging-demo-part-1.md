# Demo of Logging — Part 1

## Introduction

Theory is great, but logging truly clicks when you see it in action. In this lecture, we get our hands dirty — we'll set up logging in a Spring Boot controller, understand the `Logger` and `LoggerFactory` classes from SLF4J, see how log levels filter messages in real time, and learn how to configure log levels at the root level, package level, and class level.

By the end of this, you'll know exactly how to add logging to any Spring Boot class.

---

## The Default Console Behavior

Before we write any logging code, let's understand what's already happening. When you start a Spring Boot application, the console shows log messages using a pattern defined in `application.properties`:

```properties
logging.pattern.console=<your-custom-pattern-with-colors>
```

By default, Spring Boot uses the **INFO** log level. So in the console, you'll only see messages with severity **INFO**, **WARN**, or **ERROR**. Scroll through your console — you'll find plenty of INFO messages, some WARN messages, and ERROR messages only if exceptions occurred.

---

## Changing the Root Log Level

Want to see *everything* the framework is doing behind the scenes? You can change the root log level.

### The Property

```properties
logging.level.root=${LOG_LEVEL:INFO}
```

This uses the **environment variable syntax** — if a `LOG_LEVEL` environment variable exists, it uses that value. Otherwise, it falls back to `INFO`.

### What Happens at TRACE Level?

If you change the default to `TRACE`:

```properties
logging.level.root=TRACE
```

Your console will **explode** with logs. Why? Because Spring Boot does a *lot* behind the scenes during startup — auto-configuration, bean creation, component scanning, dependency injection. At `TRACE` level, it prints *every single detail* of this process.

Your application startup that normally takes a few seconds? It might now take **5-10 minutes** because of the sheer volume of log output.

> ⚠️ **Common Mistake**: Setting `logging.level.root=TRACE` in production. This prints framework-level logs for *every* package — Spring, Hibernate, Tomcat, everything. This is almost never what you want.

> 💡 **Pro Tip**: The `logging.level.root` property sets the log level for **all packages and classes** — including the framework's internal code. Unless you're debugging a framework bug, avoid using this property. Instead, set log levels at your application's package level.

---

## Writing Log Statements — The Logger Setup

Now let's write actual logging code. Here's how to set up a logger in any Spring Boot class:

### Step 1: Create a Logger Constant

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/logging")
public class LoggingController {

    private static final Logger LOGGER = LoggerFactory.getLogger(LoggingController.class);
}
```

Let's break this down:

| Part | Explanation |
|------|-------------|
| `Logger` | An **interface** from the `org.slf4j` package (not any other package!) |
| `LoggerFactory` | A **class** from `org.slf4j` that creates Logger instances |
| `getLogger(LoggingController.class)` | Creates a logger tied to this specific class |
| `private static final` | The logger is a constant — one per class, shared across all instances |
| `LOGGER` (all caps) | Convention for `static final` constants in Java |

### ❓ Why pass the class name to `getLogger()`?

When a log message appears in the console, it shows which class produced it:

```
INFO  c.e.j.c.controller.LoggingController : User logged in successfully
```

The framework knows the class name because you told it: `LoggerFactory.getLogger(LoggingController.class)`. Without this, you'd have no idea which class generated a particular log message.

> 💡 **Pro Tip**: Always create a `Logger` constant in every class that needs logging, and always pass *that class's* `.class` to `getLogger()`. This is critical for traceability.

---

### Step 2: Use the Logger Methods

The `LOGGER` object gives you methods for each log level:

```java
@GetMapping(value = "/public", path = "/public")
public String testLogging() {
    LOGGER.trace("TRACE: This is a very detailed trace log used for tracking execution flow");
    LOGGER.debug("DEBUG: Debugging information for developers");
    LOGGER.info("INFO: General application information");
    LOGGER.warn("WARN: Warning - something might go wrong");
    LOGGER.error("ERROR: Something serious went wrong!");
    
    return "Logging tested successfully";
}
```

Each method corresponds to a log level. You also have **overloaded methods** — the most common one takes a simple `String`, but for production code, prefer the version that accepts a format string with arguments (we'll cover parameterized logging later).

---

## Seeing Log Levels in Action

### Default behavior (INFO level)

When you invoke the `/logging/public` endpoint, only three messages appear in the console:

```
INFO  c.e.j.c.controller.LoggingController : INFO: General application information
WARN  c.e.j.c.controller.LoggingController : WARN: Warning - something might go wrong
ERROR c.e.j.c.controller.LoggingController : ERROR: Something serious went wrong!
```

Where are TRACE and DEBUG? They're **filtered out** because the default log level is INFO. Messages below INFO severity don't make it to the console.

---

## Configuring Log Levels for Your Application Package

Instead of using the root-level property (which affects all packages), you should set the log level for **your application's packages only**:

### At the Package Level (Recommended)

```properties
logging.level.com.eazybytes.jobportal=${LOG_LEVEL:INFO}
```

This sets the log level for all classes under `com.eazybytes.jobportal` and its sub-packages — but doesn't touch the framework's internal logs.

If you change this to `TRACE`:

```properties
logging.level.com.eazybytes.jobportal=TRACE
```

Now invoking the same endpoint shows **all five** log messages:

```
TRACE c.e.j.c.controller.LoggingController : TRACE: This is a very detailed trace log
DEBUG c.e.j.c.controller.LoggingController : DEBUG: Debugging information for developers
INFO  c.e.j.c.controller.LoggingController : INFO: General application information
WARN  c.e.j.c.controller.LoggingController : WARN: Warning - something might go wrong
ERROR c.e.j.c.controller.LoggingController : ERROR: Something serious went wrong!
```

### At the Class Level (Not Recommended)

You *can* set the log level for a specific class:

```properties
logging.level.com.eazybytes.jobportal.company.controller.LoggingController=DEBUG
```

But this is overly specific and hard to maintain. Stick with the **package-level** approach.

---

## The Power of Framework-Managed Logging

Here's what makes logging frameworks infinitely better than `System.out.println()`:

| Feature | Logging Framework | System.out.println() |
|---------|-------------------|----------------------|
| Timestamp | ✅ Automatic | ❌ Manual |
| Log level | ✅ Automatic | ❌ Not available |
| Thread name | ✅ Automatic | ❌ Manual |
| Class name | ✅ Automatic | ❌ Manual |
| Package name | ✅ Automatic | ❌ Manual |
| Level filtering | ✅ Configurable | ❌ Not possible |
| Output destination | ✅ Console + file | ❌ Console only |

As a developer, you just provide the **message**. The framework handles everything else — timestamp, thread info, class name, formatting. With `System.out.println()`, you'd have to manually build the entire string including the date and time.

---

## ✅ Key Takeaways

1. Use `LoggerFactory.getLogger(YourClass.class)` to create a logger — always pass the current class name
2. The logger constant should be `private static final` with an uppercase name like `LOGGER`
3. Import `Logger` and `LoggerFactory` from the `org.slf4j` package — not from other packages
4. Use `LOGGER.info()`, `LOGGER.error()`, etc. to log at different severity levels
5. Set log levels at your **application package level** using `logging.level.com.yourpackage=INFO`
6. Avoid `logging.level.root` unless debugging framework internals
7. Keep the log level at **INFO** for normal operation; switch to DEBUG/TRACE only when investigating issues
8. The framework automatically adds timestamp, thread name, class name, and formatting — you just provide the message
