# What Are Queues?

## Introduction

If stacks are like a deck of cards, queues are like a **line at an ATM**. The first person who arrives is the first person served. This simple concept powers everything from thread scheduling in operating systems to how your smartphone handles touch events. Let's understand the queue abstract data type.

---

## Concept 1: The Queue Abstract Data Type

### 🧠 What is it?

A queue is an **abstract data type** — it defines behavior without dictating the underlying implementation. It can be implemented with one-dimensional arrays, linked lists, or other structures.

The key idea: items enter from one end and exit from the other.

### ❓ Why do we need it?

Whenever a **shared resource** must serve multiple consumers in order, a queue is the natural choice. Think of a printer handling print jobs, or an operating system scheduling tasks for the CPU.

---

## Concept 2: FIFO — First In, First Out

### ⚙️ How it works

Queues follow the **FIFO principle**: the **first** item inserted is the **first** item removed.

Real-world analogy: people waiting in line at an ATM. You must wait for everyone who arrived before you. No cutting!

This is the **opposite** of a stack's LIFO behavior.

---

## Concept 3: The Three Core Operations

### 🧠 Enqueue

Adds an item to the **back** (tail) of the queue.

### 🧠 Dequeue

Removes **and returns** the item from the **front** (head) of the queue.

### 🧠 Peek

Returns the front item's value **without removing it** — similar to dequeue, but the item stays in place.

### 🧪 Example — Step by Step

```
Enqueue 10  →  Queue: [10]                 (front = 10)
Enqueue 6   →  Queue: [10, 6]             (front = 10)
Enqueue 18  →  Queue: [10, 6, 18]         (front = 10)
Enqueue 1   →  Queue: [10, 6, 18, 1]      (front = 10)
Enqueue 56  →  Queue: [10, 6, 18, 1, 56]  (front = 10)
```

We can **only** access `10` — the first item inserted:

```
Dequeue  →  returns 10  →  Queue: [6, 18, 1, 56]
Dequeue  →  returns 6   →  Queue: [18, 1, 56]
Dequeue  →  returns 18  →  Queue: [1, 56]
Dequeue  →  returns 1   →  Queue: [56]
Dequeue  →  returns 56  →  Queue: []
```

First come, first served — every single time.

---

## Concept 4: Real-World Applications

### 🧠 CPU Scheduling on Smartphones

Your smartphone has a single CPU that can process one task at a time. But many things happen simultaneously — touch events, notifications, background downloads, API calls.

How does the OS handle this? It stores all pending tasks in a **queue**:

1. User touches the screen → task enters the queue
2. Notification arrives → task enters the queue
3. API response received → task enters the queue
4. CPU picks the **front** task from the queue and processes it

This is classical FIFO: the first task submitted is the first task handled.

> If you've done Android development, this is essentially how the main thread's message queue (Looper/Handler) works.

### 🧪 Other Applications

| Application | How Queues Are Used |
|---|---|
| **Thread scheduling** | OS stores threads in queues for CPU assignment |
| **Data transfer between processes** | Buffering when data rates differ between sender/receiver |
| **Breadth-First Search (BFS)** | Graph traversal algorithm uses a queue |
| **Print spooling** | Print jobs are processed in order |

---

## ✅ Key Takeaways

- A queue is an **abstract data type** with **FIFO** structure — first in, first out
- Three core operations: **enqueue** (add to back), **dequeue** (remove from front), **peek** (view front without removing)
- Can be implemented with arrays or linked lists
- Critical for **OS scheduling**, **inter-process communication**, and **graph algorithms** like BFS

## ⚠️ Common Mistakes

- Confusing FIFO (queues) with LIFO (stacks) — they have opposite removal orders
- Assuming queues support random access — you can only access the front element
- Using a stack when order-of-arrival matters — queues are the right tool for fairness

## 💡 Pro Tips

- In Java, the `Queue` interface is the abstraction; implementations include `LinkedList`, `PriorityQueue`, and `ArrayDeque`
- `ArrayDeque` is generally the best-performing queue implementation for most use cases
