# Bean Lifecycle Hooks — @PostConstruct & @PreDestroy

## Introduction

You've learned how to create Spring beans using `@Component` — just slap an annotation on a class, and Spring automatically creates an object and registers it in the IoC container.

But here's a question: **what if you want to do something right after the bean is created?**

For instance, what if you need to populate data into the bean, open a database connection, load a configuration file, or perform some setup logic? With `@Component`, you don't manually create the object — Spring does it for you. So how do you get a chance to step in and initialize things?

And on the flip side — **what if you want to do something just before the bean gets destroyed?** Maybe close a connection, release a resource, or log a cleanup message?

This is where **bean lifecycle hooks** come in. Spring gives you specific points in a bean's life where you can inject your own logic:

- **After creation** → `@PostConstruct`
- **Before destruction** → `@PreDestroy`

In this lesson, you'll learn:

- How to run initialization logic after a bean is created using `@PostConstruct`
- How to run cleanup logic before a bean is destroyed using `@PreDestroy`
- Alternative approaches using Spring's `InitializingBean` and `DisposableBean` interfaces
- How `@Bean` annotation's `initMethod` and `destroyMethod` attributes work
- When to use which approach and what's recommended in practice

---

## Concept 1: The Problem — How to Populate Data in a @Component Bean?

### 🧠 What's the Issue?

When you use `@Component`, Spring creates the bean for you. You don't call `new Vehicle()` yourself. So if you have a field like `name` inside the `Vehicle` class, how do you set its value?

Sure, you could give it a default value:

```java
@Component
public class Vehicle {
    private String name = "BMW";
}
```

But here's the catch — that **same default value** will be used for **every** bean object created from this class. That's not flexible at all. What if you want to conditionally set the value, load it from a database, or compute it based on some logic?

You need a way to **run custom initialization code** once the bean is ready. That's exactly what `@PostConstruct` gives you.

---

## Concept 2: @PostConstruct — Running Logic After Bean Creation

### 🧠 What Is @PostConstruct?

`@PostConstruct` is an annotation you place on a method inside your bean class. It tells Spring:

> "Once you've created this bean and injected all its dependencies, please call this method."

Think of it as a **setup hook** — a chance to run initialization logic right after the object comes to life.

### ❓ Why Do We Need It?

Because with `@Component`, you don't control the object creation process. Spring creates the object behind the scenes. `@PostConstruct` gives you a **callback** — a specific moment where you can step in and do your thing.

### ⚙️ How Does It Work?

1. Create a method inside your `@Component` class (the method name can be anything)
2. Annotate it with `@PostConstruct`
3. Write your initialization logic inside

```java
import jakarta.annotation.PostConstruct;

@Component
public class Vehicle {

    private String name;

    @PostConstruct
    public void initialize() {
        this.name = "Audi";
    }
}
```

When Spring creates the `Vehicle` bean:
1. It creates the object
2. It injects any dependencies
3. It calls the `initialize()` method (because of `@PostConstruct`)
4. Now the bean is fully ready with `name = "Audi"`

### 🔍 Important Detail — This Is NOT a Spring Annotation!

Here's something that surprises many beginners: `@PostConstruct` does **not** come from the Spring Framework library. It comes from the **Jakarta Enterprise Edition** (formerly Java EE) library.

Spring is inspired by Jakarta EE and supports many of its specifications. So you can use Jakarta annotations inside Spring without any issue — but you need to add the dependency first.

#### Adding the Jakarta Annotations Dependency

Go to [Maven Repository](https://mvnrepository.com/) and search for **"Jakarta Annotations API"**. Copy the latest version's dependency:

```xml
<dependency>
    <groupId>jakarta.annotation</groupId>
    <artifactId>jakarta.annotation-api</artifactId>
    <version>3.0.0</version>
</dependency>
```

Add this to your `pom.xml` right after the Spring Context dependency, then sync your Maven changes.

### 🧪 Example in Action

```java
@Component
public class Vehicle {

    private String name;

    @PostConstruct
    public void initialize() {
        this.name = "Audi";
    }

    // getters, setters, etc.
}
```

```java
// In your main class
var context = new AnnotationConfigApplicationContext(ProjectConfig.class);
Vehicle vehicle = context.getBean(Vehicle.class);
System.out.println(vehicle.getName()); // Output: Audi
```

Without `@PostConstruct`, the `name` field would be `null`. With it, the method runs automatically after bean creation, and you get `"Audi"`.

### 💡 Key Rules About @PostConstruct

- The method is invoked **only once** in the bean's lifecycle
- It's called **after** the bean is created **and** after dependencies are injected
- The method name can be anything — `initialize()`, `setup()`, `init()`, whatever you like
- Use it **only** with stereotype annotations like `@Component` (not with `@Bean` methods — there you can just write code directly in the method body)

---

## Concept 3: Alternative — Spring's InitializingBean Interface

### 🧠 What Is It?

If you don't want to use the Jakarta `@PostConstruct` annotation, Spring provides its own way: the `InitializingBean` interface.

### ⚙️ How Does It Work?

Your class implements `InitializingBean` and overrides the `afterPropertiesSet()` method:

```java
import org.springframework.beans.factory.InitializingBean;

@Component
public class Vehicle implements InitializingBean {

    private String name;

    @Override
    public void afterPropertiesSet() {
        this.name = "Tesla";
    }
}
```

This achieves the exact same thing as `@PostConstruct` — once the bean is created and dependencies are injected, Spring calls `afterPropertiesSet()`.

### ❓ So Why Not Use This?

It works, but it's **more verbose**:
- You have to implement an interface
- You have to override a method with a fixed name
- It couples your class to Spring's API

Compare that to `@PostConstruct` — just put an annotation on any method. Much cleaner.

> 💡 **Pro Tip:** Prefer `@PostConstruct` over `InitializingBean`. It's simpler, cleaner, and widely adopted in the industry.

---

## Concept 4: Another Alternative — @Bean's initMethod Attribute

### 🧠 What Is It?

If you're using `@Bean` to create your beans (inside a `@Configuration` class), you can specify an `initMethod` parameter:

```java
@Bean(initMethod = "initialize")
public Vehicle vehicle1() {
    Vehicle vehicle = new Vehicle();
    return vehicle;
}
```

This tells Spring: "After creating this bean, call the `initialize()` method on it."

The `Vehicle` class must have a method with that exact name:

```java
public class Vehicle {
    private String name;

    public void initialize() {
        this.name = "Audi";
    }
}
```

### ❓ Why Is This Rarely Used?

Because when you write a `@Bean` method, you **already have full control** over the object. You can just do everything right there:

```java
@Bean
public Vehicle vehicle1() {
    Vehicle vehicle = new Vehicle();
    vehicle.setName("Audi"); // Just set it here directly!
    return vehicle;
}
```

No need for a separate `initMethod`. That's why even Spring's own documentation says:

> *"Not commonly used given that the method may be called programmatically directly within the body of a Bean-annotated method."*

The `initMethod` is useful in rare scenarios — like when your `@Bean` method calls a third-party API that returns an object, and you want to populate additional data before registering it as a bean.

---

## Concept 5: @PreDestroy — Running Logic Before Bean Destruction

### 🧠 What Is @PreDestroy?

Just like `@PostConstruct` gives you a hook **after creation**, `@PreDestroy` gives you a hook **before destruction**.

When does a bean get destroyed? Typically when:
- The application is shutting down
- The Spring IoC container is being closed
- The program is terminating

Just before the bean is removed from the container, Spring will call any method annotated with `@PreDestroy`.

### ❓ Why Do We Need It?

Common use cases:
- **Closing database connections** held by the bean
- **Releasing file handles** or network sockets
- **Flushing caches** or buffered data
- **Logging** that a component is shutting down
- General **cleanup operations**

### ⚙️ How Does It Work?

```java
import jakarta.annotation.PreDestroy;

@Component
public class Vehicle {

    private String name;

    @PostConstruct
    public void initialize() {
        this.name = "Audi";
    }

    @PreDestroy
    public void destroy() {
        System.out.println("Destroying the Vehicle Bean");
    }
}
```

### 🧪 Triggering Destruction

To see `@PreDestroy` in action, you need to **close** the application context:

```java
var context = new AnnotationConfigApplicationContext(ProjectConfig.class);
Vehicle vehicle = context.getBean(Vehicle.class);
System.out.println(vehicle.getName()); // Audi

context.close(); // This triggers the destroy process
// Output: Destroying the Vehicle Bean
```

When `context.close()` is called, Spring begins the shutdown process. Before destroying the `Vehicle` bean, it invokes the `destroy()` method — and you see the cleanup message.

### 💡 Key Rules About @PreDestroy

- Like `@PostConstruct`, this comes from the **Jakarta** library (same dependency)
- The method is called **only once**, just before destruction
- The method name can be anything
- It's your chance to do final cleanup

---

## Concept 6: Alternative — Spring's DisposableBean Interface

### 🧠 What Is It?

Spring's own alternative to `@PreDestroy`. Your class implements `DisposableBean` and overrides the `destroy()` method:

```java
import org.springframework.beans.factory.DisposableBean;

@Component
public class Vehicle implements DisposableBean {

    private String name;

    @Override
    public void destroy() {
        System.out.println("Destroying the Vehicle Bean");
    }
}
```

Same result — Spring calls `destroy()` before removing the bean from the container.

### ❓ Should You Use This?

Same verdict as `InitializingBean` — it works but it's more verbose and couples your code to Spring. Prefer `@PreDestroy` for cleaner code.

---

## Concept 7: @Bean's destroyMethod Attribute

Just like `initMethod`, the `@Bean` annotation also supports a `destroyMethod`:

```java
@Bean(initMethod = "initialize", destroyMethod = "cleanup")
public Vehicle vehicle1() {
    Vehicle vehicle = new Vehicle();
    return vehicle;
}
```

Again, this is **rarely used** because you can call cleanup logic directly in the `@Bean` method or use `@PreDestroy` in the class itself.

---

## The Complete Bean Lifecycle — Putting It All Together

Here's the full picture of what happens during a bean's life:

```
1. Spring creates the bean (instantiates the object)
         ↓
2. Spring injects dependencies (@Autowired fields, etc.)
         ↓
3. @PostConstruct method is called (or afterPropertiesSet())
         ↓
4. Bean is READY — available for use in your application
         ↓
   ... application runs ...
         ↓
5. Application shutdown / context.close() triggered
         ↓
6. @PreDestroy method is called (or DisposableBean.destroy())
         ↓
7. Bean is DESTROYED — removed from the IoC container
```

---

## Summary: Three Ways to Hook into Bean Lifecycle

| Approach | Init Hook | Destroy Hook | Recommended? |
|---|---|---|---|
| **Jakarta Annotations** | `@PostConstruct` | `@PreDestroy` | ✅ Yes — cleanest |
| **Spring Interfaces** | `InitializingBean.afterPropertiesSet()` | `DisposableBean.destroy()` | ⚠️ Works but verbose |
| **@Bean Attributes** | `@Bean(initMethod = "...")` | `@Bean(destroyMethod = "...")` | ⚠️ Rarely needed |

---

## ✅ Key Takeaways

1. **`@PostConstruct`** runs a method **once** after the bean is created and dependencies are injected — perfect for initialization logic
2. **`@PreDestroy`** runs a method **once** just before the bean is destroyed — perfect for cleanup logic
3. Both annotations come from **Jakarta EE**, not Spring — you need the `jakarta.annotation-api` dependency
4. Spring provides alternatives (`InitializingBean`, `DisposableBean`) but they're more verbose
5. `@Bean` has `initMethod` and `destroyMethod` attributes, but they're rarely used since you can write logic directly in the `@Bean` method body
6. These lifecycle hooks are invoked **only once** per bean lifecycle
7. Use `@PostConstruct` and `@PreDestroy` with **stereotype annotations** like `@Component`

---

## ⚠️ Common Mistakes

1. **Forgetting the Jakarta dependency** — `@PostConstruct` and `@PreDestroy` won't be available without `jakarta.annotation-api` in your `pom.xml`
2. **Using `@PostConstruct` with `@Bean` methods** — You don't need it there. Just write your logic directly in the `@Bean` method body
3. **Expecting the method to run multiple times** — These hooks run exactly **once** in the bean's lifecycle
4. **Not calling `context.close()`** — If you don't close the context, `@PreDestroy` methods won't be triggered (in standalone apps)

---

## 💡 Pro Tips

1. **Prefer `@PostConstruct` and `@PreDestroy`** over Spring interfaces — they're clean, simple, and industry-standard
2. Use `@PostConstruct` for things like **loading initial data, validating configuration, warming up caches**
3. Use `@PreDestroy` for things like **closing connections, releasing resources, flushing buffers**
4. In Spring Boot applications, the context is closed automatically on shutdown — you don't need to call `context.close()` manually
5. If your class uses both `@PostConstruct` and `InitializingBean`, **both** will be called — `@PostConstruct` first, then `afterPropertiesSet()`
