# Thread Lifecycles

## Introduction

Before we start creating threads in code, we need to understand the **different states** a thread goes through during its lifetime. Every thread transitions through a well-defined lifecycle — knowing these states helps you understand thread behavior, debug issues, and write correct concurrent programs.

---

## The Four Lifecycle Phases

A thread in Java goes through **four main states**:

```
NEW → ACTIVE (Runnable / Running) ⇄ BLOCKED/WAITING → TERMINATED
```

---

## State 1: NEW

### 🧠 What is it?

When you **create** (instantiate) a thread object, it enters the **NEW** state. At this point, the thread exists as a Java object but has **not started executing** yet.

```java
Thread t = new Thread(myRunnable);  // Thread is in NEW state
```

The thread remains in the NEW state **until you call the `start()` method**.

💡 **Think of it like:** Hiring a new employee — they've been hired (created), but they haven't started working yet.

---

## State 2: ACTIVE

### 🧠 What is it?

When you call the `start()` method, the thread moves to the **ACTIVE** state.

```java
t.start();  // Thread is now ACTIVE
```

The **ACTIVE** state has two sub-states:

### Runnable (Ready)

The thread is **ready to execute**, but the CPU is currently handling another thread (because of the time-slicing algorithm). It's waiting for its turn.

### Running

The thread is **currently being executed** by the CPU.

```
ACTIVE
├── Runnable — ready to run, waiting for CPU time
└── Running  — currently executing on the CPU
```

### 💡 Why do these sub-states exist?

Because of the **time-slicing algorithm**. Even though you've started a thread, the CPU might be busy with other threads. Your thread sits in the **Runnable** queue until the CPU picks it up.

---

## State 3: BLOCKED / WAITING

### 🧠 What is it?

A thread enters the **BLOCKED** or **WAITING** state when it needs to pause execution — typically because it's waiting for something:

- **`join()`** — waiting for another thread to finish
- **`sleep()`** — pausing for a specified time
- **`wait()`** — waiting for a notification from another thread

```java
t1.join();        // Current thread enters WAITING state until t1 finishes
Thread.sleep(1000); // Current thread enters WAITING state for 1 second
```

### 💡 Key Insight

A thread in the BLOCKED/WAITING state **does not consume CPU cycles**. It simply waits. The thread scheduler will **notify** the thread when it can resume execution.

### ⚙️ Transitions

An important point: threads can **switch back and forth** between ACTIVE and BLOCKED states:

```
ACTIVE → BLOCKED (waiting for another thread)
BLOCKED → ACTIVE (notified it can continue)
```

This happens frequently in patterns like the **Producer-Consumer** pattern, where:
- Producer thread is active, consumer thread is waiting
- Then producer waits, consumer becomes active
- And so on...

---

## State 4: TERMINATED

### 🧠 What is it?

When a thread **finishes its assigned task**, it enters the **TERMINATED** state. The thread is done — it has completed the execution of its `run()` method.

```java
// When the run() method completes, the thread is TERMINATED
@Override
public void run() {
    // ... do work ...
}  // Thread enters TERMINATED state after this
```

A terminated thread **cannot be restarted**.

---

## Visual Summary

```
     ┌──────┐
     │ NEW  │   ← Thread created (new Thread())
     └──┬───┘
        │ start()
     ┌──▼───────────────────┐
     │       ACTIVE         │
     │  ┌─────────────────┐ │
     │  │    Runnable      │ │  ← Ready, waiting for CPU
     │  │    Running       │ │  ← Executing on CPU
     │  └─────────────────┘ │
     └──┬──────────────┬────┘
        │              │
        │ join/sleep/  │ task
        │ wait         │ complete
        │              │
  ┌─────▼──────┐  ┌────▼──────┐
  │  BLOCKED / │  │TERMINATED │
  │  WAITING   │  │           │
  └─────┬──────┘  └───────────┘
        │
        │ notified / timeout
        │
     ┌──▼───────────────────┐
     │       ACTIVE         │
     └──────────────────────┘
```

---

## ✅ Key Takeaways

- **NEW** — thread is created but not started
- **ACTIVE** — thread is either runnable (waiting for CPU) or running (executing)
- **BLOCKED/WAITING** — thread is paused, waiting for another thread or a timer; uses no CPU
- **TERMINATED** — thread has completed its task
- Threads can transition between ACTIVE and BLOCKED/WAITING multiple times
- Understanding these states is essential for debugging thread behavior

---

## What's Next?

Now that we understand the theory, it's time to write code. We'll start by looking at **sequential processing** to see the problem firsthand, and then solve it with threads.
