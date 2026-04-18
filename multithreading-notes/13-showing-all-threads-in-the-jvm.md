# Showing All Threads in the JVM

## Introduction

Ever wondered what's going on behind the scenes when your Java application runs? Even if you never create a single thread yourself, the JVM is already running several threads in the background. In this section, we'll learn how to peek under the hood and see every active thread in the Java Virtual Machine.

---

## Concept 1: Listing Active Threads Programmatically

### 🧠 What is it?

Java provides a way to enumerate all currently active threads in the JVM. Using `Thread.getAllStackTraces()`, you get a map of every live thread along with its stack trace. By calling `.keySet()` on this map, you get a `Set<Thread>` — an unordered collection of all active threads.

### ⚙️ How it works

```java
for (Thread t : Thread.getAllStackTraces().keySet()) {
    System.out.println(t.getName() + " - " + t.getState());
}
```

This iterates over every thread in the JVM and prints its **name** and **state** (e.g., `RUNNABLE`, `WAITING`, `TIMED_WAITING`).

### 🧪 Example

Suppose you have two custom threads running alongside the main thread:

```java
Thread t1 = new Thread(new RunnerOne());
Thread t2 = new Thread(new RunnerTwo());
t1.start();
t2.start();

// List all threads
for (Thread t : Thread.getAllStackTraces().keySet()) {
    System.out.println(t.getName() + " - " + t.getState());
}
```

Output might look like:

```
main - RUNNABLE
Thread-0 - RUNNABLE
Thread-1 - RUNNABLE
Finalizer - WAITING
Reference Handler - WAITING
Common-Cleaner - TIMED_WAITING
Notification Thread - RUNNABLE
```

---

## Concept 2: Understanding JVM Internal Threads

### 🧠 What is it?

When you list all threads, you'll discover threads you never created. These are JVM-internal threads that handle critical background operations.

### ❓ Why do they exist?

The JVM needs to manage memory, finalization, and housekeeping tasks automatically. These threads run silently in the background so your application doesn't have to worry about low-level resource management.

### ⚙️ The key threads you'll see

| Thread Name | Purpose |
|---|---|
| **main** | Executes the `main()` method — every Java app starts here |
| **Thread-0, Thread-1, ...** | Your custom threads |
| **Finalizer** | Runs `finalize()` methods on objects before garbage collection |
| **Reference Handler** | Manages weak/soft/phantom references for the GC |
| **Common-Cleaner** | Performs cleanup actions registered via `Cleaner` API |
| **Notification Thread** | Internal JVM signaling |

### 💡 Insight

You **cannot** run a Java application without at least one thread — the **main thread**. Even if you never explicitly create threads, the main thread is always present. And multiple GC-related threads are quietly working in the background.

---

## Concept 3: The Connection to Daemon Threads

### 🧠 What is it?

Those JVM-internal threads (Finalizer, Reference Handler, Common-Cleaner) are **daemon threads**. They exist solely to support the application and are automatically terminated when all user threads finish.

### 💡 Insight

This foreshadows an important distinction: **user threads** vs. **daemon threads**. The JVM waits for all user threads to complete before shutting down, but it does not wait for daemon threads. The garbage collection threads are daemon threads — they vanish the moment your application has no more user threads running.

---

## Key Takeaways

- ✅ Use `Thread.getAllStackTraces().keySet()` to list all active threads in the JVM
- ✅ The **main thread** always exists — you can't run Java without it
- ✅ The JVM creates several background threads automatically (GC, finalizer, cleaner)
- ⚠️ The returned set is unordered — don't assume any particular thread ordering
- 💡 JVM-internal threads are daemon threads and will be terminated automatically when all user threads finish
