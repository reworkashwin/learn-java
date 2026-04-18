# Dynamic Bean Registration — Programmatic Style

## Introduction

So far in this course, every bean you've created followed the same pattern — slap an annotation like `@Bean` or `@Component` on something, and Spring creates it. Every time. No questions asked. No conditions. No "only if this happens."

But what if you need **conditional bean creation**? What if you want to register a bean **only in production**, or **only when a certain flag is set**, or **only when a random business rule is satisfied**?

Annotations alone can't give you that kind of dynamic, runtime control. They're static — they're baked into your code at compile time.

Starting with **Spring Framework 7** (Spring Boot 4), there's a powerful new feature: **Programmatic Bean Registration**. It lets you write plain Java code — `if` statements, loops, environment checks — to decide **at runtime** which beans get registered in the Spring container.

In this lesson, you'll learn:

- Why annotation-based bean registration isn't always enough
- What `BeanRegistrar` is and how it works
- How to register beans programmatically with conditions
- How to inject dependencies while registering beans
- How to initialize bean properties using supplier lambda expressions
- How to wire everything together with `@Import`

By the end, you'll know how to take full programmatic control over bean creation — a skill that becomes essential in advanced, real-world Spring applications.

---

## Concept 1: The Limitation of Annotation-Based Bean Creation

### 🧠 What's the Problem?

With `@Bean` and stereotype annotations (`@Component`, `@Service`, etc.), you're essentially telling Spring: "Create this bean. Always. Period."

The developer's control is binary — either the annotation is there (bean gets created) or it isn't (no bean). There's no middle ground. No "create this bean **only if** the database is PostgreSQL" or "register this bean **only when** running in the production environment."

### ❓ Why Does This Matter?

In real applications, you'll encounter scenarios like:

- **Environment-specific beans** — Register a mock payment gateway in development but a real one in production
- **Feature flags** — Only create a bean if a certain feature is enabled
- **Conditional logic** — Register different beans based on configuration values, system properties, or even business rules
- **Dynamic registration** — Create beans in a loop based on external data

None of these can be elegantly handled with annotations alone.

### 💡 The Solution

Spring 7 introduces the `BeanRegistrar` interface — a way to write your bean registration logic as **plain Java code**. You get full access to `if/else`, loops, environment variables, and any Java logic you want.

Think of it this way: annotations are like a **pre-set menu** — you pick items before the restaurant opens. Programmatic registration is like a **live chef** — you decide what to cook based on who walks in the door.

---

## Concept 2: The BeanRegistrar Interface

### 🧠 What Is It?

`BeanRegistrar` is a **functional interface** introduced in Spring 7. It has a single abstract method called `register()`. Any class that implements this interface can contain logic to programmatically register beans into the Spring container.

### ⚙️ How It Works — Step by Step

**Step 1:** Create a class that implements `BeanRegistrar`

**Step 2:** Override the `register()` method — this is where all your conditional bean creation logic goes

**Step 3:** Tell Spring about this class using `@Import` on your `@Configuration` class

### 🧪 The Method Signature

```java
public class MyBeanRegistrar implements BeanRegistrar {

    @Override
    public void register(BeanRegistry registry, Environment env) {
        // Your bean registration logic goes here
    }
}
```

The `register()` method receives two powerful parameters:

| Parameter | Type | Purpose |
|-----------|------|---------|
| `registry` | `BeanRegistry` | Used to actually register beans into the container |
| `env` | `Environment` | Gives access to environment properties, profiles, system variables |

### 💡 Why Two Parameters?

- **`BeanRegistry`** — This is your tool to create beans. You call `registry.registerBean()` to add beans to the container.
- **`Environment`** — This lets you make decisions based on *where* your code is running. Is it production? Development? UAT? What system variables are set? You can check all of this and decide which beans to register accordingly.

### ⚠️ Common Mistake

Don't forget — just creating the `MyBeanRegistrar` class isn't enough. Spring won't discover it automatically. You **must** use `@Import` to connect it to your configuration:

```java
@Configuration
@Import(MyBeanRegistrar.class)
public class ProjectConfig {
    // No @Bean methods needed here
}
```

Without `@Import`, your `BeanRegistrar` class is just a regular Java class sitting in your codebase doing nothing.

---

## Concept 3: Setting Up the Example — The Classes

### 🧠 The Setup

To demonstrate programmatic registration, let's work with three simple Java classes. Notice — **none of them have stereotype annotations**. They're plain Java classes, not Spring beans (yet).

#### Engine.java

```java
public class Engine {
    private String name;

    public Engine() {}

    // getters, setters, toString
}
```

#### Vehicle.java

```java
public class Vehicle {
    private String name;
    private Engine engine;

    public Vehicle(Engine engine) {
        this.engine = engine;
    }

    // getters, setters, toString
}
```

Notice that `Vehicle` has a **dependency on `Engine`** — it requires an `Engine` object through its constructor. This will be important when we register these beans programmatically.

#### Bike.java

```java
public class Bike {
    private String name;

    public Bike() {}

    // getters, setters, toString
}
```

#### ProjectConfig.java

```java
@Configuration
public class ProjectConfig {
    // Empty — no @Bean methods!
}
```

The configuration class is intentionally empty. We're not creating any beans the traditional way. Everything will be done programmatically.

---

## Concept 4: Registering Beans with Conditions

### 🧠 The Business Logic

Here's the scenario: we generate a random number. If it's **even**, we register `Engine` and `Vehicle` beans. If it's **odd**, we register only the `Bike` bean.

This is a simple example, but it demonstrates the core idea — **different beans are created based on runtime conditions**.

### ⚙️ The Implementation

```java
public class MyBeanRegistrar implements BeanRegistrar {

    @Override
    public void register(BeanRegistry registry, Environment env) {
        int number = new Random().nextInt(100);
        System.out.println("Generated number: " + number);

        if (number % 2 == 0) {
            System.out.println("Even — Registering Engine + Vehicle");

            registry.registerBean("engine", Engine.class);
            registry.registerBean("vehicle", Vehicle.class);

        } else {
            System.out.println("Odd — Registering Bike only");

            registry.registerBean("bike", Bike.class);
        }
    }
}
```

### 🔍 Breaking It Down

1. **Random number generation** — `new Random().nextInt(100)` produces a number between 0 and 99
2. **Condition check** — `number % 2 == 0` determines even or odd
3. **Even path** — Both `Engine` and `Vehicle` beans get registered
4. **Odd path** — Only `Bike` gets registered

### ❓ Why Register Engine Before Vehicle?

Because `Vehicle` depends on `Engine`. If you try to create a `Vehicle` without an `Engine` bean already in the container, Spring won't be able to satisfy the dependency. **Order matters** when there are dependencies between beans.

---

## Concept 5: Bean Names in Programmatic Registration

### 🧠 The Default Naming Trap

When you call `registry.registerBean(Engine.class)` **without** providing a name, Spring doesn't use the simple lowercase class name like it does with `@Component`. Instead, it uses the **fully qualified class name** plus a hash suffix:

```
com.example.beans.Engine#0
```

This is very different from what you'd expect! If your main class is checking for a bean named `"engine"` using `context.containsBean("engine")`, it won't find it — because the actual name is that long ugly string.

### ⚙️ The Fix — Provide Explicit Names

Always pass the bean name as the **first parameter**:

```java
registry.registerBean("engine", Engine.class);
registry.registerBean("vehicle", Vehicle.class);
registry.registerBean("bike", Bike.class);
```

Now the beans have clean, predictable names: `engine`, `vehicle`, `bike`.

### ⚠️ Common Mistake

Forgetting to provide explicit bean names and then wondering why `context.containsBean("engine")` returns `false`. With programmatic registration, **always provide explicit names** to avoid confusion.

---

## Concept 6: Initializing Beans with Supplier Logic

### 🧠 The Problem

With the basic `registerBean()` call, Spring creates the bean using the default constructor — but it doesn't set any field values. So if you fetch the bean and check its `name`, you'll get `null`.

```java
registry.registerBean("bike", Bike.class);
// The bike bean exists, but bike.getName() returns null
```

How do you initialize the bean's properties during registration?

### ⚙️ The Solution — Lambda Expressions

The `registerBean()` method has an overloaded version that accepts a **consumer lambda expression** as a second parameter. This lambda receives a `spec` (specification) object, which lets you define a **supplier** — the logic for creating and initializing the bean.

#### Registering Bike with Initialization:

```java
registry.registerBean("bike", Bike.class, spec -> 
    spec.supplier(context -> {
        Bike bike = new Bike();
        bike.setName("Electric Bike");
        return bike;
    })
);
```

Let's unpack this layer by layer:

| Layer | What It Does |
|-------|-------------|
| `spec ->` | Consumer lambda — receives the bean specification |
| `spec.supplier(...)` | Defines *how* to create the bean object |
| `context ->` | Supplier lambda — receives the application context |
| `new Bike()` | Creates the actual object |
| `bike.setName(...)` | Initializes properties |
| `return bike` | Returns the fully configured object to Spring |

### 🧪 Registering Engine with Initialization:

```java
registry.registerBean("engine", Engine.class, spec -> 
    spec.supplier(context -> {
        Engine engine = new Engine();
        engine.setName("V8 Turbo");
        return engine;
    })
);
```

Now when you fetch the engine bean, `engine.getName()` will return `"V8 Turbo"` instead of `null`.

### 💡 When to Use the Simple vs Lambda Form

- **Simple form** — `registerBean("name", MyClass.class)` — Use when you just need the bean to exist, no special initialization needed
- **Lambda form** — `registerBean("name", MyClass.class, spec -> ...)` — Use when you need to set properties, inject dependencies, or run custom logic during bean creation

---

## Concept 7: Injecting Dependencies During Registration

### 🧠 The Challenge

`Vehicle` requires an `Engine` in its constructor. When registering `Vehicle` programmatically, how do you pass the `Engine` bean that was just registered?

### ⚙️ The Solution — Use the Context

Remember that the supplier lambda receives the `context` (application context) as a parameter. You can use it to **fetch any already-registered bean**:

```java
registry.registerBean("vehicle", Vehicle.class, spec -> 
    spec.supplier(context -> {
        Engine engine = context.bean(Engine.class);
        Vehicle vehicle = new Vehicle(engine);
        vehicle.setName("Sports Car");
        return vehicle;
    })
);
```

Here's what's happening:

1. `context.bean(Engine.class)` — Fetches the `Engine` bean from the container (it was registered earlier)
2. `new Vehicle(engine)` — Creates the `Vehicle` with the `Engine` dependency
3. `vehicle.setName("Sports Car")` — Sets the vehicle's name
4. `return vehicle` — Returns the fully assembled `Vehicle` to Spring

### ⚠️ Important — Registration Order

You **must** register `Engine` before `Vehicle`. If you reverse the order, `context.bean(Engine.class)` will fail because the engine bean doesn't exist yet.

```java
// ✅ Correct order
registry.registerBean("engine", Engine.class, ...);
registry.registerBean("vehicle", Vehicle.class, ...);  // Can fetch Engine

// ❌ Wrong order
registry.registerBean("vehicle", Vehicle.class, ...);  // Engine doesn't exist yet!
registry.registerBean("engine", Engine.class, ...);
```

---

## Concept 8: The Main Class — Handling Conditional Beans

### 🧠 The Setup

Since beans are created conditionally (even → Engine + Vehicle, odd → Bike), the main class must check if a bean exists before trying to fetch it. Otherwise, you'll get a runtime exception.

```java
var context = new AnnotationConfigApplicationContext(ProjectConfig.class);

if (context.containsBean("engine")) {
    Engine engine = context.getBean("engine", Engine.class);
    System.out.println("Engine name: " + engine.getName());
}

if (context.containsBean("vehicle")) {
    Vehicle vehicle = context.getBean("vehicle", Vehicle.class);
    System.out.println("Vehicle name: " + vehicle.getName());
    System.out.println("Vehicle engine: " + vehicle.getEngine().getName());
}

if (context.containsBean("bike")) {
    Bike bike = context.getBean("bike", Bike.class);
    System.out.println("Bike model: " + bike.getName());
}
```

### ❓ Why the `containsBean()` Check?

Because not all beans exist in every run! If the random number is odd, only `Bike` exists. Calling `context.getBean("engine", Engine.class)` when no engine bean was registered would throw an exception. The `containsBean()` check prevents that.

### 🧪 Sample Outputs

**When generated number is even (e.g., 18):**
```
Generated number: 18
Even — Registering Engine + Vehicle
Vehicle name: Sports Car
Vehicle engine: V8 Turbo
```

**When generated number is odd (e.g., 77):**
```
Generated number: 77
Odd — Registering Bike only
Bike model: Electric Bike
```

---

## Concept 9: The Complete BeanRegistrar

### 🧪 Final Code

Here's the complete `MyBeanRegistrar` with all initialization logic:

```java
public class MyBeanRegistrar implements BeanRegistrar {

    @Override
    public void register(BeanRegistry registry, Environment env) {
        int number = new Random().nextInt(100);
        System.out.println("Generated number: " + number);

        if (number % 2 == 0) {
            System.out.println("Even — Registering Engine + Vehicle");

            // Register Engine with initialization
            registry.registerBean("engine", Engine.class, spec -> 
                spec.supplier(context -> {
                    Engine engine = new Engine();
                    engine.setName("V8 Turbo");
                    return engine;
                })
            );

            // Register Vehicle with dependency injection
            registry.registerBean("vehicle", Vehicle.class, spec -> 
                spec.supplier(context -> {
                    Engine engine = context.bean(Engine.class);
                    Vehicle vehicle = new Vehicle(engine);
                    vehicle.setName("Sports Car");
                    return vehicle;
                })
            );

        } else {
            System.out.println("Odd — Registering Bike only");

            // Register Bike with initialization
            registry.registerBean("bike", Bike.class, spec -> 
                spec.supplier(context -> {
                    Bike bike = new Bike();
                    bike.setName("Electric Bike");
                    return bike;
                })
            );
        }
    }
}
```

And the configuration:

```java
@Configuration
@Import(MyBeanRegistrar.class)
public class ProjectConfig {
}
```

---

## ✅ Key Takeaways

1. **Annotation-based bean creation is static** — the bean either exists or it doesn't. There's no conditional logic.

2. **`BeanRegistrar`** is a functional interface (Spring 7+) that lets you register beans programmatically using plain Java code.

3. The `register()` method gives you two tools: **`BeanRegistry`** (to register beans) and **`Environment`** (to check runtime conditions).

4. Use **`@Import(MyBeanRegistrar.class)`** on your `@Configuration` class — Spring won't discover the registrar on its own.

5. Always provide **explicit bean names** with `registerBean("name", Class)` — default names in programmatic registration are fully qualified class names with hash suffixes.

6. Use the **supplier lambda** (`spec -> spec.supplier(context -> ...)`) to initialize bean properties and inject dependencies during registration.

7. When beans are conditional, always use **`containsBean()`** before `getBean()` to avoid runtime exceptions.

8. **Register dependencies first** — if Bean B depends on Bean A, register A before B.

---

## ⚠️ Common Mistakes

| Mistake | Consequence |
|---------|------------|
| Not using `@Import` for the `BeanRegistrar` class | Registrar is ignored — no beans get created |
| Not providing explicit bean names | Bean names become fully qualified class names with hash suffixes — hard to look up |
| Registering beans in wrong order | Dependency not found when trying to inject via `context.bean()` |
| Calling `getBean()` without checking `containsBean()` first | Runtime exception when the bean wasn't registered in that particular run |
| Forgetting to use the supplier lambda | Bean properties remain `null` — only the default constructor runs |

---

## 💡 Pro Tips

- **Use this for advanced scenarios only.** If you always want a bean to exist, stick with `@Bean` or `@Component`. Programmatic registration shines when you need **runtime flexibility**.

- The `Environment` parameter lets you check profiles (`env.getActiveProfiles()`), system properties, and environment variables — perfect for creating environment-specific beans. This will be covered in upcoming sections.

- Since `BeanRegistrar` is a **functional interface**, you could technically use a lambda, but a dedicated class is much more readable for complex registration logic.

- Think of `registerBean()` with a supplier as the programmatic equivalent of a `@Bean` method — you control exactly how the object is created and initialized.
