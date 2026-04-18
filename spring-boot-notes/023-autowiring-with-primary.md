# Autowiring with @Primary — Which Bean Wins?

## Introduction

In the previous lectures, you learned how to autowire Spring beans using Field, Setter, and Constructor Injection. Everything worked smoothly — but there was a catch: you only ever had **one bean** of a given type in the Spring container.

What happens when Spring finds **two (or more) beans** of the same type? Which one does it pick? And how do **you** tell Spring which one to choose?

In this lesson, you'll:

- Walk through a **realistic scenario** where autowiring fails due to ambiguity
- See the `NoUniqueBeanDefinitionException` in action — and understand *why* it happens
- Learn how `@Primary` solves the problem by declaring a **default winner**
- Build a complete example from scratch: interface, multiple implementations, and a dependent class
- Get a preview of `@Qualifier` — another way to resolve bean ambiguity

By the end, you'll know exactly how to handle the "multiple beans of the same type" problem that every Spring developer runs into sooner or later.

---

## Concept 1: The Setup — An Interface with Multiple Implementations

### 🧠 What Are We Building?

Imagine a **CoffeeShop** application. You have a `Coffee` interface that defines a contract — any type of coffee must implement a `makeCoffee()` method. Then you have two concrete coffee types: `Cappuccino` and `Espresso`.

This is a very common pattern in real-world Spring applications. You define an **interface** (the abstraction) and provide **multiple implementations** (the concrete classes). Think of payment gateways (`Stripe`, `PayPal`), notification services (`Email`, `SMS`), or database strategies (`MySQL`, `MongoDB`).

### ⚙️ How It Works — Step by Step

**Step 1:** Create the `Coffee` interface with one abstract method:

```java
public interface Coffee {
    String makeCoffee();
}
```

**Step 2:** Create two implementation classes and annotate them with `@Component`:

```java
@Component
public class Cappuccino implements Coffee {
    @Override
    public String makeCoffee() {
        return "Cappuccino Coffee";
    }
}
```

```java
@Component
public class Espresso implements Coffee {
    @Override
    public String makeCoffee() {
        return "Espresso Coffee";
    }
}
```

**Step 3:** Create the `CoffeeShop` class that **depends on** the `Coffee` interface via Constructor Injection:

```java
@Component
public class CoffeeShop {

    private final Coffee coffee;

    @Autowired
    public CoffeeShop(Coffee coffee) {
        this.coffee = coffee;
    }

    public Coffee getCoffee() {
        return coffee;
    }
}
```

Notice the `CoffeeShop` doesn't care *which* coffee it gets — it just asks for "a `Coffee`." This is the beauty of **programming to an interface**. But it also creates a problem...

### 💡 Insight

The `@Autowired` annotation on the constructor is **optional** when there's only a single constructor. It's mentioned here explicitly for clarity while you're still learning autowiring, but in production code, most developers skip it for single-constructor classes.

---

## Concept 2: The Problem — NoUniqueBeanDefinitionException

### 🧠 What Goes Wrong?

When Spring starts up and tries to create the `CoffeeShop` bean, it sees the constructor needs a bean of type `Coffee`. So it searches the Spring container... and finds **two beans**: `Cappuccino` and `Espresso`.

Now Spring is confused. Which one should it inject? It has no way to decide — there's no priority, no preference, no instruction from you. So it does the only reasonable thing: it **throws an exception** and refuses to start.

### ⚙️ What Does the Error Look Like?

```
NoUniqueBeanDefinitionException: No qualifying bean of type 'Coffee' available:
expected single matching bean but found 2: cappuccino, espresso
```

This error message is actually very helpful. It tells you:
1. **What went wrong** — there's no unique bean of the expected type
2. **What it expected** — a single matching bean
3. **What it actually found** — two beans, and it names them for you

### 🧪 Real-World Analogy

Imagine walking into a coffee shop and saying, "I'd like a coffee." The barista asks, "Cappuccino or Espresso?" You say, "Just... a coffee." The barista stares at you blankly. That's Spring right now — it needs more information to make a decision.

### 💡 Insight

Some IDEs like IntelliJ IDEA are smart enough to detect this problem **at compile time** and show a warning or error before you even run your application. Other IDEs like Eclipse or VS Code may not catch it until runtime — so you'd see the `NoUniqueBeanDefinitionException` in the console when the application starts.

---

## Concept 3: The Solution — @Primary Annotation

### 🧠 What Is @Primary?

`@Primary` is a Spring annotation that marks a bean as the **default choice** when multiple beans of the same type exist. Think of it as raising one bean's hand and saying, "Pick me first!"

When Spring encounters ambiguity during autowiring, it checks: "Is any of these beans marked as `@Primary`?" If yes, that bean wins. Problem solved.

### ❓ Why Do We Need It?

Because in real-world applications, you frequently have multiple implementations of the same interface. You need a way to tell Spring: "When in doubt, use **this one** as the default."

### ⚙️ How to Use It

Simply place `@Primary` on top of the implementation class you want to be the default:

```java
@Component
@Primary
public class Espresso implements Coffee {
    @Override
    public String makeCoffee() {
        return "Espresso Coffee";
    }
}
```

That's it. Now when Spring needs to autowire a `Coffee` bean and finds both `Cappuccino` and `Espresso`, it picks `Espresso` because it's marked as `@Primary`.

### 🧪 What Happens After Adding @Primary?

With `@Primary` on `Espresso`, the `CoffeeShop` class compiles without errors, the application starts successfully, and the output is:

```
Espresso Coffee
```

Spring injected `Espresso` into the `CoffeeShop` because it was the primary bean.

### 🧪 Real-World Analogy

Think of `@Primary` like setting a **default printer** on your computer. You might have three printers connected, but when you hit "Print," your default printer handles the job — unless you explicitly choose a different one.

---

## Concept 4: What Happens Without @Primary?

### ⚙️ The Experiment

If you remove `@Primary` from `Espresso`, you're back to square one. Spring sees two beans of type `Coffee`, has no way to decide, and throws:

```
NoUniqueBeanDefinitionException: No qualifying bean of type 'Coffee' available:
expected single matching bean but found 2: cappuccino, espresso
```

This confirms that `@Primary` is what resolves the ambiguity. Without it, Spring can't make a choice.

### ⚠️ Common Mistake

Don't mark **both** implementations as `@Primary`. If you do, Spring is right back to being confused — now it has two "primary" beans and still can't decide. You'll get another error. **Only one bean per type should be `@Primary`.**

---

## Concept 5: The Configuration Class

### ⚙️ Wiring It All Together

To make everything work, you need a configuration class that tells Spring **where to scan** for your beans:

```java
@Configuration
@ComponentScan(basePackages = "com.example.ex5.beans")
public class ProjectConfig {
}
```

And in your main class:

```java
public class Example5 {
    public static void main(String[] args) {
        var context = new AnnotationConfigApplicationContext(ProjectConfig.class);

        CoffeeShop coffeeShop = context.getBean(CoffeeShop.class);
        Coffee coffee = coffeeShop.getCoffee();
        System.out.println(coffee.makeCoffee());

        context.close();
    }
}
```

### ⚠️ Common Mistake

Make sure your main class imports the **correct** `ProjectConfig`. In the demo, the application initially threw a `NoSuchBeanDefinitionException` because it accidentally imported `ProjectConfig` from a different package (example 4 instead of example 5). Always double-check your imports — this is a sneaky bug that the compiler won't always catch.

---

## Concept 6: What's Next — @Qualifier (Preview)

### 🧠 Another Way to Resolve Ambiguity

`@Primary` is great when you want to set a **global default** — "always use this bean unless told otherwise." But what if different parts of your application need **different implementations**?

That's where `@Qualifier` comes in. Instead of declaring a default, `@Qualifier` lets you **explicitly name** which bean you want at each injection point. You'll explore this in the next lecture.

Think of it this way:

> `@Primary` = "This is the default coffee for everyone."
> `@Qualifier` = "I specifically want a Cappuccino, please."

---

## ✅ Key Takeaways

| Concept | Summary |
|---|---|
| **Multiple beans of same type** | Causes `NoUniqueBeanDefinitionException` — Spring can't decide which to inject |
| **@Primary** | Marks one bean as the default choice when there's ambiguity |
| **Where to place it** | On top of the implementation class, alongside `@Component` |
| **Only one primary per type** | Don't mark multiple beans as `@Primary` for the same type |
| **IDE behavior** | IntelliJ may catch the ambiguity at compile time; other IDEs may not |
| **@Qualifier (next lecture)** | An alternative approach for explicit, per-injection-point bean selection |

## ⚠️ Common Mistakes

- **Forgetting `@Component`** on implementation classes — they won't be registered as beans
- **Importing the wrong config class** — leads to `NoSuchBeanDefinitionException`
- **Marking multiple beans as `@Primary`** — defeats the purpose and causes a new error
- **Confusing `NoUniqueBeanDefinitionException` with `NoSuchBeanDefinitionException`** — the first means "too many beans," the second means "no beans found at all"

## 💡 Pro Tips

- Use `@Primary` when you have a clear "default" implementation that works for most cases
- If every injection point needs a specific implementation, prefer `@Qualifier` over `@Primary`
- Always program to interfaces (`Coffee`) rather than concrete classes (`Espresso`) — this makes your code flexible and easy to swap implementations
- When debugging bean issues, read the exception message carefully — Spring tells you exactly what went wrong and which beans it found
