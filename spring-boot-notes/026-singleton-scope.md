# Singleton Scope — One Bean to Rule Them All

## Introduction

Until now, you've been happily creating beans with `@Bean`, `@Component`, and other annotations. Spring creates them, manages them, injects them — life is good. But have you ever stopped and asked: **how many instances** of that bean does Spring actually create? And **when** does it create them?

This is where **Bean Scopes** enter the picture.

A bean scope tells Spring **how to create and manage bean instances** — specifically, how many instances of a particular bean should exist and when they should be created. Spring supports **6 different scopes**, but the one it uses by default — the one working behind the scenes in every bean you've created so far — is the **Singleton scope**.

In this lesson, you'll learn:

- What Bean Scopes are and why they exist
- What the Singleton scope means (and how it differs from the Singleton design pattern)
- How Singleton scope behaves with multiple bean definitions
- How to explicitly declare Singleton scope (and why you usually don't need to)
- Why Spring chose Singleton as the default scope
- What "stateless" means and why it matters for scope decisions

By the end, you'll understand the most fundamental scope in Spring — and you'll know exactly when it's the right (or wrong) choice.

---

## Concept 1: What Are Bean Scopes?

### 🧠 What Is It?

A **Bean Scope** defines the lifecycle and visibility of a bean within the Spring container. It answers two critical questions:

1. **How many instances** of this bean should Spring create?
2. **When** should those instances be created?

Think of it like ordering at a restaurant. A "singleton" scope is like having **one chef** — no matter how many customers order, the same chef prepares every dish. A "prototype" scope (which we'll explore next) is like hiring **a new chef for every order**.

### 📋 The 6 Bean Scopes in Spring

| Scope | Description | When to Use |
|-------|-------------|-------------|
| **Singleton** | One instance per bean definition (default) | Most beans — services, repositories, configs |
| **Prototype** | New instance every time the bean is requested | Stateful objects |
| **Request** | One instance per HTTP request | Web apps only |
| **Session** | One instance per HTTP session | Web apps only |
| **Application** | One instance per ServletContext | Web apps only |
| **WebSocket** | One instance per WebSocket session | Web apps only |

⚠️ **Important**: The last 4 scopes (Request, Session, Application, WebSocket) are **only applicable to web applications**. Since we haven't built a web application yet, we'll focus on **Singleton** and **Prototype** for now.

---

## Concept 2: Singleton Scope — The Default

### 🧠 What Is It?

Singleton scope means Spring creates **exactly one instance** of a bean per bean definition and reuses that same instance everywhere it's needed.

Every time you ask the Spring container for that bean — whether through `getBean()`, `@Autowired`, constructor injection, or any other mechanism — you get back the **exact same object**. Not a copy. Not a new instance. The *same* one.

### ❓ Why Is It the Default?

You might be wondering — why did the Spring team choose Singleton as the default instead of creating a new instance every time? Two big reasons:

**1. Performance**

Creating objects takes time. In a small application, a few milliseconds here and there is nothing. But in an enterprise application handling thousands of requests per second, constantly creating and destroying beans would be a **massive performance hit**. Singleton avoids this by creating the bean once and reusing it forever.

**2. Shared Business Logic**

Most beans in a Spring application are things like services, repositories, and controllers. These classes contain **business logic** — methods that do the same thing regardless of who's calling them. There's no point in having 500 copies of your `UserService` sitting in memory when one will do.

### 🎯 Real-World Analogy

Think about the Wi-Fi router in your house. You have **one router**, and every device connects to it. You don't buy a new router for each phone, laptop, or tablet. The router is shared — it provides the same internet access to everyone. That's Singleton scope.

Now, think about toothbrushes. Every person in the house needs **their own separate one**. You'd never share a toothbrush. That's more like Prototype scope (which we'll cover next).

---

## Concept 3: Singleton Scope vs. Singleton Design Pattern

### 🧠 Where Does the Confusion Come From?

Spring's Singleton scope is **inspired by** the Singleton design pattern, but they are **not the same thing**.

| | Singleton Design Pattern | Spring Singleton Scope |
|---|---|---|
| **Guarantee** | One instance per **JVM / application** | One instance per **bean definition** within the Spring context |
| **Enforcement** | Class enforces it (private constructor, static instance) | Spring container manages it |
| **Multiple definitions?** | Not possible — the class itself prevents it | Yes — you can have multiple bean definitions of the same type |

### ⚙️ What Does "One Instance per Bean Definition" Mean?

This is a subtle but critical distinction. Look at this scenario:

```java
@Configuration
public class VehicleConfig {

    @Bean
    public Vehicle v1() {
        return new Vehicle("Car");
    }

    @Bean
    public Vehicle v2() {
        return new Vehicle("Truck");
    }

    @Bean
    public Vehicle v3() {
        return new Vehicle("Bike");
    }
}
```

Here, you have **three bean definitions** — `v1`, `v2`, and `v3` — all of type `Vehicle`. With Singleton scope, Spring creates:

- **One instance** for the `v1` bean definition
- **One instance** for the `v2` bean definition
- **One instance** for the `v3` bean definition

So you end up with **three separate singleton instances** — not one. Each bean definition gets its own single instance.

However, when you use **stereotype annotations** like `@Component`:

```java
@Component
public class MyService {
    // ...
}
```

You can only have **one bean definition** for this class (you can't slap `@Component` on the same class twice). So with stereotype annotations, Singleton scope truly gives you **one and only one instance** of that class.

💡 **Pro Tip**: When someone says "Singleton" in the Spring context, always think **"one instance per bean definition"**, not "one instance in the entire application."

---

## Concept 4: How to Declare Singleton Scope

### ⚙️ Using the `@Scope` Annotation

You can explicitly mark a bean as Singleton using the `@Scope` annotation:

```java
@Component
@Scope("singleton")
public class MyService {

    public MyService() {
        System.out.println("MyService Bean is created");
    }
}
```

But here's the thing — **this is completely optional**. Even without the `@Scope` annotation, the bean is Singleton by default. Adding it is like writing `public` on an interface method — it's already the default behavior.

### 🛡️ Using the Constant (Safer Approach)

Worried about typos? Instead of typing the string `"singleton"`, you can use a constant from the `BeanDefinition` interface:

```java
@Component
@Scope(BeanDefinition.SCOPE_SINGLETON)
public class MyService {
    // ...
}
```

If you open the `SCOPE_SINGLETON` constant, you'll find it's simply the string `"singleton"`. But using the constant protects you from spelling mistakes — the compiler catches errors for you.

⚠️ **Common Mistake**: Typing `"Singleton"` (capital S) or `"SINGLETON"` instead of `"singleton"` (all lowercase). The scope value is case-sensitive! Using the constant avoids this trap entirely.

---

## Concept 5: Proving Singleton Works — The Demo

### ⚙️ The Setup

Let's prove that Singleton scope really does return the same instance. Here's the full working example:

**The Bean:**

```java
@Component
@Scope(BeanDefinition.SCOPE_SINGLETON)  // optional
public class MyService {

    public MyService() {
        System.out.println("MyService Bean is created");
    }
}
```

**The Configuration:**

```java
@Configuration
@ComponentScan(basePackages = "com.example.beans")
public class ProjectScopeConfig {
}
```

**The Main Class:**

```java
public class Example7 {
    public static void main(String[] args) {
        var context = new AnnotationConfigApplicationContext(ProjectScopeConfig.class);

        MyService myService1 = context.getBean(MyService.class);
        MyService myService2 = context.getBean(MyService.class);

        System.out.println(myService1.hashCode());
        System.out.println(myService2.hashCode());
    }
}
```

### 🔍 What Happens?

1. Spring loads the context and creates one `MyService` instance → you see `"MyService Bean is created"` printed **once**
2. `getBean()` is called twice, but both times Spring returns the **same instance**
3. Both `myService1` and `myService2` have the **same hash code** — proving they point to the **exact same object in memory**

If this were Prototype scope, you'd see the constructor message printed **twice**, and the hash codes would be **different**. But with Singleton — one instance, always the same.

💡 **Pro Tip**: The `hashCode()` trick is a quick and easy way to verify whether two references point to the same object. Same hash code = same object in memory.

---

## Concept 6: When Singleton Scope Is the Right Choice

### 🧠 The Concept of Stateless Beans

The word **"stateless"** is key to understanding when Singleton scope works perfectly.

A **stateless class** is one that doesn't hold any data unique to a specific user or request. It only carries **business logic** — methods that behave the same no matter who calls them or when.

```java
@Service
public class CalculatorService {

    public int add(int a, int b) {
        return a + b;
    }

    public int multiply(int a, int b) {
        return a * b;
    }
}
```

This `CalculatorService` is stateless — it has no instance variables that change per user. Whether User A or User B calls `add(2, 3)`, the result is always 5. **Singleton scope is perfect here.**

### ⚠️ When Singleton Becomes Dangerous

Now consider this:

```java
@Component
public class ShoppingCart {
    private List<String> items = new ArrayList<>();

    public void addItem(String item) {
        items.add(item);
    }
}
```

This class is **stateful** — it holds data (`items`) that should be different for each user. If this bean is Singleton, **all users share the same shopping cart**. User A adds "Laptop" and suddenly User B sees "Laptop" in their cart too. That's a bug, not a feature!

For stateful classes like this, you'd switch to **Prototype scope** (or one of the web-aware scopes like Request or Session).

### ✅ The Golden Rule

> **When in doubt, stick with the default Singleton scope.** Only change it when your class holds state that must be unique per user or per request.

Most beans in a typical Spring application — services, repositories, controllers, configuration classes — are stateless. They carry logic, not user-specific data. Singleton scope handles them beautifully.

---

## ✅ Key Takeaways

1. **Bean Scope** controls how many instances Spring creates and when — it's a fundamental concept in Spring
2. **Singleton** is the default scope — one instance per bean definition, reused everywhere
3. Spring's Singleton scope is **per bean definition**, not per class — multiple `@Bean` methods of the same type create multiple singleton instances
4. You can declare Singleton scope explicitly with `@Scope("singleton")` or `@Scope(BeanDefinition.SCOPE_SINGLETON)`, but it's **optional** since it's the default
5. Singleton is chosen as the default for **performance** (avoids repeated object creation) and because most beans are **stateless**
6. **Stateless** classes (no user-specific data, only business logic) → Singleton is perfect
7. **Stateful** classes (holds data unique per user/request) → Consider Prototype or web-aware scopes

---

## ⚠️ Common Mistakes

| Mistake | Why It's Wrong |
|---------|---------------|
| Thinking Singleton scope = Singleton design pattern | Spring Singleton is per bean definition, not per JVM |
| Storing user-specific state in a Singleton bean | All users will share the same data — causes hard-to-debug bugs |
| Explicitly adding `@Scope("singleton")` everywhere | Unnecessary clutter — it's already the default |
| Confusing "one instance per type" with "one instance per bean definition" | Three `@Bean` methods returning the same type = three singleton instances |

---

## 💡 Pro Tips

- Use `hashCode()` to quickly verify whether two bean references point to the same instance
- Use `BeanDefinition.SCOPE_SINGLETON` constant instead of the raw string to avoid typos
- If you're unsure which scope to pick, **always start with Singleton** — it's the right choice 95% of the time
- The 4 web-aware scopes (Request, Session, Application, WebSocket) only work in web applications — you'll learn them when building Spring Boot web apps
