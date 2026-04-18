# Spring's Stereotype Annotations — @Component, @Service, @Repository, @Controller

## Introduction

You already know how to use `@Component` to create Spring beans automatically. But if you've looked at any real-world Spring project, you'll notice that not every class uses `@Component`. Instead, you'll see annotations like `@Service`, `@Repository`, `@Controller`, and `@RestController` scattered across different classes.

Why? If `@Component` already does the job, **why do we need four more annotations that seem to do the same thing?**

The answer lies in **architecture**. Real backend applications aren't just a single pile of code — they're organized into **layers**, each with a specific responsibility. Spring provides these specialized annotations (called **stereotype annotations**) so your code clearly communicates *what role* each class plays in this layered architecture.

In this lesson, you'll learn:

- The three essential layers of a backend application
- Why separating code into layers matters
- What `@Service`, `@Repository`, `@Controller`, and `@RestController` annotations mean
- How they relate to `@Component`
- Where you can and can't use these annotations
- Why `@Component` still has a place

---

## Concept 1: The Three Layers of a Backend Application

### 🧠 What Are These Layers?

Before diving into the annotations, you need to understand how a real backend application is structured. Every enterprise backend application — whether built with Java, Python, or any other language — follows a **three-layer architecture**:

1. **Controller Layer** (Presentation Layer)
2. **Service Layer** (Business Logic Layer)
3. **Repository Layer** (Data Access Layer)

Think of it as an assembly line in a factory. Each station (layer) has a specific job, and work flows from one station to the next.

### ⚙️ How Do These Layers Work Together?

Here's the complete request flow:

**Client → Controller → Service → Repository → Database**

Let's walk through each layer:

#### 1. Controller Layer (Presentation Layer)

This is the **front door** of your application. When a request comes in from a client — whether it's a browser, a mobile app, a microservice, or any other external service — the **controller layer receives it first**.

Its responsibilities:
- Receive incoming requests from client applications
- Validate the request data
- Forward the request to the service layer
- Send the response back to the client

Think of it like a **receptionist** — they greet you, check your appointment, and direct you to the right department.

#### 2. Service Layer (Business Logic Layer)

This is the **brain** of your application. Once the controller hands off the request, the **service layer processes the actual business rules**.

Its responsibilities:
- Execute business rules and validations
- Perform data transformations
- Orchestrate calls to the repository layer when data needs to be read or written
- Handle database transactions (rollbacks if something fails)

Think of it like the **manager** who actually makes the decisions and ensures everything follows company policy.

#### 3. Repository Layer (Data Access Layer)

This is the **data gateway**. When the service layer needs to talk to the database, it delegates that work to the **repository layer**.

Its responsibilities:
- Execute all database operations — CRUD (Create, Read, Update, Delete)
- Communicate with the database using libraries like Spring Data JPA, JDBC, etc.
- Run queries to fetch, insert, update, or delete data

Think of it like the **filing clerk** — they know exactly where every file is stored and how to retrieve or update it.

### 🔄 Putting It All Together

```
Client (Browser/Mobile/Microservice)
    │
    ▼
┌──────────────────────────┐
│   Controller Layer       │  ← Receives request, validates, returns response
│   (@Controller)          │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│   Service Layer          │  ← Business logic, rules, transactions
│   (@Service)             │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│   Repository Layer       │  ← Database queries, CRUD operations
│   (@Repository)          │
└──────────┬───────────────┘
           │
           ▼
      [ Database ]
```

---

## Concept 2: Why Not Just Write Everything in One Class?

### ❓ Why Do We Need Separate Layers?

This is a natural question — especially when you're starting out. Why can't we just put everything in one big class?

Here's the reality: in an enterprise application, your business logic can have **thousands of lines of code**. If you dump everything into a single class:

- **Maintainability drops** — Finding and fixing bugs in a 5,000-line class is a nightmare
- **Reusability drops** — You can't easily reuse a piece of logic if it's buried deep inside a massive class

### 💡 The Power of Separation

When you separate logic into layers, you get:

**Reusability:**
Imagine you have a method in the repository layer that reads data from a `users` table. If three different service classes need that data, they can all call the same repository method — no code duplication.

**Maintainability:**
If there's a bug in how data is fetched from the database, you know exactly where to look — the repository layer. If a business rule is wrong, you go straight to the service layer. No hunting through a monster class.

**Clarity:**
When a new developer joins your team, the layered structure immediately tells them where to find what. Controller handles requests. Service handles logic. Repository handles data. Simple.

> Think of it like an office — you wouldn't ask the receptionist to also manage finances and file legal documents. Each person has a clear role, and the whole organization runs smoothly because of it.

---

## Concept 3: The Stereotype Annotations — One for Each Layer

### 🧠 What Are Stereotype Annotations?

Now that you understand the layers, the annotations map perfectly:

| Layer | Annotation | Purpose |
|---|---|---|
| Controller Layer | `@Controller` | Classes that handle incoming web requests (returns HTML) |
| Controller Layer | `@RestController` | Classes that handle REST API requests (returns JSON) |
| Service Layer | `@Service` | Classes that contain business logic |
| Repository Layer | `@Repository` | Classes that handle database operations |
| Generic / Cross-cutting | `@Component` | Classes that don't fit a specific layer |

### ⚙️ How Do They Work?

Here's the key insight — **all of these annotations are built on top of `@Component`**. You can think of `@Service`, `@Repository`, `@Controller`, and `@RestController` as *specialized children* of `@Component`.

If you peek inside the source code of `@Controller`:

```java
@Component   // <-- It uses @Component internally!
public @interface Controller {
    // ...
}
```

Same for `@Service`:

```java
@Component
public @interface Service {
    // ...
}
```

And `@Repository`:

```java
@Component
public @interface Repository {
    // ...
}
```

They all carry `@Component` inside them. This means **all the functionality of `@Component` is inherited** — Spring will detect these classes during component scanning and register them as beans, just like it does with `@Component`.

### ❓ So Why Not Just Use @Component Everywhere?

If they all inherit from `@Component`, why bother with separate annotations? Two reasons:

**1. Readability**

When someone sees `@Service` on a class, they instantly know: "This class handles business logic." When they see `@Repository`, they know: "This class talks to the database." With `@Component`, all you know is that it's *some* bean — but what does it do? You'd have to read the code to find out.

**2. Special Behavior**

Some stereotype annotations come with extra powers:
- `@Repository` automatically translates database-specific exceptions into Spring's generic `DataAccessException` hierarchy
- `@Controller` enables Spring MVC's web request handling
- `@RestController` combines `@Controller` + `@ResponseBody` to return JSON directly

### 🧪 When to Use What

```java
// Controller layer — handles incoming web requests
@Controller
public class HomeController {
    // returns HTML views
}

// Controller layer — handles REST API requests
@RestController
public class UserApiController {
    // returns JSON responses
}

// Service layer — handles business logic
@Service
public class UserService {
    // business rules, validations, data transformations
}

// Repository layer — handles database operations
@Repository
public class UserRepository {
    // CRUD operations, database queries
}

// Generic — not tied to any specific layer
@Component
public class EmailHelper {
    // utility used across multiple layers
}
```

---

## Concept 4: @Controller vs @RestController

### 🧠 What's the Difference?

Both are used in the controller layer, but they behave differently:

- `@Controller` — Returns responses in **HTML format** (typically used with template engines like Thymeleaf)
- `@RestController` — Returns responses in **JSON format** (used for building REST APIs)

`@RestController` is essentially a convenience annotation that combines `@Controller` and `@ResponseBody`. When you're building modern APIs that return JSON data, `@RestController` is what you'll use most of the time.

> Don't worry if this doesn't fully click right now — you'll use `@RestController` extensively when you start building Spring Boot web applications.

---

## Concept 5: Where Can You Use These Annotations?

### 🧠 The @Target Rule

Every annotation in Java has a **target** — it defines *where* the annotation can be placed. This is an important distinction:

| Annotation | Target | Can Be Used On |
|---|---|---|
| `@Component` | TYPE | Classes only |
| `@Service` | TYPE | Classes only |
| `@Repository` | TYPE | Classes only |
| `@Controller` | TYPE | Classes only |
| `@Bean` | METHOD | Methods only |

### ⚠️ What Happens If You Mix Them Up?

If you try to place `@Bean` on top of a class:

```java
@Bean  // ❌ Compilation error: @Bean is not applicable to type
public class Vehicle {
    // ...
}
```

You'll get: **"@Bean is not applicable to type"** — because `@Bean` can only go on methods.

Similarly, if you try to place `@Component` (or any stereotype annotation) on a method:

```java
@Component  // ❌ Compilation error!
public Vehicle createVehicle() {
    // ...
}
```

You'll get a compilation error — because stereotype annotations can only go on classes.

### 💡 Pro Tip

Always check the `@Target` of an annotation when you're unsure where to use it:
- `@Target(ElementType.TYPE)` → use on classes
- `@Target(ElementType.METHOD)` → use on methods
- Both listed → use on either

---

## Concept 6: Don't Forget @ComponentScan

### ⚠️ Critical Reminder

Regardless of which stereotype annotation you use — `@Component`, `@Service`, `@Repository`, or `@Controller` — **you must always have `@ComponentScan` on your configuration class** to enable automatic detection of these annotations.

```java
@Configuration
@ComponentScan(basePackages = "com.example.myapp")
public class AppConfig {
    // Spring will scan the package and register all stereotype-annotated classes as beans
}
```

Without `@ComponentScan`, Spring has no idea these annotated classes exist. It won't scan for them, and no beans will be created.

---

## Concept 7: When to Still Use @Component

### ❓ Does @Component Still Have a Place?

Absolutely! Use `@Component` when:

- Your class is a **generic utility** that doesn't belong to any specific layer
- It's a **cross-cutting concern** used by multiple layers (e.g., an email sender, a file parser, a logging helper)
- You can't categorize it as a controller, service, or repository

```java
@Component
public class NotificationHelper {
    // Used by service layer, controller layer, etc.
    // Not specific to any one layer
}
```

If the class clearly fits a layer, use the appropriate stereotype annotation. If it doesn't, `@Component` is your fallback.

---

## ✅ Key Takeaways

1. **Backend applications follow a three-layer architecture**: Controller → Service → Repository
2. **Each layer has a matching annotation**: `@Controller`/`@RestController`, `@Service`, `@Repository`
3. **All stereotype annotations inherit from `@Component`** — they all create beans the same way
4. **Use the specific annotation for readability** — `@Service` tells the reader "this is business logic" instantly
5. **Using `@Component` on a service class won't cause errors**, but using `@Service` is the best practice
6. **`@Bean` goes on methods, stereotype annotations go on classes** — don't mix them up
7. **`@ComponentScan` is always required** for Spring to discover stereotype-annotated classes
8. **`@RestController` returns JSON**, `@Controller` returns HTML — use `@RestController` for REST APIs

---

## ⚠️ Common Mistakes

1. **Using `@Component` for everything** — While it works, it hurts readability and you miss out on layer-specific features (like `@Repository`'s exception translation)
2. **Forgetting `@ComponentScan`** — Without it, none of your stereotype-annotated classes will be detected
3. **Putting `@Bean` on a class** — `@Bean` is for methods only; you'll get a compilation error
4. **Putting `@Service` on a method** — Stereotype annotations are for classes only
5. **Confusing `@Controller` with `@RestController`** — `@Controller` returns HTML views, `@RestController` returns JSON responses

---

## 💡 Pro Tips

1. **Interview favorite**: "What's the difference between `@Component`, `@Service`, `@Repository`, and `@Controller`?" — This is one of the most commonly asked Spring interview questions. Know that they all inherit from `@Component` but are used for different architectural layers.
2. **Check `@Target`**: If you ever get a "not applicable" compilation error, look at the annotation's `@Target` to see where it can be used.
3. **Think in layers**: Before creating a class, ask yourself — "Is this a controller, a service, or a repository?" Then pick the right annotation. If it's none of these, use `@Component`.
4. **You'll use these extensively**: Right now you're learning the theory, but once you start building Spring Boot web applications, these annotations will be in almost every class you write.
