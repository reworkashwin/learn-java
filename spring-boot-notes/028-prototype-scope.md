# Prototype Scope — A Fresh Bean Every Time

## Introduction

In the previous lesson, you learned about **Singleton scope** — Spring's default behavior where one instance of a bean is shared everywhere. You also saw how to prove it by comparing hash codes. But here's the thing: Singleton doesn't work for *every* situation.

What happens when each user needs their **own separate copy** of a bean? What if a bean carries data that's **unique to a specific user** — like a session ID, a shopping cart, or form input? If everyone shared the same instance, they'd end up seeing **each other's data**. That's not just a bug — that's a security disaster.

This is where **Prototype scope** steps in.

In this lesson, you'll learn:

- What Prototype scope is and how it differs from Singleton
- A real-world scenario where Prototype scope is essential
- How to declare a bean as Prototype using the `@Scope` annotation
- How to prove that Prototype creates new instances every time
- What happens when you accidentally use Singleton where Prototype is needed
- The complete comparison between Singleton and Prototype scopes
- How Prototype relates to Eager vs Lazy initialization

---

## Concept 1: What Is Prototype Scope?

### 🧠 What Is It?

Prototype scope is the **exact opposite** of Singleton scope. With Singleton, Spring creates **one instance** and hands out the same object every time you ask. With Prototype, Spring creates a **brand new instance every single time** you request the bean.

Every `getBean()` call? New object.  
Every `@Autowired` injection? New object.  
Every constructor injection? New object.  

No sharing. No reuse. Every consumer gets their own fresh copy.

### 🎯 Real-World Analogy

Remember the toothbrush analogy from Singleton scope? A Wi-Fi router is shared (Singleton) — one router serves everyone. But toothbrushes? **Each person gets their own** — you'd never share a toothbrush.

Prototype scope is the toothbrush. Every time someone asks, they get a **new one, just for them**.

Or think about it like restaurant receipts. Every customer gets their **own unique receipt** with their own order details, their own bill total, and their own timestamp. If everyone got the same receipt, chaos would follow. That's exactly why Prototype scope exists — to give each consumer their own dedicated object.

---

## Concept 2: When Do You Need Prototype Scope?

### ❓ Why Can't Singleton Handle Everything?

Let's think about this with a concrete example. Imagine you're building an **e-commerce website**. When a user visits the site, you want to assign them a unique **session ID** — a random identifier that tracks their browsing activity.

Now ask yourself: if the session bean is **Singleton**, what happens?

Every user gets the **same session object**. User A visits the site and gets session ID `abc-123`. User B visits — they also get `abc-123`. User C? Same thing. They're all sharing the same session, which means they could potentially see **each other's shopping carts, each other's order history, each other's personal data**.

That's not a theoretical problem — that's a **real-world security vulnerability**.

### ✅ Prototype to the Rescue

With Prototype scope, every time a user's request triggers a bean lookup, Spring hands out a **brand new instance** with its own unique data. User A gets their session. User B gets a completely different session. No overlap. No data leakage.

### 📋 When Should You Use Prototype?

Use Prototype scope when your bean is **mutable** — meaning its internal data can (and should) change after creation, and those changes should be **isolated per consumer**.

Common Prototype candidates:
- **User session data** — unique per user
- **Form input objects** — unique per request
- **Command/request objects** — carrying request-specific data
- **Temporary processing contexts** — unique per operation

💡 **Pro Tip**: If a bean **carries user-specific or request-specific data**, it's a strong candidate for Prototype scope. If it only carries **business logic** (methods that behave the same for everyone), stick with Singleton.

---

## Concept 3: Building a Prototype Bean — The UserSession Example

### ⚙️ Step 1: Create the Class

Let's build a `UserSession` class that generates a unique session ID for each instance:

```java
@Component
@Scope(BeanDefinition.SCOPE_PROTOTYPE)
public class UserSession {

    private String sessionId;

    public UserSession() {
        this.sessionId = UUID.randomUUID().toString();
    }

    public String getSessionId() {
        return sessionId;
    }
}
```

### 🔍 Let's Break This Down

1. **`@Component`** — Registers this class as a Spring-managed bean (component scanning picks it up)
2. **`@Scope(BeanDefinition.SCOPE_PROTOTYPE)`** — Tells Spring: *"Don't cache this. Create a new instance every time someone asks for it."*
3. **`UUID.randomUUID().toString()`** — Generates a globally unique identifier. Every time the constructor runs, you get a completely different random ID
4. **`getSessionId()`** — A simple getter so we can inspect the generated session ID

The key insight here is that the **constructor runs every time** Spring creates a new instance. Since Prototype scope creates a new instance per request, the `UUID.randomUUID()` call happens fresh each time — producing a different session ID for every consumer.

### ⚙️ Step 2: Request the Bean Multiple Times

```java
public class Example7 {
    public static void main(String[] args) {
        var context = new AnnotationConfigApplicationContext(ProjectScopeConfig.class);

        UserSession user1 = context.getBean(UserSession.class);
        UserSession user2 = context.getBean(UserSession.class);

        System.out.println(user1.hashCode());
        System.out.println(user2.hashCode());

        System.out.println(user1.getSessionId());
        System.out.println(user2.getSessionId());

        System.out.println(user1 == user2);  // false
    }
}
```

### 🧪 What's the Output?

```
1836019240
325040804
a3f5d8c2-9b1e-4a7d-b842-1e6f38a9c5d7
f7e2b190-3c4d-48a1-9856-2a8d71e0b3f4
false
```

Notice three things:

1. **Hash codes are different** — `user1` and `user2` are completely different objects in memory
2. **Session IDs are different** — because the constructor ran twice, generating two unique UUIDs
3. **`user1 == user2` returns `false`** — the `==` operator compares object references, and they point to different objects

This is the **exact opposite** of what happened with Singleton, where both references pointed to the same object, had the same hash code, and `==` returned `true`.

---

## Concept 4: What Goes Wrong Without Prototype?

### ⚠️ The Dangerous Mistake

Let's say you accidentally leave `UserSession` as Singleton (or forget to add the `@Scope` annotation, since Singleton is the default). What happens?

```java
@Component
// No @Scope annotation → defaults to Singleton!
public class UserSession {

    private String sessionId;

    public UserSession() {
        this.sessionId = UUID.randomUUID().toString();
    }

    public String getSessionId() {
        return sessionId;
    }
}
```

Now when you run the same test:

```
1836019240
1836019240
a3f5d8c2-9b1e-4a7d-b842-1e6f38a9c5d7
a3f5d8c2-9b1e-4a7d-b842-1e6f38a9c5d7
true
```

**Same hash code. Same session ID. Same object.**

Every user in your application would share the **exact same session**. In a real application, this means User A could see User B's shopping cart, payment details, or personal information. That's a critical bug — and it comes from **choosing the wrong scope**.

⚠️ **Common Mistake**: Forgetting to mark a stateful bean (one that carries user-specific data) with `@Scope(BeanDefinition.SCOPE_PROTOTYPE)`. Since Singleton is the default, this mistake is silent — no error, no warning. The application runs fine but behaves **dangerously wrong**.

---

## Concept 5: Singleton vs Prototype — The Complete Comparison

Here's everything you need to know side by side:

| Aspect | Singleton Scope | Prototype Scope |
|--------|-----------------|-----------------|
| **Default?** | ✅ Yes — used by default | ❌ No — must be explicitly declared with `@Scope` |
| **Instances created** | One per bean definition | New instance every time the bean is requested |
| **Same object returned?** | Yes — always the same reference | No — always a fresh, new object |
| **Eager/Lazy applies?** | ✅ Yes — you can control with `@Lazy` | ❌ No — irrelevant. Instance is only created when requested, so there's no concept of eager vs lazy |
| **Initialization timing** | During startup (eager) or on first use (lazy) | **Only when requested** — never during startup |
| **Best for** | **Immutable/stateless** objects — services, repositories, configs | **Mutable/stateful** objects — user sessions, form inputs, request-specific data |
| **Hash codes match?** | Same for multiple references to the same bean | Different for each reference |

### 💡 The Immutable vs Mutable Mental Model

This is the simplest way to decide between the two:

- **Immutable objects** → Singleton. Once created, the data inside doesn't change, and it's safe for everyone to share. Example: a `CalculatorService` — the `add()` method works the same for all users.

- **Mutable objects** → Prototype. The data inside the bean **changes per user**, and those changes must be **isolated**. Example: a `UserSession` — each user needs their own session ID that doesn't leak to others.

---

## Concept 6: Prototype and Eager/Lazy — Why It Doesn't Apply

### 🧠 Why No Eager or Lazy for Prototype?

With Singleton scope, you learned about **Eager initialization** (bean created at startup) and **Lazy initialization** (bean created on first use). But with Prototype scope, this distinction **doesn't exist**.

Why? Because Prototype beans are **never created at startup**. There's no pre-created instance sitting in the container waiting to be served. The container only creates an instance **at the exact moment someone asks for it** — whether through `getBean()`, `@Autowired`, or constructor injection.

Think about it: if Spring created a Prototype bean eagerly during startup... who would that instance belong to? Nobody asked for it yet. And Prototype is supposed to give a **new instance per request**. So pre-creating one doesn't make sense.

💡 **Pro Tip**: If you put `@Lazy` on a Prototype bean, it won't cause an error — but it's meaningless. Prototype beans are **inherently lazy** by nature. They come into existence only when someone requests them.

---

## Concept 7: What About the Other Scopes?

Spring has **6 scopes** in total. You've now learned the two foundational ones:

| Scope | Context |
|-------|---------|
| **Singleton** ✅ | One instance per bean definition |
| **Prototype** ✅ | New instance per request |
| **Request** | One instance per HTTP request (web only) |
| **Session** | One instance per HTTP session (web only) |
| **Application** | One instance per ServletContext (web only) |
| **WebSocket** | One instance per WebSocket session (web only) |

The remaining four scopes — Request, Session, Application, and WebSocket — are only applicable in **web applications**. You'll explore them once you start building Spring Boot web applications. But here's the good news: understanding Singleton and Prototype gives you the **foundation** to grasp the web-related scopes easily, because they're all variations on the same idea — **how many instances, and for how long do they live?**

---

## ✅ Key Takeaways

1. **Prototype scope creates a new bean instance** every time it's requested — the exact opposite of Singleton
2. Declare it with `@Scope(BeanDefinition.SCOPE_PROTOTYPE)` on your bean class
3. Use Prototype for **mutable, stateful objects** that carry user-specific or request-specific data
4. **Singleton is for shared, stateless logic** — Prototype is for **isolated, per-user data**
5. Prototype beans are **never created during startup** — they're created on demand, so Eager vs Lazy doesn't apply
6. Accidentally using Singleton for a stateful bean can cause **data leakage between users** — a serious bug with no compile-time warning
7. Most beans in a Spring application are Singleton. Prototype is **rarely used**, but when it's needed, it's absolutely critical

## ⚠️ Common Mistakes

1. **Forgetting `@Scope` on a stateful bean** — Since Singleton is the default, forgetting the annotation means your user-specific data is shared across everyone. Silent, dangerous, no error at compile time.
2. **Trying to use `@Lazy` with Prototype** — It won't break anything, but it's pointless. Prototype is already lazy by nature.
3. **Overusing Prototype** — Not every bean needs Prototype. If the bean doesn't carry user-specific state, stick with Singleton for better performance and simpler lifecycle management.

## 💡 Pro Tips

1. **Quick scope test**: Call `getBean()` twice, compare hash codes. Same hash code = Singleton. Different hash codes = Prototype.
2. **Use the constant**: Always prefer `BeanDefinition.SCOPE_PROTOTYPE` over the raw string `"prototype"` to avoid typos.
3. **Default to Singleton**: Start with Singleton (the default). Only switch to Prototype when you have a clear reason — typically when the bean holds mutable, user-specific data.
4. **Think "per user" vs "per application"**: If the bean serves the whole application equally, it's Singleton. If each user needs their own version, it's Prototype.
