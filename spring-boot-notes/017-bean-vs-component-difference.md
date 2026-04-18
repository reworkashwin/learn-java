# @Bean vs @Component — What's the Difference?

## Introduction

You've now used both `@Bean` and `@Component` to create Spring beans. Both annotations accomplish the same fundamental goal — **registering objects in the Spring IoC container**. But they do it in very different ways, with different levels of control and flexibility.

So naturally, the question arises: **when should you use `@Bean`, and when should you use `@Component`?** Are they interchangeable? Can one do things the other can't?

Spoiler: they're **not** interchangeable. Each has a specific sweet spot, and understanding the differences will help you make the right choice every time.

In this lesson, you'll learn:

- The key differences between `@Bean` and `@Component`
- When each annotation is the right tool for the job
- Why `@Component` is preferred in most real-world applications
- The trade-offs in control, flexibility, and code simplicity

---

## Concept 1: Where You Place the Annotation — Method vs Class

### 🧠 What's the Core Difference?

The most fundamental difference is **where** you write the annotation:

- `@Bean` goes on top of a **Java method** (inside a `@Configuration` class)
- `@Component` goes on top of a **Java class**

This single difference has a ripple effect on everything else.

### ⚙️ How Does This Matter?

Think about it — inside a single Java class, you can write **as many methods as you want**. So if `@Bean` is placed on methods, you can write multiple methods that each return a different bean — even beans of the **same type**.

```java
@Configuration
public class VehicleConfig {

    @Bean
    public Vehicle vehicle1() {
        Vehicle v = new Vehicle();
        v.setName("BMW");
        return v;
    }

    @Bean
    public Vehicle vehicle2() {
        Vehicle v = new Vehicle();
        v.setName("Audi");
        return v;
    }
}
```

Here, two beans of type `Vehicle` exist in the Spring context — one named "BMW" and one named "Audi". Easy.

But with `@Component`? You place it **on the class itself**. And a class can only have the annotation **once**. So `@Component` creates **exactly one bean** of that class.

```java
@Component
public class Vehicle {
    private String name = "BMW";
}
```

One annotation, one bean. That's it.

### 💡 Insight

> Need **multiple beans of the same type**? Use `@Bean`. Need **one bean per class**? `@Component` is simpler and cleaner.

---

## Concept 2: What Types of Classes Can You Create Beans For?

### 🧠 What's the Difference?

This is a big one.

With `@Bean`, you can create a bean for **any class** — including classes from **external libraries** like `String`, `Integer`, `Double`, or classes from third-party frameworks.

Remember from earlier lessons? We created beans of `String` and `Integer`:

```java
@Bean
public String greeting() {
    return "Hello, Spring!";
}

@Bean
public Integer appVersion() {
    return 42;
}
```

These are JDK library classes. You didn't write `String` or `Integer` — Java provides them.

Now, can you do the same with `@Component`? **No, you can't.**

### ❓ Why Not?

To use `@Component`, you need to **write the annotation on top of the class definition**. But you can't edit `String.java` or `Integer.java` — they're part of the JDK library. You can **use** them, but you can't **modify** them.

So `@Component` is limited to **your own application classes** — the classes your development team creates.

### 🧪 Quick Comparison

| Scenario | `@Bean` | `@Component` |
|---|---|---|
| Your own classes (e.g., `Vehicle`, `UserService`) | ✅ Yes | ✅ Yes |
| JDK classes (e.g., `String`, `Integer`) | ✅ Yes | ❌ No |
| Third-party library classes | ✅ Yes | ❌ No |

### 💡 Insight

> Anytime you need a bean from a **library or framework class** you didn't write, `@Bean` is your only option. There's no way around this limitation of `@Component`.

---

## Concept 3: Amount of Code Required

### 🧠 Which One Is Easier to Write?

With `@Component`, creating a bean is dead simple — just one annotation on the class:

```java
@Component
public class Vehicle {
    private String name = "Toyota";
}
```

Done. Spring scans this class, sees the `@Component` annotation, creates an object, and registers it.

With `@Bean`, there's more ceremony. You need:

1. A `@Configuration` class
2. A method inside it
3. The `@Bean` annotation on that method
4. Logic inside the method to create and return the object

```java
@Configuration
public class AppConfig {

    @Bean
    public Vehicle vehicle() {
        Vehicle v = new Vehicle();
        v.setName("Toyota");
        return v;
    }
}
```

That's more code for the same result.

### 💡 Insight

> `@Component` wins on **simplicity**. If you just need a straightforward bean from your own class, don't overthink it — use `@Component`.

---

## Concept 4: Control Over Bean Creation

### 🧠 Who's in Charge?

This is where `@Bean` really shines.

When you use `@Bean`, **you** are in full control. You write the method body. You decide:

- How to create the object (which constructor to call)
- What values to set
- What validation logic to run
- What conditional logic to apply

```java
@Bean
public Vehicle vehicle() {
    Vehicle v = new Vehicle();
    
    // Custom logic — maybe load from a config file
    String name = loadFromConfig("vehicle.name");
    
    // Validation
    if (name == null || name.isEmpty()) {
        throw new IllegalStateException("Vehicle name cannot be empty!");
    }
    
    v.setName(name);
    return v;
}
```

You have **complete freedom** inside that method. It's just regular Java code.

### What About @Component?

When you use `@Component`, **Spring takes charge**. Spring creates the object behind the scenes. You don't call `new Vehicle()` — Spring does. You don't get to write custom instantiation logic.

Now, does that mean you have **zero** control? Not exactly. You learned in the previous lesson that you can use:

- `@PostConstruct` — to run initialization logic after the bean is created
- `@PreDestroy` — to run cleanup logic before the bean is destroyed

But these hooks give you **limited control** compared to writing the full creation logic yourself inside a `@Bean` method. With `@Bean`, you control the **entire creation process** from start to finish. With `@Component` + `@PostConstruct`, you only get to step in **after** Spring has already created the object.

### 🧪 Analogy

Think of it like ordering food:

- **`@Bean`** is like cooking at home — you pick the ingredients, control the recipe, decide the seasoning, and serve it exactly how you want.
- **`@Component`** is like ordering from a restaurant — the chef (Spring) prepares the dish. You can request some customizations (`@PostConstruct`), but you're not in the kitchen.

---

## Concept 5: Who Creates the Object?

### 🧠 Developer vs Framework

This is closely related to the control point, but worth stating explicitly:

- **`@Bean`** → The **developer** creates the object using the `new` operator inside the method. You invoke constructors, call setters, and return the fully configured object.
- **`@Component`** → The **Spring framework** creates the object behind the scenes. You never call `new`. Spring handles instantiation using reflection.

```java
// @Bean — developer creates the object
@Bean
public Vehicle vehicle() {
    return new Vehicle("BMW");  // YOU call new
}

// @Component — Spring creates the object
@Component
public class Vehicle {
    // Spring calls new Vehicle() internally — you never see it
}
```

### ⚠️ Common Mistake

> Don't try to manually create objects with `new` when using `@Component`. The whole point is to let Spring manage the lifecycle. If you need full control over instantiation, switch to `@Bean`.

---

## Concept 6: So Which One Should You Use?

### 🧠 The Practical Answer

In real-world applications, developers use **`@Component` (and its stereotype variants like `@Service`, `@Repository`, `@Controller`) the vast majority of the time.**

Why? Because:

- Most of the time, you're creating beans from your own classes — `@Component` works perfectly
- It requires less code — just one annotation
- Spring Boot's component scanning picks it up automatically
- It's clean, simple, and idiomatic

You reach for `@Bean` when:

- You need to create a bean from a **third-party or library class** you can't annotate
- You need **multiple beans of the same type**
- You need **full control** over the creation and configuration logic

### 🧪 Decision Guide

Ask yourself these questions:

1. **Is it your own class?** → Prefer `@Component`
2. **Is it a library/third-party class?** → Must use `@Bean`
3. **Do you need multiple beans of the same type?** → Use `@Bean`
4. **Do you need full control over object creation?** → Use `@Bean`
5. **Is it a straightforward, single bean?** → Use `@Component`

---

## ✅ Key Takeaways

| Feature | `@Bean` | `@Component` |
|---|---|---|
| **Placed on** | Java method | Java class |
| **Multiple beans of same type?** | ✅ Yes | ❌ No (one per class) |
| **Works with library classes?** | ✅ Yes | ❌ No (only your classes) |
| **Code required** | More (method + config class) | Less (just one annotation) |
| **Control over creation** | Full control | Limited (Spring creates it) |
| **Who creates the object?** | Developer (`new`) | Spring Framework |
| **Used in real projects** | For special cases | Most of the time |

---

## ⚠️ Common Mistakes

1. **Trying to use `@Component` on a library class** — You can't edit `String.java` to add `@Component`. Use `@Bean` for external classes.
2. **Using `@Bean` for everything** — If it's your own simple class, `@Component` is cleaner. Don't overcomplicate things.
3. **Forgetting `@Configuration`** — `@Bean` methods must live inside a `@Configuration` (or `@Component`) class. A `@Bean` method in a plain class won't be picked up by Spring.

---

## 💡 Pro Tips

1. **Stereotype annotations** like `@Service`, `@Repository`, and `@Controller` are specialized forms of `@Component`. They work the same way but add semantic meaning. You'll use these heavily in real applications.
2. When you start building enterprise applications with Spring Boot, you'll notice that **80–90% of your beans use `@Component`** (or its variants). `@Bean` is reserved for configuration classes where you wire up third-party libraries or need fine-grained control.
3. You can mix both approaches in the same project — and you almost always will. There's no rule that says you must pick one. Use the right tool for the right situation.
