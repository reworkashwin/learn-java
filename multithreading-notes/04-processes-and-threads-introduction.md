# Processes and Threads Introduction

## Introduction

This is the foundational lecture of the entire course. Before we write a single line of multithreaded code, we need to understand **why** multithreading exists, what **processes** and **threads** are, and how they relate to each other.

The short answer: **programming languages are sequential by default**, and that creates problems when we have time-consuming operations.

---

## The Problem: Sequential Execution

### 🧠 What is sequential execution?

By default, programming languages (including Java) execute operations **one by one**, line by line. Each operation must complete before the next one begins.

```java
public static void main(String[] args) {
    initializeArrays();   // Step 1 — runs first
    downloadData();       // Step 2 — waits for Step 1
    buildModel();         // Step 3 — waits for Step 2
    makePredictions();    // Step 4 — waits for Step 3
}
```

### ❓ Why is this a problem?

Imagine `downloadData()` takes **20 minutes** to fetch a large dataset from the web. In a single-threaded application:

- `buildModel()` has to **wait** 20 minutes before it can even start
- The entire application **freezes** — the user sees nothing happening
- No other operations can proceed

💡 **Real-world analogy:** It's like standing in a single checkout line at a grocery store. Even if you're just buying a bottle of water, you have to wait for the person ahead of you who has a cart full of items.

---

## The Solution: Multithreading

### 🧠 What is multithreading?

Multithreading is about **separating time-consuming tasks** into independent units of execution so they don't block each other.

Instead of one checkout line, imagine having **multiple checkout counters** — each handling a different customer simultaneously.

For example, in a stock market application:
- **Thread 1:** Downloads real-time data from Yahoo Finance (takes 2–3 minutes)
- **Thread 2:** Handles the user interface (remains responsive)
- **Thread 3:** Processes existing data in the background

The application never freezes because the download happens on a **separate thread**.

💡 **Everyday example:** When you copy a large directory on your computer, the operating system doesn't freeze. You can still browse the web, read PDFs, etc. That's because the copy operation runs on a **separate thread**.

---

## Processes vs. Threads

### 🧠 What is a process?

A **process** is an instance of a program execution — a fundamental unit of work in the operating system.

- Every application you open (Chrome, Excel, Photoshop) is a **separate process**
- The OS assigns **distinct resources** to each process:
  - Registers
  - Stack memory
  - Heap memory

```
Process (e.g., Chrome)
├── Registers
├── Stack Memory
└── Heap Memory
```

You can see all running processes using:
- **Windows:** `tasklist` in the command prompt
- **macOS/Linux:** `ps aux` in the terminal

Each process has a unique **PID** (Process Identification Number).

⚠️ **Important:** Creating a new process is **expensive** because the OS must allocate registers, stack memory, heap memory, and manage the parent-child process relationship.

In Java, processes can be created using the `ProcessBuilder` class.

---

### 🧠 What is a thread?

A **thread** is a **lightweight process** — a unit of execution that exists **within** a process.

Key characteristics:
- A single process can contain **one or more threads**
- All threads within a process **share the same memory and resources**
- Creating a thread is **much cheaper** than creating a process

```
Process
├── Shared Resources (Registers, Stack, Heap)
│   ├── Thread 1
│   ├── Thread 2
│   └── Thread 3
```

### ❓ Why are threads "lightweight"?

When creating a new thread:
- No need to allocate separate registers
- No need to manage parent-process relationships
- Threads share the existing process's memory

This makes thread creation **fast and resource-efficient** compared to process creation.

---

## The Catch: Shared Memory = Concurrency Problems

Here's the critical insight that drives the rest of this course:

Since all threads **share the same memory** within a process:
- Thread 1 can modify a variable
- Thread 2 can modify the **same** variable
- Thread 3 can read that variable while it's being modified

This can lead to **inconsistent data**. 

⚠️ **This is why we need:**
- **Synchronization** — to control access to shared resources
- **Concurrent programming** — to manage threads safely

---

## ✅ Key Takeaways

- Java is **sequential by default** — operations execute one after another
- Time-consuming operations can **freeze** single-threaded applications
- **Processes** are heavyweight — each gets its own memory and resources
- **Threads** are lightweight — they share memory within a process
- Thread creation is **much cheaper** than process creation
- Shared memory between threads creates the need for **synchronization**

---

## What's Next?

Now that we understand why threads exist, we'll look at **how** the CPU handles multiple threads — the **time-slicing algorithm**.
