# Make Your Console Logs Developer-Friendly

## Introduction

Spring Boot generates a **lot** of log messages during startup and execution. But the default log format? It's boring, hard to read, and everything looks the same. When you're debugging an issue at 11 PM, staring at a wall of monochrome text is the last thing you want.

In this lecture, we'll learn how to customize the console log format — making logs **colorful, structured, and easy to scan** — using a single property in `application.properties`.

---

## The Problem with Default Logs

By default, Spring Boot prints log messages in a plain format. All messages look visually identical — info, warnings, errors, debug — they all blend together. When you're scrolling through hundreds of log lines trying to find an error, this lack of visual distinction slows you down.

What if the **timestamp** was green, the **log level** was blue, the **thread name** was red, and the **actual message** was cyan? You could spot issues in seconds instead of minutes.

---

## The Property — `logging.pattern.console`

Spring Boot provides a property called `logging.pattern.console` that lets you define the exact format of every log line printed to the console.

There's also a sibling property — `logging.pattern.file` — for controlling the format when logs are written to a file. We'll cover file-based logging in later sections.

### IntelliJ Shortcut

Instead of typing the full property name, you can type just the first letters of each word: `l.p.c` — IntelliJ will suggest `logging.pattern.console`. This is a small but handy productivity trick.

> ⚠️ This shortcut might be a premium IntelliJ feature. If it doesn't work for you, just type the full property name manually.

---

## The Log Pattern — Explained

Here's the pattern we're using (you can copy this from the GitHub repo — no need to type it):

```properties
logging.pattern.console=${CONSOLE_LOG_PATTERN:%clr(%d{HH:mm:ss.SSS}){green} %clr(%-5level){blue} %clr([%15.15t]){red} %clr(%-15.15logger){yellow} %clr(-){faint} %clr(%m){cyan}%n}
```

Let's break this monster down piece by piece:

### The Outer Wrapper — Environment Variable Syntax

```
${CONSOLE_LOG_PATTERN: <default value> }
```

This syntax does something clever:
1. First, it checks if an **environment variable** called `CONSOLE_LOG_PATTERN` exists
2. If yes → use that value
3. If no → use the **default value** after the colon

This is a best practice — it lets you override the log format in different environments **without changing any code**.

### Component Breakdown

| Component | What It Does | Color |
|-----------|-------------|-------|
| `%d{HH:mm:ss.SSS}` | Time (hours:minutes:seconds.nanoseconds) — no date, because during local dev you always know today's date | Green |
| `%-5level` | Log severity level (INFO, WARN, ERROR, DEBUG) — left-aligned, max 5 characters | Blue |
| `[%15.15t]` | Current thread name — truncated to 15 characters | Red |
| `%-15.15logger` | Logger/class name — truncated to 15 characters | Yellow |
| `-` | A simple separator hyphen | Faint |
| `%m` | The actual log message | Cyan |
| `%n` | New line | — |

### Why No Date?

During local development, you always know the date — it's today! Including it just adds visual noise. The **time** (hours, minutes, seconds, nanoseconds) is what you actually need when debugging.

### Why Truncate Logger Names?

Full package names like `org.hibernate.engine.transaction.internal.TransactionImpl` are too long and clutter the console. Truncating to 15 characters gives you enough context (e.g., `o.h.e.t.Transac`) without the noise.

---

## Using Environment Variables for Properties

The `${ENV_VAR:default}` syntax is a pattern you should follow for **any property that might differ across environments**:

| Environment | Log Format |
|-------------|-----------|
| **Development** | Detailed, colorful, human-readable |
| **Production** | JSON format (for log aggregators like AWS CloudWatch) |
| **Testing** | Minimal logging |

You inject different values via environment variables — no code changes required.

### Setting Environment Variables in IntelliJ

1. Click the three dots (`...`) near the run configuration
2. Select **Edit**
3. Under **Modify Options**, select **Environment Variables**
4. Add your variable: `CONSOLE_LOG_PATTERN=<new pattern>;`
5. Separate multiple variables with semicolons

---

## IntelliJ Tip — Soft Wrap

By default, log messages display on a single line in IntelliJ's console. If a message is long, you have to scroll horizontally — annoying!

Click the **Soft Wrap** button in the console toolbar. Now logs wrap to the next line, and you can read everything by scrolling up and down. This is a significant productivity improvement.

---

## ✅ Key Takeaways

- Customize console logs using `logging.pattern.console` in `application.properties`
- Use **different colors** for different components (time, level, thread, logger, message) to quickly spot issues
- Use the `${ENV_VAR:default}` syntax to allow **environment-specific overrides** without code changes
- Skip the **date** in local development — you only need the time
- **Truncate** logger names to keep log lines readable
- Enable **Soft Wrap** in IntelliJ for easier log reading

---

## ⚠️ Common Mistakes

- Breaking the property value into multiple lines — `logging.pattern.console` must be a **single line**
- Forgetting the closing `}` of the `${ENV_VAR:...}` wrapper
- Not using the environment variable syntax — hardcoding formats that can't be changed per environment
- Using dates in local development logs — adds unnecessary noise

---

## 💡 Pro Tips

- You can use **any colors** you like — the supported colors include: `green`, `blue`, `red`, `yellow`, `cyan`, `magenta`, `faint`, `white`
- For production, switch to **JSON-formatted logs** so that log aggregators (AWS CloudWatch, ELK Stack, Splunk) can parse and search them efficiently
- The same `${ENV_VAR:default}` syntax works for **any** property in `application.properties` — not just logging
- Keep a proven log pattern in your team's shared documentation — don't reinvent it for every project
