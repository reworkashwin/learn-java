# Method-Based Bean Wiring — Theory

## Introduction

So far, you've learned how to **create** Spring beans using `@Bean`, `@Component`, and other annotations. But here's the thing — creating beans is only half the story.

In a real application, beans don't work in isolation. A `VehicleController` needs a `VehicleService`. A `VehicleService` needs a `VehicleRepository`. These objects **depend on each other**. And unless you tell Spring about these dependencies, it won't connect them — it'll just create isolated beans sitting inside the IoC container, completely unaware of one another.

So the big question is: **How do you connect beans that depend on each other?**

That's where **bean wiring** comes in. In this lesson, you'll learn:

- What bean wiring means and why it matters
- What happens when you *don't* wire beans (the "no wiring" scenario)
- Two manual approaches to wire beans using `@Bean` methods
- How Spring resolves dependencies behind the scenes

---

## Concept 1: What is Bean Wiring?

### 🧠 What Is It?

**Bean wiring** is the process of connecting dependent beans within the Spring IoC container. It's how you tell Spring: *"Hey, this bean needs that bean to function properly — please link them together."*

Think of it like plugging devices into a power strip. Each device (bean) exists on its own, but it's useless until you **wire** it to a power source (its dependency).

### ❓ Why Do We Need It?

In enterprise applications, you write code across multiple layers — controllers, services, repositories. Each layer depends on the next:

```
VehicleController → VehicleService → VehicleRepository
```

If you just create beans for all three classes without telling Spring about these relationships, they'll sit inside the Spring context as **three completely independent objects**. The controller won't be able to call the service. The service won't be able to talk to the repository.

Without wiring, your beans are like coworkers sitting in the same office but having **no idea the other person exists**. They can't collaborate because no one introduced them.

### ⚙️ How Does It Work at a High Level?

When you wire beans properly, Spring's IoC container:

1. **Creates all the beans** in the correct order
2. **Identifies dependencies** — which bean needs which other bean
3. **Injects the dependencies** — connects the beans so they can work together
4. **Maintains the relationships** throughout the application lifecycle

After wiring, the dependency chain looks like this:

```
VehicleController bean
    └── depends on → VehicleService bean
                          └── depends on → VehicleRepository bean
```

Spring creates the `VehicleRepository` first (no dependencies), then `VehicleService` (injecting the repository), and finally `VehicleController` (injecting the service). Order matters.

### 💡 Two Styles of Wiring

Spring provides two broad approaches:

- **Manual wiring** — You explicitly tell Spring how to connect the beans (what we'll learn today)
- **Auto wiring** — Spring figures out the connections on its own (covered in upcoming lessons)

We'll start with manual wiring because understanding the explicit approach first makes auto wiring much easier to grasp later.

---

## Concept 2: The "No Wiring" Scenario — What Goes Wrong

### 🧠 What Happens If You Don't Wire?

Let's look at a simple example with two classes: `Person` and `Vehicle`.

```java
public class Vehicle {
    private String name;
    // getters and setters
}

public class Person {
    private String name;
    private Vehicle vehicle;
    // getters and setters
}
```

The relationship is straightforward — a `Person` owns a `Vehicle`. In real life, a person depends on their vehicle to get around. In code, the `Person` class has a **dependency** on the `Vehicle` class.

Now, let's create beans for both using `@Bean`:

```java
@Configuration
public class ProjectConfig {

    @Bean
    public Vehicle vehicle() {
        Vehicle veh = new Vehicle();
        veh.setName("Toyota");
        return veh;
    }

    @Bean
    public Person person() {
        Person per = new Person();
        per.setName("Lucy");
        // ⚠️ Notice: we're NOT setting the vehicle!
        return per;
    }
}
```

### ❓ What's the Problem Here?

Both beans get created perfectly fine. Spring will happily put a `Vehicle` bean (with name "Toyota") and a `Person` bean (with name "Lucy") into the IoC container.

But here's the catch — **Spring has no idea that the Person needs a Vehicle**. You never told it. So the `vehicle` field inside the `Person` bean remains `null`.

If you try to access `person.getVehicle()`, you'll get:

```
null
```

Not an error — just a silent `null`. And that's arguably worse than an error, because your application *appears* to work but produces wrong results. The two beans exist side by side in the container like strangers — created independently, with zero connection between them.

### ⚠️ Common Mistake

> Creating beans and assuming Spring will automatically figure out the relationships. It won't — not unless you explicitly tell it (manual wiring) or use mechanisms like `@Autowired` (auto wiring).

---

## Concept 3: Manual Wiring — Approach 1: Method Call

### 🧠 What Is It?

The first approach to manually wire beans is simple: **call one `@Bean` method from inside another**.

When you're creating the `Person` bean, you directly invoke the `vehicle()` method to get the `Vehicle` bean and set it as a dependency.

### ⚙️ How Does It Work?

```java
@Configuration
public class ProjectConfig {

    @Bean
    public Vehicle vehicle() {
        Vehicle veh = new Vehicle();
        veh.setName("Toyota");
        return veh;
    }

    @Bean
    public Person person() {
        Person per = new Person();
        per.setName("Lucy");
        per.setVehicle(vehicle());  // 👈 Wiring via method call!
        return per;
    }
}
```

Look at the key line: `per.setVehicle(vehicle())`.

Here's what's happening step by step:

1. Spring calls `person()` to create the `Person` bean
2. Inside `person()`, you call `vehicle()` — this returns the `Vehicle` bean
3. You pass that `Vehicle` bean into `setVehicle()`
4. Now the `Person` bean has a reference to the `Vehicle` bean
5. Spring recognizes this dependency and **wires** them together in the IoC container

### 🤔 Wait — Doesn't Calling `vehicle()` Create a *New* Vehicle Object?

Great question. You might think calling `vehicle()` again would create a second `Vehicle` instance. But it doesn't — and that's the magic of Spring's `@Configuration` class.

Spring intercepts the method call through a proxy. Since the `Vehicle` bean already exists in the context, Spring returns the **same existing bean** instead of creating a new one. This is how Spring maintains the **singleton** behavior by default.

### 🧪 What's the Output Now?

If you run:

```java
Person person = context.getBean(Person.class);
Vehicle vehicle = context.getBean(Vehicle.class);

System.out.println(person.getName());             // Lucy
System.out.println(vehicle.getName());             // Toyota
System.out.println(person.getVehicle().getName()); // Toyota ✅ (not null anymore!)
```

The `person.getVehicle()` now returns the actual `Vehicle` bean instead of `null`. The wiring worked.

---

## Concept 4: Manual Wiring — Approach 2: Method Parameters

### 🧠 What Is It?

The second approach avoids calling the `vehicle()` method directly. Instead, you **declare the dependency as a method parameter** of the `person()` method. Spring will automatically inject the required bean through that parameter.

### ⚙️ How Does It Work?

```java
@Configuration
public class ProjectConfig {

    @Bean
    public Vehicle vehicle() {
        Vehicle veh = new Vehicle();
        veh.setName("Toyota");
        return veh;
    }

    @Bean
    public Person person(Vehicle veh) {  // 👈 Vehicle passed as parameter
        Person per = new Person();
        per.setName("Lucy");
        per.setVehicle(veh);             // 👈 Use the injected parameter
        return per;
    }
}
```

Notice the difference: the `person()` method now takes `Vehicle veh` as a parameter.

### ⚙️ What Happens Behind the Scenes?

Here's the step-by-step flow:

1. Spring sees that `person()` is a `@Bean` method and needs to create a `Person` bean
2. It notices that `person()` **requires a `Vehicle` parameter**
3. Spring checks: *"Do I have a `Vehicle` bean in my context?"*
4. It finds the `Vehicle` bean created by the `vehicle()` method
5. Spring **automatically injects** that `Vehicle` bean into the `veh` parameter
6. You use `veh` to set the vehicle on the `Person` object
7. The wiring is established — the `Person` bean is linked to the `Vehicle` bean

The output is exactly the same as Approach 1. Both approaches achieve the same result — they just differ in *how* you access the dependency.

### 🆚 Method Call vs. Method Parameter — Which One?

| Aspect | Method Call | Method Parameter |
|--------|-----------|-----------------|
| Syntax | Call `vehicle()` directly | Declare `Vehicle` as parameter |
| Coupling | Slightly more coupled (references another method) | Cleaner separation |
| Spring magic | Relies on `@Configuration` proxy | Relies on Spring's parameter injection |
| Readability | Obvious what's happening | Slightly more implicit |

Both are valid. The **method parameter approach** is generally preferred because it's cleaner and doesn't depend on the proxy behavior of `@Configuration`. But you'll see both in real projects.

### 💡 Pro Tip

> The method parameter approach works because Spring's IoC container is smart enough to **resolve dependencies by type**. When it sees a `Vehicle` parameter, it searches the context for a bean of type `Vehicle` and injects it. This is essentially a form of dependency injection happening at the `@Bean` method level.

---

## Concept 5: The Big Picture — Why This Matters

### 🧠 Connecting It to Real Applications

The `Person` and `Vehicle` example is intentionally simple. In real enterprise applications, the pattern looks like this:

```java
@Bean
public VehicleRepository vehicleRepository() {
    return new VehicleRepository();
}

@Bean
public VehicleService vehicleService(VehicleRepository repo) {
    return new VehicleService(repo);  // Service depends on Repository
}

@Bean
public VehicleController vehicleController(VehicleService service) {
    return new VehicleController(service);  // Controller depends on Service
}
```

Spring creates them in the right order: **Repository → Service → Controller**. Each bean gets its dependency injected, and the entire layered architecture is wired together.

This is **manual wiring** in action. You're explicitly telling Spring what depends on what. It's clear, it's readable, and it works. But as your application grows to dozens or hundreds of beans, writing all this wiring code becomes tedious.

That's exactly why Spring offers **auto wiring** — which we'll explore in upcoming lessons.

---

## ✅ Key Takeaways

1. **Bean wiring** is the process of connecting dependent beans in the Spring IoC container
2. Without wiring, beans exist independently — dependent fields will be `null`
3. **Method call approach**: Call one `@Bean` method from another to get the dependency
4. **Method parameter approach**: Declare the dependency as a parameter — Spring injects it automatically
5. Spring creates beans in the correct order to satisfy the dependency chain
6. Both manual approaches achieve the same result — they just differ in syntax
7. Manual wiring is explicit and clear, but can become verbose in large applications

## ⚠️ Common Mistakes

1. **Forgetting to wire beans** — Creating beans without establishing dependencies, then wondering why fields are `null`
2. **Thinking Spring auto-detects relationships** — With `@Bean` methods, Spring only knows about dependencies you explicitly declare
3. **Worrying about duplicate objects with method calls** — Spring's `@Configuration` proxy ensures the same singleton bean is returned, not a new instance

## 💡 Pro Tips

1. **Start with manual wiring** to understand the concept, then graduate to auto wiring — you'll appreciate the automation much more
2. **Method parameter injection** is generally the cleaner approach since it doesn't rely on `@Configuration` proxy magic
3. Think of wiring as **introducing beans to each other** — without introductions, they're just strangers in the same container
