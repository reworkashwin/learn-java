# Targeting Methods Precisely with Execution Pointcuts

## Introduction

You've learned **what** (Aspect) and **when** (Advice). Now comes the crucial third piece — **which** methods should be intercepted. This is where **Pointcuts** come in, and specifically the **execution designator**, which is the most common and powerful way to target methods in Spring AOP.

---

## What Is a Pointcut?

### 🧠 The Simple Explanation

A Pointcut is a **rule** that tells Spring AOP which Java methods should be intercepted. Think of it as a **filter**, a **selector**, or a **targeting rule**.

> "Run this advice ONLY for these methods."

The most common way to define a Pointcut is using the `execution` designator. Why the name "execution"? Because we're saying: **intercept this method's execution**.

---

## The Execution Syntax

The `execution` designator follows a specific pattern:

```
execution(modifiers-pattern? return-type-pattern declaring-type-pattern? name-pattern(param-pattern) throws-pattern?)
```

That looks intimidating, but let's break it down piece by piece:

| Component | Required? | What It Specifies | Example |
|-----------|-----------|-------------------|---------|
| **Modifiers pattern** | Optional (`?`) | `public`, `private`, `protected` | `public` |
| **Return type pattern** | ✅ Required | Method's return type | `String`, `void`, `*` (any) |
| **Declaring type pattern** | Optional (`?`) | Package + class name | `com.app.service..*` |
| **Name pattern** | ✅ Required | Method name | `getAllCompanies`, `set*`, `*` |
| **Param pattern** | ✅ Required | Input parameter types | `(..)`, `()`, `(int, String)` |
| **Throws pattern** | Optional (`?`) | Exception types thrown | `throws Throwable` |

### 💡 Key Rule

All conditions are combined with **AND logic**. The target method must satisfy **ALL** specified patterns to be intercepted.

---

## Understanding Wildcards

### 🔤 The Three Wildcards

| Symbol | Meaning | Where Used |
|--------|---------|-----------|
| `*` | Matches any single element | Return type, method name, package segment |
| `+` | Matches class and all subclasses | Class/interface names |
| `..` | Matches zero or more elements | Parameters, package hierarchy |

### Examples of `..` (Two Dots)

**In parameters:**
- `(..)` — matches ANY number of parameters (including zero)
- `()` — matches methods with NO parameters

**In packages:**
- `com.app.service..*` — matches `service` package AND all sub-packages

---

## Common Pointcut Patterns

### 1️⃣ Intercept ANY Public Method

```java
execution(public * *(..))
```

- `public` — only public methods
- First `*` — any return type
- Second `*` — any method name
- `(..)` — any parameters

### 2️⃣ Intercept Methods Starting with "set"

```java
execution(* set*(..))
```

- `*` — any return type
- `set*` — method name must start with "set" (like `setName`, `setAge`)
- `(..)` — any parameters

### 3️⃣ Intercept All Methods in a Specific Class

```java
execution(* com.svc.AccountService.*(..))
```

- `*` — any return type
- `com.svc.AccountService.*` — any method in `AccountService`
- `(..)` — any parameters

> Note the single dot (`.`) before `*` — this targets only methods in `AccountService`, not sub-packages.

### 4️⃣ Intercept All Methods in a Package AND Sub-Packages

```java
execution(* com.svc..*(..))
```

- `*` — any return type
- `com.svc..*` — `..` means the `svc` package and ALL sub-packages (like `svc.impl`, `svc.util`)
- `(..)` — any parameters

### 5️⃣ Intercept a Specific Method

```java
execution(* com.app.controller.AuthController.registerUser(..))
```

This targets ONLY the `registerUser()` method in `AuthController`.

### 6️⃣ Methods with Specific Parameter Types

```java
execution(* *(int, String))
```

- Only methods that take exactly two parameters: an `int` and a `String`

```java
execution(* *(*, String))
```

- First parameter can be anything (`*`), second must be `String`

---

## Parameter Pattern Cheat Sheet

| Pattern | Matches |
|---------|---------|
| `(..)` | Any number of params (including zero) |
| `()` | No parameters at all |
| `(*)` | Exactly one parameter of any type |
| `(int, int)` | Exactly two `int` parameters |
| `(*, String)` | Two params — any type first, `String` second |

---

## The `+` Wildcard for Inheritance

```java
execution(* com.app.AccountService+.*(..))
```

The `+` means: intercept methods in `AccountService` **and all its child classes** (subclasses). This is incredibly useful when you have an interface with multiple implementations.

---

## Real-World Thought Process

When defining a pointcut, ask yourself:

1. **Do I care about the return type?** → Use `*` for any, or specify like `String`
2. **Do I want a specific package?** → Use `com.app.service..*` for package + sub-packages
3. **Do I want specific methods?** → Use the exact name or `set*` for patterns
4. **Do I care about parameters?** → Use `(..)` for any, `()` for none, or specify types
5. **Should modifiers matter?** → Add `public` to restrict, or omit for all

---

## ✅ Key Takeaways

- Pointcuts answer the "WHICH" question — which methods to intercept
- The `execution` designator is the most common and powerful pointcut type
- Use `*` for "any single element" (return type, method name)
- Use `..` for "zero or more" (parameters, sub-packages)
- Use `+` to include subclasses/implementations
- All conditions use **AND logic** — the method must match ALL patterns
- Omitting optional components (modifiers, declaring type, throws) means "match any"

---

## ⚠️ Common Mistakes

- **Using `..` when you mean `.`** — `com.app.service..*` includes sub-packages, `com.app.service.*` doesn't
- **Forgetting parameter parentheses** — `(..)` is required even if you don't care about params
- **Making pointcuts too broad** — intercepting ALL methods can hurt performance; target only what you need
- **Confusing `*` and `..`** — `*` matches one element, `..` matches zero or more

---

## 💡 Pro Tips

- Start broad during development (`com.app..*`), then narrow down for production
- Use specific pointcuts for expensive aspect logic (like database calls in Before advice)
- Combine return type + package + method name for precise targeting
- The syntax feels complex at first, but it becomes second nature with practice
