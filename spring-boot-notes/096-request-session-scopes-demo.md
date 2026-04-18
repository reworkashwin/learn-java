# Hands-On Scopes — How Request and Session Behave in Real Apps

## Introduction

Theory is great, but nothing beats seeing it in action. In this lesson, we'll create `RequestScopedBean` and `SessionScopedBean` classes, wire them into a controller, and send real HTTP requests to observe exactly how these scopes behave. You'll see beans being created and destroyed, data persisting (or not), and the role of HTTP sessions — all through hands-on experimentation.

---

## Concept 1: Setting Up the Beans

### 🧠 What are we building?

Two simple beans — one with Request Scope and one with Session Scope — each holding a `username` field and printing a message when created.

### ⚙️ RequestScopedBean

```java
@Component
@RequestScope
@Getter
@Setter
public class RequestScopedBean {
    private String username;

    public RequestScopedBean() {
        System.out.println("RequestScopedBean created");
    }
}
```

### ⚙️ SessionScopedBean

```java
@Component
@SessionScope
@Getter
@Setter
public class SessionScopedBean {
    private String username;

    public SessionScopedBean() {
        System.out.println("SessionScopedBean created");
    }
}
```

The constructor `println` statements are key — they tell us **exactly when** a new bean instance is created.

---

## Concept 2: The Test Controller

### 🧠 What is it?

A controller with three endpoints that let us set and read data from scope-specific beans.

### ⚙️ Implementation

```java
@RestController
@RequestMapping("/scope")
@RequiredArgsConstructor
public class ScopeController {

    private final RequestScopedBean requestScopedBean;
    private final SessionScopedBean sessionScopedBean;

    // Sets username in RequestScopedBean and returns it
    @GetMapping("/request")
    public ResponseEntity<String> testRequestScope() {
        requestScopedBean.setUsername("John Doe");
        return ResponseEntity.ok(requestScopedBean.getUsername());
    }

    // Sets username in SessionScopedBean and returns it
    @GetMapping("/session")
    public ResponseEntity<String> testSessionScope() {
        sessionScopedBean.setUsername("John Doe");
        return ResponseEntity.ok(sessionScopedBean.getUsername());
    }

    // Reads username from SessionScopedBean (does NOT set it)
    @GetMapping("/test")
    public ResponseEntity<String> testScope() {
        return ResponseEntity.ok(sessionScopedBean.getUsername());
    }
}
```

---

## Concept 3: Request Scope in Action

### 🧪 Experiment 1: Call `/scope/test` → read from RequestScopedBean

**What happens:** Each time you send a request, the console prints `"RequestScopedBean created"`. The response is **empty/null** because we never set the username — notice this endpoint only reads.

**Key observation:** A **new bean** is created for **every request**. No data carried over.

### 🧪 Experiment 2: Call `/scope/request` → set and read

**What happens:** We set `"John Doe"` and immediately read it back → response is `"John Doe"`. Console shows a new bean was created.

### 🧪 Experiment 3: Call `/scope/test` again after `/scope/request`

**What happens:** Response is **empty** again! Why? Because `/scope/test` is a **new request** → a **new RequestScopedBean** is created → the username from the previous request is gone.

### 💡 The takeaway

Request scope is like writing on a whiteboard that gets **erased after every class**. Whatever you write during one request is completely gone by the next request.

---

## Concept 4: Session Scope in Action

### 🧪 Experiment 1: Call `/scope/session` → set username

**What happens:** `"SessionScopedBean created"` prints in the console. Response is `"John Doe"`. A `JSESSIONID` cookie is created in Postman.

### 🧪 Experiment 2: Call `/scope/test` → read from SessionScopedBean

**What happens:** Response is `"John Doe"` — even though this is a **different request**! The console does **NOT** print "SessionScopedBean created" again.

**Why?** Because both requests share the same HTTP session (same `JSESSIONID` cookie). The **same bean instance** is reused, and the data set during the first request is still there.

### 🧪 Experiment 3: Delete the JSESSIONID cookie, then call `/scope/test`

**What happens:** Response is **empty/null**. Console prints `"SessionScopedBean created"` — a brand new bean! The old session (and its data) is gone.

### 🧪 Experiment 4: Call `/scope/session` again, then `/scope/test` (without clearing cookies)

**What happens:** Both return `"John Doe"`. Data persists across requests within the same session.

### 💡 The takeaway

Session scope is like a **personal notebook** you keep at your desk. You write something in one meeting, and it's still there for the next meeting — as long as you don't throw the notebook away (i.e., the session doesn't expire).

---

## Concept 5: Visualizing the Difference

### ⚙️ Request Scope timeline

```
Request 1 → Bean A created → setUsername("John Doe") → response → Bean A destroyed
Request 2 → Bean B created → getUsername() → null! → response → Bean B destroyed
Request 3 → Bean C created → getUsername() → null! → response → Bean C destroyed
```

### ⚙️ Session Scope timeline

```
Request 1 (Session X) → Bean X created → setUsername("John Doe") → response
Request 2 (Session X) → Same Bean X → getUsername() → "John Doe"! → response
Request 3 (Session X) → Same Bean X → getUsername() → "John Doe"! → response
--- Delete JSESSIONID ---
Request 4 (Session Y) → Bean Y created → getUsername() → null! → response
```

---

## Concept 6: The Role of JSESSIONID

### 🧠 What is it?

When the server creates an HTTP session, it sends a cookie called `JSESSIONID` to the client. The client sends this cookie with every subsequent request. The server uses it to identify which session the request belongs to.

### ⚙️ In Postman

- Postman automatically stores and sends cookies
- You can view cookies by clicking the "Cookies" option
- **Deleting the JSESSIONID** simulates a new user/session
- This is how you test session-scoped behavior

### 💡 Insight

In a real browser, the JSESSIONID is managed automatically. When the user closes the browser (or the session times out), the session ends and all session-scoped beans are destroyed.

---

## ✅ Key Takeaways

1. **Request-scoped beans** are created **fresh for every HTTP request** — data does NOT persist between requests
2. **Session-scoped beans** are created **once per HTTP session** — data persists across multiple requests in the same session
3. Console `println` in constructors is a great way to **verify when beans are created**
4. The `JSESSIONID` cookie identifies the HTTP session — deleting it starts a new session
5. To test session behavior, use the same Postman session (don't clear cookies)
6. To test request behavior, any request will show a new bean creation

## ⚠️ Common Mistakes

- Expecting data to persist across requests in Request Scope — it won't
- Forgetting that `JSESSIONID` ties requests to a session — deleting it resets everything
- Not checking the console logs — they tell you exactly when beans are created
- Confusing "request" and "session" — requests are ephemeral, sessions persist

## 💡 Pro Tips

- Use `System.out.println()` in constructors during development to debug scope behavior
- In Postman, use the "Cookies" panel to manage session cookies for testing
- Request scope is useful for storing per-request context (like audit info or request correlation IDs)
- Session scope is ideal for multi-step wizards where the user fills data across multiple pages
