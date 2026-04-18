# Application Scope in Spring — Sharing Data Across the Entire App

## Introduction

We've seen how Request Scope creates a new bean per request and Session Scope creates one per session. Now let's explore **Application Scope** — a bean that's created **once** and shared across **all users, all sessions, and all requests** for the lifetime of the application. We'll also tackle the million-dollar question: *"How is this different from Singleton Scope?"*

---

## Concept 1: Creating an Application-Scoped Bean

### 🧠 What is it?

An Application Scope bean has a **single instance** that everyone in the application shares. It's perfect for global state like visitor counters or application-wide configuration.

### ⚙️ Implementation

```java
@Component
@ApplicationScope
@Getter
@Setter
public class ApplicationScopedBean {
    private int visitorsCount;

    public ApplicationScopedBean() {
        System.out.println("ApplicationScopedBean created");
    }

    public void incrementVisitorCount() {
        visitorsCount++;
    }
}
```

---

## Concept 2: Wiring It Into the Controller

### ⚙️ Adding the REST API

```java
@RestController
@RequestMapping("/scope")
@RequiredArgsConstructor
public class ScopeController {

    private final ApplicationScopedBean applicationScopedBean;

    @GetMapping("/application")
    public ResponseEntity<Integer> testApplicationScope() {
        applicationScopedBean.incrementVisitorCount();
        return ResponseEntity.ok(applicationScopedBean.getVisitorsCount());
    }

    @GetMapping("/test")
    public ResponseEntity<Integer> testScope() {
        return ResponseEntity.ok(applicationScopedBean.getVisitorsCount());
    }
}
```

The `/application` endpoint **increments** the counter and returns it. The `/test` endpoint just **reads** the current count.

---

## Concept 3: Application Scope in Action

### 🧪 Experiment — Calling `/scope/application` repeatedly

| Request # | Response | Console |
|-----------|----------|---------|
| 1st call | `1` | `"ApplicationScopedBean created"` (only once!) |
| 2nd call | `2` | (no new creation message) |
| 3rd call | `3` | (no new creation message) |
| 4th call | `4` | (no new creation message) |

The bean is created **exactly once**. Every subsequent request uses the **same instance** and the counter keeps incrementing.

### 🧪 Experiment — Clear the session cookie, then call `/scope/application`

| Action | Response |
|--------|----------|
| Clear JSESSIONID | |
| Call `/application` | `5` |

Even after clearing the session (which would create a new Session Scope bean), the Application Scope bean **still has the same counter value**. It's completely independent of sessions.

### 🧪 Experiment — Call `/scope/test` from a different "user"

| Action | Response |
|--------|----------|
| Call `/test` (new session) | `5` |
| Call `/test` again | `5` |

The `/test` endpoint reads the same counter value regardless of which user or session makes the request.

### 💡 The takeaway

Application Scope creates a **single, global bean** that transcends individual requests and sessions. Everyone sees the same data.

---

## Concept 4: Application Scope vs Singleton Scope — The Key Difference

### 🧠 The question everyone asks

"If Application Scope creates one instance shared across the whole app... isn't that exactly what Singleton does?"

Yes — most of the time. But there's a **subtle, important difference** in **who manages the bean**.

### ⚙️ Comparison

| Aspect | Application Scope | Singleton Scope |
|--------|-------------------|-----------------|
| **Managed by** | **Servlet Context** (Tomcat/web container) | **Spring Container** (ApplicationContext) |
| **Works in** | Web applications only | All applications (web, CLI, batch) |
| **Annotation** | `@ApplicationScope` | Default — no annotation needed |
| **Created when** | First web request | Spring container startup |
| **Destroyed when** | Application stops | Spring container shuts down |
| **Multiple instances possible?** | Yes — one per servlet context | Yes — one per Spring container |

### ❓ When does the difference actually matter?

In a **rare scenario** where multiple web applications are deployed in a **single Tomcat server** (single servlet container):

```
Tomcat Server (Servlet Container)
├── App 1 → Servlet Context 1 → ApplicationScope Bean A
├── App 2 → Servlet Context 2 → ApplicationScope Bean B
```

Each app gets its own Servlet Context, and therefore its own Application Scope bean.

But for **Singleton** scope, if somehow multiple Spring containers exist:

```
JVM
├── Spring Container 1 → Singleton Bean X
├── Spring Container 2 → Singleton Bean Y
```

Each Spring container has its own Singleton instance.

### 💡 Practical reality

In **99% of real-world applications**:
- There's **one** Tomcat server running **one** web app
- There's **one** Spring container
- Application Scope and Singleton Scope behave **identically**

The difference is academic — but worth knowing for interviews and edge cases.

---

## Concept 5: When to Use Which Scope

### 🧠 Decision guide

| I need... | Use this scope |
|-----------|---------------|
| One bean for the whole app (default) | **Singleton** |
| A new bean every time it's injected | **Prototype** |
| Temp data for one HTTP request | **Request** |
| User data across multiple requests | **Session** |
| Global data shared by all users | **Application** |
| Per-WebSocket connection data | **WebSocket** |

### ❓ Should I use Application Scope?

Honestly? **Rarely.** For 99% of use cases where you need a shared bean, **Singleton** (the default) works perfectly. Use Application Scope only when:
- You specifically need data tied to the **Servlet Context lifecycle**
- You're building features that must be explicitly web-scoped (global counters, feature flags shared across the web layer)

### 💡 Insight

Don't overthink scopes. Singleton is the default for a reason — it covers most needs. Request and Session scopes handle web-specific requirements. Application and WebSocket scopes are for specialized scenarios only.

---

## ✅ Key Takeaways

1. **Application Scope** creates a **single bean** shared across all users, sessions, and requests
2. The bean is created **once** and destroyed only when the **application stops**
3. It's managed by the **Servlet Context** (not the Spring Container — that's Singleton's job)
4. In practice, Application Scope and Singleton behave almost identically (99% of cases)
5. The key difference: **who manages the bean** — Servlet Context vs Spring Container
6. Application Scope only works in **web applications**
7. Use Singleton by default; only use Application Scope for explicit web-global data needs

## ⚠️ Common Mistakes

- Using Application Scope when Singleton would suffice — adds unnecessary complexity
- Storing user-specific data in Application Scope — everyone sees it (it's global!)
- Not considering thread safety — if multiple users increment a counter simultaneously, you need synchronization
- Confusing Application Scope with Session Scope — Application is global, Session is per-user

## 💡 Pro Tips

- For global counters in production, use `AtomicInteger` instead of `int` for thread safety
- The `"ApplicationScopedBean created"` console message appears **once** — that confirms single-instance behavior
- For interview preparation, focus on the "managed by" difference (Servlet Context vs Spring Container)
- When unsure about scope, start with Singleton and change only if you encounter a specific need
