# Eager vs Lazy Initialization — When Is Your Singleton Bean Actually Created?

## Introduction

You now know that Spring's default bean scope is **Singleton** — meaning only **one instance** of a bean is created per bean definition. But here's a follow-up question you might not have thought about:

**When exactly does Spring create that singleton bean?**

Is it created the moment your application starts? Or does Spring wait until someone actually *asks* for it? And more importantly — **does it matter?**

The answer is: **yes, it matters a lot** — especially when your application has hundreds or thousands of beans. This is the story of **Eager vs Lazy Initialization**, and understanding this gives you fine-grained control over your application's startup time, memory usage, and runtime performance.

In this lesson, you'll learn:

- What Eager Initialization is and why it's the default
- What Lazy Initialization is and how to enable it with `@Lazy`
- The key differences between Eager and Lazy
- How each approach affects startup time, memory, and error detection
- Real-world scenarios: when to use Eager and when to go Lazy
- The golden rule for balancing both

---

## Concept 1: Eager Initialization — The Default Behavior

### 🧠 What Is It?

**Eager initialization** means Spring creates your singleton bean **immediately during application startup** — before anyone even asks for it. This is the **default behavior** in the Spring Framework.

The moment your Spring application context boots up, it scans all your bean definitions and says: *"Let me create all singleton beans right now, so they're ready to go when someone needs them."*

### ❓ Why Is This the Default?

Think about it from a restaurant analogy. Imagine a restaurant that **pre-cooks popular dishes** before customers arrive. When a customer walks in and orders a pizza, it's already ready — no waiting time. That's eager initialization.

Spring follows this approach because:

1. **Fail-fast behavior** — If a bean has a problem (like a missing dependency), you want to know about it **at startup**, not when a user clicks a button in production.
2. **No runtime delays** — Every bean is ready to serve when it's first requested.
3. **Predictable startup** — You can see exactly what's happening during boot.

### 🧪 Seeing It in Action

Let's say you have a `MyService` class configured as a singleton bean:

```java
@Component
public class MyService {
    
    public MyService() {
        System.out.println("MyService is created!");
    }
}
```

Now, even if **no one** in your application asks for `MyService` — no `getBean()`, no `@Autowired`, nothing — you'll still see this in the console when the app starts:

```
MyService is created!
```

Why? Because Spring eagerly created the bean during startup. It didn't wait for anyone to request it. The bean is sitting there in the IoC container, ready and waiting.

### 💡 Key Insight

> With eager initialization, the singleton bean is created **whether you use it or not**. Spring prepares everything upfront.

---

## Concept 2: Lazy Initialization — Create Only When Needed

### 🧠 What Is It?

**Lazy initialization** tells Spring: *"Don't create this bean at startup. Wait until someone actually asks for it."*

The bean definition still exists in the container, but the actual object isn't instantiated until the **first time** it's requested — either via `getBean()`, `@Autowired`, or any other reference.

### ⚙️ How Do You Enable It?

Simple — just add the `@Lazy` annotation:

```java
@Component
@Lazy
public class MyService {
    
    public MyService() {
        System.out.println("MyService is created!");
    }
}
```

Now, if you start your application and **no one** asks for `MyService`:

```
// Console is empty — no "MyService is created!" message
```

The bean was **never created** because no one needed it.

### ❓ So When Does It Get Created?

The moment someone refers to it for the first time:

```java
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

// At this point, MyService has NOT been created yet

MyService service = context.getBean(MyService.class);

// NOW "MyService is created!" appears in the console
```

You can even verify this with a debugger. Set a breakpoint at the `getBean()` line — before that line executes, the console has no output from `MyService`. The instant `getBean()` runs, Spring creates the bean and you see the constructor message.

### 📌 Where Can You Use `@Lazy`?

The `@Lazy` annotation works with:

- **`@Component`** (and its stereotypes like `@Service`, `@Repository`, `@Controller`)
- **`@Bean`** methods inside `@Configuration` classes

```java
@Configuration
public class AppConfig {
    
    @Bean
    @Lazy
    public MyService myService() {
        return new MyService();
    }
}
```

### 💡 Key Insight

> With lazy initialization, the bean is only created on **first access**. If no one ever asks for it, it never exists in memory.

---

## Concept 3: Eager vs Lazy — The Key Differences

Let's put them side by side so the picture is crystal clear:

| Aspect | Eager (Default) | Lazy (`@Lazy`) |
|--------|-----------------|----------------|
| **When is the bean created?** | During application startup | When first requested |
| **Default behavior?** | ✅ Yes | ❌ No (must use `@Lazy`) |
| **Startup time** | Slower (creates all beans upfront) | Faster (skips bean creation) |
| **Memory at startup** | Higher (all beans in memory) | Lower (only needed beans) |
| **Error detection** | At startup (fail-fast) | At runtime (fail-late) |
| **First request performance** | Fast (bean already exists) | Slightly slower (bean created on demand) |
| **Applicable to** | Singleton beans only | Singleton beans only |

### ⚠️ Critical Difference: Error Detection

This is the **most important** difference, and it deserves extra attention.

**With Eager initialization:**

If a bean has a problem — say it depends on a database connection that doesn't exist — your application **will not start**. You'll see the error immediately in the logs. This is called **fail-fast** behavior, and it's a *good thing* because you catch problems before they reach production users.

**With Lazy initialization:**

Your application starts successfully — everything looks fine. But later, when a user triggers a business flow that needs that lazy bean for the **first time**, Spring tries to create it... and *boom* — a runtime exception. Your application is now crashing in the middle of execution, potentially affecting real users.

```
// Eager: App won't start → you fix it before deployment
// Lazy: App starts fine → crashes at runtime when bean is first needed 💥
```

### ⚠️ Common Mistake

> **Don't mark ALL beans as `@Lazy` just to speed up startup time.** You'll trade a slightly faster startup for unpredictable runtime failures. That's almost never a good trade.

---

## Concept 4: Eager & Lazy Apply Only to Singleton Scope

Here's something important to remember:

> The concept of **Eager vs Lazy initialization is only applicable to Singleton scoped beans** — not Prototype scoped beans.

Why? Because **Prototype beans are *always* lazy by nature**. A prototype bean is never pre-created — it's only instantiated when someone requests it. So the idea of "eager vs lazy" doesn't apply to prototypes. (This will make more sense once you learn about Prototype scope in an upcoming lesson.)

---

## Concept 5: When to Use Eager vs Lazy — Real-World Scenarios

This is where it gets practical. As a developer, you need to **balance** between eager and lazy based on your use case. Let's break this down.

### 🟢 Use Eager (Default) For: Frequently Used Beans

Any bean that handles **core business logic** — the stuff your users do every day — should be **eager**. You want these beans ready to go, with zero delay on first access.

**Example: E-Commerce Application**

Think about the operations users perform *constantly*:

- 🔍 Searching for products
- 🛒 Placing an order
- ❌ Canceling an order
- 💳 Processing payments

The service beans that handle these use cases (`ProductSearchService`, `OrderService`, `PaymentService`) should all be **eagerly initialized**. You don't want the first customer who searches for a product to experience a slight delay because Spring is still creating the bean.

### 🟡 Use Lazy For: Rarely Used Beans

Any bean that handles **edge cases or rare operations** can be **lazy**. If only 1 out of 1000 users will ever trigger that flow, why waste memory keeping it alive from startup?

**Example: Same E-Commerce Application**

Think about the operations users *rarely* perform:

- 🔒 Closing their account
- 🏠 Adding a new address
- 📱 Changing their phone number

The beans handling these scenarios (`AccountClosureService`, `AddressService`, `ProfileUpdateService`) are great candidates for `@Lazy`. They'll only be created when someone actually needs them.

### 📊 The Scale Factor

For small to medium applications (a few dozen beans), the difference between eager and lazy is **negligible**. But consider this:

> What if your application has **thousands of singleton beans**?

If all of them are eagerly initialized:
- 📈 **Startup time increases** — the app takes longer to boot
- 💾 **Memory consumption spikes** — all beans sit in the IoC container from the start

By marking the rarely-used ones as lazy, you can:
- ⚡ **Reduce startup time** — fewer beans to create upfront
- 🧠 **Save memory** — beans are only created when needed

### ⚠️ The Runtime Trade-off

But here's the flip side. If you mark **too many** beans as lazy, and a user triggers a business flow that needs multiple lazy beans for the first time:

> Spring will need a few extra milliseconds to create those beans on the fly. For applications processing **millions of requests per minute**, those milliseconds can add up.

With eager, this problem doesn't exist because all beans are pre-created during startup.

---

## Concept 6: The Golden Rule — Balance Is Key

Here's the simple decision framework:

```
📌 Default to Eager (don't add @Lazy)
      ↓
   Ask yourself: "Is this bean used frequently?"
      ↓
   YES → Keep it Eager (default)
   NO  → "Is this a rare use case?"
      ↓
   YES → Mark it @Lazy
   NO  → Keep it Eager (when in doubt, go with default)
```

### 💡 Pro Tip

> **When in doubt, always go with the default eager initialization.** It's safer, more predictable, and gives you fail-fast error detection. Only switch to `@Lazy` when you have a clear reason — like optimizing startup time for an application with many rarely-used beans.

---

## Concept 7: A Reminder About Singleton Scope

Before we wrap up, here's an important reminder that connects back to what you learned about Singleton scope:

> **Use Singleton scope (and by extension, eager/lazy decisions) only for stateless beans** — classes that do NOT carry user-specific data.

All your **service classes**, **controller classes**, and **repository classes** — which strictly contain business logic — are perfect candidates for Singleton scope. They don't hold data that changes from user to user, so a single shared instance works perfectly.

If a class holds user-specific state (like a shopping cart), Singleton is the wrong scope — but that's a topic for the Prototype scope lesson.

---

## ✅ Key Takeaways

1. **Eager initialization** (default) creates singleton beans **at application startup** — before anyone asks for them.
2. **Lazy initialization** (`@Lazy`) delays bean creation until the **first time** the bean is requested.
3. Eager gives you **fail-fast** error detection — broken beans are caught at startup, not at runtime.
4. Lazy gives you **faster startup** and **lower memory usage** — but at the cost of potential runtime exceptions.
5. Eager and Lazy are **only applicable to Singleton scoped beans**, not Prototype.
6. **Frequently used beans** (core business logic) → Keep Eager.
7. **Rarely used beans** (edge cases) → Consider `@Lazy`.
8. **When in doubt, go with the default** — Eager initialization is almost always the right choice.

## ⚠️ Common Mistakes

1. **Marking all beans as `@Lazy`** to speed up startup — this creates unpredictable runtime failures.
2. **Ignoring the fail-fast benefit** of eager initialization — catching errors at startup is far better than catching them when users hit a feature.
3. **Confusing Eager/Lazy with Singleton/Prototype** — Eager and Lazy control *when* a bean is created; Singleton and Prototype control *how many* instances exist.

## 💡 Pro Tips

1. If your application takes too long to start and has hundreds of beans, audit which ones are rarely used and mark those `@Lazy`.
2. In production, prefer eager initialization for any bean involved in critical user flows — you never want a lazy bean's first creation to slow down a real user's request.
3. You can use `@Lazy` at the **class level** (with `@Component`) or at the **method level** (with `@Bean`) — both work the same way.
