# Introduction to Request, Session, Application & WebSocket Bean Scopes

## Introduction

Earlier in the course, we learned about **Singleton** and **Prototype** bean scopes — the two scopes available for all types of Spring applications. But when you're building **web applications** (which most Spring Boot apps are), there are **four additional scopes** that give you fine-grained control over bean lifecycle tied to HTTP concepts.

In this lesson, we'll understand what each of these web scopes does, when to use them, and how they fit into the bigger picture of Spring's bean management.

---

## Concept 1: Quick Recap — Scopes We Already Know

### 🧠 The foundation scopes

| Scope | Instances | Lifetime | Works in |
|-------|-----------|----------|----------|
| **Singleton** (default) | One per Spring container | Application lifetime | All apps |
| **Prototype** | New instance per injection/request | Until garbage collected | All apps |

These two work everywhere — web apps, CLI apps, batch jobs. The four scopes below **only work in web applications** (Spring MVC / Spring Boot web apps).

---

## Concept 2: Request Scope

### 🧠 What is it?

A **Request Scope** bean is created fresh for **every single HTTP request** and destroyed when that request completes.

### ❓ When to use it?

When you need to store **temporary, request-specific data** — like form data being processed, or intermediate calculation results that shouldn't leak between requests.

### ⚙️ How to define it

```java
@Component
@RequestScope
public class RequestScopedBean {
    private String username;
    // getters and setters
}
```

### 🧪 Behavior

- User A sends Request 1 → Bean A1 is created → Request completes → Bean A1 is destroyed
- User A sends Request 2 → Bean A2 is created (completely new!) → destroyed after response
- User B sends Request 3 → Bean B1 is created (separate from A's beans) → destroyed after response

### 💡 Key insight

Every request gets its own bean. **Nothing is shared between requests**, not even from the same user. Think of it like a disposable paper cup — used once and thrown away.

---

## Concept 3: Session Scope

### 🧠 What is it?

A **Session Scope** bean is created once per **HTTP session** and lives as long as that session exists. It survives across multiple requests from the same user.

### ❓ What is an HTTP session?

When a user opens a browser and starts interacting with your web application, the server creates a **session** — identified by a `JSESSIONID` cookie. This session persists until:
- The browser is closed
- The session times out (usually 30 minutes of inactivity)
- The user explicitly logs out

### ❓ When to use it?

When you need data to **survive across multiple requests** within the same user's browsing session — like:
- Logged-in user details
- Shopping cart contents
- Multi-step form wizard data

### ⚙️ How to define it

```java
@Component
@SessionScope
public class SessionScopedBean {
    private String username;
    // getters and setters
}
```

### 🧪 Behavior

- User A sends Request 1 → Session Bean A is created
- User A sends Request 2 → **Same** Session Bean A is used (data persists!)
- User A closes browser → Session expires → Bean A is destroyed
- User B → gets their own separate Session Bean B

### 💡 Key insight

Session scope is like a **personal locker** at a gym. You get one when you arrive, use it across multiple visits to different areas, and it's cleaned out when you leave. Other members have their own lockers.

---

## Concept 4: Application Scope

### 🧠 What is it?

An **Application Scope** bean creates a **single instance** shared across the **entire application** — all users, all sessions, all requests.

### ❓ When to use it?

When you need **global, shared data** across the entire application — like:
- Visitor counters
- Application-wide configuration
- Global statistics

### ⚙️ How to define it

```java
@Component
@ApplicationScope
public class ApplicationScopedBean {
    private int visitorsCount;

    public void incrementVisitorCount() {
        visitorsCount++;
    }
}
```

### 🧪 Behavior

- User A increments counter → count = 1
- User B increments counter → count = 2
- User C from a different session increments counter → count = 3
- One bean instance, shared by everyone

### ❓ How is this different from Singleton?

Great question! They **seem** identical, but there's a subtle difference:

| Aspect | Application Scope | Singleton Scope |
|--------|-------------------|-----------------|
| **Managed by** | Servlet Context (Tomcat) | Spring Container |
| **Works in** | Web applications only | All applications |
| **Annotation** | `@ApplicationScope` | Default (no annotation) |
| **Destroyed when** | Application stops | Spring container shuts down |

In 99% of cases, they behave the same because there's one servlet context and one Spring container. The difference matters only in rare scenarios where multiple web apps share a single servlet container.

---

## Concept 5: WebSocket Scope

### 🧠 What is it?

A **WebSocket Scope** bean is created for each **WebSocket connection** and destroyed when the connection closes.

### ❓ What is WebSocket?

While HTTP works on a request-response model (send request → get response → connection ends), WebSocket maintains a **continuous, two-way connection**. It's used for:
- Live chat (WhatsApp, Messenger)
- Stock price tickers
- Real-time notifications
- Multiplayer games

### ⚙️ How to define it

```java
@Component
@Scope("websocket")
public class WebSocketScopedBean {
    // per-connection data
}
```

### 🧪 Behavior

- User A opens chat → WebSocket Bean A is created
- User B opens chat → WebSocket Bean B is created (separate instance)
- User A closes chat → Bean A is destroyed
- Each chat connection has its own isolated bean

### 💡 Key insight

This scope is used **very rarely** and only when building WebSocket-based features. For most REST API applications, you'll never need it.

---

## Concept 6: All Scopes at a Glance

| Scope | Instance Created | Lives For | Use Case |
|-------|-----------------|-----------|----------|
| **Singleton** | Once per Spring container | App lifetime | Services, repositories, components |
| **Prototype** | Every time requested | Until GC | Stateful, throwaway objects |
| **Request** | Every HTTP request | One request | Temp request data |
| **Session** | Every HTTP session | One session | User-specific data (cart, login) |
| **Application** | Once per servlet context | App lifetime | Global shared data |
| **WebSocket** | Every WebSocket connection | Connection lifetime | Chat, live feeds |

---

## ✅ Key Takeaways

1. **Request, Session, Application, WebSocket** scopes only work in **web applications**
2. **Request scope** → new bean per HTTP request → destroyed after response
3. **Session scope** → new bean per HTTP session → persists across requests → destroyed on session expiry
4. **Application scope** → one bean for the entire app → shared by all users and sessions
5. **WebSocket scope** → one bean per WebSocket connection → used for real-time features
6. **Singleton** scope works everywhere; **Application** scope is web-only (but behaves similarly)
7. For 99% of scenarios, **Singleton** scope is what you need

## ⚠️ Common Mistakes

- Using Application Scope when Singleton works fine — adds unnecessary complexity
- Storing user-specific data in Application Scope — it's shared by everyone!
- Using Request Scope when you need data to persist across requests — use Session instead
- Confusing HTTP Session with Application Scope — Sessions are per-user, Application is global

## 💡 Pro Tips

- When in doubt, use **Singleton** — it's the default for a reason
- Use **Session Scope** for shopping carts, user preferences, and wizard forms
- Use **Application Scope** only for truly global counters or configuration
- Never use **Request Scope** for data you need across multiple API calls
