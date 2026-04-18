# Object-Level Locking and Class-Level Locking

## Introduction

When you use `synchronized` in Java, there are actually **two different types of locks** being used behind the scenes — and confusing them is a common source of bugs. Understanding the difference between **object-level** and **class-level** locking is essential for writing correct concurrent code.

---

## Concept 1: Object-Level Locking (Instance Lock)

### 🧠 What is it?

When you synchronize on an **instance method** or use `synchronized(this)`, the lock is tied to the **specific object instance**. This means different objects have **different locks** — they don't block each other.

### ⚙️ How it works

```java
public class Counter {
    private int count = 0;

    public synchronized void increment() {
        count++;
    }
}
```

Under the hood, this is equivalent to:

```java
public void increment() {
    synchronized (this) {  // Lock = this particular Counter object
        count++;
    }
}
```

### 🧪 Example — Two different objects, two independent locks

```java
Counter counterA = new Counter();
Counter counterB = new Counter();

// Thread 1 locks counterA — does NOT block Thread 2
new Thread(() -> counterA.increment()).start();

// Thread 2 locks counterB — completely independent
new Thread(() -> counterB.increment()).start();
```

Both threads run concurrently because they're locking on **different objects**.

### ⚠️ The trap — Same object, same lock

```java
Counter shared = new Counter();

// Thread 1 must wait for Thread 2 (or vice versa) — same lock
new Thread(() -> shared.increment()).start();
new Thread(() -> shared.increment()).start();
```

Now both threads use the **same object**, so they compete for the same lock.

---

## Concept 2: Class-Level Locking (Static Lock)

### 🧠 What is it?

When you synchronize on a **static method** or use `synchronized(ClassName.class)`, the lock is tied to the **Class object itself**. There's only one `Class` object per class in the JVM, so this lock is shared across **all instances**.

### ⚙️ How it works

```java
public class Counter {
    private static int count = 0;

    public static synchronized void increment() {
        count++;
    }
}
```

Under the hood, this is equivalent to:

```java
public static void increment() {
    synchronized (Counter.class) {  // Lock = the Counter class itself
        count++;
    }
}
```

### 🧪 Example — All threads share one lock

```java
// Even with different objects, they ALL share the class-level lock
Counter a = new Counter();
Counter b = new Counter();

// These block each other — same class lock
new Thread(() -> Counter.increment()).start();
new Thread(() -> Counter.increment()).start();
```

---

## Concept 3: Key Differences

### ⚙️ Side-by-side comparison

| Feature | Object-Level Lock | Class-Level Lock |
|---|---|---|
| Lock target | `this` (instance) | `ClassName.class` |
| Scope | Per object | Per class (JVM-wide) |
| Different instances | **Don't** block each other | **Do** block each other |
| Use case | Protecting instance fields | Protecting static fields |
| Keyword | `synchronized` on instance method | `synchronized` on static method |

### 🧪 Visual comparison

```
Object-Level Locking:
  counterA: [Thread 1 — locked]  → Only blocks threads using counterA
  counterB: [Thread 2 — locked]  → Only blocks threads using counterB

Class-Level Locking:
  Counter.class: [Thread 1 — locked]  → Blocks ALL threads calling static sync methods
```

---

## Concept 4: Mixing Both — A Common Bug

### ⚠️ The dangerous mix

```java
public class Counter {
    private int count = 0;

    // Object-level lock (this)
    public synchronized void incrementInstance() {
        count++;
    }

    // Class-level lock (Counter.class)
    public static synchronized void incrementStatic() {
        // Can't access count — it's an instance variable
    }
}
```

### ❓ Why is this a problem?

Object-level and class-level locks are **completely independent**. A thread holding the instance lock does NOT block a thread trying to acquire the class lock, and vice versa. If both methods access the same data through different paths, you'll have a race condition.

### 🧪 Correct approach — Use the same lock

```java
public class Counter {
    private static final Object LOCK = new Object();
    private int count = 0;

    public void incrementA() {
        synchronized (LOCK) {
            count++;
        }
    }

    public void incrementB() {
        synchronized (LOCK) {   // Same lock object — properly synchronized
            count++;
        }
    }
}
```

💡 **Pro Tip:** When in doubt, use an explicit private lock object. It makes the locking strategy clear and prevents accidental mixing of lock scopes.

---

## Concept 5: When to Use Which?

### ⚙️ Decision guide

| Scenario | Use |
|---|---|
| Protecting instance-specific data | Object-level locking (`synchronized` method) |
| Protecting shared static state | Class-level locking (`static synchronized`) |
| Singleton initialization | Class-level locking |
| Per-object counters or buffers | Object-level locking |
| Global rate limiters or counters | Class-level locking |

---

## Summary

✅ **Key Takeaways:**

- **Object-level lock** = `synchronized(this)` — one lock per instance, different instances are independent
- **Class-level lock** = `synchronized(ClassName.class)` — one lock for the entire class, blocks all instances
- These two lock types are **independent** — holding one doesn't block the other
- Never mix object-level and class-level locks when protecting the same data
- Prefer explicit lock objects (`private static final Object LOCK`) for clarity
