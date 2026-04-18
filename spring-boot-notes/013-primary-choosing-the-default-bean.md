# @Primary — Choosing the Default Bean

## Introduction

In the previous lectures, you learned about the `NoUniqueBeanDefinitionException` — that annoying error Spring throws when you have **multiple beans of the same type** and you ask for one without specifying a name. You also learned how to fix it by **passing the bean name** alongside the type in `getBean()`.

But let's be honest — is that really the *best* fix?

Every time you fetch a bean, you'd need to remember its exact name. What if there's a **smarter way** to tell Spring: *"Hey, if you're ever confused about which bean to pick, just use this one by default"*?

That's exactly what the `@Primary` annotation does. It marks one bean as the **preferred choice** — the default — so Spring never gets confused again.

Let's see how it works.

---

## Concept 1: The Problem — A Quick Recap

### 🧠 What Situation Are We Dealing With?

You have three beans of the same type — `Vehicle` — registered in your Spring context:

```java
@Configuration
public class ProjectConfig {

    @Bean
    Vehicle audiVehicle() {
        var vehicle = new Vehicle();
        vehicle.setName("Audi");
        return vehicle;
    }

    @Bean
    Vehicle hondaVehicle() {
        var vehicle = new Vehicle();
        vehicle.setName("Honda");
        return vehicle;
    }

    @Bean
    Vehicle ferrariVehicle() {
        var vehicle = new Vehicle();
        vehicle.setName("Ferrari");
        return vehicle;
    }
}
```

Now, if you try to fetch a bean by **type alone**:

```java
Vehicle vehicle = context.getBean(Vehicle.class);
System.out.println(vehicle.getName());
```

💥 **Boom!** — `NoUniqueBeanDefinitionException`.

Spring found three beans of type `Vehicle`. It doesn't know which one you want. So it throws its hands up and gives you an error.

### ❓ The Known Fix — And Its Limitation

You already know you can fix this by passing the bean name:

```java
Vehicle vehicle = context.getBean("hondaVehicle", Vehicle.class);
```

This works, but it has a drawback: every single time you retrieve this bean, you need to **explicitly mention the name**. In a large application with many injection points, that's tedious and error-prone.

What if you could just tell Spring once — *"When in doubt, use this bean"* — and then never worry about it again?

---

## Concept 2: The @Primary Annotation — Your Default Bean Selector

### 🧠 What Is @Primary?

`@Primary` is a Spring annotation that you place on top of a `@Bean` method (or a component class) to mark it as the **preferred bean** when Spring encounters ambiguity.

In simple terms:

> `@Primary` says: *"If the developer doesn't specify which bean they want, pick me."*

### 🎯 Real-World Analogy

Think of it like setting a **default printer** on your computer. You might have three printers connected — your office laser printer, a photo printer, and a portable one. When you hit "Print," your computer doesn't ask you every time which printer to use — it sends the job to the **default**. You only pick a different printer when you specifically need to.

`@Primary` works the same way. It sets a **default bean** that Spring uses automatically unless you explicitly ask for a different one.

---

### ⚙️ How to Use @Primary

Simply add the `@Primary` annotation on top of the bean method you want to make the default:

```java
@Configuration
public class ProjectConfig {

    @Bean
    Vehicle audiVehicle() {
        var vehicle = new Vehicle();
        vehicle.setName("Audi");
        return vehicle;
    }

    @Bean
    @Primary
    Vehicle hondaVehicle() {
        var vehicle = new Vehicle();
        vehicle.setName("Honda");
        return vehicle;
    }

    @Bean
    Vehicle ferrariVehicle() {
        var vehicle = new Vehicle();
        vehicle.setName("Ferrari");
        return vehicle;
    }
}
```

Notice the `@Primary` annotation on top of `hondaVehicle()`. This tells Spring:

> *"Whenever someone asks for a `Vehicle` bean without specifying which one, give them the Honda."*

### 🧪 Let's See It in Action

Now, when you run the same code that was previously crashing:

```java
Vehicle vehicle = context.getBean(Vehicle.class);
System.out.println(vehicle.getName());
```

**Output:**

```
Honda
```

No more exception. No need to pass a bean name. Spring automatically picks the `hondaVehicle` because it's marked as `@Primary`.

---

## Concept 3: Why @Primary Is the Recommended Approach

### ❓ Why Not Just Use Bean Names Every Time?

You *could* always pass the bean name to `getBean()` — and it would work. But here's why `@Primary` is considered a **better and recommended approach**:

| Approach | Pros | Cons |
|---|---|---|
| Passing bean name | Explicit, no ambiguity | Repetitive, easy to mistype the name |
| `@Primary` | Set once, works everywhere | Only one bean per type can be primary |

### 💡 When Should You Use @Primary?

Use `@Primary` when:

- You have multiple beans of the same type
- One of them is the **most commonly used** across the application
- You want to **eliminate boilerplate** and avoid specifying the bean name at every retrieval point

Think of it as selecting a "go-to" option. You're not removing the other beans — they're still available if you fetch them by name — but you're telling Spring which one to **default to**.

### ⚠️ Important: Only One @Primary Per Type

You can only mark **one bean** as `@Primary` for a given type. If you try to mark two beans of the same type as `@Primary`, Spring will be confused again — and you'll get another exception.

```java
// ❌ DON'T do this — ambiguity again!
@Bean
@Primary
Vehicle hondaVehicle() { ... }

@Bean
@Primary
Vehicle ferrariVehicle() { ... }
```

One default — that's the rule.

---

## Concept 4: @Primary Doesn't Remove Other Beans

### 🧠 A Common Misconception

Just because you mark a bean as `@Primary` doesn't mean the other beans disappear. They are **still registered** in the Spring context. You can still retrieve them by name:

```java
// Gets the primary bean (Honda)
Vehicle defaultVehicle = context.getBean(Vehicle.class);

// Gets a specific bean by name (Audi)
Vehicle audi = context.getBean("audiVehicle", Vehicle.class);

// Gets another specific bean by name (Ferrari)
Vehicle ferrari = context.getBean("ferrariVehicle", Vehicle.class);
```

All three beans exist. `@Primary` just tells Spring which one to pick **when no name is specified**. It's a tie-breaker, not a filter.

---

## ✅ Key Takeaways

1. **`@Primary`** marks a bean as the default choice when Spring faces ambiguity between multiple beans of the same type.
2. It solves the `NoUniqueBeanDefinitionException` **without** requiring you to pass the bean name every time.
3. Place `@Primary` on top of the `@Bean` method you want as the default.
4. Only **one bean per type** can be marked `@Primary`.
5. Other beans are **still available** — you can access them by their bean name.
6. `@Primary` is considered the **recommended approach** over always specifying the bean name.

---

## ⚠️ Common Mistakes

- **Marking multiple beans of the same type as `@Primary`** — This brings back the ambiguity problem and leads to another exception.
- **Thinking `@Primary` deletes other beans** — It doesn't. All beans remain in the context; `@Primary` just sets the default.
- **Forgetting to import `@Primary`** — Make sure you import `org.springframework.context.annotation.Primary`.

---

## 💡 Pro Tips

- Think of `@Primary` as a **preference**, not a restriction. Spring uses the primary bean only when it doesn't have more specific instructions (like a bean name).
- In real-world projects, `@Primary` is commonly used when you have a **production bean** and a **test/mock bean** — the production one is marked `@Primary`.
- Later, you'll learn about `@Qualifier`, which gives you even **more control** over bean selection. `@Primary` is the broad default; `@Qualifier` is the precise override.
