# Autowiring Demo — Constructor Injection

## Introduction

In the previous lecture, you learned about **Field Injection** and **Setter Injection** — and discovered that both come with serious drawbacks: difficult unit testing, no immutability, hidden dependencies, and the dreaded risk of `NullPointerException`.

So what's the solution? Enter **Constructor Injection** — the **recommended and preferred** way to wire dependencies in modern Spring applications.

In this lesson, you'll:

- See a **hands-on demo** of Constructor Injection using the same `Car` and `Engine` beans
- Discover that `@Autowired` is **optional** when there's a single constructor
- Understand **why** Constructor Injection solves every drawback of Field/Setter Injection
- Learn about the `final` keyword advantage and **immutable beans**
- Encounter the dreaded **Circular Dependency** problem — and how to avoid it

By the end, you'll not only know *how* to use Constructor Injection, but you'll confidently choose it as your go-to approach for every Spring project.

---

## Concept 1: Constructor Injection — The Recommended Approach

### 🧠 What Is It?

Constructor Injection means placing the `@Autowired` annotation on a **constructor** and declaring all required dependencies as **constructor parameters**. When Spring creates the bean, it passes all the dependencies right into the constructor — the object is fully wired from the very first moment it exists.

Think of it this way:

> **Field Injection** is like buying a car and then installing the engine later.
> **Setter Injection** is like buying a car and then swapping the engine through a service center.
> **Constructor Injection** is like building the car **with the engine already inside** — it rolls off the assembly line ready to go.

### ❓ Why Is It Preferred?

Because your bean is **never in an incomplete state**. The moment it's created, all dependencies are guaranteed to be present. No nulls, no surprises, no half-baked objects floating around your application.

---

## Concept 2: Constructor Injection in Action

### ⚙️ How It Works — Step by Step

Let's take the same `Car` and `Engine` classes from the previous lecture and switch from Setter Injection to Constructor Injection.

**Step 1:** Remove `@Autowired` from the setter method (if present).

**Step 2:** Create a constructor that accepts the dependency as a parameter, and annotate it with `@Autowired`:

```java
@Component
public class Car {
    private Engine engine;

    @Autowired
    public Car(Engine engine) {
        this.engine = engine;
    }

    // Other fields, getters, setters, toString...
}
```

That's it. You've declared: *"To create a `Car`, you **must** provide an `Engine`."*

### 🔍 What Happens at Startup?

Here's where Constructor Injection behaves **differently** from Field and Setter Injection — and this difference is critical:

1. Spring starts creating the `Car` bean
2. It sees the constructor requires an `Engine` parameter
3. It **pauses** the `Car` creation and goes to create the `Engine` bean **first**
4. Once `Engine` is ready, Spring passes it into the `Car` constructor
5. The `Car` bean is created — fully wired from the start

#### Console Output:

```
Engine bean created      ← Engine is created FIRST
Car bean created         ← Car is created AFTER its dependency
```

Compare this to Field/Setter Injection, where the output was:

```
Car bean created         ← Car was created first (without Engine!)
Engine bean created      ← Engine was injected later
```

See the difference? With Constructor Injection, **Spring respects the dependency order**. The `Engine` bean is always created before the `Car` — because the `Car` literally cannot exist without it.

### 🧪 The Output

```
V8 Engine is owned by the Car
```

Spring successfully wired the `Engine` into the `Car` through the constructor. No manual wiring. No setters. Clean and predictable.

---

## Concept 3: Multiple Dependencies? No Problem

### ❓ What If Your Bean Has More Than One Dependency?

Simply add more parameters to the constructor:

```java
@Component
public class Car {
    private Engine engine;
    private Transmission transmission;
    private SteeringSystem steering;

    @Autowired
    public Car(Engine engine, Transmission transmission, SteeringSystem steering) {
        this.engine = engine;
        this.transmission = transmission;
        this.steering = steering;
    }
}
```

Spring will resolve **each** parameter by type and inject all of them. Every dependency is clearly listed in the constructor signature — like a recipe listing all ingredients upfront.

---

## Concept 4: `@Autowired` Is Optional for Single Constructors

### 🧠 The Magic Shortcut

Here's a beautiful feature of Spring: if your class has **only one constructor**, you don't even need to write `@Autowired`. Spring is smart enough to figure it out automatically.

```java
@Component
public class Car {
    private Engine engine;

    // No @Autowired needed!
    public Car(Engine engine) {
        this.engine = engine;
    }
}
```

This works identically to the version with `@Autowired`. Spring sees a single constructor, inspects its parameters, and performs the injection automatically.

### ⚠️ When Is `@Autowired` Still Required?

If your class has **multiple constructors**, Spring won't know which one to use. In that case, you **must** annotate exactly one constructor with `@Autowired` to tell Spring which one is the injection target.

```java
@Component
public class Car {
    private Engine engine;

    public Car() {
        // default constructor
    }

    @Autowired  // ← Required: tells Spring to use THIS constructor
    public Car(Engine engine) {
        this.engine = engine;
    }
}
```

### 💡 Pro Tip

In most real-world Spring applications, you'll see constructors **without** `@Autowired` — and that's perfectly fine. It's the idiomatic, modern Spring style. Just remember: this shortcut only works when there's a single constructor.

---

## Concept 5: How Constructor Injection Solves Every Drawback

This is the heart of the lecture. Let's revisit every drawback of Field/Setter Injection and see how Constructor Injection elegantly eliminates them.

### ✅ Advantage 1: Easy Unit Testing

#### The Problem with Field/Setter Injection

With Field Injection, dependencies are injected via reflection — there's no clean way to pass mock objects when writing tests. You'd need to use reflection-based frameworks or create the bean in a running Spring context, making tests slow and complex.

#### How Constructor Injection Fixes It

Since dependencies are accepted as **constructor parameters**, you can simply pass mock objects directly:

```java
// In your test code — no Spring context needed!
Engine mockEngine = new MockEngine();
Car car = new Car(mockEngine);

// Test your Car with the mock engine
```

Clean. Simple. No reflection hacks. No Spring context required for unit tests.

---

### ✅ Advantage 2: Immutability with `final` Fields

#### The Problem

With Field/Setter Injection, you **cannot** mark your dependency fields as `final`:

```java
@Autowired
private final Engine engine;  // ❌ Compilation error with Field Injection!
```

Why? Because `final` fields must be assigned in the constructor. Field/Setter Injection assigns them *after* construction — that's too late.

#### How Constructor Injection Fixes It

With Constructor Injection, assignment happens **inside the constructor**, so `final` works perfectly:

```java
@Component
public class Car {
    private final Engine engine;  // ✅ Works perfectly!

    public Car(Engine engine) {
        this.engine = engine;
    }
}
```

Once the `Car` bean is created, no one can change its `engine` — it's immutable. This gives you a rock-solid guarantee:

> "This car was built with **this specific engine**, and it will stay that way forever."

### 💡 Flexibility

Want immutability? Mark the field `final`. Want the flexibility to change the dependency later? Leave out `final`. Constructor Injection gives you the **choice** — Field/Setter Injection doesn't.

---

### ✅ Advantage 3: Better Code Readability

#### The Problem

With Field Injection, someone looking at your class from the outside has **no idea** what dependencies it needs. They'd have to open the class and scan through every field looking for `@Autowired` annotations.

#### How Constructor Injection Fixes It

All dependencies are declared right in the **constructor signature**. Even without opening the class, any developer (or IDE) can instantly see what a bean needs:

```java
// Somewhere in your code...
Car car = new Car(engine);  // 👀 Instantly clear: Car needs an Engine
```

The constructor acts as a **contract** — it tells the world: *"Give me these things, and I'll give you a fully working Car."*

---

### ✅ Advantage 4: No NullPointerException Surprises

#### The Problem

With Field/Setter Injection, if the dependency bean doesn't exist (e.g., you forgot `@Component`), the bean is still created — but the dependency field stays `null`. You won't know until later, when your code tries to use it and gets a **NullPointerException** at runtime.

#### How Constructor Injection Fixes It

Let's simulate this. Remove `@Component` from the `Engine` class:

```java
// @Component  ← Commented out!
public class Engine {
    // ...
}
```

Now run the application. What happens?

```
ERROR: UnsatisfiedDependencyException
```

The entire application **refuses to start**. Spring says: *"I can't create a `Car` because I can't find an `Engine` bean."*

This is a **good thing**! You get a clear, immediate error at startup — not a mysterious `NullPointerException` hours later in production when a customer triggers the right code path.

> **Fail fast, fail loudly.** That's the philosophy of Constructor Injection.

---

### 📊 Comparison Table

| Concern | Field/Setter Injection | Constructor Injection |
|---|---|---|
| **Unit Testing** | Hard — needs reflection or Spring context | Easy — just pass mocks to constructor |
| **Immutability (`final`)** | ❌ Not possible | ✅ Fully supported |
| **Readability** | Dependencies hidden in fields | Dependencies visible in constructor |
| **Null Safety** | Bean created even if dependency missing | Fails fast at startup |
| **Bean Creation Order** | Bean created first, dependency injected later | Dependency created first, then bean |

---

## Concept 6: Circular Dependency — The One Thing That Can Go Wrong

### 🧠 What Is a Circular Dependency?

A circular dependency happens when two (or more) beans depend on **each other** through their constructors, creating an infinite loop.

Imagine this:

- `Car` needs `Engine` to be created (via constructor)
- `Engine` needs `Car` to be created (via constructor)

Who gets created first? **Neither can!** It's like two people holding a door open for each other — nobody goes through.

### ⚙️ Demo: Creating a Circular Dependency

**Car class** (already has Engine as a constructor dependency):

```java
@Component
public class Car {
    private final Engine engine;

    @Autowired
    public Car(Engine engine) {
        this.engine = engine;
    }
}
```

**Engine class** (now also depends on Car):

```java
@Component
public class Engine {
    private Car car;

    @Autowired
    public Engine(Car car) {
        this.car = car;
    }
}
```

### 💥 What Happens at Startup?

Spring tries this chain:

1. "Let me create `Car`... oh, it needs `Engine`"
2. "Let me create `Engine`... oh, it needs `Car`"
3. "Let me create `Car`... oh, it needs `Engine`"
4. *...round and round...*
5. **Gives up** and throws:

```
UnsatisfiedDependencyException:
Is there an unresolvable circular reference?
```

### 🔧 How to Avoid Circular Dependencies

The answer is simple but requires discipline: **design your beans so that dependencies flow in one direction**.

Ask yourself:

> "Does Bean A truly need Bean B, AND does Bean B truly need Bean A?"

Usually, the answer is no. One of the dependencies is unnecessary or can be redesigned. Some strategies:

- **Rethink the design** — often circular dependencies signal a design smell
- **Extract a shared dependency** — move common logic into a third bean that both can depend on
- **Use an event-based approach** — one bean publishes an event, the other listens

### ⚠️ Common Mistake

Don't try to "fix" circular dependencies by switching to Field or Setter Injection. While it may avoid the immediate exception, it masks a fundamental design problem and introduces all the drawbacks we discussed earlier.

---

## ✅ Key Takeaways

1. **Constructor Injection** declares dependencies as constructor parameters — the bean is fully wired from the moment it's created.

2. Spring creates dependencies **before** the bean that needs them, respecting the correct creation order.

3. If your class has a **single constructor**, `@Autowired` is **optional** — Spring injects automatically.

4. Constructor Injection solves **all four drawbacks** of Field/Setter Injection:
   - Easy unit testing (pass mocks directly)
   - Supports `final` fields (immutable beans)
   - Better readability (dependencies visible in constructor)
   - Fail-fast behavior (no NullPointerException surprises)

5. **Circular dependencies** (A needs B, B needs A) cause `UnsatisfiedDependencyException`. Avoid them through thoughtful design.

6. **Constructor Injection is the recommended approach** for production-grade Spring applications.

---

## ⚠️ Common Mistakes

1. **Using Field Injection out of habit** — It's easier to type, but every `@Autowired` on a field is a missed opportunity for better code.

2. **Forgetting `@Autowired` with multiple constructors** — If you have more than one constructor, Spring can't guess which one to use. Annotate exactly one.

3. **Creating circular dependencies accidentally** — Especially in large projects. Always trace your dependency graph mentally or with tools.

4. **Trying to fix circular dependencies with Setter Injection** — This hides the problem instead of solving it.

---

## 💡 Pro Tips

1. **Combine Constructor Injection with `final`** — Always mark injected fields as `final` unless you have a specific reason not to. This makes your beans immutable and thread-safe.

2. **Use Lombok's `@RequiredArgsConstructor`** — In real projects, you'll often see this Lombok annotation that auto-generates a constructor for all `final` fields, eliminating boilerplate entirely:

   ```java
   @Component
   @RequiredArgsConstructor
   public class Car {
       private final Engine engine;
       // No constructor needed — Lombok generates it!
   }
   ```

3. **Let the single-constructor shortcut be your default** — Don't write `@Autowired` on single constructors. It's cleaner and aligns with modern Spring conventions.
