# Method-Based Bean Wiring — Hands-On Demo

## Introduction

In the previous lesson, you understood the **theory** behind bean wiring — what it is, why it matters, and the two manual approaches (method call and method parameter). Now it's time to roll up your sleeves and **see it in action**.

In this hands-on session, you'll:

- Set up `Vehicle` and `Person` classes from scratch (without stereotypes)
- Observe what happens when **no wiring** exists between beans
- Wire beans using **method invocation** inside a `@Configuration` class
- Wire beans using **method parameters** — the cleaner approach
- Verify the **bean creation order** using constructor logs

This is the kind of lesson where everything clicks. Let's build it step by step.

---

## Step 1: Project Setup — Preparing the Playground

### 🧠 What Are We Building?

We're creating a fresh example package (`ex4`) with two simple classes:

- **`Vehicle`** — represents a vehicle with a `name` field
- **`Person`** — represents a person with a `name` field and a `Vehicle` dependency

The goal? First show them as **independent beans** (no wiring), then **wire them together** using two different approaches.

### ⚙️ Setting Up the Classes

Start by creating a new sub-package `ex4` under your base package. Inside it, create two POJO classes.

#### The `Vehicle` Class

```java
public class Vehicle {
    private String name;

    // Getter and Setter
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // toString for clean output
    @Override
    public String toString() {
        return "Vehicle{name='" + name + "'}";
    }
}
```

Notice there's **no `@Component`** annotation here. We're deliberately using `@Bean` methods to create these beans manually. Also, the `toString()` method is important — when you print a `Vehicle` object, Java calls `toString()` behind the scenes. Without it, you'd see ugly output like `com.ezbytes.ex4.Vehicle@3f2a3a5`.

#### The `Person` Class

```java
public class Person {
    private String name;
    private Vehicle vehicle;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }
}
```

The key thing: `Person` has a `Vehicle` field — this is the **dependency** we want Spring to wire.

### 💡 Pro Tip

> Why define `toString()` on `Vehicle`? Because later, when you print `person.getVehicle()`, Java automatically calls `toString()` on the returned `Vehicle` object. A well-defined `toString()` gives you readable output like `Vehicle{name='Toyota'}` instead of a cryptic memory address.

---

## Step 2: Creating Independent Beans — The "No Wiring" Scenario

### 🧠 What's Happening Here?

Let's create both beans in the `@Configuration` class, but **without any connection** between them.

### ⚙️ The Configuration Class

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
        // ⚠️ No wiring! We never call per.setVehicle(...)
        return per;
    }
}
```

Both `@Bean` methods create and return their respective objects. The `Vehicle` gets the name "Toyota", and the `Person` gets the name "Lucy". But notice — we **never set the vehicle on the person**. Spring has no idea these two beans are related.

### 🧪 Running the Example

In your main class, fetch both beans and print their details:

```java
var context = new AnnotationConfigApplicationContext(ProjectConfig.class);

Vehicle vehicle = context.getBean(Vehicle.class);
Person person = context.getBean(Person.class);

System.out.println("Person name: " + person.getName());
System.out.println("Vehicle name: " + vehicle.getName());
System.out.println("Vehicle that person owns: " + person.getVehicle());
```

### 📋 Output

```
Person name: Lucy
Vehicle name: Toyota
Vehicle that person owns: null
```

### ❓ What Just Happened?

Both beans were created successfully — we can confirm that because `person.getName()` returns "Lucy" and `vehicle.getName()` returns "Toyota". They **exist** inside the Spring context.

But when we ask for `person.getVehicle()`, we get `null`. Why? Because Spring created them as **two completely independent beans**. Nobody told Spring that the `Person` needs a `Vehicle`. They're like two strangers sitting in the same room — present, but totally unaware of each other.

### ⚠️ Common Mistake

> Getting `null` from a dependency field and being confused about it. Always remember: Spring only creates what you tell it to create. If you don't explicitly wire the dependency (or use auto wiring mechanisms), the field stays `null`.

---

## Step 3: Wiring via Method Invocation — Approach 1

### 🧠 What Are We Doing?

Now let's **fix** that `null` problem. The first approach is straightforward — inside the `person()` method, **call the `vehicle()` method** directly and pass the result to `setVehicle()`.

### ⚙️ Updated Configuration

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
        per.setVehicle(vehicle());  // 👈 Wiring! Call vehicle() directly
        return per;
    }
}
```

The magic is in this single line:

```java
per.setVehicle(vehicle());
```

You're calling the `vehicle()` method from within `person()` to get the `Vehicle` bean, and passing it into the `Person`'s setter.

### 🧪 Running It Now

Same test code, completely different result:

```
Person name: Lucy
Vehicle name: Toyota
Vehicle that person owns: Vehicle{name='Toyota'}
```

No more `null`! The `Person` bean now holds a proper reference to the `Vehicle` bean. The wiring worked.

### ❓ Where Did That Output Format Come From?

The output `Vehicle{name='Toyota'}` comes from the `toString()` method we defined in the `Vehicle` class. When `System.out.println()` tries to print a `Vehicle` object, it calls `toString()` automatically. That's why we defined it earlier — to get clean, readable output instead of something like `Vehicle@3f2a3a5`.

### 💡 Pro Tip

> You might wonder: "Doesn't calling `vehicle()` again create a **second** Vehicle object?" Great question — but no. Because the class is annotated with `@Configuration`, Spring creates a **CGLIB proxy** around it. When `vehicle()` is called the second time, Spring intercepts the call and returns the **same singleton bean** that already exists in the context. No duplicate created.

---

## Step 4: Wiring via Method Parameters — Approach 2

### 🧠 What's Different About This Approach?

Instead of directly calling the `vehicle()` method, you **declare the dependency as a parameter** of the `person()` method. Spring sees the parameter type, finds a matching bean in the context, and injects it automatically.

### ⚙️ Updated Configuration

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
    public Person person(Vehicle vehicle) {  // 👈 Dependency as parameter
        Person per = new Person();
        per.setName("Lucy");
        per.setVehicle(vehicle);             // 👈 Use the injected parameter
        return per;
    }
}
```

### ⚙️ What's Happening Behind the Scenes?

Here's the step-by-step flow:

1. Spring sees that `person()` is a `@Bean` method
2. It notices `person()` requires a `Vehicle` parameter
3. Spring checks its IoC container: *"Do I have a bean of type `Vehicle`?"*
4. It finds the `Vehicle` bean created by the `vehicle()` method
5. Spring **injects** that `Vehicle` bean into the parameter
6. Inside `person()`, you use the injected `vehicle` parameter to set the dependency
7. The wiring is complete — the `Person` bean is linked to the `Vehicle` bean

### 🧪 Output

```
Person name: Lucy
Vehicle name: Toyota
Vehicle that person owns: Vehicle{name='Toyota'}
```

Exactly the same result as Approach 1. The difference is purely in **how** you access the dependency — not in what happens at runtime.

### 🆚 Quick Comparison

| Aspect | Method Invocation | Method Parameter |
|--------|-------------------|------------------|
| How | Call `vehicle()` directly | Declare `Vehicle` as parameter |
| Who resolves it? | You call the method explicitly | Spring injects it for you |
| Coupling | Your `@Bean` method references another method | Cleaner — no direct method reference |
| Proxy needed? | Relies on `@Configuration` CGLIB proxy | Works independently of proxy |

---

## Step 5: Verifying Bean Creation Order

### 🧠 Why Does Order Matter?

When beans have dependencies, Spring must create them in the **right order**. You can't create a `Person` that depends on a `Vehicle` if the `Vehicle` doesn't exist yet. Let's verify this with constructor logging.

### ⚙️ Adding Constructors with Logs

Add constructors to both classes:

```java
public class Vehicle {
    private String name;

    public Vehicle() {
        System.out.println("Vehicle Bean Created");
    }

    // ... getters, setters, toString
}
```

```java
public class Person {
    private String name;
    private Vehicle vehicle;

    public Person() {
        System.out.println("Person Bean Created");
    }

    // ... getters, setters
}
```

### 🧪 Output with Method Parameter Wiring

```
Vehicle Bean Created
Person Bean Created
Person name: Lucy
Vehicle name: Toyota
Vehicle that person owns: Vehicle{name='Toyota'}
```

### ❓ What Does This Confirm?

Two critical things:

1. **Order is correct** — `Vehicle` bean is created **first**, then `Person`. Spring figured out that `Person` depends on `Vehicle` (because of the method parameter) and created them in the correct dependency order.
2. **Wiring is successful** — Instead of `null`, we get the full vehicle details, proving both beans are properly connected.

This is Spring's IoC container being smart. When you declare a dependency via a method parameter, Spring automatically resolves the creation order. It builds a **dependency graph** internally and creates beans from the bottom up — leaf nodes (no dependencies) first, dependent beans after.

---

## ✅ Key Takeaways

1. **Without wiring**, beans exist independently — dependency fields will be `null`, not an error
2. **Method invocation approach**: Call the other `@Bean` method directly (e.g., `per.setVehicle(vehicle())`)
3. **Method parameter approach**: Declare the dependency as a method parameter — Spring injects it automatically
4. Both approaches produce **identical results** — the choice is about code style and coupling
5. Spring resolves **bean creation order** automatically when dependencies are declared
6. The `toString()` method is essential for getting readable output when printing objects
7. These manual wiring techniques apply when you're using `@Bean` annotation — auto wiring with `@Component` is covered next

## ⚠️ Common Mistakes

1. **Forgetting to wire** — Creating both beans but never connecting them, then getting `null` and being confused
2. **Not defining `toString()`** — Printing an object without `toString()` gives you memory addresses, not useful data
3. **Assuming automatic wiring with `@Bean`** — When using `@Bean` methods, you must wire manually. Auto wiring comes with stereotype annotations like `@Component`

## 💡 Pro Tips

1. **Method parameter approach is generally preferred** — it's cleaner, less coupled, and doesn't depend on `@Configuration` proxy behavior
2. **Add constructor logs** when debugging bean creation issues — `System.out.println("MyBean Created")` in constructors instantly reveals creation order
3. **This is manual wiring** — it works, but it gets tedious in large applications. From the next lesson, you'll learn **auto wiring** with `@Component` and `@Autowired`, which makes this process much simpler
