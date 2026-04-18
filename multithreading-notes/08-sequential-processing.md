# Sequential Processing

## Introduction

Before we jump into multithreading, let's see the **problem with sequential execution** in action. This lecture sets up the "before" picture — once you see how sequential code behaves, you'll understand exactly why we need threads.

---

## Setting Up the Project

Create a new Java project in IntelliJ:
- **Name:** Java Multi-Threading Course
- **Build system:** IntelliJ (no Maven/Gradle needed for learning)
- **JDK:** Java 23

Create a package (e.g., `com.globalsoftwaresupport`) and a main `Application` class.

---

## Example 1: Methods Execute One After Another

### 🧪 Code

```java
public class Application {
    public static void main(String[] args) {
        loadImages();
        transformImages();
        showImages();
    }

    private static void loadImages() {
        System.out.println("Loading images...");
    }

    private static void transformImages() {
        System.out.println("Transforming images...");
    }

    private static void showImages() {
        System.out.println("Showing images...");
    }
}
```

### ⚙️ What happens?

Java executes the methods **one by one** in exact order:
1. `loadImages()` runs and completes
2. `transformImages()` runs and completes
3. `showImages()` runs and completes

Each method **waits** for the previous one to finish. This is sequential execution.

---

## Example 2: Two Runners — Sequential Behavior

This is a clearer demonstration of the problem. Let's create two classes that each print numbers 0–9.

### 🧪 Code

```java
class Runner1 {
    public void execute() {
        for (int i = 0; i < 10; i++) {
            System.out.println("Runner1 - " + i);
        }
    }
}

class Runner2 {
    public void execute() {
        for (int i = 0; i < 10; i++) {
            System.out.println("Runner2 - " + i);
        }
    }
}
```

```java
public static void main(String[] args) {
    var runner1 = new Runner1();
    var runner2 = new Runner2();

    runner1.execute();
    runner2.execute();
}
```

💡 **Note:** After Java 17, you can use `var` instead of explicit types — the compiler infers the type automatically.

### ⚙️ Output

```
Runner1 - 0
Runner1 - 1
Runner1 - 2
...
Runner1 - 9
Runner2 - 0
Runner2 - 1
...
Runner2 - 9
```

### 🧠 What's happening?

Java executes `runner1.execute()` **completely** before even starting `runner2.execute()`. The second runner has to wait until the first one is entirely done.

---

## The Question That Leads to Multithreading

What if we wanted both runners to execute **at the same time**? Something like:

```
Runner1 - 0
Runner2 - 0
Runner1 - 1
Runner2 - 1
Runner1 - 2
Runner2 - 2
...
```

Using the time-slicing algorithm, we'd want the CPU to:
1. Execute a few operations from Runner 1
2. Switch to Runner 2 for a few operations
3. Switch back to Runner 1
4. And so on...

**This is exactly what multithreading solves.** Instead of waiting for one task to complete before starting the next, we can execute multiple tasks concurrently.

---

## ✅ Key Takeaways

- Java is **inherently sequential** — without explicit threads, everything runs line by line
- In sequential execution, each operation must **wait** for the previous one to complete
- This is the fundamental limitation that multithreading addresses
- To execute multiple operations concurrently, we must **create threads explicitly**

---

## What's Next?

In the next lecture, we'll transform these runners into threads using the **`Runnable` interface** — and see true concurrent execution in action.
