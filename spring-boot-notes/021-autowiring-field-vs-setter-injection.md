# Autowiring Demo — Field Injection vs Setter Injection

## Introduction

In the previous lecture, you learned how to **manually wire beans** by invoking setter methods yourself inside a `@Configuration` class. It worked — but it was clunky. You had to write boilerplate code to create objects, call setters, and glue everything together.

Wouldn't it be amazing if Spring could just **figure out** which beans depend on each other and wire them **automatically**?

That's exactly what **Autowiring** does. In this lesson, you'll:

- Understand what Autowiring is and why it exists
- Learn the three types of Autowiring: **Field**, **Setter**, and **Constructor** injection
- Build a hands-on demo with `Car` and `Engine` beans
- See **Field Injection** and **Setter Injection** in action
- Understand why **both are discouraged** for production code
- Learn the specific drawbacks: testing difficulty, mutability, readability, and null pointer risks

By the end, you'll know *how* to use Field and Setter Injection — and more importantly, *why you shouldn't* rely on them in real projects.

---

## Concept 1: What Is Autowiring?

### 🧠 What Is It?

**Autowiring** is Spring's way of automatically discovering and injecting dependencies into your beans — without you writing manual wiring code.

Instead of you saying:

> "Hey Spring, take this Engine bean and plug it into the Car bean using the setter method"

You simply say:

> "Hey Spring, this Car needs an Engine. **You** figure it out."

And Spring does exactly that.

### ❓ Why Do We Need It?

Remember what manual wiring looked like?

```java
@Bean
public Car car() {
    Car car = new Car();
    car.setEngine(engine());  // YOU are doing the wiring
    return car;
}
```

You're manually invoking the setter, creating the dependency, and gluing them. That's fine for small examples, but in a real-world application with hundreds of beans? It becomes a maintenance nightmare.

**Autowiring eliminates all of that.** You don't:

- Create objects with `new`
- Invoke setter methods manually
- Worry about the order of bean creation

Spring finds the right dependency and injects it — *automatically*.

### 💡 Benefits of Autowiring

| Benefit | Explanation |
|---|---|
| **Reduced boilerplate** | No manual wiring code |
| **Better readability** | Less configuration clutter |
| **Loose coupling** | Beans don't know how dependencies are created |
| **Efficient management** | Spring handles the entire dependency graph |

---

## Concept 2: The Three Types of Autowiring

### 🧠 Overview

Spring provides **three ways** to perform autowiring, each using the `@Autowired` annotation in a different location:

| Type | Where You Place `@Autowired` |
|---|---|
| **Field Injection** | On top of the field (variable) |
| **Setter Injection** | On top of the setter method |
| **Constructor Injection** | On top of the constructor |

Think of it like plugging in a charger — you can plug it into the wall (field), through an adapter (setter), or directly into the device's port (constructor). All three deliver power, but some are more reliable than others.

> **Spoiler:** Constructor Injection is the recommended approach for production code. We'll cover *why* in this lecture, and see the demo in the next one.

---

## Concept 3: Setting Up the Demo — Car and Engine Beans

### ⚙️ Building the Classes

To demonstrate autowiring, we're creating two fresh beans that have a natural real-world relationship:

- **`Car`** — depends on an `Engine` (just like in real life!)
- **`Engine`** — an independent bean

#### The `Engine` Class

```java
@Component
public class Engine {
    private String name;

    @PostConstruct
    public void initialize() {
        this.name = "V8";
        System.out.println("Engine bean created");
    }

    // Getter, Setter, toString
}
```

#### The `Car` Class

```java
@Component
public class Car {
    private String name;

    @PostConstruct
    public void initialize() {
        this.name = "Kia";
        System.out.println("Car bean created");
    }

    // Getter, Setter, toString
}
```

Notice how both classes use:

- `@Component` — so Spring automatically creates beans from them
- `@PostConstruct` — to set default values right after bean creation

### ⚙️ Configuring Component Scanning

Don't forget — for `@Component` to work, you need to tell Spring **where to look**:

```java
@Configuration
@ComponentScan(basePackages = "ex4.beans")
public class ProjectConfig {
}
```

At this point, `Car` and `Engine` are two **independent** beans. There's no relationship between them yet. Let's change that.

---

## Concept 4: Field Injection — The Simplest (But Flawed) Approach

### 🧠 What Is Field Injection?

Field Injection means placing the `@Autowired` annotation **directly on a field**. Spring will look at the field's type, find a matching bean in the context, and inject it — no setter, no constructor needed.

### ⚙️ How It Works — Step by Step

**Step 1:** Add an `Engine` field to the `Car` class:

```java
@Component
public class Car {
    private String name;

    @Autowired
    private Engine engine;

    // Getter and Setter for engine
    // Other getters, setters, toString, @PostConstruct
}
```

That's it. Just one annotation — `@Autowired` — on top of the field.

**Step 2:** Retrieve and verify in your main class:

```java
var context = new AnnotationConfigApplicationContext(ProjectConfig.class);

Car car = context.getBean(Car.class);
Engine engine = context.getBean(Engine.class);

System.out.println("Car name: " + car.getName());
System.out.println("Engine name: " + engine.getName());
System.out.println("Engine that Car owns: " + car.getEngine());
```

**Step 3:** Run the application. Output:

```
Car name: Kia
Engine name: V8
Engine that Car owns: Engine{name='V8'}
```

### 💡 The Magic Behind the Scenes

You never wrote `car.setEngine(engine)`. You never called `new Engine()`. Spring:

1. Created the `Car` bean
2. Saw the `@Autowired` annotation on the `engine` field
3. Looked for a bean of type `Engine` in the context
4. Injected it directly into the field — using **reflection** (bypassing the setter entirely)

That's the beauty of autowiring — zero manual wiring.

---

## Concept 5: Setter Injection — Autowiring Through the Setter

### 🧠 What Is Setter Injection?

Instead of placing `@Autowired` on the field itself, you place it on the **setter method**. During startup, Spring will call that setter and pass the matching bean as the argument.

### ⚙️ How It Works

```java
@Component
public class Car {
    private String name;
    private Engine engine;

    @Autowired
    public void setEngine(Engine engine) {
        this.engine = engine;
    }

    // Other methods...
}
```

Notice the difference:

- **Field Injection:** `@Autowired` on the field → Spring uses reflection
- **Setter Injection:** `@Autowired` on the setter → Spring calls the setter method

### ⚙️ What Happens at Startup?

1. Spring creates the `Car` bean (object is instantiated)
2. Spring sees `@Autowired` on `setEngine()`
3. It inspects the parameter type → `Engine`
4. It finds (or creates) the `Engine` bean
5. It calls `car.setEngine(engineBean)` automatically

The output is **exactly the same** as Field Injection:

```
Car name: Kia
Engine name: V8
Engine that Car owns: Engine{name='V8'}
```

### 💡 Insight

Both Field and Setter Injection produce the same result. The difference is in **how** Spring assigns the dependency — direct field access (reflection) vs. calling a method. But both share the **same fundamental drawbacks**, which we'll explore next.

---

## Concept 6: Why Field and Setter Injection Are Discouraged

This is the most important part of the lecture. Knowing *how* to use something is only half the story — knowing *when NOT to use it* is what separates a beginner from a professional.

### Drawback 1: Unit Testing Becomes Harder

#### The Problem

Look at the console output when you run the app. You'll notice something interesting:

```
Car bean created
Engine bean created
```

Wait — the `Car` bean is created **before** the `Engine` bean? Even though `Car` depends on `Engine`?

Yes! With Field and Setter Injection, Spring creates the `Car` object **first**, and only *then* assigns the `Engine` dependency (via the field or setter). The field/setter can only be accessed **after** the object exists.

#### Why This Hurts Testing

When writing unit tests, you might want to replace the real `Engine` with a **mock engine**. But to do that, you'd need to:

1. First create the `Car` object
2. Then manually inject the mock via the field or setter

This adds extra boilerplate and makes tests messier. With Constructor Injection (covered next lecture), you pass the mock **directly into the constructor** — clean and simple.

---

### Drawback 2: No Immutability — Can't Use `final`

Try marking the `engine` field as `final`:

```java
@Autowired
private final Engine engine;  // ❌ Compilation error!
```

It won't compile. Why? Because `final` fields must be assigned at the time of object creation (in the constructor). With Field/Setter Injection, the field is assigned *after* the object is already created — that's too late for `final`.

#### Why This Matters

Without `final`, your `Car` object is **mutable**. Anyone (or any code) can accidentally replace the engine:

```java
car.setEngine(someOtherEngine);  // Oops! Changed the dependency
```

In production systems, you want dependencies to be **set once and never changed**. Immutability protects you from subtle, hard-to-debug issues.

---

### Drawback 3: Reduced Code Readability

With Field Injection, the dependencies are "hidden" inside the class body. Another developer looking at the class from the outside has **no easy way** to see what dependencies it requires without opening the file and scanning through the fields.

With Constructor Injection, all dependencies are visible right in the constructor signature — like a function's parameter list. It's a **self-documenting** approach.

---

### Drawback 4: Risk of NullPointerException

Here's a scary one. Imagine this scenario:

1. Spring creates the `Car` bean successfully
2. Something goes wrong while autowiring the `Engine` (maybe the bean doesn't exist, or there's a configuration error)
3. The `engine` field remains `null`
4. Later, your business logic calls `car.getEngine().getName()` → **NullPointerException!** 💥

With Constructor Injection, this can't happen — if Spring can't find the dependency, the bean **won't be created at all**. You get a clear, early error instead of a runtime surprise.

---

### 📊 Summary: Field/Setter Injection Drawbacks

| Drawback | Impact |
|---|---|
| **Hard to unit test** | Can't easily inject mocks |
| **No `final` fields** | Object is mutable, dependencies can change |
| **Reduced readability** | Dependencies are hidden inside the class |
| **NullPointerException risk** | Failed autowiring can leave fields as `null` |

---

## Concept 7: When Is Field/Setter Injection Acceptable?

Despite the drawbacks, you **will** see developers using Field and Setter Injection. Why? Because they're incredibly **convenient**.

If your use case meets these conditions, Field/Setter Injection can be okay:

- No unit testing requirements
- No need for immutable objects
- Quick prototyping or proof-of-concept work
- Simple applications where the risks are minimal

But whenever you're in doubt — **go with Constructor Injection**. It's the standard recommended approach.

---

## Concept 8: Handling Optional Dependencies — `@Autowired(required = false)`

### 🧠 What If the Dependency Bean Doesn't Exist?

By default, if Spring can't find a bean to autowire, it throws a `NoSuchBeanDefinitionException`. Your application crashes at startup.

But what if the dependency is **optional**? Maybe your `Car` can function without an `Engine` in certain scenarios (like a test environment).

### ⚙️ The Solution

```java
@Autowired(required = false)
private Engine engine;
```

By setting `required = false`:

- If an `Engine` bean exists → Spring injects it normally
- If no `Engine` bean exists → the field stays `null`, but your app **doesn't crash**

### ⚠️ Be Careful

This is a double-edged sword. Using `required = false` means you're accepting that the field might be `null`. You **must** add null checks in your business logic:

```java
if (engine != null) {
    System.out.println(engine.getName());
}
```

Otherwise, you're back to the NullPointerException problem.

---

## ✅ Key Takeaways

1. **Autowiring** lets Spring automatically discover and inject dependencies — no manual wiring code needed.
2. The `@Autowired` annotation can be placed on a **field** (Field Injection), a **setter** (Setter Injection), or a **constructor** (Constructor Injection).
3. **Field Injection** is the simplest — just annotate the field — but it has significant drawbacks.
4. **Setter Injection** works through the setter method — same convenience, same drawbacks.
5. Both Field and Setter Injection are **discouraged for production code** because of testing difficulty, mutability, poor readability, and NullPointerException risks.
6. **Constructor Injection** is the recommended approach (covered in the next lecture).
7. Use `@Autowired(required = false)` to make a dependency optional — but always add null checks.

---

## ⚠️ Common Mistakes

1. **Using Field Injection in production code** — it's convenient but creates long-term maintenance pain.
2. **Forgetting `@ComponentScan`** — your `@Component` beans won't be detected without it.
3. **Assuming bean creation order** — with Field/Setter Injection, the dependent bean (Car) is created *before* its dependency (Engine).
4. **Using `@Autowired(required = false)` without null checks** — you're trading one crash for another.

---

## 💡 Pro Tips

1. **When in doubt, use Constructor Injection.** It's the industry standard and solves all the drawbacks discussed here.
2. **Watch the console output** — Spring logs the bean creation order, which helps you understand the lifecycle.
3. **Field Injection uses Java reflection** to bypass access modifiers. That's clever, but it means your field doesn't *need* a setter — which also means the dependency is invisible to the outside world.
4. **Think of dependencies like a recipe's ingredients.** Constructor Injection lists them upfront (like a recipe card). Field Injection hides them inside (like discovering you need eggs halfway through cooking).

---

## What's Next?

In the next lecture, you'll see **Constructor Injection** in action — the recommended approach that solves every drawback discussed here. You'll understand why it's the gold standard for Spring dependency injection and how it makes your code testable, immutable, and readable.
