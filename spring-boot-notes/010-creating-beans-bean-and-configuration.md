# Let's Create Beans — @Bean and @Configuration in Action

## Introduction

We've talked enough theory. Now it's time to **actually create beans** using the Spring Framework.

This is the most fundamental thing you can do with Spring — create a bean and register it inside the Spring IoC container. Until you master this, you can't move on to dependency injection, autowiring, or any of the advanced features. Everything starts here.

In this section, we'll go hands-on and learn:

1. How to define a **configuration class** using `@Configuration`
2. How to create beans using the `@Bean` annotation
3. How to **initialize the Spring context** and retrieve beans from it
4. What happens when you request a bean that **doesn't exist**
5. The difference between fetching beans **by type** vs **by name**
6. A naming convention nuance around bean method names

Let's jump right in.

---

## Concept 1: Why Normal Java Objects Aren't Enough

### 🧠 The Problem with `new`

When you create a Java object the traditional way — using the `new` keyword — Spring has **absolutely no idea** that object exists.

```java
Vehicle vehicle = new Vehicle();
vehicle.setName("Audi");
```

This object lives in your code, in your memory, but the **Spring IoC container is completely empty**. It's not tracking this object. It can't inject it anywhere. It can't manage its lifecycle. As far as Spring is concerned, this object doesn't exist.

### ❓ Why Does This Matter?

Imagine you need the same `Vehicle` object in 20 different classes across your application. Without Spring, you'd have to write `new Vehicle()` in all 20 places. Now if you want to change the vehicle name from "Audi" to "BMW"? You'd have to hunt down all 20 locations and update each one manually.

That's tedious, error-prone, and exactly the kind of problem Spring was built to solve.

The solution? **Tell Spring to create and manage the object as a bean.** Then any class that needs it can simply ask the Spring context — "Hey, give me the Vehicle bean" — and Spring hands it over. One source of truth. One place to maintain.

---

## Concept 2: The @Configuration Annotation

### 🧠 What is @Configuration?

`@Configuration` is a Spring annotation you place on top of a Java class to tell the Spring Framework:

> "Hey, this class contains bean definitions. When you start up, come here and read the configurations I've defined inside."

It marks the class as a **source of bean definitions**.

### ⚙️ How It Works

```java
@Configuration
public class ProjectConfig {
    // Bean definitions go here
}
```

That's it. The class name can be anything — `ProjectConfig`, `AppConfig`, `MyBeans` — it doesn't matter. What matters is the `@Configuration` annotation on top.

When the Spring application starts up and initializes its IoC container, it looks for classes annotated with `@Configuration` and scans everything inside them.

### 💡 Think of It Like a Menu

If Spring is a restaurant, the `@Configuration` class is the **menu card**. It tells Spring what "dishes" (beans) are available. Without a menu, the restaurant doesn't know what to serve.

---

## Concept 3: The @Bean Annotation

### 🧠 What is @Bean?

`@Bean` is an annotation you place on top of a **method** inside a `@Configuration` class. It tells Spring:

> "The object returned by this method should be registered as a bean in the Spring IoC container."

Without `@Bean`, the method is just a regular Java method. The object it returns is just a regular Java object. Spring won't touch it. But the moment you add `@Bean`, Spring takes ownership of that object.

### ⚙️ How It Works — Step by Step

**Step 1:** Create a simple Java class (the class whose objects you want Spring to manage).

```java
public class Vehicle {
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

**Step 2:** Inside your `@Configuration` class, write a method that creates and returns an object of that class. Annotate the method with `@Bean`.

```java
@Configuration
public class ProjectConfig {

    @Bean
    public Vehicle vehicle() {
        Vehicle veh = new Vehicle();
        veh.setName("Tesla");
        return veh;
    }
}
```

### ❓ "Wait — You're Still Using `new`!"

Yes! And this is a great question that trips up many beginners.

In this particular approach, yes, we are manually creating the object using `new Vehicle()`. But here's the critical difference — after this method runs, the returned object is **handed over to the Spring IoC container**. Spring now manages it. Any class in your application can ask Spring for this bean, and Spring will provide the **same object**.

This is just **one approach** to creating beans. There are other approaches (like `@Component` scanning) where you don't use the `new` keyword at all. We'll cover those in upcoming sections.

### 🧪 Creating Multiple Beans

You're not limited to one bean. You can define as many `@Bean` methods as you want inside a `@Configuration` class:

```java
@Configuration
public class ProjectConfig {

    @Bean
    public Vehicle vehicle() {
        Vehicle veh = new Vehicle();
        veh.setName("Tesla");
        return veh;
    }

    @Bean
    public String hello() {
        return "Hello World";
    }

    @Bean
    public Integer luckyNumber() {
        return 16;
    }
}
```

With this setup, your Spring context now holds **three beans**:
- A `Vehicle` bean with the name "Tesla"
- A `String` bean with the value "Hello World"
- An `Integer` bean with the value 16

---

## Concept 4: Initializing the Spring Context

### 🧠 What Does "Initialize the Spring Context" Mean?

Creating `@Configuration` and `@Bean` is just the setup. Nothing actually happens until you **start the Spring IoC container**. That's when Spring reads your configuration, creates the beans, and stores them in memory.

### ⚙️ How to Do It

In your `main()` method, you create an instance of `AnnotationConfigApplicationContext` and pass your configuration class to it:

```java
public class DemoMain {
    public static void main(String[] args) {
        var context = new AnnotationConfigApplicationContext(ProjectConfig.class);
    }
}
```

Let's break down what's happening here:

1. **`AnnotationConfigApplicationContext`** — This is a concrete implementation class that acts as the Spring IoC container. It knows how to read annotation-based configurations (like `@Configuration` and `@Bean`).

2. **`ProjectConfig.class`** — You're telling the container: "Go look at `ProjectConfig` for all my bean definitions."

3. As soon as this line executes, Spring scans `ProjectConfig`, finds all `@Bean` methods, calls them, and stores the returned objects as beans in the container.

### 💡 The Hierarchy Behind the Scenes

Ever wondered how `AnnotationConfigApplicationContext` fits into the Spring architecture?

- `BeanFactory` — the root interface (basic container functionality)
- `ApplicationContext` — extends `BeanFactory` (adds advanced features)
- `AnnotationConfigApplicationContext` — implements `ApplicationContext` (handles annotation-based config)

Since we're using annotations (`@Configuration`, `@Bean`), `AnnotationConfigApplicationContext` is the right choice.

---

## Concept 5: Retrieving Beans from the Context

### ⚙️ Fetching a Bean by Type

Once the context is initialized, you can ask it for any bean using the `getBean()` method:

```java
Vehicle veh = context.getBean(Vehicle.class);
System.out.println("Vehicle name from Spring context: " + veh.getName());
// Output: Tesla
```

You pass the **class type** of the bean you want, and Spring returns the matching bean. No casting required — Spring is smart enough to figure out the return type.

You can do the same for the other beans:

```java
String hello = context.getBean(String.class);
System.out.println("String value from Spring context: " + hello);
// Output: Hello World

Integer num = context.getBean(Integer.class);
System.out.println("Integer value from Spring context: " + num);
// Output: 16
```

### ⚙️ Fetching a Bean by Name

Instead of providing the type, you can also fetch a bean by its **name**:

```java
String hello = (String) context.getBean("hello");
System.out.println("String from bean name: " + hello);
// Output: Hello World
```

Notice two differences here:

1. You pass a **String** — the bean name — instead of a class type
2. You need to perform **explicit type casting** (`(String)`) because when you provide just a name, Spring doesn't know the return type at compile time

### ❓ What's the Bean Name?

By default, the **bean name is the method name**. So:

| Method Name | Bean Name |
|-------------|-----------|
| `vehicle()` | `"vehicle"` |
| `hello()` | `"hello"` |
| `luckyNumber()` | `"luckyNumber"` |

This is important to remember — the method name doubles as the bean identifier.

---

## Concept 6: What If the Bean Doesn't Exist?

What happens if you try to retrieve a bean that was never registered?

```java
Double dbl = context.getBean(Double.class);
```

You get a **`NoSuchBeanDefinitionException`**:

```
NoSuchBeanDefinitionException: No qualifying bean of type 'java.lang.Double' available
```

Spring looked through its entire context, couldn't find a bean of type `Double`, and threw a runtime exception. This is Spring's way of saying — "I don't have what you're asking for."

⚠️ **Common Mistake:** This is a `RuntimeException`, meaning your code will compile just fine. The error only shows up when the application runs. So always make sure the beans you're requesting actually exist.

---

## Concept 7: Bean Method Naming Convention

### 🧠 The Convention Clash

In standard Java, methods should follow the **verb naming convention** — methods represent actions:

- `createVehicle()`
- `sayHello()`
- `calculateLuckyNumber()`

But when defining `@Bean` methods, it's perfectly acceptable — even recommended — to use **noun names** instead:

- `vehicle()`
- `hello()`
- `luckyNumber()`

### ❓ Why Break the Java Convention?

Because the **method name becomes the bean name**. And bean names should read like **identifiers**, not actions. When you later fetch the bean using `context.getBean("vehicle")`, it makes much more sense than `context.getBean("createVehicle")`.

So for `@Bean` methods specifically, **noun names are the standard**.

---

## The Full Picture — Comparing the Two Approaches

Let's see both approaches side by side:

```java
// ❌ Without Spring — manual object creation
Vehicle vehicle = new Vehicle();
vehicle.setName("Audi");
System.out.println(vehicle.getName()); // Audi
// Spring knows nothing about this object

// ✅ With Spring — retrieving from context
var context = new AnnotationConfigApplicationContext(ProjectConfig.class);
Vehicle veh = context.getBean(Vehicle.class);
System.out.println(veh.getName()); // Tesla
// This is a Spring-managed bean
```

The first approach gives you a standalone Java object that nobody tracks. The second gives you a **Spring-managed bean** that lives in the IoC container and can be shared across your entire application.

---

## ✅ Key Takeaways

1. **`@Configuration`** marks a class as a source of bean definitions. Spring scans it during startup.
2. **`@Bean`** on a method tells Spring to register the returned object as a bean in the IoC container.
3. Use **`AnnotationConfigApplicationContext`** to initialize the Spring context with annotation-based configuration.
4. Retrieve beans using **`getBean(Type.class)`** (no casting needed) or **`getBean("beanName")`** (requires casting).
5. The **method name becomes the bean name** — so use nouns, not verbs, for `@Bean` methods.
6. Requesting a non-existent bean throws **`NoSuchBeanDefinitionException`** at runtime.
7. This is just **one approach** to creating beans. Other approaches (like `@Component`) don't require the `new` keyword at all.

---

## ⚠️ Common Mistakes

- **Forgetting `@Bean`** — Without this annotation, the method is just a regular method. The returned object won't be registered in the Spring context.
- **Forgetting `@Configuration`** — Without this annotation on the class, Spring won't scan it for bean definitions.
- **Requesting a bean that doesn't exist** — This compiles fine but throws `NoSuchBeanDefinitionException` at runtime.
- **Forgetting to cast when using `getBean("name")`** — When fetching by name, you must explicitly cast the result.

---

## 💡 Pro Tips

- You can define **any number of beans** inside a single `@Configuration` class — `Vehicle`, `String`, `Integer`, custom classes, anything.
- Use **IntelliJ's soft wrap** feature on the console to avoid horizontal scrolling when reading long stack traces.
- In IntelliJ, you can click **"Download Sources"** on framework classes to read the actual Spring source code — a great way to learn how things work internally.
- This `@Bean` + `@Configuration` approach is best when you need **custom initialization logic** (like calling setters). For simpler cases, `@Component` scanning (covered later) is more concise.
