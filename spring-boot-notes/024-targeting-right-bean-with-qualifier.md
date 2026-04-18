# Targeting the Right Bean with @Qualifier

## Introduction

In the previous lesson, you learned how `@Primary` lets you declare a **default bean** when multiple beans of the same type exist. Spring picks the primary bean automatically — no questions asked.

But what if you don't want the default? What if you need a **specific** bean in a specific place? What if the default is `Espresso`, but one particular class absolutely needs `Cappuccino`?

This is where `@Qualifier` enters the picture. It lets you **point directly** at the bean you want — by name.

In this lesson, you'll learn:

- How to use `@Qualifier` to explicitly select a bean during autowiring
- How custom bean names work with `@Component`
- What happens when `@Qualifier` and `@Primary` are used **together** — and which one wins
- When to use `@Primary` vs `@Qualifier` (with a clear real-world analogy)
- A bonus annotation: `@DependsOn` — how to control bean creation order

By the end, you'll have a complete toolkit for resolving bean ambiguity in Spring — and you'll know exactly which tool to reach for in every situation.

---

## Concept 1: The Problem Recap — Why @Primary Isn't Always Enough

### 🧠 Where We Left Off

Remember the `CoffeeShop` example? You have two beans — `Cappuccino` and `Espresso` — both implementing the `Coffee` interface. Without `@Primary`, Spring throws a `NoUniqueBeanDefinitionException` because it can't decide which bean to inject.

Adding `@Primary` on `Espresso` solved the problem: Spring now always picks `Espresso` as the default.

But here's the question — **what if one specific class needs `Cappuccino` instead?**

`@Primary` is a global declaration. It says, "Use this bean everywhere unless told otherwise." But it doesn't give individual classes the power to override that choice. That's the limitation.

### ❓ Why Do We Need Something More?

Imagine a restaurant with a default dish. Every table gets that dish unless a customer explicitly orders something different. `@Primary` is the default dish. But `@Qualifier` is the customer saying, "No, I want **this specific item** from the menu."

You need both mechanisms:
- `@Primary` → for the **common case** (what most classes need)
- `@Qualifier` → for the **special case** (what a specific class needs)

---

## Concept 2: Understanding Bean Names

### 🧠 What Are Bean Names?

Before you can use `@Qualifier`, you need to understand **bean names** — because `@Qualifier` works by referencing a bean's name.

Every bean in the Spring container has a name. It's like an ID tag that Spring uses to identify and retrieve beans. When you register a bean, Spring assigns it a name — either a **default** one or a **custom** one you provide.

### ⚙️ Default Bean Names

When you annotate a class with `@Component` (without passing any argument), Spring generates a default name using a simple rule:

> Take the class name and convert the first letter to lowercase.

| Class Name   | Default Bean Name |
|-------------|-------------------|
| `Cappuccino` | `cappuccino`      |
| `Espresso`   | `espresso`        |
| `CoffeeShop` | `coffeeShop`      |

So behind the scenes, when Spring creates the `Cappuccino` bean, it registers it with the name `"cappuccino"`.

### ⚙️ Custom Bean Names

You can override the default name by passing a string to the `@Component` annotation:

```java
@Component("cappuccino")
public class Cappuccino implements Coffee {
    @Override
    public String makeCoffee() {
        return "Cappuccino Coffee";
    }
}
```

```java
@Component("espresso")
public class Espresso implements Coffee {
    @Override
    public String makeCoffee() {
        return "Espresso Coffee";
    }
}
```

In this example, the custom names happen to match the defaults — but you could change them to anything:

```java
@Component("morningBrew")
public class Espresso implements Coffee { ... }
```

Now the bean is registered as `"morningBrew"` instead of `"espresso"`.

### 💡 Pro Tip

Stick with the default naming convention unless you have a good reason to customize. Custom names can make your code harder to follow — another developer might look for an `"espresso"` bean and not find it because you renamed it to `"morningBrew"`.

---

## Concept 3: Using @Qualifier — Explicit Bean Selection

### 🧠 What Is @Qualifier?

`@Qualifier` is a Spring annotation that lets you **explicitly specify which bean** to inject during autowiring. Instead of letting Spring figure it out (like `@Primary` does), you tell Spring the exact bean name you want.

Think of it this way:
- `@Primary` = "Spring, you decide — but here's my recommendation."
- `@Qualifier` = "Spring, I'm telling you exactly which one I want. No debate."

### ⚙️ How to Use It

Place `@Qualifier` right before the parameter in the constructor (or on a field/setter) and pass the bean name:

```java
@Component
public class CoffeeShop {

    private final Coffee coffee;

    @Autowired
    public CoffeeShop(@Qualifier("cappuccino") Coffee coffee) {
        this.coffee = coffee;
    }

    public Coffee getCoffee() {
        return coffee;
    }
}
```

Here, you're telling Spring: "When you create the `CoffeeShop`, inject the bean named `cappuccino` — not just any `Coffee` bean."

### 🧪 What Happens?

Spring looks inside its container for a bean with:
1. The type `Coffee`
2. The name `"cappuccino"`

It finds the `Cappuccino` class, and injects it. The output:

```
Cappuccino Coffee
```

No ambiguity. No exception. You pointed at exactly what you wanted, and Spring delivered.

### 🧪 Real-World Analogy

Walking into a coffee shop and saying, "Give me **a** coffee" is like autowiring without `@Qualifier` — the barista picks whatever is default (`@Primary`). But saying, "Give me a **Cappuccino**" is like using `@Qualifier("cappuccino")` — you're leaving no room for interpretation.

---

## Concept 4: @Qualifier + @Primary Together — Who Wins?

### 🧠 The Big Question

What happens when you have **both** `@Primary` and `@Qualifier` active at the same time? Which one takes precedence?

Let's set up the scenario:

```java
@Component("espresso")
@Primary
public class Espresso implements Coffee {
    @Override
    public String makeCoffee() {
        return "Espresso Coffee";
    }
}
```

```java
@Component
public class CoffeeShop {

    private final Coffee coffee;

    @Autowired
    public CoffeeShop(@Qualifier("cappuccino") Coffee coffee) {
        this.coffee = coffee;
    }
}
```

So `Espresso` is marked `@Primary` (the default), but the `CoffeeShop` constructor uses `@Qualifier("cappuccino")` (an explicit pick).

### ⚙️ The Answer

**`@Qualifier` wins. Always.**

The output is still:

```
Cappuccino Coffee
```

This makes perfect sense if you think about it. `@Primary` says, "Use me as the default." But `@Qualifier` says, "I don't care about defaults — I want **this specific bean.**" An explicit instruction always overrides a general recommendation.

### 💡 Pro Tip

The priority order in Spring for bean selection is:

1. **`@Qualifier`** — highest priority (explicit selection)
2. **`@Primary`** — medium priority (default recommendation)
3. **No annotation** — Spring tries to match by type, and fails if there's ambiguity

---

## Concept 5: When to Use @Primary vs @Qualifier

### 🧠 The Decision Framework

This is one of the most common questions for Spring beginners: "Should I use `@Primary` or `@Qualifier`?" Here's a clean way to think about it:

| Aspect | `@Primary` | `@Qualifier` |
|--------|-----------|-------------|
| **Purpose** | Declare a **default** bean | Select a **specific** bean |
| **Where it's placed** | On the **bean class** itself | On the **injection point** (constructor, field, setter) |
| **Scope** | Global — affects **all** autowiring of that type | Local — affects **only this** injection point |
| **When to use** | When one bean should be used in **most** places | When a specific bean is needed in a **particular** place |
| **Behavior** | Automatic selection by Spring | Explicit selection by the developer |

### 🧪 Real-World Scenario

Let's say you have a `NotificationService` interface with two implementations: `EmailNotification` and `SmsNotification`.

- **90% of your application** sends emails → mark `EmailNotification` as `@Primary`
- **One specific class** (say, `EmergencyAlertService`) needs SMS → use `@Qualifier("smsNotification")` in that class

```java
@Component
@Primary
public class EmailNotification implements NotificationService { ... }

@Component
public class SmsNotification implements NotificationService { ... }
```

```java
@Component
public class EmergencyAlertService {
    
    private final NotificationService notificationService;

    public EmergencyAlertService(@Qualifier("smsNotification") NotificationService notificationService) {
        this.notificationService = notificationService;
    }
}
```

This is the **ideal combination**: `@Primary` handles the common case, and `@Qualifier` handles the exception.

### 🧪 The Coffee Shop Analogy (Revisited)

Imagine a coffee shop with a house coffee — that's `@Primary`. Most customers walk in and say, "Just give me a coffee," and they get the house coffee. But occasionally, a customer walks in and says, "I want a Cappuccino specifically." That's `@Qualifier`. The barista doesn't argue — explicit requests override defaults.

---

## Concept 6: @Qualifier Works with All Injection Types

### 🧠 Not Just Constructor Injection

Everything you've seen so far used Constructor Injection, but `@Qualifier` works with **all three** injection types:

**Field Injection:**

```java
@Component
public class CoffeeShop {

    @Autowired
    @Qualifier("cappuccino")
    private Coffee coffee;
}
```

**Setter Injection:**

```java
@Component
public class CoffeeShop {

    private Coffee coffee;

    @Autowired
    @Qualifier("cappuccino")
    public void setCoffee(Coffee coffee) {
        this.coffee = coffee;
    }
}
```

**Constructor Injection:**

```java
@Component
public class CoffeeShop {

    private final Coffee coffee;

    @Autowired
    public CoffeeShop(@Qualifier("cappuccino") Coffee coffee) {
        this.coffee = coffee;
    }
}
```

The syntax changes slightly depending on the injection type, but the behavior is identical — Spring injects the bean with the matching name.

### 💡 Pro Tip

The same applies to `@Primary` — it resolves ambiguity regardless of whether you're using Field, Setter, or Constructor Injection. Both annotations are **injection-type agnostic**.

---

## Concept 7: Bonus — @DependsOn Annotation

### 🧠 What Is @DependsOn?

So far, you've seen beans that depend on each other through injection — the `CoffeeShop` depends on `Coffee`, so Spring creates `Coffee` first and then creates `CoffeeShop`. That ordering happens automatically.

But what if two beans **don't depend on each other** through injection, yet you still want to control the **order** in which they're created?

That's what `@DependsOn` is for. It tells Spring: "Before you create this bean, make sure **that other bean** is created first."

### ❓ Why Would You Need This?

Consider two beans — `Engine` and `Vehicle`. The `Vehicle` class doesn't have an `Engine` field. They're completely independent in code. Spring might create `Vehicle` first, or `Engine` first — the order is unpredictable.

But maybe your `Engine` bean initializes some shared resource (like a configuration file or a database connection) that `Vehicle` needs to be available at startup — even though `Vehicle` doesn't directly inject `Engine`.

### ⚙️ How to Use It

```java
@Configuration
public class ProjectConfig {

    @Bean
    public Engine engine() {
        return new Engine();
    }

    @Bean
    @DependsOn("engine")
    public Vehicle vehicle() {
        return new Vehicle();
    }
}
```

With `@DependsOn("engine")` on the `vehicle()` method, Spring guarantees that the `Engine` bean is created **before** the `Vehicle` bean — every single time.

You can also use it with `@Component`:

```java
@Component
@DependsOn("engine")
public class Vehicle {
    // ...
}
```

### ⚠️ Common Mistake

**Don't overuse `@DependsOn`.** It creates **tight coupling** between beans at the startup level. If `Vehicle` always depends on `Engine` being created first, maybe `Vehicle` should actually inject `Engine` — making the dependency explicit in code rather than hidden in an annotation.

Use `@DependsOn` only when:
- There's a genuine startup-order requirement
- The beans don't have a direct injection relationship
- You can't restructure the code to make the dependency explicit

### 💡 Pro Tip

If you find yourself using `@DependsOn` frequently, it's usually a sign that your bean design needs rethinking. In most well-designed Spring applications, the natural dependency graph (created through injection) is sufficient to determine creation order.

---

## ✅ Key Takeaways

1. **`@Qualifier` lets you explicitly select a bean by name** — it's like pointing at the exact item you want from a menu.

2. **Every bean has a name.** By default, it's the class name with a lowercase first letter. You can customize it via `@Component("customName")`.

3. **`@Qualifier` overrides `@Primary`.** When both are present, the explicitly qualified bean is always chosen.

4. **Use `@Primary` for the common case, `@Qualifier` for the special case.** They complement each other beautifully.

5. **Both annotations work with all injection types** — Field, Setter, and Constructor Injection.

6. **`@DependsOn` controls bean creation order** for beans that don't have a direct injection dependency — but use it sparingly.

---

## ⚠️ Common Mistakes

1. **Misspelling the bean name in `@Qualifier`.** If you write `@Qualifier("cappucino")` (missing a 'c'), Spring won't find the bean and will throw an exception. Bean names are case-sensitive and must match exactly.

2. **Using `@Qualifier` without knowing the bean name.** Always check what name your bean was registered with — especially if you're using custom names via `@Component("customName")`.

3. **Overusing `@DependsOn`.** If you need it, fine. But if you're using it everywhere, restructure your beans to use proper injection instead.

4. **Thinking `@Primary` overrides `@Qualifier`.** It's the other way around — `@Qualifier` always wins.

---

## 💡 Pro Tips

1. **Combine `@Primary` and `@Qualifier` strategically.** Mark the most commonly used bean as `@Primary`, and use `@Qualifier` only in the few places that need a different bean. This keeps your code clean and intentional.

2. **IDE support matters.** IntelliJ IDEA shows which bean will be injected when you hover over `@Qualifier` — use this to verify your wiring before running the application.

3. **Bean names are your contract.** If you set a custom bean name with `@Component("myBean")`, treat it like a public API — don't rename it casually, because other classes might reference it via `@Qualifier`.
