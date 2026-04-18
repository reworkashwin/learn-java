# Auto-Restart & Fast Reload with Spring Boot DevTools

## Introduction

Imagine you're building a REST API. You change one line of code. To see the result, you have to **stop the server, restart it, wait for it to boot up, and test again**. Now multiply that by 50 changes a day. That's a lot of wasted time.

Spring Boot DevTools solves this problem. It provides **automatic restarts**, fast reloads, and configuration enhancements — all designed to make your development cycle faster.

---

## The Problem — Manual Restarts

Without DevTools, here's what happens:

1. You change your code (e.g., update a response message)
2. You save the file
3. You trigger a build
4. **Nothing happens** — the running server still serves the old code
5. You must **manually restart** the application
6. Only now do you see the updated output

For a simple one-line change, this process takes 10-15 seconds every time. Over a day of development, it adds up to **a lot of lost productivity**.

---

## IntelliJ's HotSwap — A Partial Solution

IntelliJ has a built-in feature called **HotSwap** that can deploy code changes without a full restart.

### How to Enable HotSwap

1. Go to **Settings → Debugger → HotSwap**
2. Check "Enable HotSwap agent"
3. Set "Reload classes after compilation" to **Always**

### How It Works

When you save a file and trigger a build, IntelliJ detects the class changes and **hot-deploys** them into the running server. No restart needed.

### ⚠️ Why HotSwap Isn't Enough

- It has **limitations** — it can only handle simple changes (method body edits), not structural changes (adding new methods, changing signatures, configuration changes)
- It's **IDE-specific** — if your organization gives you Eclipse or VS Code, you won't have this feature
- It's **not reliable** for complex changes

That said, there's one HotSwap setting worth adjusting:

> **Uncheck** "Suggest HotSwap in the editor when code is modified" — this pop-up appears every time you save and is very annoying. But keep "Reload classes after compilation" set to **Always** — this lets HotSwap work silently in the background.

---

## Spring Boot DevTools — The Real Solution

### 🧠 What is it?

DevTools is a Spring Boot **starter dependency** that provides automatic restarts, live reload, and enhanced development configurations. When you add it to your project, you get significant productivity improvements during local development.

### Adding the Dependency

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
```

### ❓ Why `scope` = `runtime`?

By setting the scope to `runtime`, you're telling Maven:

> "I don't need this dependency during compilation — only when the application is actually running."

Your code never directly imports DevTools classes. It works behind the scenes at runtime. Since there's no compile-time dependency, DevTools jars won't be added to your project's classpath during compilation.

### ❓ Why `optional` = `true`?

This is about **transitive dependencies**. Here's the scenario:

1. Your `job-portal` project depends on DevTools
2. Some other project uses `job-portal` as a dependency
3. Without `optional=true`, DevTools would **automatically be added** to that other project too (thanks to Maven's transitive dependency resolution)
4. But that other project might not want DevTools!

By marking it as `optional=true`, you're saying: "This dependency is only for **my** project. Don't pass it along to projects that depend on me."

If another developer wants DevTools, they can add it to their own `pom.xml` explicitly.

---

## How DevTools Restart Works

### The Magic — Incremental Restart

Here's the key insight about why DevTools is so fast:

| Scenario | What Happens | Time |
|----------|-------------|------|
| **First startup** (manual) | All framework libraries, beans, auto-configurations loaded from scratch | ~2.3 seconds |
| **DevTools restart** (after code change) | Only reloads beans/configs related to **your code changes** — framework jars are already bootstrapped | ~0.8 seconds |

DevTools maintains **two classloaders**:
1. **Base classloader** — loads framework and third-party libraries (loaded once, never restarted)
2. **Restart classloader** — loads your application classes (reloaded on every change)

When you change code and trigger a build, only the restart classloader is refreshed. The framework libraries stay in memory. That's why the restart is so fast — **0.8 seconds instead of 2.3 seconds**.

### The Workflow

1. Make a code change
2. Save the file
3. Trigger a build (Ctrl+F9 / Cmd+F9)
4. DevTools detects the change and **automatically restarts** the server
5. Your new code is live within a second

You don't even notice the restart. You just keep coding and testing.

---

## When to Manually Restart

DevTools handles **code changes** beautifully, but for certain changes, you still need a manual restart:

- Adding a **new dependency** to `pom.xml`
- Adding new **properties** to `application.properties` (sometimes)
- Major **configuration changes**

> 💡 Developers rarely add new dependencies — it's usually a one-time setup activity. So this limitation rarely causes friction.

---

## ✅ Key Takeaways

- DevTools provides **automatic, fast restarts** when you change code — no manual restart needed
- It's fast because it only reloads **your application classes**, not the framework libraries
- First startup: ~2.3s → DevTools restart: ~0.8s (in our example)
- Always use `scope=runtime` and `optional=true` in the dependency declaration
- IntelliJ's HotSwap and DevTools can **work together** for the best development experience
- **Manual restart is still needed** when adding new dependencies or making major configuration changes

---

## ⚠️ Common Mistakes

- Forgetting `<scope>runtime</scope>` and `<optional>true</optional>` in the dependency
- Relying only on IntelliJ's HotSwap — it has limitations and is IDE-specific
- Expecting DevTools to handle dependency changes — always restart manually after modifying `pom.xml`
- Not triggering a build after saving — DevTools activates on **compilation**, not on file save alone

---

## 💡 Pro Tips

- In real enterprise applications, **almost all backend developers** add DevTools to their projects — it's an industry standard for productivity
- DevTools only works during **development** — it's automatically disabled in production when you package your app as a JAR
- Combine DevTools with IntelliJ's "Build project automatically" setting for an even smoother experience (no need to manually trigger builds)
- After adding DevTools, do a **manual restart once** so its functionality gets loaded. After that, let DevTools handle restarts automatically
