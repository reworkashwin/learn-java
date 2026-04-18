# Student Library Simulation II — Constants

## Introduction

Before we build the full library simulation, we need to define the **constants** that configure the entire system. These constants determine how many books exist, how many students compete for them, and how long they spend reading. Getting these values right is crucial — they directly affect how the simulation behaves, whether deadlocks occur, and how much contention the system experiences.

This is the same pattern we used in the Dining Philosophers problem: centralize all configuration values in a single `Constants` class.

---

## Concept 1: Why Use a Constants Class?

### 🧠 What is it?

A `Constants` class is a utility class that holds all the configuration values for the simulation in one place. Every value is `public static final` — meaning it's a compile-time constant accessible from anywhere.

### ❓ Why do we need it?

Imagine scattering magic numbers throughout your codebase:
- `new Book[5]` in one file
- `new Student[7]` in another
- `Thread.sleep(2000)` buried in the `Book` class

If you want to change the number of books from 5 to 10, you'd have to hunt through every file. A constants class solves this:

```java
public class Constants {

    private Constants() {
        // Prevent instantiation — this is a utility class
    }

    public static final int NUMBER_OF_BOOKS = 5;
    public static final int NUMBER_OF_STUDENTS = 7;
    public static final int READING_TIME = 2000;  // milliseconds
}
```

### 💡 Insight

The private constructor prevents anyone from instantiating `Constants`. There's no reason to create an object — all fields are static. This is a standard Java convention for utility classes.

---

## Concept 2: Understanding Each Constant

### ⚙️ NUMBER_OF_BOOKS

```java
public static final int NUMBER_OF_BOOKS = 5;
```

This defines the **shared resources** in the simulation. Each book wraps a `ReentrantLock` — so this also determines the number of locks in the system.

**Why does the value matter?**
- **Too few books** → high contention. Many students wait for the same book, leading to frequent blocking.
- **Too many books** → low contention. Students rarely compete, which defeats the purpose of the simulation.
- A ratio of books to students around 1:1.5 or 1:2 creates interesting concurrency behavior.

### ⚙️ NUMBER_OF_STUDENTS

```java
public static final int NUMBER_OF_STUDENTS = 7;
```

This determines how many threads will be created. Each student is a `Runnable` that runs on its own thread in the `ExecutorService`.

**Why 7 students with 5 books?**

With 7 students and only 5 books, at least **2 students are always waiting**. This guarantees contention and makes the simulation interesting. If we had 5 students and 5 books, every student could potentially read without waiting.

### ⚙️ READING_TIME

```java
public static final int READING_TIME = 2000;  // 2 seconds
```

This controls how long a student holds a lock (reads a book). In the `Book.read()` method, this value is passed to `Thread.sleep()`:

```java
Thread.sleep(Constants.READING_TIME);
```

**Why does this matter?**
- **Longer reading time** → more contention, because books are held longer
- **Shorter reading time** → less contention, threads cycle through books faster

---

## Concept 3: How Constants Connect to the Simulation

### ⚙️ The Full Picture

Here's how these constants flow through the system:

```
Constants.NUMBER_OF_BOOKS  →  Book[] books = new Book[Constants.NUMBER_OF_BOOKS]
Constants.NUMBER_OF_STUDENTS  →  Student[] students = new Student[Constants.NUMBER_OF_STUDENTS]
                               →  Executors.newFixedThreadPool(Constants.NUMBER_OF_STUDENTS)
Constants.READING_TIME  →  Thread.sleep(Constants.READING_TIME) inside Book.read()
```

### 🧪 Experimenting with Values

One of the best ways to learn concurrency is to **change these constants and observe what happens**:

| Configuration | Expected Behavior |
|---------------|-------------------|
| 5 books, 7 students | Moderate contention — students frequently wait |
| 2 books, 7 students | High contention — most students blocked at any given time |
| 10 books, 3 students | Low contention — students rarely wait |
| 5 books, 5 students, reading time = 100ms | Fast cycling, minimal blocking |
| 5 books, 5 students, reading time = 10000ms | Slow cycling, long waits |

### 💡 Pro Tip

When debugging concurrency issues, start with **extreme values**. Set `NUMBER_OF_BOOKS = 1` and `NUMBER_OF_STUDENTS = 10` — this maximizes contention and forces concurrency problems (starvation, long waits) to surface quickly.

---

## Concept 4: Connecting to Dining Philosophers

### 🧠 Same Pattern, Different Domain

If you compare this to the Dining Philosophers constants, the structure is identical:

| Dining Philosophers | Library Simulation |
|--------------------|--------------------|
| `NUMBER_OF_PHILOSOPHERS` | `NUMBER_OF_STUDENTS` |
| `NUMBER_OF_CHOPSTICKS` | `NUMBER_OF_BOOKS` |
| `EATING_TIME` | `READING_TIME` |

The underlying concurrency model is the same: **N threads competing for M shared resources**. The constants class gives us a single place to tune the system's behavior.

---

## ✅ Key Takeaways

- Centralize all simulation parameters in a `Constants` class with `public static final` fields
- The ratio of students to books determines the **level of contention**
- More students than books guarantees blocking — which is the whole point of the simulation
- Reading time controls how long locks are held, directly affecting thread scheduling
- Experimenting with different constant values is one of the best ways to build intuition about concurrent systems
