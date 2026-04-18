# Dining Philosophers Problem — The Problem

## Introduction

The **Dining Philosophers Problem** is one of the most famous concurrency problems in computer science, formulated by Edsger Dijkstra in 1965. It beautifully illustrates how **deadlocks** can arise in multi-threaded systems where threads compete for shared resources. Understanding this problem is essential because it mirrors real-world scenarios like database transactions, resource allocation, and network protocols.

---

## Concept 1: The Setup

### 🧠 What Is the Problem?

Imagine **five philosophers** sitting around a circular table. Between each pair of adjacent philosophers, there is **one chopstick** (or fork) — so there are **five chopsticks** in total.

```
        P0
      /    \
    C4      C0
    /        \
  P4          P1
    \        /
    C3      C1
      \    /
        P3
       /
     C2
     /
   P2
```

Each philosopher alternates between two activities:
1. **Thinking** — doesn't need any resources
2. **Eating** — needs **both** the left and the right chopstick

### ⚙️ The Rules

- A philosopher can only eat when they hold **both** their left and right chopstick
- A chopstick can be held by **only one philosopher** at a time
- When a philosopher finishes eating, they put down both chopsticks
- The goal: design a system where **no philosopher starves** (i.e., avoid deadlocks)

---

## Concept 2: Why Deadlock Occurs

### ❓ Why Can't All Philosophers Eat at Once?

There are 5 philosophers but only 5 chopsticks. Each philosopher needs **2** chopsticks to eat. That means at most **2 philosophers** can eat simultaneously (using 4 chopsticks, leaving 1 unused).

### ⚙️ The Deadlock Scenario

Here's the classic deadlock:

1. **P0** picks up left chopstick (C0) ✅
2. **P1** picks up left chopstick (C1) ✅
3. **P2** picks up left chopstick (C2) ✅
4. **P3** picks up left chopstick (C3) ✅
5. **P4** picks up left chopstick (C4) ✅

Now every philosopher holds one chopstick and needs one more. But all chopsticks are taken. **Every philosopher is waiting for their right neighbor to release a chopstick, but no one will release theirs because they're all waiting.**

This is a **circular wait** — one of the four conditions for deadlock.

---

## Concept 3: The Eating Procedure

### ⚙️ Step-by-Step Process

When a philosopher wants to eat, this is the sequence:

1. **Pick up** the left chopstick
2. **Pick up** the right chopstick (if available)
3. **Eat** for some time
4. **Put down** the right chopstick
5. **Put down** the left chopstick

The order matters — both the pickup order (left then right) and the put-down order (right then left) are important for understanding how deadlocks form.

### 💡 Key Insight

The problem is fundamentally about **resource ordering and competition**. Each chopstick is a **shared resource** that two adjacent philosophers compete for. The challenge is designing a protocol that prevents:

- **Deadlock** — all philosophers stuck waiting forever
- **Starvation** — one philosopher never getting to eat
- **Livelock** — philosophers constantly picking up and putting down chopsticks without making progress

---

## Summary

✅ The Dining Philosophers Problem models real-world resource contention between threads

✅ 5 philosophers + 5 chopsticks = competition and potential deadlock

⚠️ If every philosopher picks up their left chopstick first, circular wait (deadlock) can occur

💡 The solution requires careful synchronization — which we'll implement in the following lectures using locks and `tryLock()` to avoid infinite blocking
